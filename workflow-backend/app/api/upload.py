import os
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import Dict, Any

from app.services.workflow_generator import WorkflowGenerator

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize the workflow generator
workflow_generator = WorkflowGenerator()


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload a PDF file and generate workflow directly (synchronous processing)
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400,
                                detail="Only PDF files are supported")

        # Check file size (50MB limit as requested)
        file_size = 0
        file_contents = await file.read()
        file_size = len(file_contents)

        if file_size > 50 * 1024 * 1024:  # 50MB in bytes
            raise HTTPException(status_code=413,
                                detail="File size exceeds 50MB limit")

        if file_size == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        logger.info(f"Processing PDF: {file.filename} ({file_size} bytes)")

        # Generate workflow directly from PDF bytes
        result = await workflow_generator.generate_workflow_from_pdf(
            pdf_bytes=file_contents, filename=file.filename)

        if result["success"]:
            return {
                "success": True,
                "message": "Workflow generated successfully",
                "workflow": result["workflow"],
                "metadata": {
                    "filename": result["filename"],
                    "text_length": result.get("text_length", 0)
                }
            }
        else:
            logger.error(f"Workflow generation failed: {result['error']}")
            raise HTTPException(
                status_code=500,
                detail=f"Workflow generation failed: {result['error']}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in PDF upload endpoint: {str(e)}")
        raise HTTPException(status_code=500,
                            detail=f"Internal server error: {str(e)}")


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "workflow-backend"}
