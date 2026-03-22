import { memo } from 'react';
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { useCodeStore } from '../../../store/codeStore';

export const WireEdge = memo((props: EdgeProps) => {
  const isRunning = useCodeStore((s) => s.isRunning);
  const [edgePath] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
    borderRadius: 16,
  });

  return (
    <BaseEdge
      path={edgePath}
      style={{
        stroke: '#10B981',
        strokeWidth: 2,
        strokeDasharray: isRunning ? '8 4' : 'none',
        animation: isRunning ? 'wire-dash 0.5s linear infinite' : 'none',
      }}
    />
  );
});

WireEdge.displayName = 'WireEdge';
