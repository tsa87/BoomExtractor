export interface WorkflowMetadata {
    [key: string]: any;
}

export interface WorkflowStep {
    label: string;
    type: string;
    description: string;
    metadata: WorkflowMetadata;
}

export interface WorkflowStage {
    label: string;
    description: string;
}

export interface WorkflowEdge {
    from: string;
    to: string;
    label: string;
    description: string;
    relation?: string;
}

export interface Workflow {
    stages: Record<string, WorkflowStage>;
    stageEdges: WorkflowEdge[];
    steps: Record<string, WorkflowStep>;
    stepEdges: WorkflowEdge[];
}

export interface ViewMode {
    mode: 'stages' | 'steps';
    selectedStage?: string;
} 