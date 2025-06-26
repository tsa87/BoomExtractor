import React, { useState } from 'react';
import WorkflowVisualization from './components/WorkflowVisualization';
import PdfUpload from './components/PdfUpload';
import { Workflow } from './types/workflow';

// Your scientific workflow data
const workflow: Workflow = {
  "stages": {
    "S1": {
      "label": "Embryo Preparation & CRISPR Vector Construction",
      "description": "MSM/Ms mice (Mus musculus molossinus) and ICR recipient mice were housed under 07:00–21:00 lighting; all procedures approved by RIKEN Tsukuba Animal Experimentation Committee. Superovulation induced by intraperitoneal anti-inhibin serum (50–100 μL) followed 48 h later by 7.5 IU hCG; metaphase II oocytes collected 16–17 h post-hCG. Epididymal spermatozoa preincubated 1 h at 37 °C, 5% CO₂ in human tubal fluid. IVF performed per established protocol. Three single-guide RNAs targeting a gene exons 1/intron 1, 3, and 4 were designed from MSM/Ms genomic sequence, annealed and cloned into pX330 at BbsI site. Vector cutting efficiency validated by single-strand annealing assay in HEK293 cells transfected via NEPA21 electroporation and monitored for EGFP fluorescence at 48 h."
    },
    "S2": {
      "label": "Generation of nonagouti KO Mice",
      "description": "Pronuclear-stage embryos injected with 5 ng/μL pX330–sgRNA constructs, cultured in KSOM at 37 °C, 5% CO₂ for 24 h to two-cell stage, then transferred bilaterally into oviducts of pseudopregnant ICR females (co-transferred with equal ICR embryos). Recipients received 1–2 mg/kg cyclosporin A subcutaneously on day 5; foetuses checked days 19–20, live pups delivered by C-section and fostered. Founders genotyped by tail-tip DNA PCR (500–700 bp amplicons), sequencing, subcloning into pT7 Blue, allele identification; allele-specific PCR for lines A and D; Cas9 integration ruled out by Cas9-specific PCR. F0 crossed to WT to produce F1, intercrossed to establish homozygous F2 KO lines."
    },
    "S3": {
      "label": "Physiological & Morphological Analyses",
      "description": "At 8 weeks, modified SHIRPA protocol (53 items) assessed behaviour and morphology. At 19 weeks, serum biochemical parameters and adipocytokines measured. At 26 weeks, mice euthanized by pentobarbital overdose; gross organ morphology examined and organ weights recorded."
    },
    "S4": {
      "label": "Behavioural & Tameness Testing",
      "description": "Light/dark transition test at 8 weeks and open-field tests at 9 and 10 weeks performed per RIKEN Mouse Clinic protocols. Home-cage activity monitored over 10–11 weeks for 24 h cycles. Stay-on-hand tameness test at 6 weeks: mice placed on researcher's hand for three 10 s trials; durations summed."
    },
    "S5": {
      "label": "Midbrain Molecular Analysis",
      "description": "Midbrain tissue from 8–9 week mice dissected; total RNA extracted with TRIzol, amplified and Cy3-labeled using Low-Input QuickAmp. cRNA hybridized to Agilent SurePrint G3 Mouse Gene Expression v2 8×60K arrays at 65 °C for 17 h, washed and scanned; signal extracted with Feature Extraction, imported into GeneSpring GX 13.1.1 and normalized."
    }
  },
  "stageEdges": [
    {
      "from": "S1",
      "to": "S2",
      "label": "Vectors & Embryos → KO Mice",
      "description": "CRISPR constructs and two-cell embryos from S1 are used for pronuclear injection and embryo transfer in S2."
    },
    {
      "from": "S2",
      "to": "S3",
      "label": "KO Mice → Phenotyping",
      "description": "Established homozygous KO lines from S2 proceed to physiological and morphological screening in S3."
    },
    {
      "from": "S3",
      "to": "S4",
      "label": "Physiological Data → Behavioural Tests",
      "description": "Mice characterized in S3 undergo behavioural and tameness assays in S4."
    },
    {
      "from": "S4",
      "to": "S5",
      "label": "Behavioural Phenotypes → Molecular Profiling",
      "description": "Mice evaluated in S4 provide midbrain tissue for expression profiling in S5."
    }
  ],
  "steps": {
    "S1.1": {
      "label": "Animal housing & approvals",
      "type": "Experimental",
      "description": "MSM/Ms and ICR mice maintained under 07:00–21:00 light cycle; procedures approved by RIKEN Tsukuba Animal Experimentation Committee.",
      "metadata": {
        "animal_model": "Mus musculus",
        "strain": "MSM/Ms, ICR",
        "lighting": "07:00–21:00",
        "ethical_approval": "RIKEN Tsukuba Animal Experimentation Committee"
      }
    },
    "S1.2": {
      "label": "Superovulation & IVF setup",
      "type": "Experimental",
      "description": "Female MSM/Ms mice injected i.p. with anti-inhibin serum (50–100 µL) then 7.5 IU hCG 48 h later; MII oocytes collected 16–17 h post-hCG; epididymal sperm incubated 1 h at 37 °C, 5% CO₂ in HTF; IVF performed per protocol.",
      "metadata": {
        "AIS_volume": "50–100 µL",
        "hCG_dose": "7.5 IU",
        "oocyte_collection_time": "16–17 h post-hCG",
        "sperm_preincubation": "1 h at 37 °C, 5% CO₂",
        "medium": "HTF"
      }
    },
    "S1.3": {
      "label": "sgRNA design & cloning",
      "type": "Computational",
      "description": "Three sgRNAs targeting a locus (exon 1/intron 1, exon 3, exon 4) designed from MSM/Ms genomic data, oligonucleotides annealed and cloned into pX330 at BbsI site.",
      "metadata": {
        "target_sites": "exon1/intron1, exon3, exon4",
        "vector": "pX330",
        "restriction_site": "BbsI"
      }
    },
    "S1.4": {
      "label": "SSA assay in HEK293",
      "type": "Experimental",
      "description": "HEK293 cells co-transfected with pCAG-EGxxFP and pX330–sgRNA via NEPA21 electroporation; EGFP fluorescence assessed at 48 h using Keyence BZ-9000 and BZ-II Analyzer.",
      "metadata": {
        "cell_line": "HEK293",
        "transfection_tool": "NEPA21 electroporator",
        "fluorescence_microscope": "Keyence BZ-9000",
        "analysis_system": "BZ-II Analyzer"
      }
    },
    "S2.1": {
      "label": "Pronuclear injection",
      "type": "Experimental",
      "description": "Pronuclear-stage embryos injected with 5 ng/µL pX330–sgRNA plasmids, then cultured.",
      "metadata": {
        "plasmid_concentration": "5 ng/µL",
        "embryo_stage": "pronuclear"
      }
    },
    "S2.2": {
      "label": "Embryo culture",
      "type": "Experimental",
      "description": "Injected embryos cultured in KSOM at 37 °C, 5% CO₂ for 24 h to reach two-cell stage.",
      "metadata": {
        "medium": "KSOM",
        "temperature": "37 °C",
        "CO2": "5%",
        "duration_h": "24"
      }
    },
    "S2.3": {
      "label": "Embryo transfer",
      "type": "Experimental",
      "description": "Two-cell embryos transferred into oviducts of pseudopregnant ICR females; recipients given 1–2 mg/kg cyclosporin A on day 5; pups delivered by C-section days 19–20 and fostered.",
      "metadata": {
        "recipient_strain": "ICR",
        "transfer_stage": "two-cell",
        "cyclosporinA_dose_mg_per_kg": "1–2",
        "C-section_days": "19–20"
      }
    },
    "S2.4": {
      "label": "Founder genotyping",
      "type": "Experimental",
      "description": "Tail DNA PCR (500–700 bp) and sequencing to identify indels; subcloning into pT7 Blue; allele-specific PCR for lines A and D; Cas9 integration checked by Cas9-specific PCR.",
      "metadata": {
        "PCR_amplicon_bp": "500–700",
        "vector": "pT7 Blue",
        "alleles": "A, D",
        "integration_check": "Cas9 PCR"
      }
    },
    "S2.5": {
      "label": "KO line establishment",
      "type": "Experimental",
      "description": "F0 founders mated with WT to produce F1 heterozygotes; F1 intercrossed to generate homozygous F2 KO lines carrying alleles A or D.",
      "metadata": {
        "crosses": "F0×WT, F1×F1",
        "generations": "F1, F2"
      }
    },
    "S3.1": {
      "label": "Modified SHIRPA screening",
      "type": "Experimental",
      "description": "At 8 weeks, mice evaluated by modified SHIRPA protocol covering 53 behavioural and morphological items.",
      "metadata": {
        "age_weeks": "8",
        "items_tested": "53"
      }
    },
    "S3.2": {
      "label": "Serum biochemistry",
      "type": "Experimental",
      "description": "At 19 weeks, conventional serum biochemical parameters and adipocytokine levels measured.",
      "metadata": {
        "age_weeks": "19",
        "assays": "biochemical, adipocytokine"
      }
    },
    "S3.3": {
      "label": "Gross morphology & organ weights",
      "type": "Experimental",
      "description": "At 26 weeks, mice euthanized by pentobarbital overdose; organs examined macroscopically and weighed.",
      "metadata": {
        "age_weeks": "26",
        "euthanasia_method": "pentobarbital overdose"
      }
    },
    "S4.1": {
      "label": "Light/dark transition test",
      "type": "Experimental",
      "description": "Conducted at 8 weeks per RIKEN Mouse Clinic protocol to assess anxiety-related behaviour.",
      "metadata": {
        "age_weeks": "8",
        "protocol_source": "RIKEN Mouse Clinic"
      }
    },
    "S4.2": {
      "label": "Open-field tests",
      "type": "Experimental",
      "description": "First and second open-field tests at 9 and 10 weeks to evaluate locomotor activity and exploration.",
      "metadata": {
        "ages_weeks": "9, 10"
      }
    },
    "S4.3": {
      "label": "Home-cage activity monitoring",
      "type": "Experimental",
      "description": "Activity counts recorded over 24 h periods at 10–11 weeks to assess circadian activity patterns.",
      "metadata": {
        "age_weeks": "10–11",
        "recording_period_h": "24"
      }
    },
    "S4.4": {
      "label": "Stay-on-hand tameness test",
      "type": "Experimental",
      "description": "At 6 weeks, mice placed on researcher's hand for three trials (max 10 s each); durations summed as tameness metric.",
      "metadata": {
        "age_weeks": "6",
        "trial_count": "3",
        "max_duration_s": "10"
      }
    },
    "S5.1": {
      "label": "Microarray expression profiling",
      "type": "Experimental",
      "description": "Midbrain RNA from 8–9 week mice extracted with TRIzol, Cy3-labeled cRNA hybridized to Agilent SurePrint G3 Mouse 8×60K arrays at 65 °C for 17 h; scanned, signals extracted and normalized in GeneSpring GX 13.1.1.",
      "metadata": {
        "age_weeks": "8–9",
        "RNA_purification": "TRIzol",
        "labeling_kit": "Low-Input QuickAmp",
        "array": "Agilent G3 Mouse v2 8×60K",
        "hybridization_temp": "65 °C",
        "hybridization_time_h": "17",
        "analysis_software": "GeneSpring GX 13.1.1"
      }
    }
  },
  "stepEdges": [
    { "from": "S1.1", "to": "S1.2", "relation": "preceded_by", "description": "", "label": "Sequential" },
    { "from": "S1.2", "to": "S1.3", "relation": "preceded_by", "description": "", "label": "Sequential" },
    { "from": "S1.3", "to": "S1.4", "relation": "preceded_by", "description": "", "label": "Sequential" },
    { "from": "S1.4", "to": "S2.1", "relation": "generates", "description": "Validated CRISPR vectors used for embryo injection in S2.1.", "label": "Generated" },
    { "from": "S2.1", "to": "S2.2", "relation": "preceded_by", "description": "", "label": "Sequential" },
    { "from": "S2.2", "to": "S2.3", "relation": "preceded_by", "description": "", "label": "Sequential" },
    { "from": "S2.3", "to": "S2.4", "relation": "preceded_by", "description": "", "label": "Sequential" },
    { "from": "S2.4", "to": "S2.5", "relation": "preceded_by", "description": "", "label": "Sequential" },
    { "from": "S2.5", "to": "S3.1", "relation": "generates", "description": "Established KO lines proceed to SHIRPA in S3.1.", "label": "Generated" },
    { "from": "S3.1", "to": "S3.2", "relation": "preceded_by", "description": "", "label": "Sequential" },
    { "from": "S3.2", "to": "S3.3", "relation": "preceded_by", "description": "", "label": "Sequential" },
    { "from": "S3.3", "to": "S4.1", "relation": "generates", "description": "Phenotyped mice subjected to behavioural assays in S4.1.", "label": "Generated" },
    { "from": "S4.1", "to": "S4.2", "relation": "preceded_by", "description": "", "label": "Sequential" },
    { "from": "S4.2", "to": "S4.3", "relation": "preceded_by", "description": "", "label": "Sequential" },
    { "from": "S4.3", "to": "S4.4", "relation": "preceded_by", "description": "", "label": "Sequential" },
    { "from": "S4.4", "to": "S5.1", "relation": "generates", "description": "Behaviourally characterized mice used for molecular profiling in S5.1.", "label": "Generated" }
  ]
};

function App() {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);

  const handleWorkflowGenerated = (generatedWorkflow: Workflow) => {
    setWorkflow(generatedWorkflow);
  };

  const handleBackToUpload = () => {
    setWorkflow(null);
  };

  if (workflow) {
    return (
      <div className="App">
        <WorkflowVisualization
          workflow={workflow}
          onBackToUpload={handleBackToUpload}
        />
      </div>
    );
  }

  return (
    <div className="App">
      <PdfUpload onWorkflowGenerated={handleWorkflowGenerated} />
    </div>
  );
}

export default App;
