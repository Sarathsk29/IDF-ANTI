export type CaseStatus = "open" | "closed" | "pending";

export interface Evidence {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface AnalysisResult {
  id: string;
  evidence_id: string;
  case_id: string;
  analysis_type: string; // "image_forgery" | "document_forgery" | "ai_detection"
  status: string;        // "processing" | "completed" | "failed"
  forgery_detected: boolean | null;
  confidence_score: number | null;
  detection_methods: string[] | null;
  findings: string[] | null;
  heatmap_path: string | null;
  annotated_image_path: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Case {
  id: string;
  case_number: string;
  title: string;
  description: string | null;
  status: CaseStatus;
  created_at: string;
  updated_at: string;
}

export interface CaseDetail extends Case {
  evidence: Evidence[];
  analysis_results: AnalysisResult[];
}

export interface CreateCaseInput {
  title: string;
  description?: string;
}

export interface UpdateCaseInput {
  title?: string;
  description?: string;
  status?: CaseStatus;
}
