import type { ProjectDef } from '../engine/types';

export const STARTER_PROJECT: ProjectDef = {
  id: 'blink-led',
  title: 'Blink LED',
  difficulty: 1,
  category: 'Beginner',
  description: 'The classic first project — make an LED blink on and off.',
  concepts: ['Digital Output', 'setup/loop', 'delay()'],
  components: [
    { type: 'arduino_uno', position: { x: 200, y: 200 } },
    { type: 'led_red', position: { x: 500, y: 200 } },
  ],
  connections: [
    { sourceType: 'arduino_uno', sourcePin: 'D13', targetType: 'led_red', targetPin: 'ANODE' },
  ],
  code: `let ledState = 0;

function setup() {
  log("Starting Blink LED...");
}

function loop() {
  ledState = ledState === 0 ? 1 : 0;
  writeActuator("LED 1", ledState);
  log("LED is " + (ledState ? "ON" : "OFF"));
  delay(1000);
}`,
};
