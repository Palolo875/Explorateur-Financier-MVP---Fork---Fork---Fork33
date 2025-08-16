import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  ArrowRightIcon, 
  HeartIcon, 
  BrainIcon, 
  PencilIcon, 
  SaveIcon,
  BarChart3Icon,
  ArrowUpIcon,
  ArrowDownIcon,
  DownloadIcon,
  UploadIcon,
  RotateCcwIcon,
  TagIcon
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Hooks et utilitaires
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { useFinanceStore } from '../stores/financeStore';
import { useFinancialData, FinancialDataType } from '../hooks/useFinancialData';
import { dataPersistence } from '../utils/persistence';

// Composants
import { GlassCard } from './ui/GlassCard';
import { FinancialItemForm } from './forms/FinancialItemForm';
import { FinancialItemList } from './forms/FinancialItemList';

// Types
import { EmotionalContext, FinancialItem } from '../types/finance';

interface TabInfo {
  key: FinancialDataType;
  label: string;
  icon: string;
  color: string;
}

const TABS: TabInfo[] = [
  { key: 'incomes', label: 'Revenus', icon: '💰', color: 'text-green-400' },
  { key: 'expenses', label: 'Dépenses', icon: '💸', color: 'text-red-400' },
  { key: 'savings', label: 'Épargne', icon: '🏦', color: 'text-blue-400' },
  { key: 'debts', label: 'Dettes', icon: '💳', color: 'text-orange-400' }
];

export function MappingScreenNew() {
  const navigate = useNavigate();
  const { theme, themeColors } = useTheme();
  const { userQuestion, emotionalContext } = useFinance();
  const { setHasCompletedOnboarding } = useFinanceStore();

  // Hook personnalisé pour les données financières
  const {
    financialData,
    totals,
    addItem,
    updateItem,
    deleteItem,
    duplicateItem,
    moveItem,
    exportData,
    importData,
    clearAllData
  } = useFinancialData();

  // États locaux
  const [activeTab, setActiveTab] = useState<FinancialDataType>('incomes');
  const [isAdding, setIsAdding] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');
  const [showInsights, setShowInsights] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Calcul du score de santé financière
  const healthScore = useMemo(() => {
    let score = 50; // Score de base
    
    if (totals.income > 0) {
      // Ajuster pour le ratio revenus/dépenses
      if (totals.income > totals.expenses) {
        score += 15 * Math.min(1, (totals.income - totals.expenses) / totals.income);
      } else {
        score -= 15 * Math.min(1, (totals.expenses - totals.income) / totals.income);
      }
      
      // Ajuster pour l'épargne
      score += 15 * Math.min(1, totals.savings / totals.income);
      
      // Ajuster pour l'endettement
      score -= 10 * Math.min(1, totals.debts / totals.income);
    }
    
    return Math.max(0, Math.min(100, score));
  }, [totals]);

  // Génération des insights comportementaux
  const insights = useMemo(() => {
    const insights: string[] = [];
    
    if (emotionalContext && totals.income > 0) {
      // Insights basés sur l'état émotionnel
      if (emotionalContext.mood > 7 && totals.expenses > totals.income * 0.8) {
        insights.push('Votre niveau de stress élevé pourrait influencer vos dépenses. Essayez la règle des 24h avant tout achat non essentiel.');
      }
      
      if (emotionalContext.mood < 5 && totals.balance < 0) {
        insights.push('Votre humeur pourrait être affectée par vos préoccupations financières. Envisagez de créer un plan d\'action pour améliorer votre situation.');
      }
    }
    
    // Insights basés sur les données financières
    if (totals.income > 0) {
      const savingsRate = totals.balance / totals.income;
      if (savingsRate < 0.1) {
        insights.push('Votre taux d\'épargne est inférieur à 10%. Essayez d\'identifier des dépenses non essentielles à réduire.');
      }
      
      if (totals.debts / totals.income > 0.4) {
        insights.push('Votre ratio dette/revenu est élevé (>40%). Priorisez le remboursement de vos dettes les plus coûteuses.');
      }
    }
    
    if (insights.length === 0) {
      insights.push('Votre situation financière semble équilibrée. Continuez sur cette voie !');
    }
    
    return insights;
  }, [emotionalContext, totals]);

  // Génération des tags contextuels
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const tags = [];

    // Tags temporels
    if (hour < 10) tags.push('Matin');
    else if (hour < 14) tags.push('Midi');
    else if (hour < 18) tags.push('Après-midi');
    else tags.push('Soir');

    if (day === 0 || day === 6) tags.push('Weekend');
    else tags.push('Semaine');

    // Tags financiers
    if (totals.balance < 0) tags.push('Budget serré');
    if (totals.savings > 0) tags.push('Épargnant');
    if (totals.debts > 0) tags.push('Dette active');

    // Tags émotionnels
    if (emotionalContext) {
      if (emotionalContext.mood > 7) tags.push('Stressé');
      else if (emotionalContext.mood < 4) tags.push('Détendu');
      tags.push(...emotionalContext.tags);
    }

    // Tags généraux
    tags.push('Travail', 'Famille', 'Santé', 'Loisir', 'Urgence');

    setAvailableTags([...new Set(tags)]);
  }, [emotionalContext, totals]);

  // Gestionnaires d'événements
  const handleTabChange = useCallback((tab: FinancialDataType) => {
    setActiveTab(tab);
    setIsAdding(false);
  }, []);

  const handleAddSubmit = useCallback(async (item: Partial<FinancialItem>) => {
    const success = await addItem(activeTab, item);
    if (success) {
      setIsAdding(false);
    }
    return success;
  }, [activeTab, addItem]);

  const handleEditSubmit = useCallback(async (id: string, updates: Partial<FinancialItem>) => {
    return await updateItem(activeTab, id, updates);
  }, [activeTab, updateItem]);

  const handleDelete = useCallback(async (id: string) => {
    return await deleteItem(activeTab, id);
  }, [activeTab, deleteItem]);

  const handleDuplicate = useCallback(async (id: string) => {
    return await duplicateItem(activeTab, id);
  }, [activeTab, duplicateItem]);

  const handleMove = useCallback(async (id: string, toType: FinancialDataType) => {
    return await moveItem(activeTab, toType, id);
  }, [activeTab, moveItem]);

  const handleSaveJournal = useCallback(async () => {
    if (!journalEntry.trim()) {
      toast.error('Veuillez entrer une note dans votre journal');
      return;
    }
    
    try {
      const entryId = await dataPersistence.saveJournalEntry(
        journalEntry,
        selectedTags,
        emotionalContext?.mood
      );
      toast.success('Note de journal enregistrée avec succès');
      setShowJournal(false);
      setJournalEntry('');
      console.log('Journal entry saved with ID:', entryId);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du journal:', error);
      toast.error('Erreur lors de la sauvegarde du journal');
    }
  }, [journalEntry, selectedTags, emotionalContext]);

  const handleExportData = useCallback(() => {
    const data = exportData();
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donnees-financieres-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Données exportées avec succès');
    }
  }, [exportData]);

  const handleImportData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string;
        await importData(jsonData);
      } catch (error) {
        toast.error('Erreur lors de l\'import du fichier');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  }, [importData]);

  const handleClearAllData = useCallback(async () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.')) {
      await clearAllData();
    }
  }, [clearAllData]);

  const handleContinue = useCallback(() => {
    setHasCompletedOnboarding(true);
    navigate('/reveal');
  }, [navigate, setHasCompletedOnboarding]);

  return (
    <div className="w-full max-w-6xl mx-auto pb-20">
      <Toaster position="top-right" />

      {/* Header */}
      <motion.div 
        className="flex justify-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={`inline-block bg-gradient-to-r ${themeColors.primary} px-8 py-4 rounded-2xl shadow-lg`}>
          <h1 className="text-3xl font-bold">Cartographie Financière</h1>
        </div>
      </motion.div>

      {/* Question et contexte émotionnel */}
      <GlassCard className="p-6 mb-6" animate>
        <h2 className="text-xl font-bold mb-2">Votre question</h2>
        <p className="text-lg bg-black/20 p-3 rounded-lg mb-4">
          {userQuestion || 'Comment optimiser ma situation financière ?'}
        </p>

        {emotionalContext && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2 flex items-center">
              <HeartIcon className="h-4 w-4 mr-2 text-red-400" />
              Votre contexte émotionnel
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {emotionalContext.tags.map((tag, index) => (
                <span key={index} className="bg-indigo-900/30 text-indigo-200 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-2">Niveau de stress:</span>
              <div className="w-full bg-black/20 h-2 rounded-full">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${
                    emotionalContext.mood > 7 ? 'from-red-500 to-orange-500' : 
                    emotionalContext.mood > 4 ? 'from-yellow-500 to-green-500' : 
                    'from-green-500 to-blue-500'
                  }`}
                  style={{ width: `${emotionalContext.mood * 10}%` }}
                />
              </div>
              <span className="ml-2 text-sm">{emotionalContext.mood}/10</span>
            </div>
          </div>
        )}

        {/* Journal émotionnel */}
        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => setShowJournal(!showJournal)}
            className={`flex items-center text-sm px-3 py-1.5 rounded-lg transition-colors ${
              showJournal ? 'bg-indigo-600' : 'bg-black/30 hover:bg-black/40'
            }`}
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Journal émotionnel
          </button>
        </div>

        <AnimatePresence>
          {showJournal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 bg-black/20 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Note de journal</h4>
                <textarea
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  placeholder="Comment vous sentez-vous par rapport à votre situation financière actuelle ?"
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 min-h-[100px] resize-none"
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">{journalEntry.length}/1000</span>
                  <button 
                    onClick={handleSaveJournal}
                    className="flex items-center bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-sm transition-colors"
                  >
                    <SaveIcon className="h-4 w-4 mr-1" />
                    Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Score de santé financière */}
      <GlassCard className="p-6 mb-6" animate>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center">
              <HeartIcon className="h-5 w-5 mr-2 text-red-400" />
              Indice de Santé Financière
            </h2>
            <div className="flex items-center mb-2">
              <div className="w-full bg-black/20 h-4 rounded-full mr-4">
                <div 
                  className={`h-4 rounded-full bg-gradient-to-r transition-all duration-1000 ${
                    healthScore > 70 ? 'from-green-500 to-green-300' : 
                    healthScore > 50 ? 'from-yellow-500 to-yellow-300' : 
                    'from-red-500 to-red-300'
                  }`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
              <span className="text-xl font-bold">{Math.round(healthScore)}</span>
            </div>
            <p className="text-sm text-gray-300">
              {healthScore > 70 ? 'Excellent ! Votre santé financière est très bonne.' : 
               healthScore > 50 ? 'Bonne santé financière. Quelques points à améliorer.' : 
               healthScore > 30 ? "Santé financière moyenne. Attention à l'équilibre revenus/dépenses." : 
               'Attention : votre santé financière nécessite une action immédiate.'}
            </p>
          </div>

          {/* Actions rapides */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setShowInsights(!showInsights)}
              className={`flex items-center text-sm px-3 py-1.5 rounded-lg transition-colors ${
                showInsights ? 'bg-indigo-600' : 'bg-black/30 hover:bg-black/40'
              }`}
            >
              <BrainIcon className="h-4 w-4 mr-1" />
              Insights
            </button>
            
            <div className="flex gap-1">
              <button
                onClick={handleExportData}
                className="p-1.5 bg-black/30 hover:bg-black/40 rounded-lg transition-colors"
                title="Exporter"
              >
                <DownloadIcon className="h-4 w-4" />
              </button>
              
              <label className="p-1.5 bg-black/30 hover:bg-black/40 rounded-lg transition-colors cursor-pointer" title="Importer">
                <UploadIcon className="h-4 w-4" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={handleClearAllData}
                className="p-1.5 bg-red-600/30 hover:bg-red-600/50 rounded-lg transition-colors"
                title="Effacer tout"
              >
                <RotateCcwIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Insights comportementaux */}
        <AnimatePresence>
          {showInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 bg-black/20 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-3">Patterns comportementaux détectés</h4>
                <div className="space-y-2">
                  {insights.map((insight, index) => (
                    <div key={index} className="flex items-start">
                      <BrainIcon className="h-4 w-4 mr-2 mt-0.5 text-indigo-400 flex-shrink-0" />
                      <span className="text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Résumé financier */}
      <GlassCard className="p-6 mb-6" animate>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <BarChart3Icon className="h-5 w-5 mr-2" />
          Résumé Financier
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {TABS.map((tab) => (
            <div key={tab.key} className="bg-black/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{tab.icon}</span>
                <span className={`text-sm font-medium ${tab.color}`}>
                  {tab.label}
                </span>
              </div>
              <div className="text-lg font-bold">
                {totals[tab.key === 'incomes' ? 'income' : tab.key === 'expenses' ? 'expenses' : tab.key === 'savings' ? 'savings' : 'debts'].toLocaleString('fr-FR')}€
              </div>
              <div className="text-xs text-gray-400">
                {tab.key === 'incomes' || tab.key === 'expenses' ? '/ mois' : 'total'}
              </div>
            </div>
          ))}
        </div>

        {/* Balance mensuelle */}
        <div className="bg-black/20 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-400 mb-1">Balance mensuelle</div>
              <div className={`text-xl font-bold ${totals.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totals.balance.toLocaleString('fr-FR')}€
              </div>
            </div>
            <div className="flex items-center">
              {totals.balance >= 0 ? 
                <ArrowUpIcon className="h-6 w-6 text-green-400 mr-2" /> : 
                <ArrowDownIcon className="h-6 w-6 text-red-400 mr-2" />
              }
              <span className={`text-lg font-medium ${totals.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totals.income > 0 ? Math.abs((totals.balance / totals.income) * 100).toFixed(1) : '0'}%
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Données financières par onglets */}
      <GlassCard className="p-6 mb-6" animate>
        {/* Navigation par onglets */}
        <div className="flex flex-wrap border-b border-white/10 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`mr-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => handleTabChange(tab.key)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {financialData[tab.key].length > 0 && (
                <span className="ml-2 bg-indigo-600/20 text-indigo-300 px-2 py-0.5 rounded-full text-xs">
                  {financialData[tab.key].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Liste des éléments */}
        <FinancialItemList
          type={activeTab}
          items={financialData[activeTab]}
          onEdit={handleEditSubmit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onMove={handleMove}
        />

        {/* Bouton d'ajout */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
              isAdding
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <PlusIcon className={`h-5 w-5 mr-2 ${isAdding ? 'rotate-45' : ''} transition-transform`} />
            {isAdding ? 'Annuler' : 'Ajouter un élément'}
          </button>
        </div>

        {/* Formulaire d'ajout */}
        <AnimatePresence>
          {isAdding && (
            <div className="mt-6">
              <FinancialItemForm
                type={activeTab}
                onSubmit={handleAddSubmit}
                onCancel={() => setIsAdding(false)}
                availableTags={availableTags}
                selectedTags={selectedTags}
                onTagChange={setSelectedTags}
              />
            </div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Bouton Continuer */}
      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          className="btn btn-primary flex items-center justify-center px-8 py-3 text-lg"
        >
          Continuer vers l'analyse
          <ArrowRightIcon className="ml-3 h-6 w-6" />
        </button>
      </div>
    </div>
  );
}