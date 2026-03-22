import type { Node } from '@xyflow/react';

interface SensorConfig {
  name: string;
  simulationType: string;
}

export class SensorSimulator {
  private values: Map<string, unknown> = new Map();
  private state: Map<string, number> = new Map();
  private configs: SensorConfig[] = [];
  private startTime: number;

  constructor(nodes: Node[]) {
    this.startTime = performance.now();
    this.configs = nodes
      .filter((n) => (n.data as { category?: string }).category === 'sensor')
      .map((n) => ({
        name: (n.data as { label: string }).label,
        simulationType: (n.data as { simulationType: string }).simulationType,
      }));

    // Initialize with default values
    for (const cfg of this.configs) {
      this.initSensor(cfg);
    }
  }

  private initSensor(cfg: SensorConfig) {
    switch (cfg.simulationType) {
      case 'temperature':
        this.values.set(cfg.name, 25);
        this.state.set(`${cfg.name}_val`, 25);
        break;
      case 'humidity':
        this.values.set(cfg.name, 60);
        this.state.set(`${cfg.name}_val`, 60);
        break;
      case 'light':
        this.values.set(cfg.name, 512);
        break;
      case 'motion':
        this.values.set(cfg.name, false);
        this.state.set(`${cfg.name}_last`, 0);
        this.state.set(`${cfg.name}_cd`, 5000);
        break;
      case 'ultrasonic':
        this.values.set(cfg.name, 100);
        this.state.set(`${cfg.name}_val`, 100);
        break;
      case 'soil':
        this.values.set(cfg.name, 512);
        this.state.set(`${cfg.name}_val`, 512);
        break;
      case 'sound':
        this.values.set(cfg.name, 100);
        break;
      case 'gas':
        this.values.set(cfg.name, 100);
        this.state.set(`${cfg.name}_val`, 100);
        break;
      case 'potentiometer':
        this.values.set(cfg.name, 512);
        break;
      case 'button':
        this.values.set(cfg.name, false);
        break;
      case 'ir':
        this.values.set(cfg.name, false);
        break;
      case 'flame':
        this.values.set(cfg.name, 0);
        this.state.set(`${cfg.name}_val`, 0);
        break;
      case 'pressure':
        this.values.set(cfg.name, 1013.25);
        this.state.set(`${cfg.name}_val`, 1013.25);
        break;
      case 'color':
        this.values.set(cfg.name, { r: 128, g: 128, b: 128 });
        break;
      case 'accelerometer':
        this.values.set(cfg.name, { x: 0, y: 0, z: 9.8 });
        break;
    }
  }

  tick() {
    const now = performance.now();
    const elapsed = (now - this.startTime) / 1000;

    for (const cfg of this.configs) {
      switch (cfg.simulationType) {
        case 'temperature': {
          const curr = this.state.get(`${cfg.name}_val`) ?? 25;
          const next = Math.max(
            15,
            Math.min(45, curr + (Math.random() - 0.5) * 0.6)
          );
          this.state.set(`${cfg.name}_val`, next);
          this.values.set(cfg.name, Math.round(next * 10) / 10);
          break;
        }
        case 'humidity': {
          const curr = this.state.get(`${cfg.name}_val`) ?? 60;
          const next = Math.max(
            30,
            Math.min(90, curr + (Math.random() - 0.5) * 1.0)
          );
          this.state.set(`${cfg.name}_val`, next);
          this.values.set(cfg.name, Math.round(next * 10) / 10);
          break;
        }
        case 'light': {
          const base = Math.sin((elapsed / 30) * Math.PI) * 512 + 512;
          this.values.set(
            cfg.name,
            Math.floor(
              Math.max(0, Math.min(1023, base + (Math.random() - 0.5) * 80))
            )
          );
          break;
        }
        case 'motion': {
          const lastTrigger = this.state.get(`${cfg.name}_last`) ?? 0;
          const cooldown = this.state.get(`${cfg.name}_cd`) ?? 5000;
          if (now - lastTrigger > cooldown && Math.random() < 0.1) {
            this.values.set(cfg.name, true);
            this.state.set(`${cfg.name}_last`, now);
            this.state.set(`${cfg.name}_cd`, 2000 + Math.random() * 8000);
          } else {
            this.values.set(cfg.name, false);
          }
          break;
        }
        case 'ultrasonic': {
          const curr = this.state.get(`${cfg.name}_val`) ?? 100;
          const next = Math.max(
            2,
            Math.min(400, curr + (Math.random() - 0.5) * 10)
          );
          this.state.set(`${cfg.name}_val`, next);
          this.values.set(cfg.name, Math.round(next * 10) / 10);
          break;
        }
        case 'soil': {
          const curr = this.state.get(`${cfg.name}_val`) ?? 512;
          const next = Math.max(
            0,
            Math.min(1023, curr + (Math.random() - 0.5) * 20)
          );
          this.state.set(`${cfg.name}_val`, next);
          this.values.set(cfg.name, Math.floor(next));
          break;
        }
        case 'sound': {
          const base = 80 + Math.random() * 100;
          const spike = Math.random() < 0.05 ? Math.random() * 500 : 0;
          this.values.set(
            cfg.name,
            Math.floor(Math.min(1023, base + spike))
          );
          break;
        }
        case 'gas': {
          const curr = this.state.get(`${cfg.name}_val`) ?? 100;
          const next = Math.max(
            0,
            Math.min(1023, curr + (Math.random() - 0.48) * 8)
          );
          this.state.set(`${cfg.name}_val`, next);
          this.values.set(cfg.name, Math.floor(next));
          break;
        }
        case 'ir': {
          this.values.set(cfg.name, Math.random() < 0.15);
          break;
        }
        case 'flame': {
          const curr = this.state.get(`${cfg.name}_val`) ?? 0;
          const next = Math.max(
            0,
            Math.min(1023, curr + (Math.random() - 0.45) * 15)
          );
          this.state.set(`${cfg.name}_val`, next);
          this.values.set(cfg.name, Math.floor(next));
          break;
        }
        case 'pressure': {
          const curr = this.state.get(`${cfg.name}_val`) ?? 1013.25;
          const next = Math.max(
            300,
            Math.min(1100, curr + (Math.random() - 0.5) * 1.5)
          );
          this.state.set(`${cfg.name}_val`, next);
          this.values.set(cfg.name, Math.round(next * 100) / 100);
          break;
        }
        case 'color': {
          this.values.set(cfg.name, {
            r: Math.floor(80 + Math.random() * 175),
            g: Math.floor(80 + Math.random() * 175),
            b: Math.floor(80 + Math.random() * 175),
          });
          break;
        }
        case 'accelerometer': {
          this.values.set(cfg.name, {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
            z: 9.8 + (Math.random() - 0.5) * 0.5,
          });
          break;
        }
        // potentiometer and button are user-controlled, don't auto-update
      }
    }
  }

  read(name: string): unknown {
    return this.values.get(name);
  }

  setUserValue(name: string, value: unknown) {
    this.values.set(name, value);
  }
}
