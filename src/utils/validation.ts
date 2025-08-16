import { z } from 'zod';
import { FinancialItem, FinancialData } from '../types/finance';

// Schéma de validation pour un élément financier
export const FinancialItemSchema = z.object({
  id: z.string().optional(),
  value: z.union([
    z.number().positive({ message: "Le montant doit être positif" }),
    z.string()
      .min(1, { message: "Le montant est requis" })
      .refine((val) => {
        const num = parseFloat(val.replace(',', '.'));
        return !isNaN(num) && num > 0;
      }, { message: "Le montant doit être un nombre positif valide" })
  ]),
  category: z.string()
    .min(1, { message: "La catégorie est requise" })
    .trim(),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once'])
    .default('monthly'),
  isRecurring: z.boolean().default(true)
});

// Schéma de validation pour les données financières complètes
export const FinancialDataSchema = z.object({
  incomes: z.array(FinancialItemSchema).default([]),
  expenses: z.array(FinancialItemSchema).default([]),
  savings: z.array(FinancialItemSchema).default([]),
  debts: z.array(FinancialItemSchema).default([]),
  investments: z.array(FinancialItemSchema).default([])
});

// Types inférés des schémas
export type ValidatedFinancialItem = z.infer<typeof FinancialItemSchema>;
export type ValidatedFinancialData = z.infer<typeof FinancialDataSchema>;

// Fonction pour valider et nettoyer un élément financier
export function validateFinancialItem(item: Partial<FinancialItem>): {
  success: boolean;
  data?: ValidatedFinancialItem;
  errors?: string[];
} {
  try {
    const validated = FinancialItemSchema.parse(item);
    return {
      success: true,
      data: validated
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => err.message)
      };
    }
    return {
      success: false,
      errors: ['Erreur de validation inconnue']
    };
  }
}

// Fonction pour valider les données financières complètes
export function validateFinancialData(data: Partial<FinancialData>): {
  success: boolean;
  data?: ValidatedFinancialData;
  errors?: string[];
} {
  try {
    const validated = FinancialDataSchema.parse(data);
    return {
      success: true,
      data: validated
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      success: false,
      errors: ['Erreur de validation des données financières']
    };
  }
}

// Fonction pour normaliser une valeur numérique
export function normalizeNumericValue(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }
  
  // Nettoyer la chaîne et convertir
  const cleaned = value.replace(',', '.').trim();
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed) || !isFinite(parsed) || parsed <= 0) {
    throw new Error('Valeur numérique invalide');
  }
  
  return parsed;
}

// Fonction pour générer un ID unique
export function generateUniqueId(prefix: string = 'item'): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${randomSuffix}`;
}

// Validation des catégories selon le type
export const INCOME_CATEGORIES = [
  'salary', 'freelance', 'investments', 'rental', 'other_income'
] as const;

export const EXPENSE_CATEGORIES = [
  'housing', 'food', 'transport', 'utilities', 'entertainment', 
  'health', 'education', 'other_expense'
] as const;

export const SAVING_CATEGORIES = [
  'emergency', 'retirement', 'savings', 'project'
] as const;

export const DEBT_CATEGORIES = [
  'mortgage', 'credit_card', 'loan', 'other_debt'
] as const;

export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type SavingCategory = typeof SAVING_CATEGORIES[number];
export type DebtCategory = typeof DEBT_CATEGORIES[number];

// Fonction pour valider une catégorie selon le type d'élément
export function validateCategory(category: string, type: 'incomes' | 'expenses' | 'savings' | 'debts'): boolean {
  switch (type) {
    case 'incomes':
      return INCOME_CATEGORIES.includes(category as IncomeCategory);
    case 'expenses':
      return EXPENSE_CATEGORIES.includes(category as ExpenseCategory);
    case 'savings':
      return SAVING_CATEGORIES.includes(category as SavingCategory);
    case 'debts':
      return DEBT_CATEGORIES.includes(category as DebtCategory);
    default:
      return false;
  }
}

// Fonction pour calculer en sécurité le total d'un tableau d'éléments
export function calculateSafeTotal(items: FinancialItem[]): number {
  if (!Array.isArray(items)) {
    console.warn('calculateSafeTotal: items n\'est pas un tableau', items);
    return 0;
  }
  
  return items.reduce((total, item) => {
    try {
      const value = normalizeNumericValue(item.value);
      return total + value;
    } catch (error) {
      console.warn('Erreur lors du calcul du total pour l\'élément:', item, error);
      return total;
    }
  }, 0);
}

// Utilitaires pour la gestion d'erreurs
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DataIntegrityError extends Error {
  constructor(message: string, public readonly context?: any) {
    super(message);
    this.name = 'DataIntegrityError';
  }
}

// Type guards
export function isValidFinancialItem(item: any): item is FinancialItem {
  return FinancialItemSchema.safeParse(item).success;
}

export function isValidFinancialData(data: any): data is FinancialData {
  return FinancialDataSchema.safeParse(data).success;
}