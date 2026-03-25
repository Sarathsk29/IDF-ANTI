import { Case, CaseDetail, Evidence, AnalysisResult, CreateCaseInput, UpdateCaseInput } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (e) {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  // Handle No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const createCase = (data: CreateCaseInput): Promise<Case> => {
  return fetchAPI('/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const getCases = (): Promise<Case[]> => {
  return fetchAPI('/cases', { method: 'GET' });
};

export const getCase = (id: string): Promise<CaseDetail> => {
  return fetchAPI(`/cases/${id}`, { method: 'GET' });
};

export const updateCase = (id: string, data: UpdateCaseInput): Promise<Case> => {
  return fetchAPI(`/cases/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const deleteCase = (id: string): Promise<void> => {
  return fetchAPI(`/cases/${id}`, { method: 'DELETE' });
};

export const uploadEvidence = async (caseId: string, file: File): Promise<{evidence_id: string, filename: string, file_type: string, upload_url: string}> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/api/upload/${caseId}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMsg = 'Upload failed';
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return response.json();
};

export const submitAnalysis = (evidenceId: string, analysisType: string): Promise<AnalysisResult> => {
  return fetchAPI(`/analyze/${evidenceId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysis_type: analysisType }),
  });
};

export const getAnalysisResult = (resultId: string): Promise<AnalysisResult> => {
  return fetchAPI(`/analyze/${resultId}`, { method: 'GET' });
};

export const pollAnalysisResult = (resultId: string, onComplete: (r: AnalysisResult) => void, onError: (e: Error) => void) => {
  const interval = setInterval(async () => {
    try {
      const result = await getAnalysisResult(resultId);
      if (result.status === 'completed' || result.status === 'failed') {
        clearInterval(interval);
        onComplete(result);
      }
    } catch (e) {
      clearInterval(interval);
      onError(e instanceof Error ? e : new Error(String(e)));
    }
  }, 3000); // poll every 3 seconds
  return () => clearInterval(interval);
};

export const downloadReport = async (resultId: string): Promise<Blob> => {
  const response = await fetch(`${API_URL}/api/report/${resultId}`);
  if (!response.ok) {
    throw new Error('Failed to download PDF report');
  }
  return response.blob();
};
