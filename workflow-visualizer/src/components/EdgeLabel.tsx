import React from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import styled from 'styled-components';

const EdgeLabelContainer = styled.div`
  position: absolute;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 85, 104, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #2d3748;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translate(-50%, -50%);
  pointer-events: all;
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 200px;
  text-align: center;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translate(-50%, -50%) scale(1.05);
  }
`;

const EdgeDescription = styled.div`
  margin-top: 4px;
  font-size: 10px;
  font-weight: 400;
  color: #718096;
  line-height: 1.3;
`;

const EdgeLabel: React.FC<EdgeProps> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
}) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <path
                id={id}
                className="react-flow__edge-path"
                d={edgePath}
                strokeWidth={4}
                stroke="#4a5568"
            />
            {data?.label && (
                <EdgeLabelRenderer>
                    <EdgeLabelContainer
                        style={{
                            left: labelX,
                            top: labelY,
                        }}
                    >
                        <div>{data.label}</div>
                        {data.description && (
                            <EdgeDescription>{data.description}</EdgeDescription>
                        )}
                    </EdgeLabelContainer>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default EdgeLabel; 