import React from 'react';
import { Handle, Position } from 'reactflow';
import styled from 'styled-components';

const StageContainer = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 24px;
  min-width: 280px;
  max-width: 320px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #4299e1, #38a169, #ed8936);
    border-radius: 20px 20px 0 0;
  }
`;

const StageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const StageIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4299e1, #3182ce);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
`;

const StageTitle = styled.h3`
  margin: 0;
  color: #1a202c;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  flex: 1;
`;

const StageDescription = styled.p`
  margin: 0 0 16px 0;
  color: #2d3748;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const DrillDownHint = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  background: rgba(66, 153, 225, 0.1);
  border-radius: 8px;
  color: #3182ce;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  ${StageContainer}:hover & {
    background: rgba(66, 153, 225, 0.2);
    color: #2b77c4;
  }
`;

interface StageNodeProps {
    data: {
        label: string;
        description: string;
        stageId: string;
        onDrillDown: () => void;
    };
}

const StageNode: React.FC<StageNodeProps> = ({ data }) => {
    const getStageIcon = (stageId: string): string => {
        if (stageId.includes('1')) return '🧬';
        if (stageId.includes('2')) return '🔬';
        if (stageId.includes('3')) return '📊';
        if (stageId.includes('4')) return '🐭';
        if (stageId.includes('5')) return '🧠';
        return '⚗️';
    };

    return (
        <StageContainer onClick={data.onDrillDown}>
            <Handle
                type="target"
                position={Position.Left}
                style={{
                    background: '#4299e1',
                    border: '2px solid white',
                    width: '12px',
                    height: '12px',
                }}
            />

            <StageHeader>
                <StageIcon>
                    {getStageIcon(data.stageId)}
                </StageIcon>
                <StageTitle>{data.label}</StageTitle>
            </StageHeader>

            <StageDescription>
                {data.description}
            </StageDescription>

            <DrillDownHint>
                <span>🔍</span>
                <span>Click to explore detailed steps</span>
            </DrillDownHint>

            <Handle
                type="source"
                position={Position.Right}
                style={{
                    background: '#4299e1',
                    border: '2px solid white',
                    width: '12px',
                    height: '12px',
                }}
            />
        </StageContainer>
    );
};

export default StageNode; 