import { RealTransaction, RealDataStorageService } from './RealDataStorageService';
import { FinancialData, FinancialItem } from '../types/finance';

/**
 * Service de collecte de données multi-sources
 * Gère l'import CSV, OCR, et saisie manuelle
 */
export class DataCollectionService {
  private static instance: DataCollectionService;
  private storage: RealDataStorageService;

  private constructor() {
    this.storage = RealDataStorageService.getInstance();
  }

  public static getInstance(): DataCollectionService {
    if (!DataCollectionService.instance) {
      DataCollectionService.instance = new DataCollectionService();
    }
    return DataCollectionService.instance;
  }

  /**
   * Importe des données depuis un fichier CSV
   */
  async importFromCSV(file: File, userId: string, mapping: CSVMapping): Promise<ImportResult> {
    try {
      const csvText = await this.readFileAsText(file);
      const lines = csvText.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('Fichier CSV vide');
      }

      // Parse du header
      const headers = this.parseCSVLine(lines[0]);
      const transactions: RealTransaction[] = [];
      const errors: string[] = [];

      // Parse des données
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i]);
          const transaction = this.mapCSVToTransaction(headers, values, mapping, userId);
          
          if (transaction) {
            transactions.push(transaction);
          }
        } catch (error) {
          errors.push(`Ligne ${i + 1}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
      }

      // Sauvegarde des transactions
      const savedIds: string[] = [];
      for (const transaction of transactions) {
        try {
          const id = await this.storage.saveTransaction(userId, transaction);
          savedIds.push(id);
        } catch (error) {
          errors.push(`Erreur de sauvegarde pour transaction ${transaction.description}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
      }

      return {
        success: true,
        importedCount: savedIds.length,
        totalRows: lines.length - 1,
        errors,
        transactionIds: savedIds
      };

    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        totalRows: 0,
        errors: [error instanceof Error ? error.message : 'Erreur lors de l\'import CSV'],
        transactionIds: []
      };
    }
  }

  /**
   * Traite une image avec OCR pour extraire des données de reçu
   */
  async processReceiptOCR(imageFile: File, userId: string): Promise<OCRResult> {
    try {
      // Conversion de l'image en base64 pour le traitement
      const imageData = await this.fileToBase64(imageFile);
      
      // Simulation d'OCR - dans un vrai projet, on utiliserait Tesseract.js
      // ou un service cloud d'OCR
      const ocrText = await this.simulateOCR(imageData);
      
      // Extraction des informations financières
      const extractedData = this.extractFinancialDataFromOCR(ocrText);
      
      if (extractedData) {
        // Création d'une transaction à partir des données OCR
        const transaction: RealTransaction = {
          id: `ocr-${userId}-${Date.now()}`,
          value: extractedData.amount,
          category: extractedData.category || 'Divers',
          description: extractedData.description || 'Transaction OCR',
          date: extractedData.date || new Date().toISOString(),
          source: 'ocr',
          confidence: extractedData.confidence || 0.7,
          verified: false,
          originalDescription: ocrText,
          merchantInfo: extractedData.merchant
        };

        // Sauvegarde de la transaction
        const transactionId = await this.storage.saveTransaction(userId, transaction);

        return {
          success: true,
          extractedText: ocrText,
          transaction,
          transactionId,
          confidence: extractedData.confidence || 0.7
        };
      } else {
        return {
          success: false,
          extractedText: ocrText,
          error: 'Impossible d\'extraire des données financières de l\'image'
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors du traitement OCR'
      };
    }
  }

  /**
   * Saisie manuelle guidée avec validation
   */
  async addManualTransaction(userId: string, transactionData: ManualTransactionInput): Promise<string> {
    // Validation des données
    const validationResult = this.validateManualTransaction(transactionData);
    if (!validationResult.isValid) {
      throw new Error(`Données invalides: ${validationResult.errors.join(', ')}`);
    }

    // Création de la transaction
    const transaction: RealTransaction = {
      id: `manual-${userId}-${Date.now()}`,
      value: transactionData.amount,
      category: transactionData.category,
      description: transactionData.description,
      date: transactionData.date,
      frequency: transactionData.frequency,
      isRecurring: transactionData.isRecurring || false,
      source: 'manual',
      verified: true,
      emotionalContext: transactionData.emotionalContext
    };

    // Sauvegarde
    return await this.storage.saveTransaction(userId, transaction);
  }

  /**
   * Auto-catégorisation intelligente basée sur l'historique
   */
  async suggestCategory(description: string, amount: number, userId: string): Promise<CategorySuggestion> {
    try {
      // Récupération de l'historique des transactions
      const historicalTransactions = await this.storage.getTransactions(userId);
      
      // Analyse des patterns pour suggérer une catégorie
      const suggestions = this.analyzeTransactionPatterns(description, amount, historicalTransactions);
      
      return {
        primarySuggestion: suggestions[0] || { category: 'Divers', confidence: 0.5 },
        alternativeSuggestions: suggestions.slice(1, 4),
        reasoning: this.explainCategorization(description, amount, suggestions[0])
      };

    } catch (error) {
      return {
        primarySuggestion: { category: 'Divers', confidence: 0.5 },
        alternativeSuggestions: [],
        reasoning: 'Analyse automatique non disponible'
      };
    }
  }

  // Méthodes utilitaires privées

  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsText(file);
    });
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private mapCSVToTransaction(
    headers: string[], 
    values: string[], 
    mapping: CSVMapping, 
    userId: string
  ): RealTransaction | null {
    const getValueByMapping = (field: keyof CSVMapping): string => {
      const columnIndex = mapping[field];
      return columnIndex !== undefined ? values[columnIndex] || '' : '';
    };

    const amount = parseFloat(getValueByMapping('amount').replace(/[^\d.-]/g, ''));
    if (isNaN(amount)) {
      throw new Error('Montant invalide');
    }

    const description = getValueByMapping('description') || 'Transaction importée';
    const date = this.parseDate(getValueByMapping('date')) || new Date().toISOString();
    const category = getValueByMapping('category') || 'Divers';

    return {
      id: `csv-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      value: Math.abs(amount),
      category,
      description,
      date,
      source: 'csv',
      verified: false,
      confidence: 0.8
    };
  }

  private parseDate(dateString: string): string | null {
    if (!dateString) return null;

    // Essaie différents formats de date
    const formats = [
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
      /(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
    ];

    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        try {
          const date = new Date(match[0]);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch {
          continue;
        }
      }
    }

    return null;
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erreur lors de la conversion en base64'));
      reader.readAsDataURL(file);
    });
  }

  private async simulateOCR(imageData: string): Promise<string> {
    // Simulation d'OCR - dans un vrai projet, on utiliserait Tesseract.js
    // Cette fonction simule l'extraction de texte d'un reçu
    return `
      SUPERMARCHÉ EXEMPLE
      123 Rue de la Paix
      75001 Paris
      
      Date: 15/12/2024
      Heure: 14:30
      
      Articles:
      Pain                   2.50€
      Lait 1L               1.20€
      Fromage               4.80€
      
      Total:                8.50€
      
      Merci de votre visite!
    `;
  }

  private extractFinancialDataFromOCR(ocrText: string): ExtractedFinancialData | null {
    // Extraction des données financières du texte OCR
    const amountMatch = ocrText.match(/Total:?\s*(\d+[.,]\d{2})\s*€?/i);
    const dateMatch = ocrText.match(/Date:?\s*(\d{2}\/\d{2}\/\d{4})/i);
    const merchantMatch = ocrText.match(/^([A-Z\s]+)/m);

    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[1].replace(',', '.'));
    const date = dateMatch ? this.parseDate(dateMatch[1]) : new Date().toISOString();
    const merchantName = merchantMatch ? merchantMatch[1].trim() : 'Commerce';

    return {
      amount,
      date,
      description: `Achat chez ${merchantName}`,
      category: this.guessCategoryFromMerchant(merchantName),
      confidence: 0.8,
      merchant: {
        name: merchantName,
        category: this.guessCategoryFromMerchant(merchantName)
      }
    };
  }

  private guessCategoryFromMerchant(merchantName: string): string {
    const categoryKeywords: Record<string, string[]> = {
      'Alimentation': ['supermarché', 'boulangerie', 'épicerie', 'marché', 'bio'],
      'Transport': ['station', 'essence', 'parking', 'taxi', 'uber'],
      'Restaurant': ['restaurant', 'café', 'bar', 'brasserie', 'fast'],
      'Santé': ['pharmacie', 'médecin', 'dentiste', 'clinique'],
      'Vêtements': ['boutique', 'mode', 'vêtement', 'chaussure']
    };

    const merchantLower = merchantName.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => merchantLower.includes(keyword))) {
        return category;
      }
    }

    return 'Divers';
  }

  private validateManualTransaction(data: ManualTransactionInput): ValidationResult {
    const errors: string[] = [];

    if (!data.amount || data.amount <= 0) {
      errors.push('Le montant doit être positif');
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('La description est obligatoire');
    }

    if (!data.category || data.category.trim().length === 0) {
      errors.push('La catégorie est obligatoire');
    }

    if (!data.date) {
      errors.push('La date est obligatoire');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private analyzeTransactionPatterns(
    description: string, 
    amount: number, 
    historicalTransactions: RealTransaction[]
  ): Array<{ category: string; confidence: number }> {
    const suggestions: Array<{ category: string; confidence: number }> = [];
    
    // Analyse par mots-clés dans la description
    const descriptionLower = description.toLowerCase();
    const categoryScores: Record<string, number> = {};

    for (const transaction of historicalTransactions) {
      if (transaction.description && transaction.category) {
        const transactionDesc = transaction.description.toLowerCase();
        
        // Calcul de similarité basique
        const similarity = this.calculateTextSimilarity(descriptionLower, transactionDesc);
        
        if (similarity > 0.3) {
          categoryScores[transaction.category] = (categoryScores[transaction.category] || 0) + similarity;
        }
      }
    }

    // Conversion en suggestions triées
    for (const [category, score] of Object.entries(categoryScores)) {
      suggestions.push({
        category,
        confidence: Math.min(score, 1.0)
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    
    let commonWords = 0;
    for (const word1 of words1) {
      if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
        commonWords++;
      }
    }

    return commonWords / Math.max(words1.length, words2.length);
  }

  private explainCategorization(description: string, amount: number, suggestion?: { category: string; confidence: number }): string {
    if (!suggestion) {
      return 'Aucune suggestion disponible';
    }

    return `Catégorie "${suggestion.category}" suggérée avec ${Math.round(suggestion.confidence * 100)}% de confiance basée sur l'analyse de vos transactions similaires.`;
  }
}

// Interfaces et types

export interface CSVMapping {
  date?: number;
  description?: number;
  amount?: number;
  category?: number;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  totalRows: number;
  errors: string[];
  transactionIds: string[];
}

export interface OCRResult {
  success: boolean;
  extractedText?: string;
  transaction?: RealTransaction;
  transactionId?: string;
  confidence?: number;
  error?: string;
}

export interface ManualTransactionInput {
  amount: number;
  description: string;
  category: string;
  date: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'once';
  isRecurring?: boolean;
  emotionalContext?: {
    mood: number;
    tags: string[];
    notes?: string;
  };
}

export interface ExtractedFinancialData {
  amount: number;
  date?: string | null;
  description?: string;
  category?: string;
  confidence?: number;
  merchant?: {
    name: string;
    category: string;
    location?: string;
  };
}

export interface CategorySuggestion {
  primarySuggestion: { category: string; confidence: number };
  alternativeSuggestions: Array<{ category: string; confidence: number }>;
  reasoning: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}