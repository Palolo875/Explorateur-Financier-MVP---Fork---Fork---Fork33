export interface CognitiveBias {
  id: string;
  name: string;
  category: 'decision' | 'memory' | 'social' | 'emotional' | 'perception';
  definition: string;
  financialExplanation: string;
  commonTriggers: string[];
  counterStrategies: string[];
  examples: string[];
  scientificReferences: ScientificReference[];
  severity: 'low' | 'medium' | 'high';
  keywords: string[];
}

export interface PsychologicalFact {
  id: string;
  title: string;
  category: 'neuroeconomics' | 'behavioral_finance' | 'decision_psychology' | 'emotional_finance';
  description: string;
  financialImplication: string;
  practicalApplication: string;
  scientificReferences: ScientificReference[];
  relatedBiases: string[]; // IDs of related cognitive biases
  keywords: string[];
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  authorDescription?: string;
  category: 'investment' | 'saving' | 'psychology' | 'wisdom' | 'motivation';
  context: string; // When to show this quote
  relatedConcepts: string[];
  source?: string;
  year?: number;
}

export interface ScientificReference {
  title: string;
  authors: string[];
  journal?: string;
  year: number;
  doi?: string;
  url?: string;
  summary: string;
}

export interface PsychologicalInsight {
  id: string;
  type: 'bias' | 'fact' | 'quote';
  contentId: string; // ID of the bias, fact, or quote
  confidence: number; // 0-1, how confident the AI is about this insight
  context: string; // Why this insight is relevant now
  financialImpact: {
    amount?: number;
    percentage?: number;
    description: string;
  };
  actionable: boolean;
  urgency: 'low' | 'medium' | 'high';
  triggeredBy: {
    type: 'transaction' | 'pattern' | 'emotion' | 'goal' | 'simulation';
    data: any;
  };
}

export interface BiasDetectionResult {
  biasId: string;
  confidence: number;
  evidence: string[];
  financialImpact: number;
  detectedAt: Date;
  relatedTransactions?: string[];
}

export interface PsychologyKnowledgeBase {
  biases: CognitiveBias[];
  facts: PsychologicalFact[];
  quotes: Quote[];
  lastUpdated: Date;
  version: string;
}

export interface UserPsychologyProfile {
  detectedBiases: BiasDetectionResult[];
  preferredLearningStyle: 'visual' | 'textual' | 'interactive';
  completedLessons: string[];
  psychologyScore: number; // 0-100, understanding of own psychology
  lastProfileUpdate: Date;
}

export interface MicroInsight {
  id: string;
  type: 'tip' | 'warning' | 'encouragement' | 'education';
  content: string;
  psychologyReference?: {
    type: 'bias' | 'fact';
    id: string;
  };
  displayContext: 'transaction' | 'dashboard' | 'goal' | 'simulation';
  priority: number; // 1-10
  expiresAt?: Date;
}