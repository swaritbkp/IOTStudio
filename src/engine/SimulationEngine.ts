import type { Node } from '@xyflow/react';
import type { SimulationCallbacks } from './types';
import { SensorSimulator } from './SensorSimulator';
import { audioEngine } from './AudioEngine';

export class SimulationEngine {
  private running = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private startTime = 0;
  private sensorSim: SensorSimulator | null = null;
  private callbacks: SimulationCallbacks;

  constructor(callbacks: SimulationCallbacks) {
    this.callbacks = callbacks;
    audioEngine.init();
  }

  isActive(): boolean {
    return this.running;
  }

  start(code: string, speed: number, nodes: Node[]) {
    try {
      // Extract function bodies using brace-depth counting
      const setupBody = this.extractFunctionBody(code, 'setup');
      const loopBody = this.extractFunctionBody(code, 'loop');

      if (setupBody === null || loopBody === null) {
        this.callbacks.onError(
          'Code must contain both setup() and loop() functions'
        );
        return;
      }

      // Extract variable declarations before setup
      const beforeSetup = code.substring(
        0,
        code.indexOf('function setup')
      );

      this.startTime = performance.now();
      this.sensorSim = new SensorSimulator(nodes);

      const scope = {
        readSensor: (name: string) => this.sensorSim!.read(name),
        writeActuator: (name: string, value: unknown) => {
          this.callbacks.onActuatorChange(name, value);
          // Handle buzzer audio
          if (
            typeof value === 'number' &&
            name.toLowerCase().includes('buzzer')
          ) {
            if (value > 0) {
              audioEngine.play(value);
            } else {
              audioEngine.stop();
            }
          }
        },
        log: (msg: unknown) =>
          this.callbacks.onLog(String(msg), this.elapsed()),
        logData: (key: string, val: number) =>
          this.callbacks.onLogData(key, val, this.elapsed()),
        delay: (_ms: number) => {
          /* delay is handled by loop interval */
        },
        millis: () => this.elapsed(),
        map: (
          v: number,
          fl: number,
          fh: number,
          tl: number,
          th: number
        ) => ((v - fl) / (fh - fl)) * (th - tl) + tl,
        constrain: (v: number, lo: number, hi: number) =>
          Math.min(Math.max(v, lo), hi),
        HIGH: 1 as const,
        LOW: 0 as const,
        Math,
      };

      const scopeKeys = Object.keys(scope);
      const scopeValues = Object.values(scope);

      // Compile into a closure module to preserve variable state between setup and loop
      const compiledCode = `
        "use strict";
        ${beforeSetup}
        return {
          setup: function() { ${setupBody} },
          loop: function() { ${loopBody} }
        };
      `;
      const createModule = new Function(...scopeKeys, compiledCode);
      const userModule = createModule(...scopeValues);

      // Execute setup
      userModule.setup();

      this.running = true;
      this.intervalId = setInterval(() => {
        if (!this.running) return;
        try {
          this.sensorSim!.tick();
          const loopStart = performance.now();
          userModule.loop();
          if (performance.now() - loopStart > 100) {
            this.stop();
            this.callbacks.onError(
              'Loop execution exceeded 100ms — possible infinite loop'
            );
          }
        } catch (e: unknown) {
          this.callbacks.onError(
            e instanceof Error ? e.message : String(e)
          );
        }
      }, 1000 / speed);
    } catch (e: unknown) {
      this.callbacks.onError(
        `Syntax error: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  stop() {
    this.running = false;
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
    audioEngine.stop();
  }

  setSensorValue(name: string, value: unknown) {
    this.sensorSim?.setUserValue(name, value);
  }

  private elapsed(): number {
    return Math.floor(performance.now() - this.startTime);
  }

  private extractFunctionBody(
    code: string,
    funcName: string
  ): string | null {
    const pattern = new RegExp(
      `function\\s+${funcName}\\s*\\(\\s*\\)\\s*\\{`
    );
    const match = pattern.exec(code);
    if (!match) return null;

    let depth = 1;
    const startIdx = match.index + match[0].length;
    let i = startIdx;

    while (i < code.length && depth > 0) {
      if (code[i] === '{') depth++;
      else if (code[i] === '}') depth--;
      i++;
    }

    if (depth !== 0) return null;
    return code.substring(startIdx, i - 1);
  }
}
