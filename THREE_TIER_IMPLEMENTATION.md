# 🚀 Three-Tier Scientific Workflow Extraction System

## Overview

This document outlines our enhanced approach to building an interactive scientific discovery tool using a **three-tiered architecture** that separates concerns and maximizes effectiveness.

---

## 🎯 **Tier 1: Direct Extraction** ✅ **IMPLEMENTED**

**Purpose**: Enhanced prompt engineering for comprehensive workflow extraction directly from paper text.

### Key Features Implemented:
- ✅ **Paper Metadata**: Title, citation, and DOI at top level
- ✅ **Figure References**: Automatic extraction of "Fig 1a", "Table S5", etc.
- ✅ **Sample Sizes**: Captures "n=12 mice", participant counts, etc.
- ✅ **Detailed Parameters**: All quantitative values, temperatures, durations
- ✅ **Enhanced Precision**: Specific product names, models, suppliers
- ✅ **Full Connectivity**: Input/output mapping between workflow steps

### Updated JSON Schema:
```json
{
  "paper_title": "String",
  "citation": { "text": "String", "doi_url": "String" },
  "workflow": [
    {
      "stage_id": "String",
      "stage_label": "String", 
      "stage_description": "String",
      "steps": [
        {
          "step_id": "String",
          "step_label": "String",
          "objective": "String",
          "rationale": "String or null",
          "type": "String",
          "inputs": ["String"],
          "outputs": ["String"],
          "references": ["String"], // NEW: Fig/Table references
          "details": {
            "equipment": [...],
            "reagents": [...],
            "software": [...],
            "parameters": {
              "sample_size": "String or null" // NEW: Sample size tracking
            }
          }
        }
      ]
    }
  ]
}
```

### Files Updated:
- `workflow-backend/app/services/gemini_service.py` - Enhanced prompt
- `workflow-visualizer/src/components/PromptDisplay.tsx` - Updated UI display

---

## 🔄 **Tier 2: Knowledge Enrichment** 📋 **PREPARED**

**Purpose**: Secondary LLM calls for educational content, definitions, and explanations.

### Features Planned:
- **Term Definitions**: Click any scientific term for instant definition
- **Principle Explanations**: Understand *why* methods work
- **Reagent Information**: Detailed info about materials and suppliers
- **External Links**: Wikipedia, review papers, supplier websites

### Implementation Ready:
- ✅ `EnrichmentService` class created (`workflow-backend/app/services/enrichment_service.py`)
- ✅ Methods for `define_term()`, `explain_principle()`, `get_reagent_info()`
- ✅ JSON response format standardized

### Example API Calls:
```python
# Define a term
enrichment_service.define_term("IVF", "mouse reproductive biology")

# Explain a principle  
enrichment_service.explain_principle(
    "EGFP fluorescence indicates double-strand breaks", 
    "CRISPR genome editing"
)

# Get reagent info
enrichment_service.get_reagent_info("cyclosporin A")
```

### Next Steps for Tier 2:
1. Add API endpoints to `main.py`
2. Implement JSON parsing and error handling
3. Add frontend click handlers for terms

---

## 🖥️ **Tier 3: Interactive UI** 🎨 **ROADMAP**

**Purpose**: Rich user interface features that make the tool truly interactive.

### Features Planned:

#### **Figure/Table Display**
- **LLM Role**: Extract references like "Fig 1a", "Table S5"  
- **App Role**: Open PDF at correct location when user clicks reference
- **Technology**: PDF.js for in-browser PDF viewing

#### **Dropdown Definitions**
- **LLM Role**: Provide definitions via Tier 2 enrichment calls
- **App Role**: Display in tooltips, modals, or expandable sections
- **UX**: Smooth animations, keyboard navigation

#### **Clickable External Links**
- **LLM Role**: Suggest Wikipedia URLs, supplier links, paper references
- **App Role**: Render as styled hyperlinks with icons
- **Features**: Link previews, new tab handling

#### **Interactive Workflow Graph**
- **Enhanced Node Details**: Click any step to see full parameters
- **Reference Integration**: Hover over step to see related figures
- **Search/Filter**: Find steps by reagent, equipment, or technique

### UI Enhancement Examples:
```tsx
// Term with definition tooltip
<TermWithTooltip term="IVF" context="mouse biology" />

// Figure reference that opens PDF
<FigureReference ref="Fig 1a" pdfUrl="/paper.pdf" />

// Equipment with supplier links
<EquipmentCard 
  name="NEPA21 Electroporator" 
  manufacturer="Nepa Gene Co., Ltd."
  onSupplierSearch={() => openSupplierLinks()}
/>
```

---

## 🛠️ **Implementation Priority**

### ✅ **Phase 1: COMPLETE** 
- Enhanced prompt engineering (Tier 1)
- Improved JSON schema with metadata and references
- Frontend display of new prompt

### 🔄 **Phase 2: IN PROGRESS**
- Tier 2 API endpoints
- JSON parsing for enrichment responses
- Basic click-to-define functionality

### 📅 **Phase 3: PLANNED**
- PDF viewer integration for figure display
- Rich tooltips and modals for definitions
- Enhanced workflow visualization with references

### 🚀 **Phase 4: FUTURE**
- Advanced search and filtering
- Export capabilities (protocols, shopping lists)
- Integration with lab management systems

---

## 🎯 **Benefits of This Approach**

1. **Clean Separation**: Each tier has a clear, focused responsibility
2. **Incremental Development**: Can enhance each tier independently
3. **Reliable Core**: Tier 1 provides solid foundation regardless of other features
4. **Scalable Architecture**: Easy to add new enrichment types or UI features
5. **User-Centered**: Builds toward a truly interactive learning experience

---

## 📞 **Next Actions**

1. **Test Tier 1**: Upload a PDF and verify the enhanced extraction works
2. **Implement Tier 2**: Add enrichment endpoints to the API
3. **Plan Tier 3**: Design the interactive UI components
4. **User Testing**: Get feedback on the enhanced workflow extraction

The foundation is now set for building a world-class scientific workflow extraction and learning tool! 🧬✨ 