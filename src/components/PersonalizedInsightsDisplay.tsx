import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, TrendingUp, AlertTriangle, Heart, DollarSign, 
  Calendar, Target, Brain, Sparkles, ChevronRight,
  Info, CheckCircle, XCircle, BarChart3, PieChart
} from 'lucide-react';
import { PersonalizedInsightsEngine, PersonalizedInsight } from '../services/PersonalizedInsightsEngine';

interface PersonalizedInsightsDisplayProps {
  userId: string;
  refreshTrigger?: number;
}

export const PersonalizedInsightsDisplay: React.FC<PersonalizedInsightsDisplayProps> = ({ 
  userId, 
  refreshTrigger 
}) => {
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<PersonalizedInsight | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const insightsEngine = PersonalizedInsightsEngine.getInstance();

  useEffect(() => {
    loadInsights();
  }, [userId, refreshTrigger]);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const generatedInsights = await insightsEngine.generatePersonalizedInsights(userId);
      setInsights(generatedInsights);
    } catch (error) {
      console.error('Erreur lors du chargement des insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: PersonalizedInsight['type']) => {
    const iconMap = {
      'spending_pattern': BarChart3,
      'hidden_fees': AlertTriangle,
      'emotional_correlation': Heart,
      'savings_simulation': Target,
      'symbolic_comparison': Sparkles,
      'trend_analysis': TrendingUp,
      'micro_spending': DollarSign,
      'temporal_pattern': Calendar,
      'onboarding': Info
    };
    return iconMap[type] || Info;
  };

  const getImpactColor = (impact: PersonalizedInsight['impact']) => {
    switch (impact) {
      case 'high': return 'text-red-500 bg-red-100';
      case 'medium': return 'text-orange-500 bg-orange-100';
      case 'low': return 'text-blue-500 bg-blue-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getImpactLabel = (impact: PersonalizedInsight['impact']) => {
    switch (impact) {
      case 'high': return 'Impact Élevé';
      case 'medium': return 'Impact Moyen';
      case 'low': return 'Impact Faible';
      default: return 'Impact Inconnu';
    }
  };

  const filteredInsights = insights.filter(insight => 
    filter === 'all' || insight.impact === filter
  );

  const getAhaAnimation = () => ({
    initial: { scale: 0.8, opacity: 0, rotateY: -90 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      rotateY: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        duration: 0.6
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0, 
      rotateY: 90,
      transition: { duration: 0.3 }
    }
  });

  const renderEmotionalArchetype = (insight: PersonalizedInsight) => {
    if (insight.type === 'emotional_correlation' && insight.personalizedData.archetype) {
      return (
        <div className="flex items-center space-x-2 mt-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {insight.personalizedData.emoji}
            </span>
          </div>
          <span className="text-sm font-medium text-purple-700">
            Archétype: {insight.personalizedData.archetype}
          </span>
        </div>
      );
    }
    return null;
  };

  const renderSymbolicComparison = (insight: PersonalizedInsight) => {
    if (insight.type === 'symbolic_comparison') {
      const { originalItem, originalCount, comparisonItem, comparisonCount } = insight.personalizedData;
      return (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg mt-3 border border-yellow-200">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{originalCount}</div>
              <div className="text-xs text-orange-700">{originalItem}</div>
            </div>
            <div className="text-orange-500">
              <span className="text-lg">=</span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{comparisonCount}</div>
              <div className="text-xs text-orange-700">{comparisonItem}{comparisonCount > 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderSavingsSimulation = (insight: PersonalizedInsight) => {
    if (insight.type === 'savings_simulation') {
      const { currentMonthlySpending, monthlySavings, yearlySavings, category } = insight.personalizedData;
      return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg mt-3 border border-green-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">
                {currentMonthlySpending.toFixed(0)}€
              </div>
              <div className="text-xs text-green-700">Actuel/mois</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                -{monthlySavings.toFixed(0)}€
              </div>
              <div className="text-xs text-green-700">Économie/mois</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {yearlySavings.toFixed(0)}€
              </div>
              <div className="text-xs text-green-700">Économie/an</div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyse de vos données en cours...</p>
            <p className="text-sm text-gray-500 mt-1">Génération d'insights personnalisés</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <Brain className="text-purple-500" />
              <span>Révélations Personnalisées</span>
              <Zap className="text-yellow-500" size={20} />
            </h2>
            <p className="text-gray-600 mt-1">
              Insights basés sur vos vraies données financières
            </p>
          </div>
          <div className="flex space-x-2">
            {['all', 'high', 'medium', 'low'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level as any)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  filter === level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level === 'all' ? 'Tous' : getImpactLabel(level as any)}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {insights.filter(i => i.impact === 'high').length}
            </div>
            <div className="text-sm text-red-700">Impact Élevé</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {insights.filter(i => i.impact === 'medium').length}
            </div>
            <div className="text-sm text-orange-700">Impact Moyen</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {insights.filter(i => i.impact === 'low').length}
            </div>
            <div className="text-sm text-blue-700">Impact Faible</div>
          </div>
        </div>
      </div>

      {/* Liste des insights */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredInsights.map((insight, index) => {
            const IconComponent = getInsightIcon(insight.type);
            
            return (
              <motion.div
                key={insight.id}
                {...getAhaAnimation()}
                style={{ animationDelay: `${index * 0.1}s` }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedInsight(insight)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full ${getImpactColor(insight.impact)}`}>
                      <IconComponent size={24} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          {insight.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                            {getImpactLabel(insight.impact)}
                          </span>
                          <ChevronRight className="text-gray-400" size={16} />
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {insight.description}
                      </p>

                      {/* Visualisations spécifiques par type */}
                      {renderEmotionalArchetype(insight)}
                      {renderSymbolicComparison(insight)}
                      {renderSavingsSimulation(insight)}

                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Action suggérée:</strong> {insight.actionSuggestion}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>Source: {insight.dataSource.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>Pertinence: {Math.round(insight.relevanceScore * 100)}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < insight.relevanceScore * 5 
                                  ? 'bg-yellow-400' 
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredInsights.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <PieChart size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Aucun insight trouvé
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Ajoutez plus de transactions pour générer des insights personnalisés.'
              : `Aucun insight avec un impact ${getImpactLabel(filter as any).toLowerCase()}.`
            }
          </p>
        </div>
      )}

      {/* Modal de détail */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Détail de l'Insight
                  </h2>
                  <button
                    onClick={() => setSelectedInsight(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XCircle className="text-gray-500" size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {selectedInsight.title}
                    </h3>
                    <p className="text-gray-600">
                      {selectedInsight.description}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Action Recommandée
                    </h4>
                    <p className="text-blue-700">
                      {selectedInsight.actionSuggestion}
                    </p>
                  </div>

                  {Object.keys(selectedInsight.personalizedData).length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">
                        Données Personnalisées
                      </h4>
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(selectedInsight.personalizedData, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Type: {selectedInsight.type} • Source: {selectedInsight.dataSource}
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-500" size={16} />
                      <span className="text-sm text-green-600">
                        Basé sur vos données réelles
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};