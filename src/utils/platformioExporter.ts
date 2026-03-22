import type { Node } from '@xyflow/react';
import { exportToArduino } from './arduinoExporter';

export function downloadPlatformIOProject(
  code: string,
  nodes: Node[],
  projectName: string
): void {
  const cppCode = '#include <Arduino.h>\n' + exportToArduino(code, nodes);
  const iniConfig = `[env:uno]
platform = atmelavr
board = uno
framework = arduino
monitor_speed = 9600

; Add any required libraries below
lib_deps =
  adafruit/DHT sensor library @ ^1.4.6
  adafruit/Adafruit Unified Sensor @ ^1.1.14
`;

  // Download main.cpp
  let blob = new Blob([cppCode], { type: 'text/plain' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  const safeName = projectName.replace(/[^a-zA-Z0-9-_]/g, '_');
  a.download = safeName + "_main.cpp";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Download platformio.ini
  setTimeout(() => {
    blob = new Blob([iniConfig], { type: 'text/plain' });
    url = URL.createObjectURL(blob);
    a = document.createElement('a');
    a.href = url;
    a.download = 'platformio.ini';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 400);
}
