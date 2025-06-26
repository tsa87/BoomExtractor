import React, { useState, useCallback, useMemo, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    ReactFlow,
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ConnectionMode,
    Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Workflow, ViewMode } from '../types/workflow';
import StageNode from './StageNode';
import StepNode from './StepNode';
import EdgeLabel from './EdgeLabel';

// Animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
`;

// Loading Screen Components
const LoadingOverlay = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.5s ease-out, visibility 0.5s ease-out;
`;

const LoadingContent = styled.div`
  text-align: center;
  color: white;
`;

const LoadingTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const LoadingSubtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProgressBar = styled.div`
  width: 300px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin: 2rem auto 1rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: white;
  border-radius: 2px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const LoadingStep = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

// Welcome Overlay Components
const WelcomeOverlay = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease-out, visibility 0.3s ease-out;
`;

const WelcomeModal = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${fadeInUp} 0.5s ease-out;
`;

const WelcomeTitle = styled.h2`
  color: #2d3748;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const WelcomeText = styled.p`
  color: #4a5568;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const FeatureList = styled.ul`
  text-align: left;
  margin: 1.5rem 0;
  padding-left: 1.5rem;
  color: #4a5568;
`;

const FeatureItem = styled.li`
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const WelcomeButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const Header = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: translateY(${props => props.isVisible ? '0' : '-20px'});
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
`;

const Title = styled.h1`
  margin: 0 0 10px 0;
  color: #2d3748;
  font-size: 24px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0 0 15px 0;
  color: #4a5568;
  font-size: 14px;
  line-height: 1.5;
`;

const NavigationBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const NavButton = styled.button<{ active?: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? '#4299e1' : 'rgba(255, 255, 255, 0.7)'};
  color: ${props => props.active ? 'white' : '#2d3748'};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#3182ce' : 'rgba(255, 255, 255, 0.9)'};
    transform: translateY(-1px);
  }
`;

const Breadcrumb = styled.span`
  color: #718096;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ReactFlowContainer = styled.div<{ isVisible: boolean }>`
  height: 100vh;
  width: 100vw;
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: opacity 0.5s ease-out;
  
  .react-flow__node {
    border-radius: 12px;
    border: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .react-flow__edge-path {
    stroke-width: 8;
    stroke: #4a5568;
  }
  
  .react-flow__edge.selected .react-flow__edge-path {
    stroke: #4299e1;
    stroke-width: 10;
  }
  
  .react-flow__controls {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .react-flow__controls-button {
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #2d3748;
    
    &:hover {
      background: rgba(66, 153, 225, 0.1);
    }
  }
`;

const nodeTypes = {
    stage: StageNode,
    step: StepNode,
};

const edgeTypes = {
    default: EdgeLabel,
};

interface WorkflowVisualizationProps {
    workflow: Workflow;
    onBackToUpload?: () => void;
}

const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ workflow, onBackToUpload }) => {
    const [viewMode, setViewMode] = useState<ViewMode>({ mode: 'stages' });
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStep, setLoadingStep] = useState('Initializing...');
    const [showWelcome, setShowWelcome] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Initialize application with loading simulation
    useEffect(() => {
        const loadingSteps = [
            { step: 'Loading workflow data...', progress: 20 },
            { step: 'Processing stage relationships...', progress: 40 },
            { step: 'Calculating node positions...', progress: 60 },
            { step: 'Preparing visualization...', progress: 80 },
            { step: 'Ready!', progress: 100 },
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < loadingSteps.length) {
                setLoadingStep(loadingSteps[currentStep].step);
                setLoadingProgress(loadingSteps[currentStep].progress);
                currentStep++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    setIsLoading(false);
                    const hasSeenWelcome = localStorage.getItem('hasSeenWorkflowWelcome');
                    if (!hasSeenWelcome) {
                        setTimeout(() => setShowWelcome(true), 500);
                    } else {
                        setTimeout(() => setIsInitialized(true), 500);
                    }
                }, 500);
            }
        }, 600);

        return () => clearInterval(interval);
    }, []);

    const handleWelcomeComplete = () => {
        localStorage.setItem('hasSeenWorkflowWelcome', 'true');
        setShowWelcome(false);
        setTimeout(() => setIsInitialized(true), 300);
    };

    // Helper function to create hierarchical layout
    const createHierarchicalLayout = (stepEntries: [string, any][], stepEdges: any[]) => {
        const positions: Record<string, { x: number; y: number }> = {};
        const levels: Record<string, number> = {};

        // Calculate levels based on dependencies
        const calculateLevel = (stepId: string, visited = new Set()): number => {
            if (visited.has(stepId)) return 0; // Prevent infinite loops
            if (levels[stepId] !== undefined) return levels[stepId];

            visited.add(stepId);
            const incomingEdges = stepEdges.filter(edge => edge.to === stepId);

            if (incomingEdges.length === 0) {
                levels[stepId] = 0;
            } else {
                const maxParentLevel = Math.max(
                    ...incomingEdges.map(edge => calculateLevel(edge.from, visited))
                );
                levels[stepId] = maxParentLevel + 1;
            }

            visited.delete(stepId);
            return levels[stepId];
        };

        // Calculate levels for all steps
        stepEntries.forEach(([stepId]) => {
            calculateLevel(stepId);
        });

        // Group steps by level
        const levelGroups: Record<number, string[]> = {};
        Object.entries(levels).forEach(([stepId, level]) => {
            if (!levelGroups[level]) levelGroups[level] = [];
            levelGroups[level].push(stepId);
        });

        // Position nodes
        const nodeWidth = 300;
        const nodeHeight = 200;
        const levelSpacing = 250;
        const nodeSpacing = 350;

        Object.entries(levelGroups).forEach(([levelStr, stepIds]) => {
            const level = parseInt(levelStr);
            const y = 150 + level * levelSpacing;

            stepIds.forEach((stepId, index) => {
                const totalWidth = (stepIds.length - 1) * nodeSpacing;
                const startX = (window.innerWidth - totalWidth) / 2;
                const x = startX + index * nodeSpacing;

                positions[stepId] = { x, y };
            });
        });

        return positions;
    };

    // Generate nodes and edges based on current view mode
    const { currentNodes, currentEdges } = useMemo(() => {
        if (viewMode.mode === 'stages') {
            // Show high-level stages in hierarchical layout (ordered by workflow progression)
            const stageEntries = Object.entries(workflow.stages);

            // Sort stages by their natural order (S1, S2, S3, etc.)
            stageEntries.sort(([idA], [idB]) => {
                const numA = parseInt(idA.substring(1));
                const numB = parseInt(idB.substring(1));
                return numA - numB;
            });

            const stageNodes: Node[] = stageEntries.map(([id, stage], index) => {
                // Hierarchical layout: stages arranged vertically with earlier steps at top
                const x = 400; // Center horizontally
                const y = 150 + index * 280; // Vertical spacing of 280px between stages

                return {
                    id,
                    type: 'stage',
                    position: { x, y },
                    data: {
                        label: stage.label,
                        description: stage.description,
                        stageId: id,
                        onDrillDown: () => setViewMode({ mode: 'steps', selectedStage: id })
                    },
                    draggable: true,
                };
            });

            const stageEdges: Edge[] = workflow.stageEdges.map((edge, index) => ({
                id: `stage-edge-${index}`,
                source: edge.from,
                target: edge.to,
                type: 'default',
                data: { label: edge.label, description: edge.description },
                animated: true,
                style: { stroke: '#4a5568', strokeWidth: 8 },
            }));

            return { currentNodes: stageNodes, currentEdges: stageEdges };
        } else {
            // Show detailed steps for selected stage in hierarchical layout
            const selectedStage = viewMode.selectedStage;
            if (!selectedStage) return { currentNodes: [], currentEdges: [] };

            const stageSteps = Object.entries(workflow.steps).filter(([id]) =>
                id.startsWith(selectedStage + '.')
            );

            const relevantStepEdges = workflow.stepEdges.filter(edge =>
                edge.from.startsWith(selectedStage + '.') && edge.to.startsWith(selectedStage + '.')
            );

            // Create hierarchical layout
            const positions = createHierarchicalLayout(stageSteps, relevantStepEdges);

            const stepNodes: Node[] = stageSteps.map(([id, step], index) => {
                const stepNumber = index + 1;
                const position = positions[id] || { x: 100 + (index % 3) * 300, y: 150 + Math.floor(index / 3) * 200 };

                return {
                    id,
                    type: 'step',
                    position,
                    data: {
                        label: step.label,
                        description: step.description,
                        type: step.type,
                        metadata: step.metadata,
                        stepNumber: stepNumber,
                    },
                    draggable: true,
                };
            });

            const stepEdges: Edge[] = relevantStepEdges.map((edge, index) => ({
                id: `step-edge-${index}`,
                source: edge.from,
                target: edge.to,
                type: 'default',
                data: { label: edge.relation || edge.label, description: edge.description },
                animated: edge.relation === 'generates',
                style: {
                    stroke: edge.relation === 'generates' ? '#38a169' : '#4a5568',
                    strokeWidth: 8
                },
            }));

            return { currentNodes: stepNodes, currentEdges: stepEdges };
        }
    }, [viewMode, workflow]);

    // Update nodes and edges when view mode changes with staggered animation
    useEffect(() => {
        if (!isInitialized) return;

        // Clear existing nodes/edges first
        setNodes([]);
        setEdges([]);

        // Add new nodes/edges with slight delay for smooth transition
        setTimeout(() => {
            setNodes(currentNodes);
            setTimeout(() => {
                setEdges(currentEdges);
            }, 200);
        }, 100);
    }, [currentNodes, currentEdges, setNodes, setEdges, isInitialized]);

    const handleBackToStages = useCallback(() => {
        setViewMode({ mode: 'stages' });
    }, []);

    return (
        <Container>
            {/* Loading Screen */}
            <LoadingOverlay isVisible={isLoading}>
                <LoadingContent>
                    <LoadingTitle>🧬 Scientific Workflow</LoadingTitle>
                    <LoadingSubtitle>Preparing your visualization</LoadingSubtitle>
                    <LoadingSpinner />
                    <ProgressBar>
                        <ProgressFill progress={loadingProgress} />
                    </ProgressBar>
                    <LoadingStep>{loadingStep}</LoadingStep>
                </LoadingContent>
            </LoadingOverlay>

            {/* Welcome Modal */}
            <WelcomeOverlay isVisible={showWelcome}>
                <WelcomeModal>
                    <WelcomeTitle>🎉 Welcome to Workflow Visualization!</WelcomeTitle>
                    <WelcomeText>
                        Explore complex scientific workflows in an intuitive, hierarchical way.
                    </WelcomeText>
                    <FeatureList>
                        <FeatureItem>📊 <strong>High-level stages</strong> - Start with the big picture</FeatureItem>
                        <FeatureItem>🔬 <strong>Detailed steps</strong> - Click any stage to dive deeper</FeatureItem>
                        <FeatureItem>🔗 <strong>Clear connections</strong> - Follow the workflow progression</FeatureItem>
                        <FeatureItem>🎯 <strong>Interactive exploration</strong> - Drag, zoom, and navigate freely</FeatureItem>
                    </FeatureList>
                    <WelcomeButton onClick={handleWelcomeComplete}>
                        Let's Explore! 🚀
                    </WelcomeButton>
                </WelcomeModal>
            </WelcomeOverlay>

            {/* Main UI */}
            <Header isVisible={isInitialized}>
                <Title>Scientific Workflow Visualization</Title>
                <Subtitle>
                    Explore research workflows hierarchically - from high-level stages to detailed experimental steps
                </Subtitle>
                <NavigationBar>
                    {onBackToUpload && (
                        <NavButton onClick={onBackToUpload}>
                            ← Upload New PDF
                        </NavButton>
                    )}
                    <NavButton
                        active={viewMode.mode === 'stages'}
                        onClick={handleBackToStages}
                    >
                        📊 High-Level Stages
                    </NavButton>
                    {viewMode.selectedStage && (
                        <>
                            <Breadcrumb>
                                <span>→</span>
                                <NavButton active={viewMode.mode === 'steps'}>
                                    🔬 {workflow.stages[viewMode.selectedStage]?.label}
                                </NavButton>
                            </Breadcrumb>
                        </>
                    )}
                </NavigationBar>
            </Header>

            <ReactFlowContainer isVisible={isInitialized}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    connectionMode={ConnectionMode.Loose}
                    fitView
                    fitViewOptions={{ padding: 0.1 }}
                    nodesDraggable={true}
                >
                    <Background color="#aaa" gap={16} />
                    <Controls />

                    <Panel position="bottom-right">
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            padding: '10px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#4a5568'
                        }}>
                            {viewMode.mode === 'stages' ? (
                                <div>💡 Click on a stage to explore detailed steps</div>
                            ) : (
                                <div>🔍 Viewing detailed steps for {workflow.stages[viewMode.selectedStage!]?.label}</div>
                            )}
                        </div>
                    </Panel>
                </ReactFlow>
            </ReactFlowContainer>
        </Container>
    );
};

export default WorkflowVisualization; 