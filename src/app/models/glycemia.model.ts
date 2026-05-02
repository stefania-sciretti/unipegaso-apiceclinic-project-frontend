export type GlycemiaContext = 'A_DIGIUNO' | 'POST_PASTO_1H' | 'POST_PASTO_2H' | 'RANDOM';
export type GlycemiaClassification = 'NORMALE' | 'ATTENZIONE' | 'ELEVATA';

export interface GlycemiaThreshold {
  classification: GlycemiaClassification;
  label: string;
  minMgDl: number | null;
  maxMgDl: number | null;
}

export interface GlycemiaContextRule {
  context: GlycemiaContext;
  label: string;
  thresholds: GlycemiaThreshold[];
}

export interface GlycemiaClassificationRulesResponse {
  contexts: GlycemiaContextRule[];
}

export interface GlycemiaMeasurement {
  id: number;
  patientId: number;
  patientFirstName: string;
  patientLastName: string;
  specialistId: number;
  specialistFullName: string;
  measuredAt: string;
  valueMgDl: number;
  context: GlycemiaContext;
  classification: GlycemiaClassification;
  notes?: string;
  createdAt: string;
}

export interface GlycemiaMeasurementRequest {
  patientId: number;
  specialistId: number;
  measuredAt: string;
  valueMgDl: number;
  context: GlycemiaContext;
  notes?: string | null;
}
