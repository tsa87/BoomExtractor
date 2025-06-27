import google.generativeai as genai
import logging
from typing import Dict, Any
import config

logger = logging.getLogger(__name__)


class EnrichmentService:
    """
    Tier 2: Knowledge Enrichment Service
    
    This service handles secondary LLM calls to provide:
    - Term definitions
    - Scientific principle explanations  
    - Rationale for method choices
    - Links to external resources
    """

    def __init__(self):
        if config.GEMINI_API_KEY and config.GEMINI_API_KEY.strip():
            genai.configure(api_key=config.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-1.5-flash-latest')
        else:
            self.model = None
            logger.warning("No Gemini API key provided - Enrichment service disabled")

    def define_term(self, term: str, context: str = None) -> Dict[str, Any]:
        """
        Provide a definition for a scientific term in context.
        
        Args:
            term: The scientific term to define
            context: Optional context (e.g., "mouse reproductive biology")
            
        Returns:
            Dict with definition, example, and related links
        """
        if not self.model:
            return {"error": "Enrichment service not available"}

        try:
            context_phrase = f" in the context of {context}" if context else ""
            prompt = f"""
In the context of scientific research{context_phrase}, provide a concise, easy-to-understand definition for the term: "{term}"

Format your response as a JSON object with the following structure:
{{
  "term": "{term}",
  "definition": "Clear, concise definition in 1-2 sentences",
  "example": "Practical example or application",
  "wikipedia_url": "Wikipedia URL if relevant (or null)",
  "related_terms": ["List of 2-3 related scientific terms"]
}}

Respond only with the JSON object.
"""
            
            response = self.model.generate_content(prompt)
            # Parse JSON response here
            return {"success": True, "data": response.text}
            
        except Exception as e:
            logger.error(f"Error in define_term: {str(e)}")
            return {"error": str(e)}

    def explain_principle(self, principle: str, context: str) -> Dict[str, Any]:
        """
        Explain a scientific principle or method rationale.
        
        Args:
            principle: The principle or method to explain
            context: The experimental context
            
        Returns:
            Dict with explanation and related information
        """
        if not self.model:
            return {"error": "Enrichment service not available"}

        try:
            prompt = f"""
In the context of {context}, explain the scientific principle behind: "{principle}"

Format your response as a JSON object:
{{
  "principle": "{principle}",
  "explanation": "Clear explanation of why this works scientifically",
  "purpose": "What this achieves in the experiment",
  "alternatives": ["Alternative methods that could be used"],
  "key_papers": ["Suggest 1-2 key papers or reviews (title only)"]
}}

Respond only with the JSON object.
"""
            
            response = self.model.generate_content(prompt)
            return {"success": True, "data": response.text}
            
        except Exception as e:
            logger.error(f"Error in explain_principle: {str(e)}")
            return {"error": str(e)}

    def get_reagent_info(self, reagent: str) -> Dict[str, Any]:
        """
        Get detailed information about a reagent or material.
        
        Args:
            reagent: The reagent/material name
            
        Returns:
            Dict with reagent information and supplier links
        """
        if not self.model:
            return {"error": "Enrichment service not available"}

        try:
            prompt = f"""
Provide detailed information about the research reagent/material: "{reagent}"

Format your response as a JSON object:
{{
  "reagent": "{reagent}",
  "description": "What this reagent is and its primary use",
  "function": "Its specific role in experiments",
  "common_suppliers": ["List of 2-3 common suppliers"],
  "storage_conditions": "How it should be stored",
  "safety_notes": "Important safety considerations (if any)"
}}

Respond only with the JSON object.
"""
            
            response = self.model.generate_content(prompt)
            return {"success": True, "data": response.text}
            
        except Exception as e:
            logger.error(f"Error in get_reagent_info: {str(e)}")
            return {"error": str(e)}


# Example usage patterns for future implementation:
"""
# In your API endpoints (future Tier 2 implementation):

@app.post("/api/enrich/define")
async def define_term_endpoint(term: str, context: str = None):
    enrichment_service = EnrichmentService()
    result = enrichment_service.define_term(term, context)
    return result

@app.post("/api/enrich/explain")  
async def explain_principle_endpoint(principle: str, context: str):
    enrichment_service = EnrichmentService()
    result = enrichment_service.explain_principle(principle, context)
    return result

@app.post("/api/enrich/reagent")
async def reagent_info_endpoint(reagent: str):
    enrichment_service = EnrichmentService()
    result = enrichment_service.get_reagent_info(reagent)
    return result

# In your React frontend (future Tier 3 implementation):

const handleTermClick = async (term, context) => {
  const response = await fetch('/api/enrich/define', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ term, context })
  });
  const definition = await response.json();
  // Display in modal/tooltip
};
""" 