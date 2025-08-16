import { FinancialData } from '../types/finance';
import { validateFinancialData } from './validation';

const STORAGE_KEYS = {
  FINANCIAL_DATA: 'financial_data_v2',
  JOURNAL_ENTRIES: 'journal_entries_v1',
  USER_PREFERENCES: 'user_preferences_v1',
  TAGS: 'contextual_tags_v1'
} as const;

// Interface pour les entrées de journal
interface JournalEntry {
  id: string;
  timestamp: number;
  content: string;
  tags: string[];
  mood?: number;
}

// Interface pour les préférences utilisateur
interface UserPreferences {
  defaultCurrency: string;
  autoSave: boolean;
  notifications: boolean;
  theme: string;
  language: string;
}

// Classe principale pour la persistance
export class DataPersistence {
  private static instance: DataPersistence;
  private autoSaveEnabled = true;
  private saveTimeoutId: NodeJS.Timeout | null = null;

  private constructor() {
    // Écouter les changements de visibilité pour sauvegarder
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
    
    // Écouter les événements de fermeture/rafraîchissement
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }
  }

  public static getInstance(): DataPersistence {
    if (!DataPersistence.instance) {
      DataPersistence.instance = new DataPersistence();
    }
    return DataPersistence.instance;
  }

  // === GESTION DES DONNÉES FINANCIÈRES ===

  public async saveFinancialData(data: FinancialData): Promise<boolean> {
    try {
      // Validation des données avant sauvegarde
      const validation = validateFinancialData(data);
      if (!validation.success) {
        console.error('Données invalides, sauvegarde annulée:', validation.errors);
        return false;
      }

      const serializedData = JSON.stringify({
        data: validation.data,
        timestamp: Date.now(),
        version: '2.0'
      });

      localStorage.setItem(STORAGE_KEYS.FINANCIAL_DATA, serializedData);
      
      console.log('Données financières sauvegardées avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données financières:', error);
      return false;
    }
  }

  public loadFinancialData(): FinancialData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FINANCIAL_DATA);
      if (!stored) {
        console.log('Aucune donnée financière sauvegardée trouvée');
        return null;
      }

      const parsed = JSON.parse(stored);
      
      // Vérifier la version et la structure
      if (!parsed.data || !parsed.timestamp) {
        console.warn('Format de données obsolète, ignore');
        return null;
      }

      // Validation des données chargées
      const validation = validateFinancialData(parsed.data);
      if (!validation.success) {
        console.error('Données chargées invalides:', validation.errors);
        return null;
      }

      console.log('Données financières chargées avec succès');
      return validation.data;
    } catch (error) {
      console.error('Erreur lors du chargement des données financières:', error);
      return null;
    }
  }

  public async saveFinancialDataWithDelay(data: FinancialData, delay: number = 1000): Promise<void> {
    if (!this.autoSaveEnabled) return;

    // Annuler la sauvegarde précédente si elle existe
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
    }

    // Programmer la nouvelle sauvegarde
    this.saveTimeoutId = setTimeout(async () => {
      await this.saveFinancialData(data);
      this.saveTimeoutId = null;
    }, delay);
  }

  // === GESTION DES ENTRÉES DE JOURNAL ===

  public async saveJournalEntry(content: string, tags: string[] = [], mood?: number): Promise<string> {
    try {
      const entries = this.loadJournalEntries();
      const newEntry: JournalEntry = {
        id: `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        content: content.trim(),
        tags,
        mood
      };

      entries.push(newEntry);

      // Garder seulement les 100 dernières entrées
      const trimmedEntries = entries.slice(-100);

      localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(trimmedEntries));
      
      console.log('Entrée de journal sauvegardée:', newEntry.id);
      return newEntry.id;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'entrée de journal:', error);
      throw new Error('Échec de la sauvegarde du journal');
    }
  }

  public loadJournalEntries(): JournalEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES);
      if (!stored) return [];

      const entries = JSON.parse(stored);
      
      // Validation basique des entrées
      if (!Array.isArray(entries)) return [];

      return entries.filter(entry => 
        entry && 
        typeof entry.id === 'string' && 
        typeof entry.content === 'string' &&
        typeof entry.timestamp === 'number'
      );
    } catch (error) {
      console.error('Erreur lors du chargement des entrées de journal:', error);
      return [];
    }
  }

  public deleteJournalEntry(id: string): boolean {
    try {
      const entries = this.loadJournalEntries();
      const filteredEntries = entries.filter(entry => entry.id !== id);
      
      if (filteredEntries.length === entries.length) {
        console.warn('Entrée de journal non trouvée:', id);
        return false;
      }

      localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(filteredEntries));
      console.log('Entrée de journal supprimée:', id);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entrée de journal:', error);
      return false;
    }
  }

  // === GESTION DES TAGS ===

  public saveContextualTags(tags: string[]): void {
    try {
      const uniqueTags = [...new Set(tags)];
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(uniqueTags));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des tags:', error);
    }
  }

  public loadContextualTags(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TAGS);
      if (!stored) return [];

      const tags = JSON.parse(stored);
      return Array.isArray(tags) ? tags.filter(tag => typeof tag === 'string') : [];
    } catch (error) {
      console.error('Erreur lors du chargement des tags:', error);
      return [];
    }
  }

  // === GESTION DES PRÉFÉRENCES ===

  public saveUserPreferences(preferences: Partial<UserPreferences>): void {
    try {
      const current = this.loadUserPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
    }
  }

  public loadUserPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (!stored) {
        return this.getDefaultPreferences();
      }

      const preferences = JSON.parse(stored);
      return { ...this.getDefaultPreferences(), ...preferences };
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
      return this.getDefaultPreferences();
    }
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      defaultCurrency: 'EUR',
      autoSave: true,
      notifications: true,
      theme: 'dark',
      language: 'fr'
    };
  }

  // === UTILITAIRES ===

  public exportAllData(): string {
    try {
      const allData = {
        financialData: this.loadFinancialData(),
        journalEntries: this.loadJournalEntries(),
        contextualTags: this.loadContextualTags(),
        userPreferences: this.loadUserPreferences(),
        exportTimestamp: Date.now(),
        version: '2.0'
      };

      return JSON.stringify(allData, null, 2);
    } catch (error) {
      console.error('Erreur lors de l\'export des données:', error);
      throw new Error('Échec de l\'export des données');
    }
  }

  public async importAllData(jsonData: string): Promise<boolean> {
    try {
      const importedData = JSON.parse(jsonData);
      
      // Validation basique de la structure
      if (!importedData || typeof importedData !== 'object') {
        throw new Error('Format de données invalide');
      }

      let successCount = 0;
      let totalOperations = 0;

      // Import des données financières
      if (importedData.financialData) {
        totalOperations++;
        const success = await this.saveFinancialData(importedData.financialData);
        if (success) successCount++;
      }

      // Import des entrées de journal
      if (Array.isArray(importedData.journalEntries)) {
        totalOperations++;
        try {
          localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(importedData.journalEntries));
          successCount++;
        } catch (error) {
          console.error('Erreur lors de l\'import des entrées de journal:', error);
        }
      }

      // Import des tags
      if (Array.isArray(importedData.contextualTags)) {
        totalOperations++;
        try {
          this.saveContextualTags(importedData.contextualTags);
          successCount++;
        } catch (error) {
          console.error('Erreur lors de l\'import des tags:', error);
        }
      }

      // Import des préférences
      if (importedData.userPreferences && typeof importedData.userPreferences === 'object') {
        totalOperations++;
        try {
          this.saveUserPreferences(importedData.userPreferences);
          successCount++;
        } catch (error) {
          console.error('Erreur lors de l\'import des préférences:', error);
        }
      }

      console.log(`Import terminé: ${successCount}/${totalOperations} opérations réussies`);
      return successCount > 0;
    } catch (error) {
      console.error('Erreur lors de l\'import des données:', error);
      throw new Error('Échec de l\'import des données: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  }

  public clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('Toutes les données ont été effacées');
    } catch (error) {
      console.error('Erreur lors de l\'effacement des données:', error);
    }
  }

  public getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      let totalSize = 0;
      
      // Calculer la taille utilisée
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }

      // Estimation approximative (5MB de limite pour la plupart des navigateurs)
      const estimatedLimit = 5 * 1024 * 1024;
      const percentage = (totalSize / estimatedLimit) * 100;

      return {
        used: totalSize,
        available: estimatedLimit - totalSize,
        percentage: Math.min(percentage, 100)
      };
    } catch (error) {
      console.error('Erreur lors du calcul de l\'utilisation du stockage:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  // === GESTIONNAIRES D'ÉVÉNEMENTS ===

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // La page devient cachée, sauvegarder immédiatement
      if (this.saveTimeoutId) {
        clearTimeout(this.saveTimeoutId);
        this.saveTimeoutId = null;
      }
    }
  }

  private handleBeforeUnload(): void {
    // Sauvegarder avant la fermeture/rafraîchissement
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
      this.saveTimeoutId = null;
    }
  }

  // === CONTRÔLES ===

  public setAutoSave(enabled: boolean): void {
    this.autoSaveEnabled = enabled;
    this.saveUserPreferences({ autoSave: enabled });
  }

  public isAutoSaveEnabled(): boolean {
    return this.autoSaveEnabled;
  }
}

// Instance singleton
export const dataPersistence = DataPersistence.getInstance();

// Hooks pour React
export function useDataPersistence() {
  return dataPersistence;
}

// Utilitaires de convenience
export function saveFinancialData(data: FinancialData): Promise<boolean> {
  return dataPersistence.saveFinancialData(data);
}

export function loadFinancialData(): FinancialData | null {
  return dataPersistence.loadFinancialData();
}

export function saveJournalEntry(content: string, tags?: string[], mood?: number): Promise<string> {
  return dataPersistence.saveJournalEntry(content, tags, mood);
}

export function loadJournalEntries(): JournalEntry[] {
  return dataPersistence.loadJournalEntries();
}

export { type JournalEntry, type UserPreferences };