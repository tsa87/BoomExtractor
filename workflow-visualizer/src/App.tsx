import React, { useState } from 'react';
import WorkflowVisualization from './components/WorkflowVisualization';
import PdfUpload from './components/PdfUpload';
import { Workflow } from './types/workflow';

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
