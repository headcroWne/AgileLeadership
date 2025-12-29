
export interface Dimension {
  id: string;
  title: string;
  description: string;
}

export interface SurveyResponse {
  id: string;
  timestamp: number;
  scores: Record<string, number>;
  feedback: {
    stopDoing: string;
    startDoing: string;
    keepDoing: string;
  };
}

export interface AggregateStats {
  averageScores: Record<string, number>;
  totalParticipants: number;
  overallAgileScore: number;
  feedbackSummary: {
    stop: string[];
    start: string[];
    keep: string[];
  };
}
