import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DocumentAnalysis {
  session_id: string;
  original_text: string;
  simplified_text: string;
  risks: Array<{
    risk_level: string;
    description: string;
  }>;
  document_health_score: number;
}

export interface QARequest {
  session_id: string;
  question: string;
}

export interface QAResponse {
  answer: string;
}

export interface TranslateRequest {
  text: string;
  target_language: string;
}

export interface TranslateResponse {
  translated_text: string;
}

// Upload document for analysis
export const processDocument = async (file: File): Promise<DocumentAnalysis> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/process-document', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Ask question about document
export const askQuestion = async (request: QARequest): Promise<QAResponse> => {
  const response = await api.post('/qa', request);
  return response.data;
};

// Translate text
export const translateText = async (request: TranslateRequest): Promise<TranslateResponse> => {
  const response = await api.post('/translate', request);
  return response.data;
};

// Export analysis as PDF
export const exportToPDF = async (analysis: DocumentAnalysis): Promise<Blob> => {
  const response = await api.post('/export', analysis, {
    responseType: 'blob',
  });
  
  return response.data;
};

export default api;