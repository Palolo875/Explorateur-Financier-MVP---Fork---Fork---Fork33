import { FinancialData, FinancialItem, EmotionalContext } from '../types/finance';
import { 
  BiasDetectionResult, 
  PsychologicalInsight, 
  MicroInsight,
  UserPsychologyProfile 
} from '../types/psychology';
import { 
  cognitiveBiases, 
  psychologicalFacts, 
  quotes,
  getBiasById,
  getFactById,
  getQuoteById,
  findQuotesByContext
} from '../data/psychologyDatabase';

interface TransactionPattern {
  frequency: number;
  averageAmount: number;
  timePattern: string; // 'morning', 'afternoon', 'evening', 'weekend'
  emotionalState?: number; // 1-10 mood when transaction occurred
  category: string;
}

interface FinancialBehaviorAnalysis {
  impulsiveSpending: number; // 0-1 score
  lossAversionLevel: number; // 0-1 score
  anchoringTendency: number; // 0-1 score
  presentBias: number; // 0-1 score
  confirmationBias: number; // 0-1 score
  endowmentEffect: number; // 0-1 score
}

export class BiasDetectionService {
  private static instance: BiasDetectionService;
  private userProfile: UserPsychologyProfile | null = null;

  public static getInstance(): BiasDetectionService {
    if (!BiasDetectionService.instance) {
      BiasDetectionService.instance = new BiasDetectionService();
    }
    return BiasDetectionService.instance;
  }

  // Analyser les données financières pour détecter les biais cognitifs
  public async detectBiases(
    financialData: FinancialData,
    emotionalContext?: EmotionalContext,
    historicalData?: FinancialData[]
  ): Promise<BiasDetectionResult[]> {
    const detectedBiases: BiasDetectionResult[] = [];
    
    // Analyser les patterns de comportement
    const behaviorAnalysis = this.analyzeBehaviorPatterns(financialData, emotionalContext);
    const transactionPatterns = this.analyzeTransactionPatterns(financialData);

    // Détecter le biais d'ancrage
    const anchoringBias = this.detectAnchoringBias(financialData, transactionPatterns);
    if (anchoringBias) detectedBiases.push(anchoringBias);

    // Détecter l'aversion à la perte
    const lossAversionBias = this.detectLossAversion(financialData, behaviorAnalysis);
    if (lossAversionBias) detectedBiases.push(lossAversionBias);

    // Détecter le biais du présent
    const presentBias = this.detectPresentBias(financialData, behaviorAnalysis);
    if (presentBias) detectedBiases.push(presentBias);

    // Détecter le biais de confirmation
    const confirmationBias = this.detectConfirmationBias(financialData, historicalData);
    if (confirmationBias) detectedBiases.push(confirmationBias);

    // Détecter l'effet de dotation
    const endowmentEffect = this.detectEndowmentEffect(financialData, behaviorAnalysis);
    if (endowmentEffect) detectedBiases.push(endowmentEffect);

    return detectedBiases;
  }

  // Générer des insights psychologiques contextuels
  public generatePsychologicalInsights(
    detectedBiases: BiasDetectionResult[],
    financialData: FinancialData,
    emotionalContext?: EmotionalContext
  ): PsychologicalInsight[] {
    const insights: PsychologicalInsight[] = [];

    for (const biasResult of detectedBiases) {
      const bias = getBiasById(biasResult.biasId);
      if (!bias) continue;

      const insight: PsychologicalInsight = {
        id: `insight-${biasResult.biasId}-${Date.now()}`,
        type: 'bias',
        contentId: bias.id,
        confidence: biasResult.confidence,
        context: this.generateBiasContext(bias, biasResult, financialData),
        financialImpact: {
          amount: biasResult.financialImpact,
          description: this.calculateImpactDescription(bias, biasResult.financialImpact)
        },
        actionable: true,
        urgency: bias.severity === 'high' ? 'high' : bias.severity === 'medium' ? 'medium' : 'low',
        triggeredBy: {
          type: 'pattern',
          data: biasResult.evidence
        }
      };

      insights.push(insight);
    }

    // Ajouter des faits psychologiques pertinents
    const relevantFacts = this.findRelevantPsychologicalFacts(detectedBiases, emotionalContext);
    for (const fact of relevantFacts) {
      const insight: PsychologicalInsight = {
        id: `fact-insight-${fact.id}-${Date.now()}`,
        type: 'fact',
        contentId: fact.id,
        confidence: 0.8,
        context: fact.practicalApplication,
        financialImpact: {
          description: fact.financialImplication
        },
        actionable: true,
        urgency: 'medium',
        triggeredBy: {
          type: 'pattern',
          data: detectedBiases.map(b => b.biasId)
        }
      };

      insights.push(insight);
    }

    return insights.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }

  // Générer des micro-insights contextuels
  public generateMicroInsights(
    psychologicalInsights: PsychologicalInsight[],
    context: 'transaction' | 'dashboard' | 'goal' | 'simulation'
  ): MicroInsight[] {
    const microInsights: MicroInsight[] = [];

    for (const insight of psychologicalInsights.slice(0, 3)) { // Limiter à 3 pour éviter la surcharge
      const content = this.generateMicroInsightContent(insight, context);
      if (content) {
        const microInsight: MicroInsight = {
          id: `micro-${insight.id}`,
          type: this.determineMicroInsightType(insight),
          content,
          psychologyReference: {
            type: insight.type as 'bias' | 'fact',
            id: insight.contentId
          },
          displayContext: context,
          priority: insight.urgency === 'high' ? 8 : insight.urgency === 'medium' ? 5 : 3,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
        };

        microInsights.push(microInsight);
      }
    }

    // Ajouter des citations motivantes si approprié
    if (context === 'goal' || context === 'dashboard') {
      const relevantQuotes = findQuotesByContext(context);
      if (relevantQuotes.length > 0) {
        const quote = relevantQuotes[Math.floor(Math.random() * relevantQuotes.length)];
        microInsights.push({
          id: `quote-${quote.id}-${Date.now()}`,
          type: 'encouragement',
          content: `"${quote.text}" - ${quote.author}`,
          displayContext: context,
          priority: 2
        });
      }
    }

    return microInsights.sort((a, b) => b.priority - a.priority);
  }

  // Analyser les patterns de comportement
  private analyzeBehaviorPatterns(
    financialData: FinancialData,
    emotionalContext?: EmotionalContext
  ): FinancialBehaviorAnalysis {
    const expenses = financialData.expenses || [];
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.value), 0);

    // Calculer le score d'achat impulsif
    const impulsiveCategories = ['Loisirs', 'Restaurant', 'Shopping', 'Divertissement'];
    const impulsiveSpending = expenses
      .filter(expense => impulsiveCategories.includes(expense.category))
      .reduce((sum, expense) => sum + Number(expense.value), 0) / totalExpenses;

    // Analyser l'aversion à la perte (basé sur la réticence à changer)
    const lossAversionLevel = this.calculateLossAversionScore(financialData);

    // Analyser la tendance à l'ancrage (variation des prix par catégorie)
    const anchoringTendency = this.calculateAnchoringScore(expenses);

    // Analyser le biais du présent (épargne vs dépenses immédiates)
    const presentBias = this.calculatePresentBiasScore(financialData);

    return {
      impulsiveSpending: Math.min(1, impulsiveSpending),
      lossAversionLevel,
      anchoringTendency,
      presentBias,
      confirmationBias: 0.5, // Difficile à détecter automatiquement
      endowmentEffect: 0.3    // Nécessite plus de données historiques
    };
  }

  // Analyser les patterns de transactions
  private analyzeTransactionPatterns(financialData: FinancialData): TransactionPattern[] {
    const allTransactions = [
      ...(financialData.expenses || []),
      ...(financialData.incomes || [])
    ];

    const patternMap = new Map<string, TransactionPattern>();

    for (const transaction of allTransactions) {
      const key = transaction.category;
      if (!patternMap.has(key)) {
        patternMap.set(key, {
          frequency: 0,
          averageAmount: 0,
          timePattern: 'unknown',
          category: transaction.category
        });
      }

      const pattern = patternMap.get(key)!;
      pattern.frequency += 1;
      pattern.averageAmount = (pattern.averageAmount + Number(transaction.value)) / 2;
    }

    return Array.from(patternMap.values());
  }

  // Détecter le biais d'ancrage
  private detectAnchoringBias(
    financialData: FinancialData,
    patterns: TransactionPattern[]
  ): BiasDetectionResult | null {
    const expenses = financialData.expenses || [];
    
    // Rechercher des variations importantes dans les montants par catégorie
    // qui pourraient indiquer une influence par des "prix d'ancrage"
    let anchoringEvidence: string[] = [];
    let confidence = 0;

    for (const pattern of patterns) {
      const categoryExpenses = expenses.filter(e => e.category === pattern.category);
      if (categoryExpenses.length < 2) continue;

      const amounts = categoryExpenses.map(e => Number(e.value));
      const variance = this.calculateVariance(amounts);
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      
      // Si la variance est élevée, cela peut indiquer un ancrage sur différents prix
      if (variance / mean > 0.5) {
        anchoringEvidence.push(`Forte variation des montants en ${pattern.category}`);
        confidence += 0.2;
      }
    }

    if (confidence > 0.4) {
      return {
        biasId: 'anchoring-bias',
        confidence: Math.min(confidence, 0.9),
        evidence: anchoringEvidence,
        financialImpact: this.estimateAnchoringImpact(expenses),
        detectedAt: new Date(),
        relatedTransactions: expenses.map(e => e.id).filter(Boolean) as string[]
      };
    }

    return null;
  }

  // Détecter l'aversion à la perte
  private detectLossAversion(
    financialData: FinancialData,
    behaviorAnalysis: FinancialBehaviorAnalysis
  ): BiasDetectionResult | null {
    const evidence: string[] = [];
    let confidence = 0;

    // Analyser les investissements vs épargne de précaution
    const investments = financialData.investments || [];
    const savings = financialData.savings || [];
    const totalSavings = savings.reduce((sum, s) => sum + Number(s.value), 0);
    const totalInvestments = investments.reduce((sum, i) => sum + Number(i.value), 0);

    if (totalSavings > totalInvestments * 3) {
      evidence.push('Préférence marquée pour l\'épargne sécurisée vs investissements');
      confidence += 0.3;
    }

    // Analyser les assurances excessives
    const insuranceExpenses = financialData.expenses?.filter(e => 
      e.category.toLowerCase().includes('assurance') || 
      e.category.toLowerCase().includes('protection')
    ) || [];
    
    const totalInsurance = insuranceExpenses.reduce((sum, i) => sum + Number(i.value), 0);
    const totalIncome = (financialData.incomes || []).reduce((sum, i) => sum + Number(i.value), 0);
    
    if (totalInsurance / totalIncome > 0.15) {
      evidence.push('Dépenses d\'assurance élevées suggérant une aversion au risque');
      confidence += 0.2;
    }

    if (confidence > 0.3) {
      return {
        biasId: 'loss-aversion',
        confidence: Math.min(confidence, 0.8),
        evidence,
        financialImpact: totalSavings * 0.05, // Estimation du coût d'opportunité
        detectedAt: new Date()
      };
    }

    return null;
  }

  // Détecter le biais du présent
  private detectPresentBias(
    financialData: FinancialData,
    behaviorAnalysis: FinancialBehaviorAnalysis
  ): BiasDetectionResult | null {
    const evidence: string[] = [];
    let confidence = behaviorAnalysis.presentBias;

    if (behaviorAnalysis.impulsiveSpending > 0.3) {
      evidence.push('Dépenses impulsives élevées dans les catégories de plaisir immédiat');
      confidence += 0.2;
    }

    const totalIncome = (financialData.incomes || []).reduce((sum, i) => sum + Number(i.value), 0);
    const totalSavings = (financialData.savings || []).reduce((sum, s) => sum + Number(s.value), 0);
    const savingsRate = totalIncome > 0 ? totalSavings / totalIncome : 0;

    if (savingsRate < 0.1) {
      evidence.push('Taux d\'épargne faible suggérant une préférence pour la consommation immédiate');
      confidence += 0.3;
    }

    if (confidence > 0.4) {
      const impactAmount = (financialData.expenses || [])
        .filter(e => ['Loisirs', 'Restaurant', 'Shopping'].includes(e.category))
        .reduce((sum, e) => sum + Number(e.value), 0);

      return {
        biasId: 'present-bias',
        confidence: Math.min(confidence, 0.9),
        evidence,
        financialImpact: impactAmount * 0.3, // 30% pourrait être évité
        detectedAt: new Date()
      };
    }

    return null;
  }

  // Détecter le biais de confirmation
  private detectConfirmationBias(
    financialData: FinancialData,
    historicalData?: FinancialData[]
  ): BiasDetectionResult | null {
    // Ce biais est difficile à détecter automatiquement
    // Il nécessiterait une analyse des sources d'information de l'utilisateur
    // Pour l'instant, on retourne null mais on pourrait l'implémenter avec plus de données
    return null;
  }

  // Détecter l'effet de dotation
  private detectEndowmentEffect(
    financialData: FinancialData,
    behaviorAnalysis: FinancialBehaviorAnalysis
  ): BiasDetectionResult | null {
    // Difficile à détecter sans données sur les ventes/échanges
    // Pourrait être implémenté avec des données sur la durée de possession des biens
    return null;
  }

  // Fonctions utilitaires
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private calculateLossAversionScore(financialData: FinancialData): number {
    // Implémentation simplifiée
    const savings = (financialData.savings || []).reduce((sum, s) => sum + Number(s.value), 0);
    const investments = (financialData.investments || []).reduce((sum, i) => sum + Number(i.value), 0);
    
    if (savings + investments === 0) return 0.5;
    return Math.min(1, savings / (savings + investments));
  }

  private calculateAnchoringScore(expenses: FinancialItem[]): number {
    // Implémentation simplifiée basée sur la variance des prix
    const categories = [...new Set(expenses.map(e => e.category))];
    let totalVarianceScore = 0;

    for (const category of categories) {
      const categoryExpenses = expenses.filter(e => e.category === category);
      if (categoryExpenses.length < 2) continue;

      const amounts = categoryExpenses.map(e => Number(e.value));
      const variance = this.calculateVariance(amounts);
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      
      totalVarianceScore += variance / mean;
    }

    return Math.min(1, totalVarianceScore / categories.length);
  }

  private calculatePresentBiasScore(financialData: FinancialData): number {
    const totalIncome = (financialData.incomes || []).reduce((sum, i) => sum + Number(i.value), 0);
    const totalSavings = (financialData.savings || []).reduce((sum, s) => sum + Number(s.value), 0);
    const impulsiveExpenses = (financialData.expenses || [])
      .filter(e => ['Loisirs', 'Restaurant', 'Shopping'].includes(e.category))
      .reduce((sum, e) => sum + Number(e.value), 0);

    const savingsRate = totalIncome > 0 ? totalSavings / totalIncome : 0;
    const impulsiveRate = totalIncome > 0 ? impulsiveExpenses / totalIncome : 0;

    return Math.min(1, impulsiveRate - savingsRate + 0.5);
  }

  private estimateAnchoringImpact(expenses: FinancialItem[]): number {
    // Estimation simple : 10% des dépenses pourraient être évitées sans ancrage
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.value), 0);
    return totalExpenses * 0.1;
  }

  private generateBiasContext(
    bias: any,
    result: BiasDetectionResult,
    financialData: FinancialData
  ): string {
    return `Votre ${bias.name.toLowerCase()} a été détecté avec ${Math.round(result.confidence * 100)}% de confiance. ${bias.financialExplanation}`;
  }

  private calculateImpactDescription(bias: any, amount: number): string {
    return `Ce biais vous coûte environ ${amount.toFixed(0)}€ par mois en décisions sous-optimales.`;
  }

  private findRelevantPsychologicalFacts(
    detectedBiases: BiasDetectionResult[],
    emotionalContext?: EmotionalContext
  ): any[] {
    const biasIds = detectedBiases.map(b => b.biasId);
    
    return psychologicalFacts.filter(fact => 
      fact.relatedBiases.some(biasId => biasIds.includes(biasId)) ||
      (emotionalContext && fact.keywords.includes('stress') && emotionalContext.mood > 7)
    );
  }

  private generateMicroInsightContent(
    insight: PsychologicalInsight,
    context: string
  ): string | null {
    const bias = getBiasById(insight.contentId);
    const fact = getFactById(insight.contentId);
    
    if (bias) {
      return `💡 ${bias.name} détecté : ${bias.financialExplanation.substring(0, 100)}...`;
    }
    
    if (fact) {
      return `🧠 ${fact.title} : ${fact.practicalApplication.substring(0, 100)}...`;
    }
    
    return null;
  }

  private determineMicroInsightType(insight: PsychologicalInsight): MicroInsight['type'] {
    if (insight.urgency === 'high') return 'warning';
    if (insight.type === 'fact') return 'education';
    return 'tip';
  }
}