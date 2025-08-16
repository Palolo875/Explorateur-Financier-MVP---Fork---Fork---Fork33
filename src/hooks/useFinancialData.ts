import { useCallback, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useFinance } from '../context/FinanceContext';
import { FinancialItem, FinancialData } from '../types/finance';
import { validateFinancialItem, validateFinancialData, normalizeNumericValue, generateUniqueId, calculateSafeTotal, ValidationError, DataIntegrityError, validateCategory } from '../utils/validation';
import { dataPersistence } from '../utils/persistence';
export type FinancialDataType = 'incomes' | 'expenses' | 'savings' | 'debts';
interface UseFinancialDataReturn {
  // Données
  financialData: FinancialData;
  totals: {
    income: number;
    expenses: number;
    savings: number;
    debts: number;
    balance: number;
    netWorth: number;
  };

  // Actions
  addItem: (type: FinancialDataType, item: Partial<FinancialItem>) => Promise<boolean>;
  updateItem: (type: FinancialDataType, id: string, updates: Partial<FinancialItem>) => Promise<boolean>;
  deleteItem: (type: FinancialDataType, id: string) => Promise<boolean>;
  duplicateItem: (type: FinancialDataType, id: string) => Promise<boolean>;
  moveItem: (fromType: FinancialDataType, toType: FinancialDataType, id: string) => Promise<boolean>;

  // Validation
  validateItem: (type: FinancialDataType, item: Partial<FinancialItem>) => {
    isValid: boolean;
    errors: string[];
  };

  // Utilitaires
  getItems: (type: FinancialDataType) => FinancialItem[];
  getItem: (type: FinancialDataType, id: string) => FinancialItem | undefined;
  hasItems: (type: FinancialDataType) => boolean;
  getItemCount: (type: FinancialDataType) => number;

  // Import/Export
  exportData: () => string;
  importData: (jsonData: string) => Promise<boolean>;
  clearAllData: () => Promise<boolean>;

  // État
  isLoading: boolean;
  hasErrors: boolean;
  lastError: string | null;
}
export function useFinancialData(): UseFinancialDataReturn {
  const {
    financialData,
    setFinancialData
  } = useFinance();

  // Charger les données persistées au montage
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const persistedData = dataPersistence.loadFinancialData();
        if (persistedData && (!financialData || Object.values(financialData).every(arr => arr.length === 0))) {
          console.log('Chargement des données persistées');
          setFinancialData(persistedData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données persistées:', error);
      }
    };
    loadPersistedData();
  }, []);

  // Validation et sécurisation des données
  const safeFinancialData = useMemo(() => {
    const validation = validateFinancialData(financialData || {});
    if (validation.success && validation.data) {
      return validation.data;
    }

    // Fallback vers des données vides sécurisées
    console.warn('Données financières invalides, utilisation de valeurs par défaut');
    return {
      incomes: [],
      expenses: [],
      savings: [],
      debts: [],
      investments: []
    };
  }, [financialData]);

  // Auto-sauvegarde avec délai
  useEffect(() => {
    if (safeFinancialData && Object.values(safeFinancialData).some(arr => arr.length > 0)) {
      dataPersistence.saveFinancialDataWithDelay(safeFinancialData, 2000);
    }
  }, [safeFinancialData]);

  // Calcul des totaux de manière sécurisée
  const totals = useMemo(() => {
    const income = calculateSafeTotal(safeFinancialData.incomes);
    const expenses = calculateSafeTotal(safeFinancialData.expenses);
    const savings = calculateSafeTotal(safeFinancialData.savings);
    const debts = calculateSafeTotal(safeFinancialData.debts);
    const investments = calculateSafeTotal(safeFinancialData.investments || []);
    return {
      income,
      expenses,
      savings,
      debts,
      balance: income - expenses,
      netWorth: savings + investments - debts
    };
  }, [safeFinancialData]);

  // Fonction pour ajouter un élément
  const addItem = useCallback(async (type: FinancialDataType, item: Partial<FinancialItem>): Promise<boolean> => {
    try {
      console.log(`=== AJOUT D'ÉLÉMENT (${type.toUpperCase()}) ===`);
      console.log('Données reçues:', item);

      // Validation de l'élément
      const validation = validateFinancialItem(item);
      if (!validation.success) {
        const errorMessage = validation.errors?.join(', ') || 'Données invalides';
        toast.error(errorMessage);
        console.error('Validation échouée:', validation.errors);
        return false;
      }
      const validatedItem = validation.data!;

      // Validation de la catégorie selon le type
      if (!validateCategory(validatedItem.category, type)) {
        toast.error(`Catégorie "${validatedItem.category}" invalide pour ${type}`);
        return false;
      }

      // Normaliser la valeur
      const numericValue = normalizeNumericValue(validatedItem.value);

      // Créer l'élément final avec ID unique
      const newItem: FinancialItem = {
        ...validatedItem,
        id: generateUniqueId(type),
        value: numericValue
      };
      console.log('Élément validé et créé:', newItem);

      // Mise à jour sécurisée des données
      setFinancialData(currentData => {
        if (!currentData) {
          throw new DataIntegrityError('Données courantes nulles');
        }
        const validation = validateFinancialData(currentData);
        if (!validation.success) {
          throw new DataIntegrityError('Structure de données corrompue');
        }
        const safeCurrentData = validation.data!;
        const updatedData = {
          ...safeCurrentData,
          [type]: [...safeCurrentData[type], newItem]
        };
        console.log(`Données mises à jour pour ${type}:`, updatedData[type].length, 'éléments');
        return updatedData;
      });

      // Feedback utilisateur
      const typeLabels = {
        incomes: 'vos revenus',
        expenses: 'vos dépenses',
        savings: 'votre épargne',
        debts: 'vos dettes'
      };
      toast.success(`Élément ajouté avec succès à ${typeLabels[type]}`);
      console.log('=== AJOUT TERMINÉ AVEC SUCCÈS ===');
      return true;
    } catch (error) {
      console.error('=== ERREUR LORS DE L\'AJOUT ===', error);
      let errorMessage = 'Erreur lors de l\'ajout de l\'élément';
      if (error instanceof ValidationError) {
        errorMessage = `Validation: ${error.message}`;
      } else if (error instanceof DataIntegrityError) {
        errorMessage = `Intégrité des données: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      return false;
    }
  }, [setFinancialData]);

  // Fonction pour mettre à jour un élément
  const updateItem = useCallback(async (type: FinancialDataType, id: string, updates: Partial<FinancialItem>): Promise<boolean> => {
    try {
      console.log(`=== MISE À JOUR ÉLÉMENT (${type.toUpperCase()}) ===`);
      console.log('ID:', id, 'Mises à jour:', updates);

      // Trouver l'élément existant
      const existingItem = safeFinancialData[type].find(item => item.id === id);
      if (!existingItem) {
        toast.error('Élément non trouvé');
        return false;
      }

      // Fusionner avec les mises à jour
      const mergedItem = {
        ...existingItem,
        ...updates
      };

      // Validation
      const validation = validateFinancialItem(mergedItem);
      if (!validation.success) {
        const errorMessage = validation.errors?.join(', ') || 'Données invalides';
        toast.error(errorMessage);
        return false;
      }
      const validatedItem = validation.data!;

      // Validation de la catégorie
      if (!validateCategory(validatedItem.category, type)) {
        toast.error(`Catégorie "${validatedItem.category}" invalide pour ${type}`);
        return false;
      }

      // Normaliser la valeur
      const updatedItem: FinancialItem = {
        ...validatedItem,
        id: id,
        value: normalizeNumericValue(validatedItem.value)
      };

      // Mise à jour des données
      setFinancialData(currentData => {
        const validation = validateFinancialData(currentData);
        if (!validation.success) {
          throw new DataIntegrityError('Structure de données corrompue');
        }
        const safeCurrentData = validation.data!;
        const updatedData = {
          ...safeCurrentData,
          [type]: safeCurrentData[type].map(item => item.id === id ? updatedItem : item)
        };
        return updatedData;
      });
      toast.success('Élément mis à jour avec succès');
      console.log('=== MISE À JOUR TERMINÉE ===');
      return true;
    } catch (error) {
      console.error('=== ERREUR LORS DE LA MISE À JOUR ===', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
    }
  }, [safeFinancialData, setFinancialData]);

  // Fonction pour supprimer un élément
  const deleteItem = useCallback(async (type: FinancialDataType, id: string): Promise<boolean> => {
    try {
      console.log(`=== SUPPRESSION ÉLÉMENT (${type.toUpperCase()}) ===`);
      console.log('ID:', id);

      // Vérifier que l'élément existe
      const existingItem = safeFinancialData[type].find(item => item.id === id);
      if (!existingItem) {
        toast.error('Élément non trouvé');
        return false;
      }

      // Mise à jour des données
      setFinancialData(currentData => {
        const validation = validateFinancialData(currentData);
        if (!validation.success) {
          throw new DataIntegrityError('Structure de données corrompue');
        }
        const safeCurrentData = validation.data!;
        const updatedData = {
          ...safeCurrentData,
          [type]: safeCurrentData[type].filter(item => item.id !== id)
        };
        return updatedData;
      });
      toast.success('Élément supprimé avec succès');
      console.log('=== SUPPRESSION TERMINÉE ===');
      return true;
    } catch (error) {
      console.error('=== ERREUR LORS DE LA SUPPRESSION ===', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, [safeFinancialData, setFinancialData]);

  // Fonction pour dupliquer un élément
  const duplicateItem = useCallback(async (type: FinancialDataType, id: string): Promise<boolean> => {
    try {
      const existingItem = safeFinancialData[type].find(item => item.id === id);
      if (!existingItem) {
        toast.error('Élément non trouvé');
        return false;
      }

      // Créer une copie sans l'ID
      const {
        id: _,
        ...itemCopy
      } = existingItem;
      const duplicatedItem = {
        ...itemCopy,
        description: `${itemCopy.description || ''} (copie)`.trim()
      };
      return await addItem(type, duplicatedItem);
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      toast.error('Erreur lors de la duplication');
      return false;
    }
  }, [safeFinancialData, addItem]);

  // Fonction pour déplacer un élément d'un type à un autre
  const moveItem = useCallback(async (fromType: FinancialDataType, toType: FinancialDataType, id: string): Promise<boolean> => {
    try {
      if (fromType === toType) return true;
      const existingItem = safeFinancialData[fromType].find(item => item.id === id);
      if (!existingItem) {
        toast.error('Élément non trouvé');
        return false;
      }

      // Ajouter au nouveau type
      const {
        id: _,
        ...itemData
      } = existingItem;
      const addSuccess = await addItem(toType, itemData);
      if (addSuccess) {
        // Supprimer de l'ancien type
        await deleteItem(fromType, id);
        toast.success(`Élément déplacé de ${fromType} vers ${toType}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
      toast.error('Erreur lors du déplacement');
      return false;
    }
  }, [safeFinancialData, addItem, deleteItem]);

  // Fonction de validation
  const validateItem = useCallback((type: FinancialDataType, item: Partial<FinancialItem>) => {
    const validation = validateFinancialItem(item);
    const categoryValid = item.category ? validateCategory(item.category, type) : false;
    const errors = [...(validation.errors || [])];
    if (item.category && !categoryValid) {
      errors.push(`Catégorie invalide pour ${type}`);
    }
    return {
      isValid: validation.success && categoryValid,
      errors
    };
  }, []);

  // Fonctions utilitaires
  const getItems = useCallback((type: FinancialDataType) => {
    return safeFinancialData[type] || [];
  }, [safeFinancialData]);
  const getItem = useCallback((type: FinancialDataType, id: string) => {
    return safeFinancialData[type]?.find(item => item.id === id);
  }, [safeFinancialData]);
  const hasItems = useCallback((type: FinancialDataType) => {
    return (safeFinancialData[type]?.length || 0) > 0;
  }, [safeFinancialData]);
  const getItemCount = useCallback((type: FinancialDataType) => {
    return safeFinancialData[type]?.length || 0;
  }, [safeFinancialData]);

  // Export des données avec persistance
  const exportData = useCallback(() => {
    try {
      return dataPersistence.exportAllData();
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Erreur lors de l\'export des données');
      return '';
    }
  }, []);

  // Import des données avec persistance
  const importData = useCallback(async (jsonData: string): Promise<boolean> => {
    try {
      const success = await dataPersistence.importAllData(jsonData);
      if (success) {
        // Recharger les données financières depuis la persistance
        const newData = dataPersistence.loadFinancialData();
        if (newData) {
          setFinancialData(newData);
        }
        toast.success('Données importées avec succès');
        return true;
      } else {
        toast.error('Échec de l\'import des données');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      toast.error('Erreur lors de l\'import: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      return false;
    }
  }, [setFinancialData]);

  // Effacer toutes les données avec persistance
  const clearAllData = useCallback(async (): Promise<boolean> => {
    try {
      const emptyData = {
        incomes: [],
        expenses: [],
        savings: [],
        debts: [],
        investments: []
      };

      // Effacer dans le state et la persistance
      setFinancialData(emptyData);
      dataPersistence.clearAllData();
      toast.success('Toutes les données ont été effacées');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'effacement:', error);
      toast.error('Erreur lors de l\'effacement des données');
      return false;
    }
  }, [setFinancialData]);
  return {
    financialData: safeFinancialData,
    totals,
    addItem,
    updateItem,
    deleteItem,
    duplicateItem,
    moveItem,
    validateItem,
    getItems,
    getItem,
    hasItems,
    getItemCount,
    exportData,
    importData,
    clearAllData,
    isLoading: false,
    // TODO: Implémenter état de chargement
    hasErrors: false,
    // TODO: Implémenter détection d'erreurs
    lastError: null // TODO: Implémenter suivi des erreurs
  };
}