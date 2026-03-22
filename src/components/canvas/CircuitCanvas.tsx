import { useMemo } from 'react';
import { ReactFlow, Background, MiniMap } from '@xyflow/react';
import { useBoardStore } from '../../store/boardStore';
import { SensorNode } from './nodes/SensorNode';
import { ActuatorNode } from './nodes/ActuatorNode';
import { MicrocontrollerNode } from './nodes/MicrocontrollerNode';
import { WireEdge } from './edges/WireEdge';
import { CanvasControls } from './CanvasControls';
import { PropertiesSidebar } from './PropertiesSidebar';

export function CircuitCanvas() {
  const nodes = useBoardStore((s) => s.nodes);
  const edges = useBoardStore((s) => s.edges);
  const onNodesChange = useBoardStore((s) => s.onNodesChange);
  const onEdgesChange = useBoardStore((s) => s.onEdgesChange);
  const onConnect = useBoardStore((s) => s.onConnect);

  const nodeTypes = useMemo(
    () => ({
      microcontroller: MicrocontrollerNode,
      sensor: SensorNode,
      actuator: ActuatorNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      wire: WireEdge,
    }),
    []
  );

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{ type: 'wire' }}
        proOptions={{ hideAttribution: true }}
        className="bg-bg-canvas"
      >
        <Background
          gap={20}
          size={1}
          color="#252D38"
        />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(n) => {
            const cat = (n.data as Record<string, unknown>)?.category;
            if (cat === 'microcontroller') return '#10B981';
            if (cat === 'sensor') return '#3B82F6';
            return '#F59E0B';
          }}
          maskColor="rgba(12, 15, 18, 0.8)"
          style={{ background: '#151A20' }}
        />
      </ReactFlow>
      <CanvasControls />
      <PropertiesSidebar />
    </div>
  );
}
