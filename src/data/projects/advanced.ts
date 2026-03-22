import type { ProjectDef } from '../../engine/types';

export const advancedProjects: ProjectDef[] = [
  {
    id: 'weather-station',
    title: 'Weather Station',
    difficulty: 3,
    category: 'Advanced',
    description: 'Full weather dashboard with multiple sensors, LCD, and charts.',
    concepts: ['Multi-sensor', 'Dashboard', 'Data Logging'],
    components: [
      { type: 'esp32', position: { x: 250, y: 250 } },
      { type: 'dht11', position: { x: 0, y: 100 } },
      { type: 'bmp180', position: { x: 0, y: 250 } },
      { type: 'ldr', position: { x: 0, y: 400 } },
      { type: 'lcd_16x2', position: { x: 550, y: 150 } },
      { type: 'oled_128x64', position: { x: 550, y: 350 } },
    ],
    connections: [
      { sourceType: 'dht11', sourcePin: 'DATA', targetType: 'esp32', targetPin: 'GPIO4' },
      { sourceType: 'bmp180', sourcePin: 'SDA', targetType: 'esp32', targetPin: 'GPIO21' },
      { sourceType: 'ldr', sourcePin: 'AOUT', targetType: 'esp32', targetPin: 'GPIO36' },
      { sourceType: 'esp32', sourcePin: 'GPIO16', targetType: 'lcd_16x2', targetPin: 'SDA' },
      { sourceType: 'esp32', sourcePin: 'GPIO17', targetType: 'oled_128x64', targetPin: 'SDA' },
    ],
    code: `function setup() {
  log("Weather Station initializing...");
  writeActuator("LCD 1", "Weather Station\\nStarting...");
}

function loop() {
  let temp = readSensor("Temperature 1");
  let hum = readSensor("Humidity 1");
  let pressure = readSensor("Pressure 1");
  let light = readSensor("Light 1");

  let line1 = "T:" + temp.toFixed(1) + "C H:" + hum.toFixed(0) + "%";
  let line2 = "P:" + pressure.toFixed(0) + "hPa L:" + light;
  writeActuator("LCD 1", line1 + "\\n" + line2);
  writeActuator("OLED 1", "Weather Dashboard\\n" + line1 + "\\n" + line2);

  logData("temperature", temp);
  logData("humidity", hum);
  logData("pressure", pressure);
  logData("light", light);

  log(line1 + " | " + line2);
}`,
  },
  {
    id: 'intruder-detection',
    title: 'Intruder Detection',
    difficulty: 3,
    category: 'Advanced',
    description: 'Dual-sensor verification: PIR + Ultrasonic for reliable detection.',
    concepts: ['Dual Verification', 'State Machine', 'Multi-sensor Fusion'],
    components: [
      { type: 'arduino_uno', position: { x: 250, y: 250 } },
      { type: 'pir', position: { x: 0, y: 150 } },
      { type: 'hcsr04', position: { x: 0, y: 350 } },
      { type: 'buzzer', position: { x: 550, y: 100 } },
      { type: 'relay', position: { x: 550, y: 250 } },
      { type: 'led_red', position: { x: 550, y: 400 } },
    ],
    connections: [
      { sourceType: 'pir', sourcePin: 'OUT', targetType: 'arduino_uno', targetPin: 'D2' },
      { sourceType: 'hcsr04', sourcePin: 'ECHO', targetType: 'arduino_uno', targetPin: 'D3' },
      { sourceType: 'arduino_uno', sourcePin: 'D8', targetType: 'buzzer', targetPin: 'SIGNAL' },
      { sourceType: 'arduino_uno', sourcePin: 'D7', targetType: 'relay', targetPin: 'IN' },
      { sourceType: 'arduino_uno', sourcePin: 'D13', targetType: 'led_red', targetPin: 'ANODE' },
    ],
    code: `let alertLevel = 0;
let alertTimer = 0;

function setup() {
  log("Intruder Detection System armed");
}

function loop() {
  let motion = readSensor("Motion 1");
  let dist = readSensor("Ultrasonic 1");
  let nearObject = dist < 50;

  if (motion && nearObject) {
    alertLevel = 2;
    alertTimer = 10;
    log("INTRUDER CONFIRMED! PIR + Ultrasonic triggered");
  } else if (motion || nearObject) {
    if (alertLevel < 2) alertLevel = 1;
    log("Suspicious: " + (motion ? "motion" : "proximity") + " detected");
  }

  if (alertTimer > 0) {
    alertTimer--;
  } else {
    alertLevel = 0;
  }

  writeActuator("LED 1", alertLevel > 0 ? 255 : 0);
  writeActuator("Buzzer 1", alertLevel === 2 ? 2000 : 0);
  writeActuator("Relay 1", alertLevel === 2 ? 1 : 0);

  logData("distance", dist);
  logData("motion", motion ? 1 : 0);
  logData("alert", alertLevel);
  delay(500);
}`,
  },
  {
    id: 'smart-greenhouse',
    title: 'Smart Greenhouse',
    difficulty: 3,
    category: 'Advanced',
    description: 'Auto-control fan, pump, and lights based on sensor readings.',
    concepts: ['Automated Control', 'Multi-actuator', 'Threshold Logic'],
    components: [
      { type: 'esp32', position: { x: 250, y: 250 } },
      { type: 'dht11', position: { x: 0, y: 100 } },
      { type: 'soil_moisture', position: { x: 0, y: 250 } },
      { type: 'ldr', position: { x: 0, y: 400 } },
      { type: 'relay', position: { x: 550, y: 100 } },
      { type: 'dc_motor', position: { x: 550, y: 250 } },
      { type: 'led_white', position: { x: 550, y: 400 } },
    ],
    connections: [
      { sourceType: 'dht11', sourcePin: 'DATA', targetType: 'esp32', targetPin: 'GPIO4' },
      { sourceType: 'soil_moisture', sourcePin: 'AOUT', targetType: 'esp32', targetPin: 'GPIO36' },
      { sourceType: 'ldr', sourcePin: 'AOUT', targetType: 'esp32', targetPin: 'GPIO39' },
      { sourceType: 'esp32', sourcePin: 'GPIO25', targetType: 'relay', targetPin: 'IN' },
      { sourceType: 'esp32', sourcePin: 'GPIO26', targetType: 'dc_motor', targetPin: 'PWM' },
      { sourceType: 'esp32', sourcePin: 'GPIO27', targetType: 'led_white', targetPin: 'ANODE' },
    ],
    code: `function setup() {
  log("Smart Greenhouse initializing...");
}

function loop() {
  let temp = readSensor("Temperature 1");
  let soil = readSensor("Soil Moisture 1");
  let light = readSensor("Light 1");

  let fanSpeed = 0;
  if (temp > 30) fanSpeed = map(temp, 30, 45, 100, 255);
  fanSpeed = constrain(fanSpeed, 0, 255);
  writeActuator("DC Motor 1", Math.floor(fanSpeed));

  let needWater = soil < 400;
  writeActuator("Relay 1", needWater ? 1 : 0);

  let lampBrightness = 0;
  if (light < 300) lampBrightness = map(light, 0, 300, 255, 0);
  writeActuator("LED White 1", Math.floor(constrain(lampBrightness, 0, 255)));

  logData("temperature", temp);
  logData("soil_moisture", soil);
  logData("light", light);
  logData("fan_speed", fanSpeed);

  log("T:" + temp.toFixed(1) + " Soil:" + soil + " Light:" + light +
      " Fan:" + Math.floor(fanSpeed) + " Pump:" + (needWater ? "ON" : "OFF"));
}`,
  },
  {
    id: 'home-security',
    title: 'Home Security Dashboard',
    difficulty: 3,
    category: 'Advanced',
    description: 'Multi-zone security with PIR, ultrasonic, flame, and gas sensors.',
    concepts: ['Multi-zone Security', 'Priority Alerts', 'Dashboard'],
    components: [
      { type: 'esp32', position: { x: 250, y: 250 } },
      { type: 'pir', position: { x: 0, y: 50 } },
      { type: 'hcsr04', position: { x: 0, y: 175 } },
      { type: 'flame', position: { x: 0, y: 300 } },
      { type: 'mq2', position: { x: 0, y: 425 } },
      { type: 'buzzer', position: { x: 550, y: 100 } },
      { type: 'relay', position: { x: 550, y: 250 } },
      { type: 'lcd_16x2', position: { x: 550, y: 400 } },
    ],
    connections: [
      { sourceType: 'pir', sourcePin: 'OUT', targetType: 'esp32', targetPin: 'GPIO4' },
      { sourceType: 'hcsr04', sourcePin: 'ECHO', targetType: 'esp32', targetPin: 'GPIO5' },
      { sourceType: 'flame', sourcePin: 'AOUT', targetType: 'esp32', targetPin: 'GPIO36' },
      { sourceType: 'mq2', sourcePin: 'AOUT', targetType: 'esp32', targetPin: 'GPIO39' },
      { sourceType: 'esp32', sourcePin: 'GPIO25', targetType: 'buzzer', targetPin: 'SIGNAL' },
      { sourceType: 'esp32', sourcePin: 'GPIO26', targetType: 'relay', targetPin: 'IN' },
      { sourceType: 'esp32', sourcePin: 'GPIO21', targetType: 'lcd_16x2', targetPin: 'SDA' },
    ],
    code: `let alerts = [];

function setup() {
  log("Home Security Dashboard online");
  writeActuator("LCD 1", "Security System\\nAll Clear");
}

function loop() {
  alerts = [];
  let motion = readSensor("Motion 1");
  let dist = readSensor("Ultrasonic 1");
  let flame = readSensor("Flame 1");
  let gas = readSensor("Gas 1");

  if (flame > 500) alerts.push("FIRE");
  if (gas > 600) alerts.push("GAS");
  if (motion) alerts.push("MOTION");
  if (dist < 30) alerts.push("PROX");

  let isCritical = flame > 500 || gas > 600;
  writeActuator("Buzzer 1", isCritical ? 2500 : alerts.length > 0 ? 1000 : 0);
  writeActuator("Relay 1", alerts.length > 0 ? 1 : 0);

  let line1 = alerts.length > 0 ? "ALERT:" + alerts.join(",") : "All Clear";
  let line2 = "F:" + flame + " G:" + gas;
  writeActuator("LCD 1", line1 + "\\n" + line2);

  logData("flame", flame);
  logData("gas", gas);
  logData("distance", dist);
  logData("alerts", alerts.length);

  log(line1 + " | " + line2);
}`,
  },
  {
    id: 'line-following-robot',
    title: 'Line Following Robot Sim',
    difficulty: 3,
    category: 'Advanced',
    description: 'Simulated differential drive robot using 2 IR sensors.',
    concepts: ['Differential Drive', 'IR Sensing', 'Robot Control'],
    components: [
      { type: 'arduino_uno', position: { x: 250, y: 250 } },
      { type: 'ir_sensor', position: { x: 0, y: 150 } },
      { type: 'ir_sensor', position: { x: 0, y: 350 } },
      { type: 'dc_motor', position: { x: 550, y: 150 } },
      { type: 'dc_motor', position: { x: 550, y: 350 } },
    ],
    connections: [
      { sourceType: 'ir_sensor', sourcePin: 'OUT', targetType: 'arduino_uno', targetPin: 'D2' },
      { sourceType: 'ir_sensor', sourcePin: 'OUT', targetType: 'arduino_uno', targetPin: 'D3' },
      { sourceType: 'arduino_uno', sourcePin: 'D9', targetType: 'dc_motor', targetPin: 'PWM' },
      { sourceType: 'arduino_uno', sourcePin: 'D10', targetType: 'dc_motor', targetPin: 'PWM' },
    ],
    code: `let baseSpeed = 180;

function setup() {
  log("Line Following Robot initialized");
}

function loop() {
  let leftSensor = readSensor("IR Sensor 1");
  let rightSensor = readSensor("IR Sensor 2");

  let leftMotor = baseSpeed;
  let rightMotor = baseSpeed;

  if (leftSensor && !rightSensor) {
    leftMotor = 80;
    rightMotor = baseSpeed;
    log("Turning LEFT");
  } else if (!leftSensor && rightSensor) {
    leftMotor = baseSpeed;
    rightMotor = 80;
    log("Turning RIGHT");
  } else if (leftSensor && rightSensor) {
    leftMotor = 0;
    rightMotor = 0;
    log("STOP - both sensors triggered");
  } else {
    log("Going STRAIGHT");
  }

  writeActuator("DC Motor 1", leftMotor);
  writeActuator("DC Motor 2", rightMotor);
  logData("leftMotor", leftMotor);
  logData("rightMotor", rightMotor);
}`,
  },
  {
    id: 'color-sorter',
    title: 'Color Sorting System',
    difficulty: 3,
    category: 'Advanced',
    description: 'Detect colors and sort objects using servo gates.',
    concepts: ['Color Detection', 'Servo Positioning', 'Classification'],
    components: [
      { type: 'arduino_uno', position: { x: 250, y: 250 } },
      { type: 'tcs3200', position: { x: 0, y: 200 } },
      { type: 'servo', position: { x: 550, y: 150 } },
      { type: 'lcd_16x2', position: { x: 550, y: 350 } },
    ],
    connections: [
      { sourceType: 'tcs3200', sourcePin: 'OUT', targetType: 'arduino_uno', targetPin: 'D2' },
      { sourceType: 'arduino_uno', sourcePin: 'D9', targetType: 'servo', targetPin: 'SIGNAL' },
      { sourceType: 'arduino_uno', sourcePin: 'D4', targetType: 'lcd_16x2', targetPin: 'SDA' },
    ],
    code: `let sortCount = 0;

function setup() {
  log("Color Sorting System ready");
  writeActuator("Servo 1", 90);
  writeActuator("LCD 1", "Color Sorter\\nReady...");
}

function loop() {
  let color = readSensor("Color 1");
  let r = color.r;
  let g = color.g;
  let b = color.b;

  let detected = "unknown";
  let angle = 90;

  if (r > 180 && g < 100 && b < 100) {
    detected = "RED";
    angle = 30;
  } else if (r < 100 && g > 180 && b < 100) {
    detected = "GREEN";
    angle = 90;
  } else if (r < 100 && g < 100 && b > 180) {
    detected = "BLUE";
    angle = 150;
  }

  if (detected !== "unknown") {
    sortCount++;
    writeActuator("Servo 1", angle);
    writeActuator("LCD 1", "Detected: " + detected + "\\nCount: " + sortCount);
    log("Sorted " + detected + " -> " + angle + "° (#" + sortCount + ")");
  }

  logData("red", r);
  logData("green", g);
  logData("blue", b);
}`,
  },
];
