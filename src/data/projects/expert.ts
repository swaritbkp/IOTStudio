import type { ProjectDef } from '../../engine/types';

export const expertProjects: ProjectDef[] = [
  {
    id: 'pid-controller',
    title: 'PID Temperature Controller',
    difficulty: 4,
    category: 'Expert',
    description: 'Proportional-Integral-Derivative controller for temperature regulation.',
    concepts: ['PID Control', 'Feedback Loop', 'Control Theory'],
    components: [
      { type: 'esp32', position: { x: 250, y: 250 } },
      { type: 'dht11', position: { x: 0, y: 200 } },
      { type: 'dc_motor', position: { x: 550, y: 150 } },
      { type: 'lcd_16x2', position: { x: 550, y: 300 } },
      { type: 'oled_128x64', position: { x: 550, y: 450 } },
    ],
    connections: [
      { sourceType: 'dht11', sourcePin: 'DATA', targetType: 'esp32', targetPin: 'GPIO4' },
      { sourceType: 'esp32', sourcePin: 'GPIO25', targetType: 'dc_motor', targetPin: 'PWM' },
      { sourceType: 'esp32', sourcePin: 'GPIO21', targetType: 'lcd_16x2', targetPin: 'SDA' },
      { sourceType: 'esp32', sourcePin: 'GPIO22', targetType: 'oled_128x64', targetPin: 'SDA' },
    ],
    code: `let targetTemp = 28;
let integral = 0;
let lastError = 0;
let kp = 2.0;
let ki = 0.5;
let kd = 1.0;

function setup() {
  log("PID Controller - Target: " + targetTemp + "°C");
  writeActuator("LCD 1", "PID Target:" + targetTemp);
}

function loop() {
  let temp = readSensor("Temperature 1");
  let error = targetTemp - temp;

  integral = constrain(integral + error, -50, 50);
  let derivative = error - lastError;
  lastError = error;

  let output = kp * error + ki * integral + kd * derivative;
  output = constrain(output, 0, 255);

  writeActuator("DC Motor 1", Math.floor(output));
  writeActuator("LCD 1", "T:" + temp.toFixed(1) + " Out:" + Math.floor(output));
  writeActuator("OLED 1", "PID Controller\\nTemp:" + temp.toFixed(1) + "°C\\nTarget:" + targetTemp + "°C\\nOutput:" + Math.floor(output));

  logData("temperature", temp);
  logData("target", targetTemp);
  logData("output", output);
  logData("error", error);

  log("Temp:" + temp.toFixed(1) + " Err:" + error.toFixed(1) + " Out:" + Math.floor(output));
}`,
  },
  {
    id: 'earthquake-detector',
    title: 'Earthquake Detector',
    difficulty: 4,
    category: 'Expert',
    description: 'Detect vibrations with accelerometer and trigger multi-level alerts.',
    concepts: ['Vibration Detection', 'Magnitude Calculation', 'Alert Levels'],
    components: [
      { type: 'arduino_uno', position: { x: 250, y: 250 } },
      { type: 'mpu6050', position: { x: 0, y: 200 } },
      { type: 'buzzer', position: { x: 550, y: 100 } },
      { type: 'neopixel', position: { x: 550, y: 250 } },
      { type: 'lcd_16x2', position: { x: 550, y: 400 } },
    ],
    connections: [
      { sourceType: 'mpu6050', sourcePin: 'SDA', targetType: 'arduino_uno', targetPin: 'A4' },
      { sourceType: 'arduino_uno', sourcePin: 'D8', targetType: 'buzzer', targetPin: 'SIGNAL' },
      { sourceType: 'arduino_uno', sourcePin: 'D6', targetType: 'neopixel', targetPin: 'DATA' },
      { sourceType: 'arduino_uno', sourcePin: 'D4', targetType: 'lcd_16x2', targetPin: 'SDA' },
    ],
    code: `let baseline = 9.8;
let peakMag = 0;

function setup() {
  log("Earthquake Detector calibrating...");
  writeActuator("LCD 1", "Earthquake Detect\\nCalibrating...");
}

function loop() {
  let accel = readSensor("Accelerometer 1");
  let mag = Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
  let deviation = Math.abs(mag - baseline);

  if (deviation > peakMag) peakMag = deviation;

  let level = "SAFE";
  let buzzerFreq = 0;
  let color = [0, 255, 0];

  if (deviation > 3) {
    level = "SEVERE";
    buzzerFreq = 3000;
    color = [255, 0, 0];
  } else if (deviation > 1.5) {
    level = "MODERATE";
    buzzerFreq = 1500;
    color = [255, 165, 0];
  } else if (deviation > 0.5) {
    level = "MINOR";
    buzzerFreq = 500;
    color = [255, 255, 0];
  }

  writeActuator("Buzzer 1", buzzerFreq);
  writeActuator("LED Strip 1", color);
  writeActuator("LCD 1", level + " d:" + deviation.toFixed(2) + "\\nPeak:" + peakMag.toFixed(2));

  logData("magnitude", mag);
  logData("deviation", deviation);
  logData("peak", peakMag);

  log(level + " | Mag:" + mag.toFixed(2) + " Dev:" + deviation.toFixed(2));
}`,
  },
  {
    id: 'smart-parking',
    title: 'Smart Parking System',
    difficulty: 4,
    category: 'Expert',
    description: '4-slot parking system with ultrasonic sensors, gate servo, and display.',
    concepts: ['Multi-sensor Array', 'Slot Management', 'Gate Control'],
    components: [
      { type: 'esp32', position: { x: 250, y: 300 } },
      { type: 'hcsr04', position: { x: 0, y: 75 } },
      { type: 'hcsr04', position: { x: 0, y: 200 } },
      { type: 'hcsr04', position: { x: 0, y: 325 } },
      { type: 'hcsr04', position: { x: 0, y: 450 } },
      { type: 'neopixel', position: { x: 550, y: 100 } },
      { type: 'lcd_16x2', position: { x: 550, y: 275 } },
      { type: 'servo', position: { x: 550, y: 450 } },
    ],
    connections: [
      { sourceType: 'hcsr04', sourcePin: 'ECHO', targetType: 'esp32', targetPin: 'GPIO4' },
      { sourceType: 'hcsr04', sourcePin: 'ECHO', targetType: 'esp32', targetPin: 'GPIO5' },
      { sourceType: 'hcsr04', sourcePin: 'ECHO', targetType: 'esp32', targetPin: 'GPIO18' },
      { sourceType: 'hcsr04', sourcePin: 'ECHO', targetType: 'esp32', targetPin: 'GPIO19' },
      { sourceType: 'esp32', sourcePin: 'GPIO25', targetType: 'neopixel', targetPin: 'DATA' },
      { sourceType: 'esp32', sourcePin: 'GPIO21', targetType: 'lcd_16x2', targetPin: 'SDA' },
      { sourceType: 'esp32', sourcePin: 'GPIO26', targetType: 'servo', targetPin: 'SIGNAL' },
    ],
    code: `let gateTimer = 0;

function setup() {
  log("Smart Parking System - 4 slots");
  writeActuator("Servo 1", 0);
  writeActuator("LCD 1", "Parking System\\nInitializing...");
}

function loop() {
  let d1 = readSensor("Ultrasonic 1");
  let d2 = readSensor("Ultrasonic 2");
  let d3 = readSensor("Ultrasonic 3");
  let d4 = readSensor("Ultrasonic 4");

  let s1 = d1 < 20 ? 1 : 0;
  let s2 = d2 < 20 ? 1 : 0;
  let s3 = d3 < 20 ? 1 : 0;
  let s4 = d4 < 20 ? 1 : 0;

  let occupied = s1 + s2 + s3 + s4;
  let available = 4 - occupied;

  let color = available > 2 ? [0, 255, 0] : available > 0 ? [255, 165, 0] : [255, 0, 0];
  writeActuator("LED Strip 1", color);

  let line1 = "Slots: " + s1 + s2 + s3 + s4;
  let line2 = "Avail: " + available + "/4";
  writeActuator("LCD 1", line1 + "\\n" + line2);

  if (available > 0 && gateTimer <= 0) {
    writeActuator("Servo 1", 90);
    gateTimer = 5;
  }
  if (gateTimer > 0) {
    gateTimer--;
    if (gateTimer <= 0) writeActuator("Servo 1", 0);
  }

  logData("occupied", occupied);
  logData("available", available);
  log(line1 + " | " + line2);
  delay(1000);
}`,
  },
  {
    id: 'tank-monitor',
    title: 'Industrial Tank Monitor',
    difficulty: 4,
    category: 'Expert',
    description: 'Monitor tank levels, pressure, and temperature with automated valve control.',
    concepts: ['Industrial Control', 'Safety Interlocks', 'Multi-parameter Monitoring'],
    components: [
      { type: 'esp32', position: { x: 250, y: 300 } },
      { type: 'hcsr04', position: { x: 0, y: 100 } },
      { type: 'bmp180', position: { x: 0, y: 250 } },
      { type: 'dht11', position: { x: 0, y: 400 } },
      { type: 'solenoid', position: { x: 550, y: 100 } },
      { type: 'relay', position: { x: 550, y: 225 } },
      { type: 'lcd_16x2', position: { x: 550, y: 350 } },
      { type: 'oled_128x64', position: { x: 550, y: 475 } },
    ],
    connections: [
      { sourceType: 'hcsr04', sourcePin: 'ECHO', targetType: 'esp32', targetPin: 'GPIO4' },
      { sourceType: 'bmp180', sourcePin: 'SDA', targetType: 'esp32', targetPin: 'GPIO21' },
      { sourceType: 'dht11', sourcePin: 'DATA', targetType: 'esp32', targetPin: 'GPIO5' },
      { sourceType: 'esp32', sourcePin: 'GPIO25', targetType: 'solenoid', targetPin: 'IN' },
      { sourceType: 'esp32', sourcePin: 'GPIO26', targetType: 'relay', targetPin: 'IN' },
      { sourceType: 'esp32', sourcePin: 'GPIO16', targetType: 'lcd_16x2', targetPin: 'SDA' },
      { sourceType: 'esp32', sourcePin: 'GPIO17', targetType: 'oled_128x64', targetPin: 'SDA' },
    ],
    code: `let tankHeight = 200;
let maxPressure = 1050;
let maxTemp = 40;

function setup() {
  log("Industrial Tank Monitor online");
  writeActuator("LCD 1", "Tank Monitor\\nStarting...");
}

function loop() {
  let dist = readSensor("Ultrasonic 1");
  let pressure = readSensor("Pressure 1");
  let temp = readSensor("Temperature 1");

  let level = constrain(tankHeight - dist, 0, tankHeight);
  let levelPct = Math.floor((level / tankHeight) * 100);

  let valveOpen = levelPct > 90 || pressure > maxPressure || temp > maxTemp;
  let pumpOn = levelPct < 20 && pressure < maxPressure && temp < maxTemp;

  writeActuator("Solenoid Valve 1", valveOpen ? 1 : 0);
  writeActuator("Relay 1", pumpOn ? 1 : 0);

  let line1 = "Lvl:" + levelPct + "% P:" + pressure.toFixed(0);
  let line2 = "T:" + temp.toFixed(1) + "C " + (valveOpen ? "DRAIN" : pumpOn ? "FILL" : "HOLD");
  writeActuator("LCD 1", line1 + "\\n" + line2);
  writeActuator("OLED 1", "Tank Monitor\\n" + line1 + "\\n" + line2);

  logData("level_pct", levelPct);
  logData("pressure", pressure);
  logData("temperature", temp);

  log(line1 + " | " + line2);
}`,
  },
  {
    id: 'wireless-sensor-network',
    title: 'Wireless Sensor Network',
    difficulty: 4,
    category: 'Expert',
    description: 'Two ESP32 nodes sharing sensor data over simulated wireless link.',
    concepts: ['Wireless Communication', 'Node Network', 'Data Aggregation'],
    components: [
      { type: 'esp32', position: { x: 150, y: 250 } },
      { type: 'esp32', position: { x: 500, y: 250 } },
      { type: 'dht11', position: { x: 0, y: 150 } },
      { type: 'ldr', position: { x: 0, y: 350 } },
      { type: 'lcd_16x2', position: { x: 700, y: 250 } },
    ],
    connections: [
      { sourceType: 'dht11', sourcePin: 'DATA', targetType: 'esp32', targetPin: 'GPIO4' },
      { sourceType: 'ldr', sourcePin: 'AOUT', targetType: 'esp32', targetPin: 'GPIO36' },
      { sourceType: 'esp32', sourcePin: 'GPIO21', targetType: 'lcd_16x2', targetPin: 'SDA' },
    ],
    code: `let nodeATemp = 0;
let nodeALight = 0;
let packetCount = 0;

function setup() {
  log("Wireless Sensor Network");
  log("Node A: Temp + Light sensors");
  log("Node B: Display gateway");
  writeActuator("LCD 1", "WSN Gateway\\nWaiting...");
}

function loop() {
  nodeATemp = readSensor("Temperature 1");
  nodeALight = readSensor("Light 1");
  packetCount++;

  let rssi = -30 - Math.floor(Math.random() * 40);

  let line1 = "A:T" + nodeATemp.toFixed(1) + " L" + nodeALight;
  let line2 = "Pkt:" + packetCount + " " + rssi + "dBm";
  writeActuator("LCD 1", line1 + "\\n" + line2);

  logData("node_a_temp", nodeATemp);
  logData("node_a_light", nodeALight);
  logData("rssi", rssi);
  logData("packets", packetCount);

  log("TX[A]->" + line1 + " RSSI:" + rssi);
  delay(2000);
}`,
  },
];
