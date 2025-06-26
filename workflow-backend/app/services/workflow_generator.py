import logging
from typing import Dict, Any

from .pdf_parser import extract_text_from_pdf_bytes
from .gemini_service import GeminiService

logger = logging.getLogger(__name__)


class WorkflowGenerator:

    def __init__(self):
        self.gemini_service = GeminiService()

    async def generate_workflow_from_pdf(self, pdf_bytes: bytes,
                                         filename: str) -> Dict[str, Any]:
        """
        Generate workflow from PDF content using AI processing.
        
        Args:
            pdf_bytes: PDF file content as bytes
            filename: Original filename
            
        Returns:
            Generated workflow JSON or error response
        """
        try:
            # Step 1: Extract text from PDF
            logger.info(f"Extracting text from PDF: {filename}")
            text_content = await extract_text_from_pdf_bytes(
                pdf_bytes, filename)

            if not text_content:
                logger.error(f"Failed to extract text from PDF: {filename}")
                return {
                    "success": False,
                    "error": "Could not extract text from PDF file",
                    "workflow": None
                }

            # Step 2: Generate workflow using AI
            logger.info(
                f"Generating workflow from extracted text ({len(text_content)} chars)"
            )
            workflow_result = self.gemini_service.generate_workflow_from_text(
                text_content)

            if workflow_result.get("success", False):
                logger.info("Successfully generated workflow from PDF")
                return {
                    "success": True,
                    "workflow": workflow_result["workflow"],
                    "text_length": len(text_content),
                    "filename": filename
                }
            else:
                error_detail = workflow_result.get('error', 'Unknown error')
                logger.error(f"AI workflow generation failed: {error_detail}")
                logger.error(
                    f"Full workflow result: {workflow_result}")  # Debug
                return {
                    "success": False,
                    "error": f"AI processing failed: {error_detail}",
                    "workflow": None
                }

        except Exception as e:
            logger.error(
                f"Error in workflow generation pipeline for {filename}: {str(e)}"
            )
            return {
                "success": False,
                "error": f"Pipeline error: {str(e)}",
                "workflow": None
            }
