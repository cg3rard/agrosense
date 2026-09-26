export interface AnalyzeRequest {
  image_url: string;
  text: string;
}

export interface AnalyzeResponse {
  diagnosis: string;
  recommended_action: string;
  cost_estimate: number;
  roi_status: string;
}

export interface TransactionRequest {
  item_name: string;
  cost: number;
  timestamp?: string;
}

export interface TransactionResponse {
  id: string;
  item_name: string;
  cost: number;
  timestamp: string;
}
