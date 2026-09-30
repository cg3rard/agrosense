export type RoiStatus = 'Positive' | 'Neutral' | 'Negative';






export interface RoiBreakdown {
  status: RoiStatus;
  roi_percent: number;
  benefit_cost_ratio: number;
  revenue_potential: number;
  loss_if_untreated: number;
  loss_if_treated: number;
  benefit: number;
  treatment_cost: number;
  net_benefit: number;
  break_even_cost: number;
  break_even_loss_percent: number;
  land_area_ha: number;
  yield_per_ha_kg: number;
  price_per_kg: number;
  yield_loss_percent: number;
  effectiveness_percent: number;
  assumed_fields: string[];
  formula: string;
}

export interface AnalyzeResponse {
  diagnosis: string;
  recommended_action: string;
  cost_estimate: number;
  roi_status: string;

  roi?: RoiBreakdown;
}


export interface FarmParams {
  land_area_ha: string;
  yield_per_ha_kg: string;
  price_per_kg: string;
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
