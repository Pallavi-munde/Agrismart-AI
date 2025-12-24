
export interface Skill {
  name: string;
  category: string;
  relevance: number;
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  extractedSkills: string[];
  biasScore: number;
  biasFlags: string[];
  isTech: boolean;
}

export type RecruitmentStage = 'RESUME' | 'APTITUDE' | 'TECHNICAL_1' | 'TECHNICAL_2' | 'HACKATHON' | 'HIRED';

export interface CandidatePerformance {
  id: string;
  name: string;
  email: string;
  role: string;
  resumeScore: number;
  aptitudeScore: number;
  techScore1: number;
  techScore2: number;
  hackathonProject: string;
  hackathonRank: number;
  currentStage: RecruitmentStage;
  isFlagged: boolean;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  result: any | null;
  biasAnalysis: any | null;
}
