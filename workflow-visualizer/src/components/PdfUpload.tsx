import React, { useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: 'Inter', sans-serif;
`;

const UploadCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: ${fadeIn} 0.6s ease-out;
`;

const Title = styled.h1`
  color: #2d3748;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  color: #4a5568;
  font-size: 1.1rem;
  margin-bottom: 32px;
  text-align: center;
  line-height: 1.5;
`;

const DropZone = styled.div<{ isDragOver: boolean; isDisabled: boolean }>`
  border: 2px dashed ${props => {
        if (props.isDisabled) return '#cbd5e0';
        if (props.isDragOver) return '#4299e1';
        return '#a0aec0';
    }};
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: ${props => props.isDisabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  margin-bottom: 24px;
  background: ${props => {
        if (props.isDisabled) return '#f7fafc';
        if (props.isDragOver) return 'rgba(66, 153, 225, 0.05)';
        return 'rgba(74, 85, 104, 0.02)';
    }};
  
  &:hover {
    border-color: ${props => props.isDisabled ? '#cbd5e0' : '#4299e1'};
    background: ${props => props.isDisabled ? '#f7fafc' : 'rgba(66, 153, 225, 0.05)'};
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  color: #4a5568;
`;

const UploadText = styled.div`
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const UploadSubtext = styled.div`
  color: #718096;
  font-size: 0.9rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ProcessingContainer = styled.div`
  text-align: center;
  padding: 20px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProcessingText = styled.div`
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ProcessingSubtext = styled.div`
  color: #718096;
  font-size: 0.9rem;
`;

const ErrorContainer = styled.div`
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const ErrorText = styled.div`
  color: #c53030;
  font-weight: 600;
  margin-bottom: 4px;
`;

const ErrorDetails = styled.div`
  color: #742a2a;
  font-size: 0.9rem;
`;

const RetryButton = styled.button`
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
  }
`;

interface PdfUploadProps {
    onWorkflowGenerated: (workflow: any) => void;
}

const PdfUpload: React.FC<PdfUploadProps> = ({ onWorkflowGenerated }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = async (file: File) => {
        setIsProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:8000/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                onWorkflowGenerated(result.workflow);
            } else {
                setError(result.detail || result.error || 'Failed to process PDF');
            }
        } catch (err) {
            setError('Network error: Unable to connect to server');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileSelect = useCallback((file: File) => {
        if (file.type !== 'application/pdf') {
            setError('Please select a PDF file');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            setError('File size must be less than 50MB');
            return;
        }

        uploadFile(file);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (isProcessing) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect, isProcessing]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!isProcessing) {
            setIsDragOver(true);
        }
    }, [isProcessing]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect]);

    const handleRetry = () => {
        setError(null);
    };

    if (isProcessing) {
        return (
            <Container>
                <UploadCard>
                    <ProcessingContainer>
                        <Spinner />
                        <ProcessingText>🧬 Analyzing PDF</ProcessingText>
                        <ProcessingSubtext>
                            Extracting text and generating workflow visualization...
                            <br />This may take a few moments.
                        </ProcessingSubtext>
                    </ProcessingContainer>
                </UploadCard>
            </Container>
        );
    }

    return (
        <Container>
            <UploadCard>
                <Title>🧬 Scientific Workflow Generator</Title>
                <Subtitle>
                    Upload a scientific paper (PDF) to automatically generate an interactive workflow visualization
                </Subtitle>

                {error && (
                    <ErrorContainer>
                        <ErrorText>⚠️ Upload Failed</ErrorText>
                        <ErrorDetails>{error}</ErrorDetails>
                        <RetryButton onClick={handleRetry}>Try Again</RetryButton>
                    </ErrorContainer>
                )}

                <DropZone
                    isDragOver={isDragOver}
                    isDisabled={isProcessing}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => {
                        if (!isProcessing) {
                            document.getElementById('file-input')?.click();
                        }
                    }}
                >
                    <UploadIcon>📄</UploadIcon>
                    <UploadText>
                        {isDragOver ? 'Drop PDF here' : 'Click to upload or drag & drop'}
                    </UploadText>
                    <UploadSubtext>
                        PDF files only • Max 50MB
                    </UploadSubtext>
                </DropZone>

                <HiddenInput
                    id="file-input"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInputChange}
                    disabled={isProcessing}
                />
            </UploadCard>
        </Container>
    );
};

export default PdfUpload; 