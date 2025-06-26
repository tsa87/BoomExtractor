import google.generativeai as genai
import json
import logging
from typing import Dict, Any
from app.models.workflow import Workflow
import config

logger = logging.getLogger(__name__)


class GeminiService:

    def __init__(self):
        if config.GEMINI_API_KEY and config.GEMINI_API_KEY.strip():
            genai.configure(api_key=config.GEMINI_API_KEY)
            # Use the correct model name for current API
            self.model = genai.GenerativeModel('gemini-1.5-flash-latest')
        else:
            self.model = None
            logger.warning(
                "No Gemini API key provided - using sample workflow")

    def generate_workflow_from_text(
            self,
            paper_text: str,
            paper_metadata: Dict = None) -> Dict[str, Any]:
        """
        Generate workflow JSON from paper text using Gemini AI
        """
        if not self.model:
            # Return sample workflow for testing when no API key
            sample_workflow = self._get_sample_workflow()
            return {"success": True, "workflow": sample_workflow["workflow"]}

        try:
            prompt = self._create_workflow_prompt(paper_text, paper_metadata)

            response = self.model.generate_content(prompt)

            # Parse JSON response
            workflow_json = self._parse_response(response.text)

            return workflow_json

        except Exception as e:
            error_msg = f"Error generating workflow with Gemini: {str(e)}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    def _create_workflow_prompt(self,
                                paper_text: str,
                                metadata: Dict = None) -> str:
        """
        Create a structured prompt for Gemini to generate workflow JSON
        """

        prompt = f"""
You are a scientific workflow expert. Analyze the following research paper and extract the experimental methodology into a structured workflow.

PAPER METADATA:
{json.dumps(metadata, indent=2) if metadata else "Not available"}

PAPER TEXT:
{paper_text[:8000]}  # Limit text length

TASK:
Generate a JSON workflow that represents the experimental methodology described in this paper. The workflow should follow this exact structure:

{{
  "stages": {{
    "S1": {{
      "label": "Stage Name",
      "description": "Detailed description of what happens in this stage"
    }},
    "S2": {{ ... }},
    etc.
  }},
  "stageEdges": [
    {{
      "from": "S1",
      "to": "S2", 
      "label": "Connection Label",
      "description": "Description of how stages connect"
    }}
  ],
  "steps": {{
    "S1.1": {{
      "label": "Step Name",
      "type": "Experimental",
      "description": "Detailed step description",
      "metadata": {{
        "key": "value pairs of relevant experimental parameters"
      }}
    }},
    "S1.2": {{ ... }},
    etc.
  }},
  "stepEdges": [
    {{
      "from": "S1.1",
      "to": "S1.2",
      "relation": "preceded_by",
      "description": "How steps connect",
      "label": "Sequential"
    }}
  ]
}}

GUIDELINES:
1. Identify 3-6 main experimental stages in chronological order
2. Each stage should have 2-5 detailed steps
3. Use clear, scientific language for labels and descriptions
4. Include relevant experimental parameters in metadata
5. Connect stages and steps logically
6. Use "Experimental", "Computational", or "Analytical" for step types
7. Use "preceded_by" or "generates" for step relations

Focus on the METHODOLOGY section if available. Extract concrete experimental procedures, not just theoretical concepts.

Return ONLY the JSON, no additional text or explanation.
"""

        return prompt

    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse and validate Gemini response
        """
        try:
            # Clean response text
            response_text = response_text.strip()

            # Remove markdown code blocks if present
            if response_text.startswith("```"):
                lines = response_text.split('\n')
                response_text = '\n'.join(lines[1:-1])

            # Parse JSON
            workflow_data = json.loads(response_text)

            # Validate structure
            required_keys = ["stages", "stageEdges", "steps", "stepEdges"]
            for key in required_keys:
                if key not in workflow_data:
                    raise ValueError(f"Missing required key: {key}")

            # Return the correct format with success key
            return {"success": True, "workflow": workflow_data}

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON response from Gemini: {e}")
            return self._get_sample_workflow()
        except Exception as e:
            logger.error(f"Error parsing Gemini response: {e}")
            return self._get_sample_workflow()

    def _get_sample_workflow(self) -> Dict[str, Any]:
        """
        Return a sample workflow for testing/fallback
        """
        logger.info("🎯 Using sample workflow (no API key or AI failed)")
        return {
            "success": True,
            "workflow": {
                "stages": {
                    "S1": {
                        "label":
                        "Sample Preparation",
                        "description":
                        "Initial sample collection and preparation steps for the experiment."
                    },
                    "S2": {
                        "label":
                        "Experimental Treatment",
                        "description":
                        "Application of experimental conditions and treatments to prepared samples."
                    },
                    "S3": {
                        "label":
                        "Data Collection",
                        "description":
                        "Measurement and recording of experimental outcomes and observations."
                    },
                    "S4": {
                        "label":
                        "Data Analysis",
                        "description":
                        "Statistical analysis and interpretation of collected experimental data."
                    }
                },
                "stageEdges": [{
                    "from":
                    "S1",
                    "to":
                    "S2",
                    "label":
                    "Prepared Samples → Treatment",
                    "description":
                    "Prepared samples proceed to experimental treatment phase."
                }, {
                    "from":
                    "S2",
                    "to":
                    "S3",
                    "label":
                    "Treatment → Measurement",
                    "description":
                    "Treated samples are measured and data is collected."
                }, {
                    "from":
                    "S3",
                    "to":
                    "S4",
                    "label":
                    "Data → Analysis",
                    "description":
                    "Collected data undergoes statistical analysis."
                }],
                "steps": {
                    "S1.1": {
                        "label": "Sample Collection",
                        "type": "Experimental",
                        "description":
                        "Collection of biological or material samples for analysis.",
                        "metadata": {
                            "sample_type": "biological",
                            "collection_method": "standard protocol"
                        }
                    },
                    "S1.2": {
                        "label": "Sample Processing",
                        "type": "Experimental",
                        "description":
                        "Processing and preparation of collected samples for experimentation.",
                        "metadata": {
                            "processing_time": "2 hours",
                            "temperature": "room temperature"
                        }
                    },
                    "S2.1": {
                        "label": "Treatment Application",
                        "type": "Experimental",
                        "description":
                        "Application of experimental treatment to prepared samples.",
                        "metadata": {
                            "treatment_duration": "24 hours",
                            "conditions": "controlled environment"
                        }
                    }
                },
                "stepEdges": [{
                    "from": "S1.1",
                    "to": "S1.2",
                    "relation": "preceded_by",
                    "description":
                    "Samples must be collected before processing.",
                    "label": "Sequential"
                }, {
                    "from": "S1.2",
                    "to": "S2.1",
                    "relation": "generates",
                    "description":
                    "Processed samples enable treatment application.",
                    "label": "Generated"
                }]
            }
        }
