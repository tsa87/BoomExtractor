from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any


class StageEdge(BaseModel):
    from_: str = Field(alias="from")
    to: str


class StepEdge(BaseModel):
    from_: str = Field(alias="from")
    to: str
    stage_id: str


class Stage(BaseModel):
    label: str
    description: str


class Step(BaseModel):
    label: str
    description: str


class Workflow(BaseModel):
    stages: Dict[str, Stage]
    stageEdges: List[StageEdge]
    steps: Dict[str, Step]
    stepEdges: List[StepEdge]


class ProcessingStatus(BaseModel):
    status: str  # "processing", "completed", "failed"
    progress: int  # 0-100
    message: str
    workflow: Optional[Workflow] = None


class UploadResponse(BaseModel):
    success: bool
    message: str
    workflow_id: Optional[str] = None
    error: Optional[str] = None
