export interface PinDef {
  id: string;
  type: 'digital' | 'analog' | 'pwm' | 'i2c' | 'spi' | 'uart';
  direction: 'input' | 'output' | 'both';
}

export interface ComponentDef {
  type: string;
  category: 'microcontroller' | 'sensor' | 'actuator' | 'module';
  name: string;
  icon: string;
  pins: PinDef[];
  defaultValue: unknown;
  simulationType: string;
  description: string;
  color?: string;
  interactable?: boolean;
}

export interface ProjectComponent {
  type: string;
  position: { x: number; y: number };
}

export interface ProjectConnection {
  sourceType: string;
  sourcePin: string;
  targetType: string;
  targetPin: string;
}

export interface ProjectDef {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3 | 4;
  category: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  description: string;
  concepts: string[];
  components: ProjectComponent[];
  connections: ProjectConnection[];
  code: string;
}

export interface SavedProject {
  id: string;
  name: string;
  description?: string;
  savedAt: string;
  updatedAt: string;
  boardState: {
    nodes: unknown[];
    edges: unknown[];
    viewport: { x: number; y: number; zoom: number };
  };
  code: string;
}

export interface SimulationCallbacks {
  onActuatorChange: (name: string, value: unknown) => void;
  onLog: (msg: string, ts: number) => void;
  onLogData: (key: string, value: number, ts: number) => void;
  onError: (err: string) => void;
}

export interface SerialLogEntry {
  message: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: number;
}

export interface ModelDef {
  id: string;
  name: string;
  provider: string;
  context: number;
  category: 'code' | 'reasoning' | 'general' | 'lightweight' | 'auto';
  isDefault?: boolean;
}
