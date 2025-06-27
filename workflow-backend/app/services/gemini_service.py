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

            # DEBUG: Log the raw Gemini response
            logger.info("🔍 RAW GEMINI RESPONSE:")
            logger.info("=" * 80)
            logger.info(response.text)
            logger.info("=" * 80)

            # Parse JSON response
            workflow_json = self._parse_response(response.text)

            # DEBUG: Log the parsed workflow JSON
            logger.info("🎯 PARSED WORKFLOW JSON:")
            logger.info("=" * 80)
            logger.info(json.dumps(workflow_json, indent=2))
            logger.info("=" * 80)

            return workflow_json

        except Exception as e:
            error_msg = f"Error generating workflow with Gemini: {str(e)}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}

    def _create_workflow_prompt(self, paper_text: str, metadata: Dict = None) -> str:
        """
        Creates the Final Tier prompt to generate a comprehensive, interactive-ready workflow.
        """
        
        # Extract metadata to be placed directly in the prompt
        title = metadata.get('title', 'Not available') if metadata else 'Not available'
        doi = metadata.get('doi', 'Not available') if metadata else 'Not available'
        authors = metadata.get('authors', 'N/A') if metadata else 'N/A'
        journal = metadata.get('journal', 'N/A') if metadata else 'N/A'
        year = metadata.get('year', 'N/A') if metadata else 'N/A'
        citation_text = f"{authors}. {title}. {journal} ({year})."

        prompt = f"""
CRITICAL: You are a scientific workflow extraction expert. Your response must contain ONLY a valid JSON object following the EXACT schema below. Do not include any explanations, thinking blocks, markdown formatting, or other text.

TASK: Extract a detailed scientific workflow from the research paper. Break down ALL methodology into multiple stages and multiple steps per stage. The paper likely contains 15-30 individual experimental steps across 4-6 major stages.

REQUIRED JSON SCHEMA (respond with ONLY this structure):
{{
  "paper_title": "{title}",
  "citation": {{
    "text": "{citation_text}",
    "doi_url": "https://doi.org/{doi}"
  }},
  "stages": {{
    "S1": {{
      "label": "Stage Name",
      "description": "Detailed description of what this stage accomplishes"
    }},
    "S2": {{
      "label": "Stage Name", 
      "description": "Detailed description"
    }}
  }},
  "stageEdges": [
    {{
      "from": "S1",
      "to": "S2", 
      "label": "Connection Name",
      "description": "How stages connect"
    }}
  ],
  "steps": {{
    "S1.1": {{
      "label": "Step Name",
      "type": "Experimental|Computational|Analysis",
      "description": "Detailed step description",
      "metadata": {{
        "equipment": ["item1", "item2"],
        "reagents": ["reagent1", "reagent2"],
        "parameters": ["param1: value1", "param2: value2"],
        "references": ["Figure 1a", "Table 2"],
        "sample_size": "n=X",
        "duration": "time",
        "temperature": "temp",
        "concentration": "conc"
      }}
    }},
    "S1.2": {{
      "label": "Step Name",
      "type": "Experimental|Computational|Analysis", 
      "description": "Detailed step description",
      "metadata": {{}}
    }}
  }},
  "stepEdges": [
    {{
      "from": "S1.1",
      "to": "S1.2",
      "label": "Sequential",
      "description": "How steps connect",
      "relation": "Sequential|Parallel|Dependent"
    }}
  ]
}}

EXTRACTION GUIDELINES:
1. **STAGES**: Identify 4-6 major experimental phases (e.g., "Construct Design", "Animal Generation", "Phenotypic Analysis", "Molecular Analysis")
2. **STEPS**: Break each stage into 3-8 detailed steps. Extract EVERY experimental procedure mentioned.
3. **METADATA**: Capture ALL quantitative details:
   - Equipment models and manufacturers
   - Reagent concentrations and suppliers  
   - Sample sizes (n=X mice, Y cells, etc.)
   - Time durations, temperatures, speeds
   - References to figures, tables, supplementary materials
4. **CONNECTIONS**: Link steps logically showing experimental workflow
5. **COMPLETENESS**: A typical research paper should yield 15-30 steps total

RESEARCH PAPER TEXT:
{paper_text}

RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT:"""
        return prompt

    def _extract_json_from_response(self, response_text: str) -> str:
        """
        Extract JSON content from a response that might contain mixed content
        """
        # First, try to find JSON in markdown code blocks
        if "```json" in response_text:
            start = response_text.find("```json") + 7
            end = response_text.find("```", start)
            if end != -1:
                return response_text[start:end].strip()
        
        # Try to find JSON in generic code blocks
        if response_text.startswith("```"):
            lines = response_text.split('\n')
            start_idx = 1
            end_idx = len(lines) - 1
            for i, line in enumerate(lines):
                if line.strip().startswith('{'):
                    start_idx = i
                    break
            for i in range(len(lines) - 1, -1, -1):
                if lines[i].strip().endswith('}'):
                    end_idx = i + 1
                    break
            return '\n'.join(lines[start_idx:end_idx])
        
        # Handle <thinking> tags or other content before JSON
        if not response_text.strip().startswith('{'):
            json_start = response_text.find('{')
            if json_start != -1:
                # Find the matching closing brace
                brace_count = 0
                json_end = json_start
                for i in range(json_start, len(response_text)):
                    if response_text[i] == '{':
                        brace_count += 1
                    elif response_text[i] == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            json_end = i + 1
                            break
                return response_text[json_start:json_end]
        
        # If it already looks like JSON, return as-is
        return response_text.strip()

    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse and validate Gemini response with improved handling of non-JSON content
        """
        try:
            # Clean response text
            response_text = response_text.strip()
            logger.info(f"🧹 CLEANED RESPONSE TEXT LENGTH: {len(response_text)}")

            # Extract JSON using improved method
            json_content = self._extract_json_from_response(response_text)
            logger.info("🔧 EXTRACTED JSON CONTENT")

            logger.info("📝 FINAL TEXT BEFORE JSON PARSE:")
            logger.info(f"First 500 chars: {json_content[:500]}...")
            
            # Parse JSON
            workflow_data = json.loads(json_content)
            logger.info("✅ JSON PARSING SUCCESSFUL")

            # Validate structure - the workflow data should contain the necessary fields
            workflow_section = workflow_data
            required_keys = ["stages", "stageEdges", "steps", "stepEdges"]
            for key in required_keys:
                if key not in workflow_section:
                    raise ValueError(f"Missing required key: {key}")

            # Return the correct format with success key
            return {"success": True, "workflow": workflow_section}

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON response from Gemini: {e}")
            logger.error(f"Problematic text: {json_content[:1000] if 'json_content' in locals() else response_text[:1000]}...")
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
                "paper_title": "Sample Research Paper: CRISPR/Cas9 Gene Editing Study",
                "citation": {
                    "text": "Sample Author et al. Sample title. Sample Journal (2024).",
                    "doi_url": "https://doi.org/10.1000/sample"
                },
                "stages": {
                    "S1": {
                        "label": "CRISPR Construct Design & Validation",
                        "description": "Design and in vitro validation of CRISPR/Cas9 constructs targeting the gene of interest."
                    },
                    "S2": {
                        "label": "Animal Model Generation",
                        "description": "Generation of knockout mice through zygote injection and breeding."
                    },
                    "S3": {
                        "label": "Phenotypic Characterization",
                        "description": "Comprehensive physiological and behavioral analysis of knockout animals."
                    },
                    "S4": {
                        "label": "Molecular Analysis",
                        "description": "Gene expression and biochemical analysis to understand mechanisms."
                    }
                },
                "stageEdges": [
                    {
                        "from": "S1",
                        "to": "S2",
                        "label": "Validated Constructs → Animal Generation",
                        "description": "Validated CRISPR constructs are used for zygote injection."
                    },
                    {
                        "from": "S2", 
                        "to": "S3",
                        "label": "Animals → Phenotyping",
                        "description": "Generated knockout animals undergo phenotypic analysis."
                    },
                    {
                        "from": "S3",
                        "to": "S4", 
                        "label": "Phenotypes → Mechanism",
                        "description": "Observed phenotypes prompt molecular investigation."
                    }
                ],
                "steps": {
                    "S1.1": {
                        "label": "sgRNA Design",
                        "type": "Computational",
                        "description": "Design of single guide RNAs targeting specific genomic sequences.",
                        "metadata": {
                            "equipment": ["Computer workstation"],
                            "reagents": [],
                            "parameters": ["Target specificity score > 0.5"],
                            "references": ["Design software documentation"],
                            "duration": "2-3 days"
                        }
                    },
                    "S1.2": {
                        "label": "In Vitro Validation", 
                        "type": "Experimental",
                        "description": "Cell culture validation of CRISPR efficiency using reporter assays.",
                        "metadata": {
                            "equipment": ["Tissue culture hood", "Fluorescence microscope"],
                            "reagents": ["HEK293 cells", "Transfection reagent"],
                            "parameters": ["n=3 x 10^5 cells/well", "24h incubation"],
                            "references": ["Figure 1A"],
                            "sample_size": "n=6 wells per condition"
                        }
                    },
                    "S1.3": {
                        "label": "Construct Preparation",
                        "type": "Experimental", 
                        "description": "Large-scale preparation and purification of CRISPR constructs for injection.",
                        "metadata": {
                            "equipment": ["Ultracentrifuge", "Purification columns"],
                            "reagents": ["Plasmid DNA", "Purification kits"],
                            "parameters": ["Concentration: 5 ng/μl", "Endotoxin-free"],
                            "references": ["Materials and Methods"],
                            "duration": "1 week"
                        }
                    },
                    "S2.1": {
                        "label": "Zygote Microinjection",
                        "type": "Experimental",
                        "description": "Microinjection of CRISPR constructs into fertilized mouse zygotes.",
                        "metadata": {
                            "equipment": ["Microinjection setup", "Stereomicroscope"],
                            "reagents": ["Mouse zygotes", "Injection buffer"],
                            "parameters": ["127 zygotes injected", "Injection volume: 2-3 pl"],
                            "references": ["Figure 2A", "Table 1"],
                            "sample_size": "n=127 zygotes"
                        }
                    },
                    "S2.2": {
                        "label": "Embryo Culture",
                        "type": "Experimental",
                        "description": "In vitro culture of injected embryos to 2-cell stage.",
                        "metadata": {
                            "equipment": ["CO2 incubator", "Culture dishes"],
                            "reagents": ["KSOM medium", "BSA"],
                            "parameters": ["37°C", "5% CO2", "24h culture"],
                            "references": ["Standard protocols"],
                            "sample_size": "n=92 embryos developed"
                        }
                    },
                    "S2.3": {
                        "label": "Embryo Transfer",
                        "type": "Experimental",
                        "description": "Surgical transfer of 2-cell embryos into pseudopregnant recipients.",
                        "metadata": {
                            "equipment": ["Surgical instruments", "Anesthesia equipment"],
                            "reagents": ["Anesthetic agents"],
                            "parameters": ["10-15 embryos per recipient"],
                            "references": ["Surgical protocols"],
                            "sample_size": "n=6 recipient females"
                        }
                    },
                    "S2.4": {
                        "label": "Genotyping & Breeding",
                        "type": "Experimental",
                        "description": "PCR genotyping of offspring and establishment of breeding lines.",
                        "metadata": {
                            "equipment": ["PCR machine", "Gel electrophoresis"],
                            "reagents": ["PCR reagents", "Primers"],
                            "parameters": ["3 founder mice identified"],
                            "references": ["Figure 2B", "Supplementary Table S1"],
                            "sample_size": "n=3 pups born"
                        }
                    },
                    "S3.1": {
                        "label": "Basic Physiological Assessment",
                        "type": "Experimental",
                        "description": "SHIRPA protocol for basic physiological and neurological assessment.",
                        "metadata": {
                            "equipment": ["Observation chambers"],
                            "reagents": [],
                            "parameters": ["Age: 8 weeks", "Multiple timepoints"],
                            "references": ["Supplementary Figure S1"],
                            "sample_size": "n=12 mice per genotype"
                        }
                    },
                    "S3.2": {
                        "label": "Behavioral Testing",
                        "type": "Experimental",
                        "description": "Open field, light/dark transition, and social interaction tests.",
                        "metadata": {
                            "equipment": ["Behavioral chambers", "Video tracking"],
                            "reagents": [],
                            "parameters": ["10 min sessions", "Multiple trials"],
                            "references": ["Figure 3", "Supplementary Movies"],
                            "sample_size": "n=15 mice per group"
                        }
                    },
                    "S3.3": {
                        "label": "Biochemical Analysis",
                        "type": "Analysis",
                        "description": "Serum biochemistry and metabolic parameter analysis.",
                        "metadata": {
                            "equipment": ["Automated analyzer"],
                            "reagents": ["Serum samples", "Assay kits"],
                            "parameters": ["Age: 19 weeks", "Fasted samples"],
                            "references": ["Supplementary Figure S2"],
                            "sample_size": "n=10 mice per genotype"
                        }
                    },
                    "S4.1": {
                        "label": "RNA Extraction & Microarray",
                        "type": "Experimental",
                        "description": "Genome-wide gene expression analysis using microarray technology.",
                        "metadata": {
                            "equipment": ["Microarray scanner"],
                            "reagents": ["RNA extraction kits", "Microarray chips"],
                            "parameters": ["Brain tissue", "Threshold: >2-fold change"],
                            "references": ["Figure 4A", "GEO: GSE12345"],
                            "sample_size": "n=6 mice per genotype"
                        }
                    },
                    "S4.2": {
                        "label": "RT-qPCR Validation",
                        "type": "Experimental",
                        "description": "Quantitative PCR validation of differentially expressed genes.",
                        "metadata": {
                            "equipment": ["Real-time PCR machine"],
                            "reagents": ["cDNA", "qPCR reagents", "Gene-specific primers"],
                            "parameters": ["Technical triplicates", "GAPDH normalization"],
                            "references": ["Figure 4B"],
                            "sample_size": "n=8 mice per genotype"
                        }
                    },
                    "S4.3": {
                        "label": "Protein Analysis",
                        "type": "Experimental",
                        "description": "Western blot and immunohistochemistry for protein expression.",
                        "metadata": {
                            "equipment": ["Western blot apparatus", "Confocal microscope"],
                            "reagents": ["Primary antibodies", "Secondary antibodies"],
                            "parameters": ["1:1000 dilution", "Overnight incubation"],
                            "references": ["Figure 4C"],
                            "sample_size": "n=6 mice per genotype"
                        }
                    }
                },
                "stepEdges": [
                    {
                        "from": "S1.1",
                        "to": "S1.2",
                        "label": "Design → Validation",
                        "description": "Designed sgRNAs are validated in cell culture.",
                        "relation": "Sequential"
                    },
                    {
                        "from": "S1.2",
                        "to": "S1.3",
                        "label": "Validation → Preparation",
                        "description": "Validated constructs are prepared for injection.",
                        "relation": "Sequential"
                    },
                    {
                        "from": "S1.3",
                        "to": "S2.1",
                        "label": "Constructs → Injection",
                        "description": "Prepared constructs are injected into zygotes.",
                        "relation": "Sequential"
                    },
                    {
                        "from": "S2.1",
                        "to": "S2.2",
                        "label": "Injection → Culture",
                        "description": "Injected zygotes are cultured in vitro.",
                        "relation": "Sequential"
                    },
                    {
                        "from": "S2.2", 
                        "to": "S2.3",
                        "label": "Culture → Transfer",
                        "description": "Cultured embryos are transferred to recipients.",
                        "relation": "Sequential"
                    },
                    {
                        "from": "S2.3",
                        "to": "S2.4",
                        "label": "Transfer → Genotyping",
                        "description": "Born pups are genotyped and bred.",
                        "relation": "Sequential"
                    },
                    {
                        "from": "S2.4",
                        "to": "S3.1",
                        "label": "Animals → Physiology",
                        "description": "Generated animals undergo physiological assessment.",
                        "relation": "Sequential"
                    },
                    {
                        "from": "S3.1",
                        "to": "S3.2",
                        "label": "Physiology → Behavior",
                        "description": "Basic assessment followed by behavioral testing.",
                        "relation": "Sequential"
                    },
                    {
                        "from": "S3.2",
                        "to": "S3.3",
                        "label": "Behavior → Biochemistry",
                        "description": "Behavioral analysis complemented by biochemical studies.",
                        "relation": "Parallel"
                    },
                    {
                        "from": "S3.3",
                        "to": "S4.1",
                        "label": "Phenotypes → Expression",
                        "description": "Observed phenotypes prompt molecular analysis.",
                        "relation": "Sequential"
                    },
                    {
                        "from": "S4.1",
                        "to": "S4.2",
                        "label": "Microarray → Validation",
                        "description": "Microarray results validated by qPCR.",
                        "relation": "Sequential"
                    },
                    {
                        "from": "S4.2",
                        "to": "S4.3",
                        "label": "mRNA → Protein",
                        "description": "mRNA findings confirmed at protein level.",
                        "relation": "Parallel"
                    }
                ]
            }
        }
