import type { ProjectDef } from '../../engine/types';

export const beginnerProjects: ProjectDef[] = [
  {
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
  },
  {
    id: 'button-toggle',
    title: 'Button Toggle LED',
    difficulty: 1,
    category: 'Beginner',
    description: 'Press a button to toggle an LED on and off.',
    concepts: ['Digital Input', 'Boolean Logic', 'State Toggle'],
    components: [
      { type: 'arduino_uno', position: { x: 200, y: 200 } },
      { type: 'button', position: { x: 0, y: 200 } },
      { type: 'led_red', position: { x: 500, y: 200 } },
    ],
    connections: [
      { sourceType: 'button', sourcePin: 'OUT', targetType: 'arduino_uno', targetPin: 'D2' },
      { sourceType: 'arduino_uno', sourcePin: 'D13', targetType: 'led_red', targetPin: 'ANODE' },
    ],
    code: `let ledOn = 0;
let lastButton = 0;

function setup() {
  log("Button Toggle LED ready");
}

function loop() {
  let btn = readSensor("Button 1");
  if (btn && !lastButton) {
    ledOn = ledOn ? 0 : 1;
    writeActuator("LED 1", ledOn);
    log("LED toggled " + (ledOn ? "ON" : "OFF"));
  }
  lastButton = btn;
}`,
  },
  {
    id: 'pot-dimmer',
    title: 'Potentiometer Dimmer',
    difficulty: 1,
    category: 'Beginner',
    description: 'Use a potentiometer to control LED brightness.',
    concepts: ['Analog Input', 'map()', 'PWM Output'],
    components: [
      { type: 'arduino_uno', position: { x: 200, y: 200 } },
      { type: 'potentiometer', position: { x: 0, y: 200 } },
      { type: 'led_red', position: { x: 500, y: 200 } },
    ],
    connections: [
      { sourceType: 'potentiometer', sourcePin: 'WIPER', targetType: 'arduino_uno', targetPin: 'A0' },
      { sourceType: 'arduino_uno', sourcePin: 'D9', targetType: 'led_red', targetPin: 'ANODE' },
    ],
    code: `function setup() {
  log("Potentiometer Dimmer ready");
}

function loop() {
  let pot = readSensor("Potentiometer 1");
  let brightness = map(pot, 0, 1023, 0, 255);
  writeActuator("LED 1", Math.floor(brightness));
  log("Pot: " + pot + " -> Brightness: " + Math.floor(brightness));
  logData("potentiometer", pot);
  logData("brightness", brightness);
}`,
  },
  {
    id: 'traffic-light',
    title: 'Traffic Light',
    difficulty: 1,
    category: 'Beginner',
    description: 'Build a traffic light with red, yellow, and green LEDs.',
    concepts: ['Sequential Logic', 'Multiple Outputs', 'Timing'],
    components: [
      { type: 'arduino_uno', position: { x: 200, y: 200 } },
      { type: 'led_red', position: { x: 500, y: 100 } },
      { type: 'led_yellow', position: { x: 500, y: 200 } },
      { type: 'led_green', position: { x: 500, y: 300 } },
    ],
    connections: [
      { sourceType: 'arduino_uno', sourcePin: 'D11', targetType: 'led_red', targetPin: 'ANODE' },
      { sourceType: 'arduino_uno', sourcePin: 'D12', targetType: 'led_yellow', targetPin: 'ANODE' },
      { sourceType: 'arduino_uno', sourcePin: 'D13', targetType: 'led_green', targetPin: 'ANODE' },
    ],
    code: `let phase = 0;
let timer = 0;

function setup() {
  log("Traffic Light starting...");
}

function loop() {
  timer++;

  if (phase === 0 && timer > 5) {
    phase = 1; timer = 0;
  } else if (phase === 1 && timer > 2) {
    phase = 2; timer = 0;
  } else if (phase === 2 && timer > 5) {
    phase = 3; timer = 0;
  } else if (phase === 3 && timer > 2) {
    phase = 0; timer = 0;
  }

  writeActuator("LED 1", phase === 0 ? 255 : 0);
  writeActuator("LED Yellow 1", phase === 1 || phase === 3 ? 255 : 0);
  writeActuator("LED Green 1", phase === 2 ? 255 : 0);

  let state = ["RED", "YELLOW", "GREEN", "YELLOW"][phase];
  log("Traffic: " + state);
  delay(1000);
}`,
  },
  {
    id: 'buzzer-melody',
    title: 'Buzzer Melody',
    difficulty: 1,
    category: 'Beginner',
    description: 'Play a simple melody using a piezo buzzer.',
    concepts: ['Tone Generation', 'Arrays', 'Sequencing'],
    components: [
      { type: 'arduino_uno', position: { x: 200, y: 200 } },
      { type: 'buzzer', position: { x: 500, y: 200 } },
    ],
    connections: [
      { sourceType: 'arduino_uno', sourcePin: 'D8', targetType: 'buzzer', targetPin: 'SIGNAL' },
    ],
    code: `let notes = [262, 294, 330, 349, 392, 440, 494, 523];
let noteIndex = 0;

function setup() {
  log("Buzzer Melody - Playing scale...");
}

function loop() {
  let freq = notes[noteIndex % notes.length];
  writeActuator("Buzzer 1", freq);
  log("Note " + (noteIndex + 1) + ": " + freq + " Hz");
  logData("frequency", freq);
  noteIndex++;

  if (noteIndex >= notes.length) {
    noteIndex = 0;
    writeActuator("Buzzer 1", 0);
    delay(500);
  }
  delay(400);
}`,
  },
  {
    id: 'sos-morse',
    title: 'SOS Morse Code',
    difficulty: 1,
    category: 'Beginner',
    description: 'Blink an LED and beep a buzzer in SOS Morse code pattern.',
    concepts: ['Morse Code', 'Patterns', 'Timing Sequences'],
    components: [
      { type: 'arduino_uno', position: { x: 200, y: 200 } },
      { type: 'led_red', position: { x: 500, y: 150 } },
      { type: 'buzzer', position: { x: 500, y: 300 } },
    ],
    connections: [
      { sourceType: 'arduino_uno', sourcePin: 'D13', targetType: 'led_red', targetPin: 'ANODE' },
      { sourceType: 'arduino_uno', sourcePin: 'D8', targetType: 'buzzer', targetPin: 'SIGNAL' },
    ],
    code: `let pattern = [1,0,1,0,1,0,0,0,3,0,3,0,3,0,0,0,1,0,1,0,1,0,0,0,0,0];
let step = 0;

function setup() {
  log("SOS Morse Code starting...");
}

function loop() {
  let val = pattern[step % pattern.length];
  if (val > 0) {
    writeActuator("LED 1", 255);
    writeActuator("Buzzer 1", 800);
  } else {
    writeActuator("LED 1", 0);
    writeActuator("Buzzer 1", 0);
  }

  let symbol = val === 0 ? "gap" : val === 1 ? "dot" : "dash";
  log("SOS: " + symbol);
  step++;

  if (step >= pattern.length) {
    step = 0;
    log("--- SOS repeat ---");
  }
  delay(val === 3 ? 600 : 200);
}`,
  },
];
