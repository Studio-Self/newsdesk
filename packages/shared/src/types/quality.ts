export interface QualityCriteria {
  accuracy: number;
  clarity: number;
  style: number;
  completeness: number;
}

export interface QualityScore {
  id: string;
  storyId: string;
  agentId: string;
  stage: string;
  score: number;
  criteria: QualityCriteria;
  feedback: string | null;
  createdAt: string;
}
