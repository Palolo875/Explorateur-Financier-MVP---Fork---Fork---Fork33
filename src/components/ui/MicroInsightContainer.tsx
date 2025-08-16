import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import MicroInsight from './MicroInsight';
import { MicroInsight as MicroInsightType } from '../../types/psychology';
import { BiasDetectionService } from '../../services/BiasDetectionService';
import { FinancialData, EmotionalContext } from '../../types/finance';

interface MicroInsightContainerProps {
  financialData: FinancialData;
  emotionalContext?: EmotionalContext;
  context: 'transaction' | 'dashboard' | 'goal' | 'simulation';
  maxInsights?: number;
  className?: string;
}

const MicroInsightContainer: React.FC<MicroInsightContainerProps> = ({
  financialData,
  emotionalContext,
  context,
  maxInsights = 3,
  className = ''
}) => {
  const [insights, setInsights] = useState<MicroInsightType[]>([]);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, [financialData, emotionalContext, context]);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const biasService = BiasDetectionService.getInstance();
      
      // Détecter les biais cognitifs
      const detectedBiases = await biasService.detectBiases(
        financialData,
        emotionalContext
      );

      // Générer les insights psychologiques
      const psychologicalInsights = biasService.generatePsychologicalInsights(
        detectedBiases,
        financialData,
        emotionalContext
      );

      // Générer les micro-insights pour le contexte spécifique
      const microInsights = biasService.generateMicroInsights(
        psychologicalInsights,
        context
      );

      // Filtrer les insights non expirés et non dismissés
      const validInsights = microInsights
        .filter(insight => {
          if (dismissedInsights.has(insight.id)) return false;
          if (insight.expiresAt && insight.expiresAt < new Date()) return false;
          return true;
        })
        .slice(0, maxInsights);

      setInsights(validInsights);
    } catch (error) {
      console.error('Erreur lors de la génération des insights:', error);
      setInsights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissInsight = (insightId: string) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
    setInsights(prev => prev.filter(insight => insight.id !== insightId));
  };

  const getContainerStyle = () => {
    switch (context) {
      case 'dashboard':
        return 'space-y-3';
      case 'transaction':
        return 'space-y-2';
      case 'goal':
        return 'space-y-3';
      case 'simulation':
        return 'space-y-2';
      default:
        return 'space-y-3';
    }
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-16 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className={`${getContainerStyle()} ${className}`}>
      <AnimatePresence mode="popLayout">
        {insights.map((insight) => (
          <MicroInsight
            key={insight.id}
            insight={insight}
            onDismiss={() => handleDismissInsight(insight.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MicroInsightContainer;