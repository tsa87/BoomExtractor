import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import styled from 'styled-components';
import { WorkflowMetadata } from '../types/workflow';

const StepContainer = styled.div<{ stepType: string }>`
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid ${props => {
    switch (props.stepType) {
      case 'Experimental': return '#38a169';
      case 'Computational': return '#4299e1';
      default: return '#ed8936';
    }
  }};
  border-radius: 16px;
  padding: 20px;
  min-width: 260px;
  max-width: 300px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const StepNumber = styled.div<{ stepType: string }>`
  position: absolute;
  top: -10px;
  left: 15px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => {
    switch (props.stepType) {
      case 'Experimental': return 'linear-gradient(135deg, #38a169, #2f855a)';
      case 'Computational': return 'linear-gradient(135deg, #4299e1, #3182ce)';
      default: return 'linear-gradient(135deg, #ed8936, #dd6b20)';
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 3px solid white;
`;

const StepHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  margin-top: 8px;
`;

const StepTypeIcon = styled.div<{ stepType: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => {
    switch (props.stepType) {
      case 'Experimental': return 'linear-gradient(135deg, #38a169, #2f855a)';
      case 'Computational': return 'linear-gradient(135deg, #4299e1, #3182ce)';
      default: return 'linear-gradient(135deg, #ed8936, #dd6b20)';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  flex-shrink: 0;
`;

const StepInfo = styled.div`
  flex: 1;
`;

const StepTitle = styled.h4`
  margin: 0 0 4px 0;
  color: #1a202c;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
`;

const StepType = styled.span<{ stepType: string }>`
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${props => {
    switch (props.stepType) {
      case 'Experimental': return 'rgba(56, 161, 105, 0.1)';
      case 'Computational': return 'rgba(66, 153, 225, 0.1)';
      default: return 'rgba(237, 131, 54, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.stepType) {
      case 'Experimental': return '#2f855a';
      case 'Computational': return '#3182ce';
      default: return '#dd6b20';
    }
  }};
`;

const StepDescription = styled.p`
  margin: 12px 0;
  color: #4a5568;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MetadataToggle = styled.button`
  width: 100%;
  padding: 8px;
  background: rgba(74, 85, 104, 0.05);
  border: 1px solid rgba(74, 85, 104, 0.1);
  border-radius: 8px;
  color: #4a5568;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    background: rgba(74, 85, 104, 0.1);
    border-color: rgba(74, 85, 104, 0.2);
  }
`;

const MetadataPanel = styled.div<{ expanded: boolean }>`
  margin-top: 12px;
  max-height: ${props => props.expanded ? '200px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const MetadataGrid = styled.div`
  display: grid;
  gap: 8px;
  padding: 12px;
  background: rgba(74, 85, 104, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(74, 85, 104, 0.1);
`;

const MetadataItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  font-size: 11px;
`;

const MetadataKey = styled.span`
  color: #718096;
  font-weight: 600;
  min-width: 80px;
  text-transform: capitalize;
`;

const MetadataValue = styled.span`
  color: #2d3748;
  text-align: right;
  word-break: break-word;
  flex: 1;
`;

interface StepNodeProps {
  data: {
    label: string;
    description: string;
    type: string;
    metadata: WorkflowMetadata;
    stepNumber?: number;
  };
}

const StepNode: React.FC<StepNodeProps> = ({ data }) => {
  const [metadataExpanded, setMetadataExpanded] = useState(false);

  // Defensive check for data
  if (!data) {
    return (
      <StepContainer stepType="default">
        <div>No step data available</div>
      </StepContainer>
    );
  }

  const getStepIcon = (type: string): string => {
    switch (type) {
      case 'Experimental': return '🧪';
      case 'Computational': return '💻';
      default: return '📋';
    }
  };

  const formatMetadataKey = (key: string): string => {
    return key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
  };

  const formatMetadataValue = (value: any): string => {
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Provide default values to prevent null/undefined errors
  const stepType = data.type || 'default';
  const stepLabel = data.label || 'Untitled Step';
  const stepDescription = data.description || 'No description available';

  return (
    <StepContainer stepType={stepType}>
      {data.stepNumber && (
        <StepNumber stepType={stepType}>
          {data.stepNumber}
        </StepNumber>
      )}

      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#4a5568',
          border: '2px solid white',
          width: '10px',
          height: '10px',
        }}
      />

      <StepHeader>
        <StepTypeIcon stepType={stepType}>
          {getStepIcon(stepType)}
        </StepTypeIcon>
        <StepInfo>
          <StepTitle>{stepLabel}</StepTitle>
          <StepType stepType={stepType}>{stepType}</StepType>
        </StepInfo>
      </StepHeader>

      <StepDescription>{stepDescription}</StepDescription>

      {data.metadata && Object.keys(data.metadata).length > 0 && (
        <>
          <MetadataToggle
            onClick={() => setMetadataExpanded(!metadataExpanded)}
          >
            <span>📊</span>
            <span>{metadataExpanded ? 'Hide' : 'Show'} Details</span>
            <span>{metadataExpanded ? '▲' : '▼'}</span>
          </MetadataToggle>

          <MetadataPanel expanded={metadataExpanded}>
            <MetadataGrid>
              {Object.entries(data.metadata).map(([key, value]) => (
                <MetadataItem key={key}>
                  <MetadataKey>{formatMetadataKey(key)}:</MetadataKey>
                  <MetadataValue>{formatMetadataValue(value)}</MetadataValue>
                </MetadataItem>
              ))}
            </MetadataGrid>
          </MetadataPanel>
        </>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#4a5568',
          border: '2px solid white',
          width: '10px',
          height: '10px',
        }}
      />
    </StepContainer>
  );
};

export default StepNode; 