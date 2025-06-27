import React, { useEffect } from 'react';
import styled from 'styled-components';

const PromptContainer = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  margin: 20px 0;
  overflow: hidden;
`;

const PromptHeader = styled.div`
  background: #e9ecef;
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
`;

const PromptContent = styled.pre`
  background: #ffffff;
  margin: 0;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #212529;
  border: none;
`;

const PromptDisplay: React.FC = () => {
    useEffect(() => {
        // This is the FINAL TIER prompt text that includes enhanced extraction capabilities
        const newPromptText = `You are a hyper-detail-oriented scientific analyst. Your task is to extract the methodology from the provided research paper into a comprehensive JSON object. The goal is to capture every reproducible detail, parameter, and reference mentioned.

First, think through your plan in a \`<thinking>\` block. After the closing \`</thinking>\` tag, provide ONLY the final JSON object.

Your output JSON MUST follow this exact schema:
{
  "paper_title": "String",
  "citation": { "text": "String", "doi_url": "String" },
  "workflow": [
    {
      "stage_id": "String", "stage_label": "String", "stage_description": "String",
      "steps": [
        {
          "step_id": "String", "step_label": "String", "objective": "String", "rationale": "String or null",
          "type": "String", "inputs": ["String"], "outputs": ["String"],
          "references": ["String"],
          "details": {
            "equipment": [ { "item": "String", "model": "String", "manufacturer": "String" } ],
            "reagents": [ { "item": "String", "concentration": "String", "supplier": "String" } ],
            "software": [ { "name": "String", "version": "String or null" } ],
            "parameters": { "sample_size": "String or null" }
          }
        }
      ]
    }
  ]
}

GUIDELINES:
1.  **METADATA:** Use the provided metadata to populate the \`paper_title\` and \`citation\` fields at the top level.
2.  **REFERENCES:** If a step mentions a Figure, Table, or Supplementary Material (e.g., "as shown in Fig. 1a", "primers listed in Supplementary Table S5"), you MUST add that reference to the \`references\` list for that step.
3.  **PARAMETERS:** Capture ALL quantitative values, including \`sample_size\` (e.g., "n=12 mice"), concentrations, temperatures, durations, dosages, and detailed procedural parameters (like multi-step PCR cycles).
4.  **PRECISION:** Extract specific product names, models, and suppliers. If a URL is present, include it.
5.  **CONNECTIVITY:** Use the \`inputs\` and \`outputs\` fields to link steps. Reference a prior step's output using the format "from_step:S2.1".
6.  **RATIONALE:** If the authors state *why* they chose a method, capture it in the \`rationale\` field.
7.  **HANDLE MISSING INFO:** Use \`null\` or "Not Specified" for any detail not mentioned, but retain the key.

---
PAPER METADATA FOR TOP-LEVEL FIELDS:
Title: [Extracted from paper metadata]
DOI: https://doi.org/[Extracted from paper metadata]
Citation Text: [Formatted citation with authors, title, journal, year]

---
PAPER TEXT FOR WORKFLOW EXTRACTION:
[Full paper text without truncation]
---

🎯 **TIER 1: DIRECT EXTRACTION ENHANCEMENTS**
✅ Paper title, citation, and DOI at top level
✅ Figure/table/supplementary material references for each step
✅ Sample sizes and detailed quantitative parameters
✅ Enhanced precision for materials, models, and suppliers
✅ Full connectivity mapping between workflow steps

📋 **FUTURE TIERS (ROADMAP)**
🔄 Tier 2: Knowledge Enrichment - Secondary LLM calls for definitions, explanations, and "why" questions
🖥️ Tier 3: Interactive UI - Figure display, dropdown definitions, clickable references`;

        // Find the target element on the page
        const displayElement = document.getElementById('prompt-display-area');

        if (displayElement) {
            // Set the text content of the element.
            // Using .textContent is important as it prevents the browser
            // from trying to interpret the string content as HTML.
            displayElement.textContent = newPromptText;
        } else {
            console.error("Error: Could not find the element with ID 'prompt-display-area'.");
        }
    }, []);

    return (
        <PromptContainer>
            <PromptHeader>
                🚀 Final Tier AI Prompt - Enhanced Scientific Workflow Extraction
            </PromptHeader>
            <PromptContent>
                <code id="prompt-display-area">Loading enhanced prompt text...</code>
            </PromptContent>
        </PromptContainer>
    );
};

export default PromptDisplay; 