import { RealTransaction, RealDataStorageService } from './RealDataStorageService';
import { FinancialData, EmotionalContext } from '../types/finance';

/**
 * Moteur d'insights personnalisés pour générer des révélations authentiques
 * Analyse les données réelles de l'utilisateur pour créer des "Aha Moments"
 */
export class PersonalizedInsightsEngine {
  private static instance: PersonalizedInsightsEngine;
  private storage: RealDataStorageService;

  private constructor() {
    this.storage = RealDataStorageService.getInstance();
  }

  public static getInstance(): PersonalizedInsightsEngine {
    if (!PersonalizedInsightsEngine.instance) {
      PersonalizedInsightsEngine.instance = new PersonalizedInsightsEngine();
    }
    return PersonalizedInsightsEngine.instance;
  }

  /**
   * Génère des insights personnalisés basés sur les données réelles
   */
  async generatePersonalizedInsights(userId: string): Promise<PersonalizedInsight[]> {
    try {
      // Récupération des données utilisateur
      const transactions = await this.storage.getTransactions(userId);
      const financialData = await this.storage.getFinancialData(userId, 5);

      if (transactions.length === 0) {
        return this.getOnboardingInsights();
      }

      const insights: PersonalizedInsight[] = [];

      // 1. Analyse des patterns de dépenses
      insights.push(...await this.analyzeSpendingPatterns(transactions));

      // 2. Détection des frais cachés
      insights.push(...await this.detectHiddenFees(transactions));

      // 3. Analyse des corrélations émotionnelles
      insights.push(...await this.analyzeEmotionalCorrelations(transactions));

      // 4. Simulations d'économies personnalisées
      insights.push(...await this.generateSavingsSimulations(transactions));

      // 5. Comparaisons symboliques personnalisées
      insights.push(...await this.generateSymbolicComparisons(transactions));

      // 6. Tendances et projections
      insights.push(...await this.analyzeTrends(transactions));

      // Tri par pertinence et impact
      return this.rankInsightsByRelevance(insights, transactions);

    } catch (error) {
      console.error('Erreur lors de la génération d\'insights:', error);
      return [];
    }
  }

  /**
   * Analyse les patterns de dépenses pour identifier des comportements
   */
  private async analyzeSpendingPatterns(transactions: RealTransaction[]): Promise<PersonalizedInsight[]> {
    const insights: PersonalizedInsight[] = [];
    
    // Analyse par catégorie
    const categorySpending = this.groupTransactionsByCategory(transactions);
    
    for (const [category, categoryTransactions] of Object.entries(categorySpending)) {
      const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.value, 0);
      const avgTransaction = totalSpent / categoryTransactions.length;
      
      // Pattern 1: Catégorie dominante
      const totalAllCategories = transactions.reduce((sum, t) => sum + t.value, 0);
      const categoryPercentage = (totalSpent / totalAllCategories) * 100;
      
      if (categoryPercentage > 30) {
        insights.push({
          id: `dominant-category-${category}`,
          type: 'spending_pattern',
          title: `${category} représente ${Math.round(categoryPercentage)}% de vos dépenses`,
          description: `Vous avez dépensé ${totalSpent.toFixed(2)}€ en ${category} ce mois, soit plus d'un tiers de votre budget.`,
          impact: categoryPercentage > 50 ? 'high' : 'medium',
          actionSuggestion: `Analysez si cette proportion correspond à vos priorités. Peut-être pourriez-vous optimiser certaines dépenses en ${category}.`,
          dataSource: 'real_transactions',
          relevanceScore: categoryPercentage / 100,
          personalizedData: {
            category,
            amount: totalSpent,
            percentage: categoryPercentage,
            transactionCount: categoryTransactions.length
          }
        });
      }

      // Pattern 2: Micro-dépenses fréquentes
      const smallTransactions = categoryTransactions.filter(t => t.value < 10);
      if (smallTransactions.length > 10) {
        const microTotal = smallTransactions.reduce((sum, t) => sum + t.value, 0);
        insights.push({
          id: `micro-spending-${category}`,
          type: 'micro_spending',
          title: `${smallTransactions.length} petites dépenses en ${category} = ${microTotal.toFixed(2)}€`,
          description: `Vos micro-dépenses en ${category} s'accumulent. Ces ${smallTransactions.length} petits achats représentent ${microTotal.toFixed(2)}€.`,
          impact: 'medium',
          actionSuggestion: `Considérez regrouper vos achats en ${category} pour éviter les dépenses impulsives.`,
          dataSource: 'real_transactions',
          relevanceScore: smallTransactions.length / 20,
          personalizedData: {
            category,
            microTransactionCount: smallTransactions.length,
            microTotal,
            avgMicroAmount: microTotal / smallTransactions.length
          }
        });
      }
    }

    // Pattern 3: Analyse temporelle
    const weekendSpending = transactions.filter(t => {
      const date = new Date(t.date);
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    });

    if (weekendSpending.length > 0) {
      const weekendTotal = weekendSpending.reduce((sum, t) => sum + t.value, 0);
      const weekendPercentage = (weekendTotal / totalAllCategories) * 100;

      if (weekendPercentage > 40) {
        insights.push({
          id: 'weekend-spending',
          type: 'temporal_pattern',
          title: `${Math.round(weekendPercentage)}% de vos dépenses ont lieu le week-end`,
          description: `Vous dépensez ${weekendTotal.toFixed(2)}€ le week-end, soit ${Math.round(weekendPercentage)}% de votre budget total.`,
          impact: 'medium',
          actionSuggestion: 'Les week-ends semblent être vos moments de dépense principale. Planifiez un budget spécifique pour ces moments.',
          dataSource: 'real_transactions',
          relevanceScore: weekendPercentage / 100,
          personalizedData: {
            weekendAmount: weekendTotal,
            weekendPercentage,
            weekendTransactionCount: weekendSpending.length
          }
        });
      }
    }

    return insights;
  }

  /**
   * Détecte les frais cachés et récurrents
   */
  private async detectHiddenFees(transactions: RealTransaction[]): Promise<PersonalizedInsight[]> {
    const insights: PersonalizedInsight[] = [];
    
    // Détection des abonnements oubliés
    const recurringTransactions = this.detectRecurringTransactions(transactions);
    
    for (const recurring of recurringTransactions) {
      if (recurring.frequency === 'monthly' && recurring.transactions.length >= 3) {
        const monthlyAmount = recurring.averageAmount;
        const yearlyAmount = monthlyAmount * 12;
        
        insights.push({
          id: `recurring-${recurring.description}`,
          type: 'hidden_fees',
          title: `Abonnement récurrent: ${recurring.description}`,
          description: `Vous payez ${monthlyAmount.toFixed(2)}€/mois pour "${recurring.description}", soit ${yearlyAmount.toFixed(2)}€/an.`,
          impact: yearlyAmount > 100 ? 'high' : 'medium',
          actionSuggestion: `Vérifiez si cet abonnement est toujours nécessaire. Annuler cet abonnement vous ferait économiser ${yearlyAmount.toFixed(2)}€/an.`,
          dataSource: 'real_transactions',
          relevanceScore: yearlyAmount / 500, // Score basé sur l'impact financier
          personalizedData: {
            monthlyAmount,
            yearlyAmount,
            description: recurring.description,
            lastPayment: recurring.transactions[0].date,
            paymentCount: recurring.transactions.length
          }
        });
      }
    }

    // Détection des frais bancaires
    const bankFees = transactions.filter(t => 
      t.description && (
        t.description.toLowerCase().includes('frais') ||
        t.description.toLowerCase().includes('commission') ||
        t.description.toLowerCase().includes('agios')
      )
    );

    if (bankFees.length > 0) {
      const totalFees = bankFees.reduce((sum, t) => sum + t.value, 0);
      insights.push({
        id: 'bank-fees',
        type: 'hidden_fees',
        title: `${totalFees.toFixed(2)}€ de frais bancaires détectés`,
        description: `Vous avez payé ${totalFees.toFixed(2)}€ en frais bancaires sur la période analysée.`,
        impact: totalFees > 50 ? 'high' : 'medium',
        actionSuggestion: 'Analysez vos frais bancaires et considérez changer de banque ou d\'offre si ces frais sont trop élevés.',
        dataSource: 'real_transactions',
        relevanceScore: totalFees / 100,
        personalizedData: {
          totalFees,
          feeCount: bankFees.length,
          avgFee: totalFees / bankFees.length
        }
      });
    }

    return insights;
  }

  /**
   * Analyse les corrélations entre émotions et dépenses
   */
  private async analyzeEmotionalCorrelations(transactions: RealTransaction[]): Promise<PersonalizedInsight[]> {
    const insights: PersonalizedInsight[] = [];
    
    // Transactions avec contexte émotionnel
    const emotionalTransactions = transactions.filter(t => t.emotionalContext);
    
    if (emotionalTransactions.length < 5) {
      return insights; // Pas assez de données émotionnelles
    }

    // Analyse par niveau d'humeur
    const moodSpending: Record<string, { total: number; count: number; transactions: RealTransaction[] }> = {};
    
    for (const transaction of emotionalTransactions) {
      const mood = transaction.emotionalContext!.mood;
      const moodRange = this.getMoodRange(mood);
      
      if (!moodSpending[moodRange]) {
        moodSpending[moodRange] = { total: 0, count: 0, transactions: [] };
      }
      
      moodSpending[moodRange].total += transaction.value;
      moodSpending[moodRange].count++;
      moodSpending[moodRange].transactions.push(transaction);
    }

    // Détection des corrélations significatives
    for (const [moodRange, data] of Object.entries(moodSpending)) {
      const avgSpending = data.total / data.count;
      const globalAvg = emotionalTransactions.reduce((sum, t) => sum + t.value, 0) / emotionalTransactions.length;
      
      const difference = ((avgSpending - globalAvg) / globalAvg) * 100;
      
      if (Math.abs(difference) > 20) { // Différence significative de +/- 20%
        const moodEmoji = this.getMoodEmoji(moodRange);
        const trend = difference > 0 ? 'plus' : 'moins';
        const archetype = this.getEmotionalArchetype(moodRange, difference > 0);
        
        insights.push({
          id: `emotional-spending-${moodRange}`,
          type: 'emotional_correlation',
          title: `Votre ${archetype} dépense ${Math.abs(Math.round(difference))}% ${trend} ${moodEmoji}`,
          description: `Quand vous êtes ${moodRange}, vous dépensez en moyenne ${avgSpending.toFixed(2)}€ par transaction, soit ${Math.abs(Math.round(difference))}% ${trend} que votre moyenne habituelle.`,
          impact: Math.abs(difference) > 50 ? 'high' : 'medium',
          actionSuggestion: difference > 0 
            ? `Attention aux dépenses impulsives quand vous êtes ${moodRange}. Prenez une pause avant d'acheter.`
            : `Vous êtes plus économe quand vous êtes ${moodRange}. Profitez de ces moments pour planifier vos achats importants.`,
          dataSource: 'emotional_context',
          relevanceScore: Math.abs(difference) / 100,
          personalizedData: {
            moodRange,
            avgSpending,
            difference,
            transactionCount: data.count,
            archetype,
            emoji: moodEmoji
          }
        });
      }
    }

    return insights;
  }

  /**
   * Génère des simulations d'économies personnalisées
   */
  private async generateSavingsSimulations(transactions: RealTransaction[]): Promise<PersonalizedInsight[]> {
    const insights: PersonalizedInsight[] = [];
    
    // Simulation 1: Réduction de la catégorie la plus dépensière
    const categorySpending = this.groupTransactionsByCategory(transactions);
    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b.reduce((sum, t) => sum + t.value, 0) - a.reduce((sum, t) => sum + t.value, 0))[0];
    
    if (topCategory) {
      const [category, categoryTransactions] = topCategory;
      const monthlySpending = categoryTransactions.reduce((sum, t) => sum + t.value, 0);
      const reductionPercentage = 20; // Simulation de 20% de réduction
      const monthlySavings = monthlySpending * (reductionPercentage / 100);
      const yearlySavings = monthlySavings * 12;
      
      insights.push({
        id: `savings-simulation-${category}`,
        type: 'savings_simulation',
        title: `En réduisant ${category} de ${reductionPercentage}%, économisez ${yearlySavings.toFixed(0)}€/an`,
        description: `Si vous réduisiez vos dépenses en ${category} de seulement ${reductionPercentage}%, vous économiseriez ${monthlySavings.toFixed(2)}€/mois, soit ${yearlySavings.toFixed(2)}€ sur l'année.`,
        impact: yearlySavings > 500 ? 'high' : 'medium',
        actionSuggestion: `Identifiez les dépenses non essentielles en ${category} et fixez-vous un budget mensuel de ${(monthlySpending - monthlySavings).toFixed(2)}€.`,
        dataSource: 'simulation',
        relevanceScore: yearlySavings / 1000,
        personalizedData: {
          category,
          currentMonthlySpending: monthlySpending,
          reductionPercentage,
          monthlySavings,
          yearlySavings,
          newBudget: monthlySpending - monthlySavings
        }
      });
    }

    return insights;
  }

  /**
   * Génère des comparaisons symboliques personnalisées
   */
  private async generateSymbolicComparisons(transactions: RealTransaction[]): Promise<PersonalizedInsight[]> {
    const insights: PersonalizedInsight[] = [];
    
    // Base de comparaisons symboliques
    const comparisons = [
      { item: 'café', price: 3.5, category: 'Restaurant' },
      { item: 'place de cinéma', price: 12, category: 'Loisirs' },
      { item: 'magazine', price: 4, category: 'Divers' },
      { item: 'sandwich', price: 6, category: 'Restaurant' },
      { item: 'livre', price: 15, category: 'Culture' }
    ];

    // Analyse des micro-dépenses fréquentes
    const microTransactions = transactions.filter(t => t.value < 15 && t.value > 1);
    const frequentMicroSpending = this.groupTransactionsByDescription(microTransactions);

    for (const [description, descTransactions] of Object.entries(frequentMicroSpending)) {
      if (descTransactions.length >= 3) {
        const totalSpent = descTransactions.reduce((sum, t) => sum + t.value, 0);
        const avgAmount = totalSpent / descTransactions.length;
        
        // Trouve la meilleure comparaison symbolique
        const bestComparison = comparisons.find(comp => 
          Math.abs(comp.price - avgAmount) < 2 || Math.abs(comp.price - totalSpent) < 5
        );

        if (bestComparison) {
          const equivalentCount = Math.floor(totalSpent / bestComparison.price);
          
          if (equivalentCount > 0) {
            insights.push({
              id: `symbolic-comparison-${description}`,
              type: 'symbolic_comparison',
              title: `Vos ${descTransactions.length} ${description} = ${equivalentCount} ${bestComparison.item}${equivalentCount > 1 ? 's' : ''}`,
              description: `Vous avez dépensé ${totalSpent.toFixed(2)}€ en ${description}, l'équivalent de ${equivalentCount} ${bestComparison.item}${equivalentCount > 1 ? 's' : ''}.`,
              impact: 'low',
              actionSuggestion: `Cette comparaison vous aide-t-elle à relativiser vos dépenses en ${description} ?`,
              dataSource: 'symbolic_analysis',
              relevanceScore: descTransactions.length / 10,
              personalizedData: {
                originalItem: description,
                originalAmount: totalSpent,
                originalCount: descTransactions.length,
                comparisonItem: bestComparison.item,
                comparisonCount: equivalentCount,
                comparisonPrice: bestComparison.price
              }
            });
          }
        }
      }
    }

    return insights;
  }

  /**
   * Analyse les tendances et projections
   */
  private async analyzeTrends(transactions: RealTransaction[]): Promise<PersonalizedInsight[]> {
    const insights: PersonalizedInsight[] = [];
    
    // Analyse de l'évolution mensuelle
    const monthlySpending = this.groupTransactionsByMonth(transactions);
    const months = Object.keys(monthlySpending).sort();
    
    if (months.length >= 2) {
      const lastMonth = monthlySpending[months[months.length - 1]];
      const previousMonth = monthlySpending[months[months.length - 2]];
      
      const lastMonthTotal = lastMonth.reduce((sum, t) => sum + t.value, 0);
      const previousMonthTotal = previousMonth.reduce((sum, t) => sum + t.value, 0);
      
      const evolution = ((lastMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
      
      if (Math.abs(evolution) > 10) {
        const trend = evolution > 0 ? 'augmenté' : 'diminué';
        const trendEmoji = evolution > 0 ? '📈' : '📉';
        
        insights.push({
          id: 'monthly-trend',
          type: 'trend_analysis',
          title: `Vos dépenses ont ${trend} de ${Math.abs(Math.round(evolution))}% ${trendEmoji}`,
          description: `Ce mois, vous avez dépensé ${lastMonthTotal.toFixed(2)}€, soit ${Math.abs(Math.round(evolution))}% ${evolution > 0 ? 'de plus' : 'de moins'} que le mois précédent (${previousMonthTotal.toFixed(2)}€).`,
          impact: Math.abs(evolution) > 25 ? 'high' : 'medium',
          actionSuggestion: evolution > 0 
            ? 'Analysez les causes de cette augmentation et ajustez votre budget si nécessaire.'
            : 'Félicitations pour cette réduction ! Maintenez ces bonnes habitudes.',
          dataSource: 'trend_analysis',
          relevanceScore: Math.abs(evolution) / 100,
          personalizedData: {
            lastMonthAmount: lastMonthTotal,
            previousMonthAmount: previousMonthTotal,
            evolution,
            trend: evolution > 0 ? 'increase' : 'decrease'
          }
        });
      }
    }

    return insights;
  }

  // Méthodes utilitaires privées

  private groupTransactionsByCategory(transactions: RealTransaction[]): Record<string, RealTransaction[]> {
    return transactions.reduce((groups, transaction) => {
      const category = transaction.category || 'Divers';
      if (!groups[category]) groups[category] = [];
      groups[category].push(transaction);
      return groups;
    }, {} as Record<string, RealTransaction[]>);
  }

  private groupTransactionsByDescription(transactions: RealTransaction[]): Record<string, RealTransaction[]> {
    return transactions.reduce((groups, transaction) => {
      const description = transaction.description || 'Transaction';
      if (!groups[description]) groups[description] = [];
      groups[description].push(transaction);
      return groups;
    }, {} as Record<string, RealTransaction[]>);
  }

  private groupTransactionsByMonth(transactions: RealTransaction[]): Record<string, RealTransaction[]> {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(transaction);
      return groups;
    }, {} as Record<string, RealTransaction[]>);
  }

  private detectRecurringTransactions(transactions: RealTransaction[]): RecurringTransaction[] {
    const recurringMap: Record<string, RealTransaction[]> = {};
    
    // Groupe les transactions par description similaire
    for (const transaction of transactions) {
      const normalizedDesc = transaction.description?.toLowerCase().trim() || '';
      if (!recurringMap[normalizedDesc]) recurringMap[normalizedDesc] = [];
      recurringMap[normalizedDesc].push(transaction);
    }

    const recurring: RecurringTransaction[] = [];
    
    for (const [description, transactionGroup] of Object.entries(recurringMap)) {
      if (transactionGroup.length >= 2) {
        // Vérifie la régularité des montants
        const amounts = transactionGroup.map(t => t.value);
        const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
        const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length;
        
        // Si la variance est faible, c'est probablement récurrent
        if (variance < avgAmount * 0.1) {
          recurring.push({
            description,
            transactions: transactionGroup.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            averageAmount: avgAmount,
            frequency: this.detectFrequency(transactionGroup)
          });
        }
      }
    }

    return recurring;
  }

  private detectFrequency(transactions: RealTransaction[]): 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' {
    if (transactions.length < 2) return 'monthly';
    
    const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime());
    const intervals: number[] = [];
    
    for (let i = 1; i < dates.length; i++) {
      const daysDiff = (dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(daysDiff);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    if (avgInterval <= 7) return 'daily';
    if (avgInterval <= 14) return 'weekly';
    if (avgInterval <= 35) return 'monthly';
    if (avgInterval <= 100) return 'quarterly';
    return 'yearly';
  }

  private getMoodRange(mood: number): string {
    if (mood <= 3) return 'triste';
    if (mood <= 5) return 'neutre';
    if (mood <= 7) return 'content';
    return 'joyeux';
  }

  private getMoodEmoji(moodRange: string): string {
    const emojis = {
      'triste': '😢',
      'neutre': '😐',
      'content': '😊',
      'joyeux': '😄'
    };
    return emojis[moodRange as keyof typeof emojis] || '😐';
  }

  private getEmotionalArchetype(moodRange: string, spendsMore: boolean): string {
    const archetypes = {
      'triste': spendsMore ? 'Panda mélancolique' : 'Ermite économe',
      'neutre': spendsMore ? 'Robot calculateur' : 'Sage équilibré',
      'content': spendsMore ? 'Papillon généreux' : 'Écureuil prévoyant',
      'joyeux': spendsMore ? 'Licorne festive' : 'Dauphin malin'
    };
    return archetypes[moodRange as keyof typeof archetypes] || 'Explorateur financier';
  }

  private rankInsightsByRelevance(insights: PersonalizedInsight[], transactions: RealTransaction[]): PersonalizedInsight[] {
    return insights
      .sort((a, b) => {
        // Tri par impact puis par score de pertinence
        const impactScore = { high: 3, medium: 2, low: 1 };
        const aScore = impactScore[a.impact] + a.relevanceScore;
        const bScore = impactScore[b.impact] + b.relevanceScore;
        return bScore - aScore;
      })
      .slice(0, 8); // Limite à 8 insights les plus pertinents
  }

  private getOnboardingInsights(): PersonalizedInsight[] {
    return [
      {
        id: 'onboarding-welcome',
        type: 'onboarding',
        title: 'Bienvenue dans votre aventure financière personnalisée ! 🚀',
        description: 'Commencez par ajouter vos premières transactions pour que Rivela puisse analyser vos habitudes et vous révéler des insights personnalisés.',
        impact: 'medium',
        actionSuggestion: 'Ajoutez manuellement quelques transactions récentes ou importez vos données bancaires.',
        dataSource: 'onboarding',
        relevanceScore: 1.0,
        personalizedData: {}
      }
    ];
  }
}

// Interfaces et types

export interface PersonalizedInsight {
  id: string;
  type: 'spending_pattern' | 'hidden_fees' | 'emotional_correlation' | 'savings_simulation' | 'symbolic_comparison' | 'trend_analysis' | 'micro_spending' | 'temporal_pattern' | 'onboarding';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionSuggestion: string;
  dataSource: 'real_transactions' | 'emotional_context' | 'simulation' | 'symbolic_analysis' | 'trend_analysis' | 'onboarding';
  relevanceScore: number; // 0-1, plus élevé = plus pertinent
  personalizedData: Record<string, any>; // Données spécifiques à cet insight
}

export interface RecurringTransaction {
  description: string;
  transactions: RealTransaction[];
  averageAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}