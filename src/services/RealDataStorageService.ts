import { DataEncryptionService } from './DataEncryptionService';
import { FinancialData, EmotionalContext, FinancialItem } from '../types/finance';

/**
 * Service de stockage sécurisé des données réelles
 * Utilise IndexedDB avec chiffrement AES-256-GCM
 */
export class RealDataStorageService {
  private static instance: RealDataStorageService;
  private db: IDBDatabase | null = null;
  private encryption: DataEncryptionService;
  private isIncognitoMode = false;

  private constructor() {
    this.encryption = DataEncryptionService.getInstance();
  }

  public static getInstance(): RealDataStorageService {
    if (!RealDataStorageService.instance) {
      RealDataStorageService.instance = new RealDataStorageService();
    }
    return RealDataStorageService.instance;
  }

  /**
   * Initialise la base de données IndexedDB
   */
  async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('RivelaSecureDB', 2);

      request.onerror = () => {
        reject(new Error('Impossible d\'ouvrir la base de données'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store pour les données financières
        if (!db.objectStoreNames.contains('financialData')) {
          const financialStore = db.createObjectStore('financialData', { keyPath: 'id' });
          financialStore.createIndex('userId', 'userId', { unique: false });
          financialStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store pour les transactions individuelles
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('userId', 'userId', { unique: false });
          transactionStore.createIndex('date', 'date', { unique: false });
          transactionStore.createIndex('category', 'category', { unique: false });
          transactionStore.createIndex('amount', 'amount', { unique: false });
        }

        // Store pour le contexte émotionnel
        if (!db.objectStoreNames.contains('emotionalContext')) {
          const emotionalStore = db.createObjectStore('emotionalContext', { keyPath: 'id' });
          emotionalStore.createIndex('userId', 'userId', { unique: false });
          emotionalStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store pour les insights personnalisés
        if (!db.objectStoreNames.contains('personalizedInsights')) {
          const insightStore = db.createObjectStore('personalizedInsights', { keyPath: 'id' });
          insightStore.createIndex('userId', 'userId', { unique: false });
          insightStore.createIndex('category', 'category', { unique: false });
          insightStore.createIndex('relevanceScore', 'relevanceScore', { unique: false });
        }

        // Store pour les modèles d'IA personnalisés
        if (!db.objectStoreNames.contains('personalizedModels')) {
          const modelStore = db.createObjectStore('personalizedModels', { keyPath: 'id' });
          modelStore.createIndex('userId', 'userId', { unique: false });
          modelStore.createIndex('modelType', 'modelType', { unique: false });
        }
      };
    });
  }

  /**
   * Active le mode incognito (pas de persistance)
   */
  setIncognitoMode(enabled: boolean): void {
    this.isIncognitoMode = enabled;
    if (enabled) {
      console.log('Mode incognito activé - aucune donnée ne sera persistée');
    }
  }

  /**
   * Sauvegarde des données financières réelles
   */
  async saveFinancialData(userId: string, data: FinancialData): Promise<string> {
    if (this.isIncognitoMode) {
      console.log('Mode incognito - données traitées en mémoire uniquement');
      return 'incognito-' + Date.now();
    }

    if (!this.db || !this.encryption.isInitialized()) {
      throw new Error('Service non initialisé');
    }

    const dataId = `financial-${userId}-${Date.now()}`;
    const encryptedData = await this.encryption.encrypt(data);

    const record = {
      id: dataId,
      userId,
      timestamp: Date.now(),
      encryptedData,
      dataType: 'financial'
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['financialData'], 'readwrite');
      const store = transaction.objectStore('financialData');
      const request = store.add(record);

      request.onsuccess = () => resolve(dataId);
      request.onerror = () => reject(new Error('Erreur lors de la sauvegarde'));
    });
  }

  /**
   * Sauvegarde d'une transaction individuelle avec contexte
   */
  async saveTransaction(userId: string, transaction: RealTransaction): Promise<string> {
    if (this.isIncognitoMode) {
      return 'incognito-transaction-' + Date.now();
    }

    if (!this.db || !this.encryption.isInitialized()) {
      throw new Error('Service non initialisé');
    }

    const transactionId = `transaction-${userId}-${Date.now()}`;
    const encryptedTransaction = await this.encryption.encrypt(transaction);

    const record = {
      id: transactionId,
      userId,
      date: transaction.date,
      category: transaction.category,
      amount: transaction.amount,
      encryptedData: encryptedTransaction,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction_db = this.db!.transaction(['transactions'], 'readwrite');
      const store = transaction_db.objectStore('transactions');
      const request = store.add(record);

      request.onsuccess = () => resolve(transactionId);
      request.onerror = () => reject(new Error('Erreur lors de la sauvegarde de la transaction'));
    });
  }

  /**
   * Récupère les données financières de l'utilisateur
   */
  async getFinancialData(userId: string, limit = 10): Promise<FinancialData[]> {
    if (this.isIncognitoMode) {
      return [];
    }

    if (!this.db || !this.encryption.isInitialized()) {
      throw new Error('Service non initialisé');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['financialData'], 'readonly');
      const store = transaction.objectStore('financialData');
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = async () => {
        try {
          const records = request.result
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);

          const decryptedData = await Promise.all(
            records.map(async (record) => {
              const data = await this.encryption.decrypt(record.encryptedData);
              return data;
            })
          );

          resolve(decryptedData);
        } catch (error) {
          reject(error);
        }
      };

      request.onerror = () => reject(new Error('Erreur lors de la récupération'));
    });
  }

  /**
   * Récupère les transactions avec filtres
   */
  async getTransactions(
    userId: string, 
    filters?: {
      startDate?: Date;
      endDate?: Date;
      category?: string;
      minAmount?: number;
      maxAmount?: number;
    }
  ): Promise<RealTransaction[]> {
    if (this.isIncognitoMode) {
      return [];
    }

    if (!this.db || !this.encryption.isInitialized()) {
      throw new Error('Service non initialisé');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['transactions'], 'readonly');
      const store = transaction.objectStore('transactions');
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = async () => {
        try {
          let records = request.result;

          // Application des filtres
          if (filters) {
            records = records.filter(record => {
              if (filters.startDate && new Date(record.date) < filters.startDate) return false;
              if (filters.endDate && new Date(record.date) > filters.endDate) return false;
              if (filters.category && record.category !== filters.category) return false;
              if (filters.minAmount && record.amount < filters.minAmount) return false;
              if (filters.maxAmount && record.amount > filters.maxAmount) return false;
              return true;
            });
          }

          const decryptedTransactions = await Promise.all(
            records.map(async (record) => {
              const transaction = await this.encryption.decrypt(record.encryptedData);
              return transaction;
            })
          );

          resolve(decryptedTransactions);
        } catch (error) {
          reject(error);
        }
      };

      request.onerror = () => reject(new Error('Erreur lors de la récupération des transactions'));
    });
  }

  /**
   * Sauvegarde du contexte émotionnel
   */
  async saveEmotionalContext(userId: string, context: EmotionalContext): Promise<string> {
    if (this.isIncognitoMode) {
      return 'incognito-emotion-' + Date.now();
    }

    if (!this.db || !this.encryption.isInitialized()) {
      throw new Error('Service non initialisé');
    }

    const contextId = `emotion-${userId}-${Date.now()}`;
    const encryptedContext = await this.encryption.encrypt(context);

    const record = {
      id: contextId,
      userId,
      timestamp: Date.now(),
      encryptedData: encryptedContext
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['emotionalContext'], 'readwrite');
      const store = transaction.objectStore('emotionalContext');
      const request = store.add(record);

      request.onsuccess = () => resolve(contextId);
      request.onerror = () => reject(new Error('Erreur lors de la sauvegarde du contexte émotionnel'));
    });
  }

  /**
   * Nettoie toutes les données (pour le mode incognito ou reset)
   */
  async clearAllData(userId?: string): Promise<void> {
    if (!this.db) return;

    const stores = ['financialData', 'transactions', 'emotionalContext', 'personalizedInsights'];
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore('storeName');
        
        if (userId) {
          // Supprime seulement les données de cet utilisateur
          const index = store.index('userId');
          const request = index.openCursor(userId);
          
          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            } else {
              resolve();
            }
          };
          
          request.onerror = () => reject(new Error(`Erreur lors du nettoyage de ${storeName}`));
        } else {
          // Supprime toutes les données
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(new Error(`Erreur lors du nettoyage de ${storeName}`));
        }
      });
    }
  }
}

/**
 * Interface pour les transactions réelles avec métadonnées
 */
export interface RealTransaction extends FinancialItem {
  id: string;
  date: string;
  originalDescription?: string; // Description originale du relevé bancaire
  merchantInfo?: {
    name: string;
    category: string;
    location?: string;
  };
  emotionalContext?: {
    mood: number;
    tags: string[];
    notes?: string;
  };
  source: 'manual' | 'csv' | 'ocr' | 'bank_api';
  confidence?: number; // Confiance dans la catégorisation automatique
  verified: boolean; // Vérifié par l'utilisateur
}