export enum View {
  DASHBOARD = 'DASHBOARD',
  RISK_ANALYZER = 'RISK_ANALYZER',
  ARCHITECTURE = 'ARCHITECTURE',
  PROTOTYPE = 'PROTOTYPE',
  CODE_GEN = 'CODE_GEN'
}

export interface RiskFactor {
  id: string;
  category: 'Performance' | 'Security' | 'Cost' | 'Integration';
  title: string;
  description: string;
  mitigation: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface AnalysisRequest {
  fileCount: number;
  avgDurationMinutes: number;
  hostingProvider: string;
  budget: string;
}

export interface TranscriptionResult {
  text: string;
  timestamp: string;
}
