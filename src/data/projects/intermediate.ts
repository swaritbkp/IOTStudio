import type { ProjectDef } from '../../engine/types';

export const intermediateProjects: ProjectDef[] = [
  {
    id: 'smart-night-light',
    title: 'Smart Night Light',
    difficulty: 2,
    category: 'Intermediate',
    description: 'LED brightness automatically adjusts based on ambient light.',
    concepts: ['Analog Mapping', 'Inverse Relationship', 'logData()'],
    components: [
      { type: 'arduino_uno', position: { x: 200, y: 200 } },
      { type: 'ldr', position: { x: 0, y: 200 } },
      { type: 'led_white', position: { x: 500, y: 200 } },
    ],
    connections: [
      { sourceType: 'ldr', sourcePin: 'AOUT', targetType: 'arduino_uno', targetPin: 'A0' },
      { sourceType: 'arduino_uno', sourcePin: 'D9', targetType: 'led_white', targetPin: 'ANODE' },
    ],
    code: `function setup() {
  log("Smart Night Light active");
}

function loop() {
  let light = readSensor("Light 1");
  let brightness = map(light, 0, 1023, 255, 0);
  brightness = constrain(brightness, 0, 255);
  writeActuator("LED White 1", Math.floor(brightness));
  log("Light: " + light + " -> LED: " + Math.floor(brightness));
  logData("light", light);
  logData("brightness", brightness);
}`,
  },
  {
    id: 'temperature-alarm',
    title: 'Temperature Alarm',
    difficulty: 2,
    category: 'Intermediate',
    description: 'Buzzer and LED alarm when temperature exceeds 30°C.',
    concepts: ['Threshold Detection', 'Conditional Logic', 'Multi-output'],
    components: [
      { type: 'arduino_uno', position: { x: 200, y: 200 } },
      { type: 'dht11', position: { x: 0, y: 200 } },
      { type: 'buzzer', position: { x: 500, y: 150 } },
      { type: 'led_red', position: { x: 500, y: 300 } },
    ],
    connections: [
      { sourceType: 'dht11', sourcePin: 'DATA', targetType: 'arduino_uno', targetPin: 'D2' },
      { sourceType: 'arduino_uno', sourcePin: 'D8', targetType: 'buzzer', targetPin: 'SIGNAL' },
      { sourceType: 'arduino_uno', sourcePin: 'D13', targetType: 'led_red', targetPin: 'ANODE' },
    ],
    code: `let threshold = 30;

function setup() {
  log("Temperature Alarm - Threshold: " + threshold + "°C");
}

function loop() {
  let temp = readSensor("Temperature 1");
  logData("temperature", temp);
  logData("threshold", threshold);

  if (temp > threshold) {
    writeActuator("Buzzer 1", 1000);
    writeActuator("LED 1", 255);
    log("ALARM! Temp: " + temp.toFixed(1) + "°C > " + threshold + "°C");
  } else {
    writeActuator("Buzzer 1", 0);
    writeActuator("LED 1", 0);
    log("Normal. Temp: " + temp.toFixed(1) + "°C");
  }
}`,
  },
  {
    id: 'smart-fan',
    title: 'Smart Fan',
    difficulty: 2,
    category: 'Intermediate',
    description: 'Fan speed proportional to temperature — hotter means faster.',
    concepts: ['Proportional Control', 'Analog Mapping', 'Motor PWM'],
    components: [
      { type: 'arduino_uno', position: { x: 200, y: 200 } },
      { type: 'dht11', position: { x: 0, y: 200 } },
      { type: 'dc_motor', position: { x: 500, y: 200 } },
    ],
    connections: [
      { sourceType: 'dht11', sourcePin: 'DATA', targetType: 'arduino_uno', targetPin: 'D2' },
      { sourceType: 'arduino_uno', sourcePin: 'D9', targetType: 'dc_motor', targetPin: 'PWM' },
    ],
    code: `function setup() {
  log("Smart Fan initialized");
}

function loop() {
  let temp = readSensor("Temperature 1");
  let speed = map(temp, 20, 40, 0, 255);
  speed = constrain(speed, 0, 255);
  writeActuator("DC Motor 1", Math.floor(speed));
  log("Temp: " + temp.toFixed(1) + "°C -> Fan: " + Math.floor(speed));
  logData("temperature", temp);
  logData("fan_speed", speed);
}`,
  },
  {
    id: 'distance-warning',
    title: 'Distance Warning',
    difficulty: 2,
    category: 'Intermediate',
    description: 'Buzzer beeps faster as objects get closer to ultrasonic sensor.',
    concepts: ['Distance Measurement', 'Frequency Mapping', 'Proximity Alert'],
    components: [
      { type: 'arduino_uno', position: { x: 200, y: 200 } },
      { type: 'hcsr04', position: { x: 0, y: 150 } },
      { type: 'buzzer', position: { x: 500, y: 150 } },
      { type: 'led_red', position: { x: 500, y: 300 } },
    ],
    connections: [
      { sourceType: 'hcsr04', sourcePin: 'ECHO', targetType: 'arduino_uno', targetPin: 'D3' },
      { sourceType: 'arduino_uno', sourcePin: 'D8', targetType: 'buzzer', targetPin: 'SIGNAL' },
      { sourceType: 'arduino_uno', sourcePin: 'D13', targetType: 'led_red', targetPin: 'ANODE' },
    ],
    code: `function setup() {
  log("Distance Warning System active");
}

function loop() {
  let dist = readSensor("Ultrasonic 1");
  logData("distance", dist);

  if (dist < 30) {
    let freq = map(dist, 0, 30, 2000, 500);
    writeActuator("Buzzer 1", Math.floor(freq));
    writeActuator("LED 1", 255);
    log("WARNING! Distance: " + dist.toFixed(1) + "cm Freq: " + Math.floor(freq) + "Hz");
  } else {
    writeActuator("Buzzer 1", 0);
    writeActuator("LED 1", 0);
    log("Clear. Distance: " + dist.toFixed(1) + "cm");
  }
}`,
  },
  {
    id: 'light-logger',
    title: 'Light Level Logger',
    difficulty: 2,
    category: 'Intermediate',
    description: 'Display light levels on LCD and log to chart.',
    concepts: ['LCD Display', 'Data Logging', 'String Formatting'],
    components: [
      { type: 'arduino_uno', position: { x: 200, y: 200 } },
      { type: 'ldr', position: { x: 0, y: 200 } },
      { type: 'lcd_16x2', position: { x: 500, y: 200 } },
    ],
    connections: [
      { sourceType: 'ldr', sourcePin: 'AOUT', targetType: 'arduino_uno', targetPin: 'A0' },
      { sourceType: 'arduino_uno', sourcePin: 'D4', targetType: 'lcd_16x2', targetPin: 'SDA' },
    ],
    code: `let minLight = 1023;
let maxLight = 0;

function setup() {
  log("Light Level Logger started");
  writeActuator("LCD 1", "Light Logger\\nInitializing...");
}

function loop() {
  let light = readSensor("Light 1");

  if (light < minLight) minLight = light;
  if (light > maxLight) maxLight = light;

  let level = light < 300 ? "Dark" : light < 600 ? "Dim" : light < 800 ? "Bright" : "Very Bright";
  let line1 = "Light: " + light;
  let line2 = level + " " + minLight + "-" + maxLight;

  writeActuator("LCD 1", line1 + "\\n" + line2);
  logData("light", light);
  logData("min", minLight);
  logData("max", maxLight);
  log(line1 + " | " + line2);
}`,
  },
  {
    id: 'motion-alarm',
    title: 'Motion Detector Alarm',
    difficulty: 2,
    category: 'Intermediate',
    description: 'PIR sensor triggers a 5-second alarm with buzzer and relay.',
    concepts: ['Motion Detection', 'Timer Logic', 'Relay Control'],
    components: [
      { type: 'arduino_uno', position: { x: 200, y: 200 } },
      { type: 'pir', position: { x: 0, y: 200 } },
      { type: 'buzzer', position: { x: 500, y: 100 } },
      { type: 'relay', position: { x: 500, y: 300 } },
    ],
    connections: [
      { sourceType: 'pir', sourcePin: 'OUT', targetType: 'arduino_uno', targetPin: 'D2' },
      { sourceType: 'arduino_uno', sourcePin: 'D8', targetType: 'buzzer', targetPin: 'SIGNAL' },
      { sourceType: 'arduino_uno', sourcePin: 'D7', targetType: 'relay', targetPin: 'IN' },
    ],
    code: `let alarmTimer = 0;
let alarmDuration = 5;

function setup() {
  log("Motion Detector Alarm ready");
}

function loop() {
  let motion = readSensor("Motion 1");

  if (motion) {
    alarmTimer = alarmDuration;
    log("MOTION DETECTED! Alarm activated");
  }

  if (alarmTimer > 0) {
    writeActuator("Buzzer 1", 1500);
    writeActuator("Relay 1", 1);
    log("ALARM ON - " + alarmTimer + "s remaining");
    alarmTimer--;
  } else {
    writeActuator("Buzzer 1", 0);
    writeActuator("Relay 1", 0);
  }
  logData("motion", motion ? 1 : 0);
  logData("alarm", alarmTimer > 0 ? 1 : 0);
  delay(1000);
}`,
  },
  {
    id: 'servo-controller',
    title: 'Servo Sweep Controller',
    difficulty: 2,
    category: 'Intermediate',
    description: 'Control servo angle with a potentiometer.',
    concepts: ['Servo Control', 'Analog to Angle', 'Real-time Control'],
    components: [
      { type: 'arduino_uno', position: { x: 200, y: 200 } },
      { type: 'potentiometer', position: { x: 0, y: 200 } },
      { type: 'servo', position: { x: 500, y: 200 } },
    ],
    connections: [
      { sourceType: 'potentiometer', sourcePin: 'WIPER', targetType: 'arduino_uno', targetPin: 'A0' },
      { sourceType: 'arduino_uno', sourcePin: 'D9', targetType: 'servo', targetPin: 'SIGNAL' },
    ],
    code: `function setup() {
  log("Servo Controller ready - turn the potentiometer");
}

function loop() {
  let pot = readSensor("Potentiometer 1");
  let angle = map(pot, 0, 1023, 0, 180);
  angle = constrain(Math.floor(angle), 0, 180);
  writeActuator("Servo 1", angle);
  log("Pot: " + pot + " -> Servo: " + angle + "°");
  logData("potentiometer", pot);
  logData("angle", angle);
}`,
  },
  {
    id: 'digital-thermometer',
    title: 'Digital Thermometer',
    difficulty: 2,
    category: 'Intermediate',
    description: 'Show temperature on a 7-segment display.',
    concepts: ['7-Segment Display', 'Number Display', 'Rounding'],
    components: [
      { type: 'arduino_uno', position: { x: 200, y: 200 } },
      { type: 'dht11', position: { x: 0, y: 200 } },
      { type: 'seven_segment', position: { x: 500, y: 200 } },
    ],
    connections: [
      { sourceType: 'dht11', sourcePin: 'DATA', targetType: 'arduino_uno', targetPin: 'D2' },
      { sourceType: 'arduino_uno', sourcePin: 'D7', targetType: 'seven_segment', targetPin: 'DATA' },
    ],
    code: `function setup() {
  log("Digital Thermometer ready");
}

function loop() {
  let temp = readSensor("Temperature 1");
  let display = Math.round(temp) % 10;
  writeActuator("7-Segment 1", display);
  log("Temp: " + temp.toFixed(1) + "°C -> Display: " + display);
  logData("temperature", temp);
}`,
  },
];
