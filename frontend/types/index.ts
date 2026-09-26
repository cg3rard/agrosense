export interface AnalyzeResponse {
  diagnosis: string;
  recommended_action: string;
  cost_estimate: number;
  roi_status: string;
}

export interface DiagnosisHistory {
  id: string;
  timestamp: string;
  symptomText: string;
  imageName?: string;
  result: AnalyzeResponse;
}

export type FinanceEntryType = 'expense' | 'income';

export interface FinanceEntryRequest {
  type: FinanceEntryType;
  item_name: string;
  amount: number;
  note?: string;
  timestamp?: string;
}

export interface FinanceEntryResponse {
  id: string;
  type: FinanceEntryType;
  item_name: string;
  amount: number;
  note?: string | null;
  timestamp: string;
}
