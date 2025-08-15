import React, { useState, createContext, useContext } from 'react';
import { useFinanceStore } from '../stores/financeStore';
import { FinancialData, FinancialInsight, EmotionalContext } from '../types/finance';
// Default values for financial data
const defaultFinancialData: FinancialData = {
  incomes: [],
  expenses: [],
  savings: [],
  debts: [],
  investments: []
};
// Default emotional context
const defaultEmotionalContext: EmotionalContext = {
  mood: 5,
  tags: ['Neutre']
};
// Create the context with default values
const FinanceContext = createContext<any>({
  userQuestion: '',
  setUserQuestion: () => {},
  financialData: defaultFinancialData,
  setFinancialData: () => {},
  emotionalContext: defaultEmotionalContext,
  setEmotionalContext: () => {},
  generateInsights: async () => [],
  runSimulation: async () => {},
  getFinancialHealth: async () => ({
    score: 50,
    recommendations: [],
    strengths: [],
    weaknesses: []
  }),
  detectHiddenFees: async () => [],
  getHistoricalData: async () => [],
  getPredictions: async () => [],
  getFinancialScore: () => 50,
  calculateTotalIncome: () => 0,
  calculateTotalExpenses: () => 0,
  calculateNetWorth: () => 0,
  refreshData: async () => {}
});
export function FinanceProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [userQuestion, setUserQuestion] = useState('');
  const [emotionalContext, setEmotionalContext] = useState<EmotionalContext>(defaultEmotionalContext);
  const {
    financialData: storeFinancialData,
    setFinancialData: storeSetFinancialData
  } = useFinanceStore();
  // Ensure we always have valid financial data by merging with defaults
  const safeFinancialData = {
    ...defaultFinancialData,
    ...storeFinancialData
  };
  // Mock function for generating insights
  const generateInsights = async (): Promise<FinancialInsight[]> => {
    // Simulate API call with timeout
    await new Promise(resolve => setTimeout(resolve, 500));
    return [{
      id: '1',
      title: 'Optimisation des dépenses',
      description: 'Vous pourriez économiser en regroupant vos abonnements',
      category: 'Dépenses',
      impact: 'medium',
      action: 'Regrouper les abonnements',
      potentialSavings: 50
    }, {
      id: '2',
      title: "Augmentation de l'épargne",
      description: 'Automatiser vos virements vers votre compte épargne',
      category: 'Épargne',
      impact: 'high',
      action: 'Mettre en place un virement automatique'
    }];
  };
  // Mock function for financial health
  const getFinancialHealth = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      score: 65,
      recommendations: ["Augmentez votre fonds d'urgence", 'Réduisez vos dépenses non essentielles', 'Investissez régulièrement pour votre retraite'],
      strengths: ['Revenu stable', 'Peu de dettes', 'Budget équilibré'],
      weaknesses: ["Fonds d'urgence insuffisant", "Taux d'épargne faible"]
    };
  };
  // Function to calculate total income
  const calculateTotalIncome = () => {
    if (!safeFinancialData.incomes || !Array.isArray(safeFinancialData.incomes)) return 0;
    return safeFinancialData.incomes.reduce((total, income) => total + (parseFloat(income.value as any) || 0), 0);
  };
  // Function to calculate total expenses
  const calculateTotalExpenses = () => {
    if (!safeFinancialData.expenses || !Array.isArray(safeFinancialData.expenses)) return 0;
    return safeFinancialData.expenses.reduce((total, expense) => total + (parseFloat(expense.value as any) || 0), 0);
  };
  // Function to calculate net worth
  const calculateNetWorth = () => {
    const totalAssets = calculateTotalIncome() + (safeFinancialData.savings?.reduce((total, saving) => total + (parseFloat(saving.value as any) || 0), 0) || 0) + (safeFinancialData.investments?.reduce((total, investment) => total + (parseFloat(investment.value as any) || 0), 0) || 0);
    const totalLiabilities = calculateTotalExpenses() + (safeFinancialData.debts?.reduce((total, debt) => total + (parseFloat(debt.value as any) || 0), 0) || 0);
    return totalAssets - totalLiabilities;
  };
  // Mock functions for other finance operations
  const runSimulation = async () => ({});
  const detectHiddenFees = async () => [];
  const getHistoricalData = async () => [];
  const getPredictions = async () => [];
  const getFinancialScore = () => 75;
  const refreshData = async () => {};
  // Update the context value to use safeFinancialData
  return <FinanceContext.Provider value={{
    userQuestion,
    setUserQuestion,
    financialData: safeFinancialData,
    setFinancialData: storeSetFinancialData,
    emotionalContext,
    setEmotionalContext,
    generateInsights,
    runSimulation,
    getFinancialHealth,
    detectHiddenFees,
    getHistoricalData,
    getPredictions,
    getFinancialScore,
    calculateTotalIncome,
    calculateTotalExpenses,
    calculateNetWorth,
    refreshData
  }}>
      {children}
    </FinanceContext.Provider>;
}
// Custom hook to use the finance context
export const useFinance = () => useContext(FinanceContext);