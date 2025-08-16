import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, XIcon, AlertTriangleIcon, TagIcon } from 'lucide-react';
import { FinancialItem } from '../../types/finance';
import { FinancialDataType } from '../../hooks/useFinancialData';
import { validateFinancialItem, validateCategory } from '../../utils/validation';

// Types pour les catégories
interface CategoryOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

// Options de fréquence
const FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Mensuel' },
  { value: 'quarterly', label: 'Trimestriel' },
  { value: 'yearly', label: 'Annuel' },
  { value: 'once', label: 'Ponctuel' }
] as const;

// Définition des catégories avec icônes
const CATEGORY_OPTIONS: Record<FinancialDataType, CategoryOption[]> = {
  incomes: [
    { value: 'salary', label: 'Salaire', icon: '💼' },
    { value: 'freelance', label: 'Freelance', icon: '🔧' },
    { value: 'investments', label: 'Investissements', icon: '📈' },
    { value: 'rental', label: 'Revenus locatifs', icon: '🏠' },
    { value: 'other_income', label: 'Autres revenus', icon: '💰' }
  ],
  expenses: [
    { value: 'housing', label: 'Logement', icon: '🏠' },
    { value: 'food', label: 'Alimentation', icon: '🍽️' },
    { value: 'transport', label: 'Transport', icon: '🚗' },
    { value: 'utilities', label: 'Factures', icon: '⚡' },
    { value: 'entertainment', label: 'Loisirs', icon: '🎭' },
    { value: 'health', label: 'Santé', icon: '🏥' },
    { value: 'education', label: 'Éducation', icon: '📚' },
    { value: 'other_expense', label: 'Autres dépenses', icon: '📝' }
  ],
  savings: [
    { value: 'emergency', label: "Fonds d'urgence", icon: '🆘' },
    { value: 'retirement', label: 'Retraite', icon: '🏖️' },
    { value: 'savings', label: 'Épargne générale', icon: '🏦' },
    { value: 'project', label: 'Projet', icon: '🎯' }
  ],
  debts: [
    { value: 'mortgage', label: 'Prêt immobilier', icon: '🏠' },
    { value: 'credit_card', label: 'Carte de crédit', icon: '💳' },
    { value: 'loan', label: 'Prêt personnel', icon: '💰' },
    { value: 'other_debt', label: 'Autre dette', icon: '📄' }
  ]
};

interface FinancialItemFormProps {
  type: FinancialDataType;
  initialData?: Partial<FinancialItem>;
  onSubmit: (data: Partial<FinancialItem>) => Promise<boolean>;
  onCancel: () => void;
  submitLabel?: string;
  availableTags?: string[];
  selectedTags?: string[];
  onTagChange?: (tags: string[]) => void;
  isLoading?: boolean;
}

interface FormData {
  value: string;
  category: string;
  description: string;
  frequency: string;
  isRecurring: boolean;
}

interface ValidationErrors {
  value?: string[];
  category?: string[];
  description?: string[];
  frequency?: string[];
  general?: string[];
}

export function FinancialItemForm({
  type,
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Ajouter',
  availableTags = [],
  selectedTags = [],
  onTagChange,
  isLoading = false
}: FinancialItemFormProps) {
  // État du formulaire
  const [formData, setFormData] = useState<FormData>({
    value: initialData?.value?.toString() || '',
    category: initialData?.category || '',
    description: initialData?.description || '',
    frequency: initialData?.frequency || 'monthly',
    isRecurring: initialData?.isRecurring ?? true
  });

  // État des erreurs de validation
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Validation en temps réel
  const validateForm = useCallback(async () => {
    setIsValidating(true);
    
    const item: Partial<FinancialItem> = {
      value: formData.value,
      category: formData.category,
      description: formData.description,
      frequency: formData.frequency as FinancialItem['frequency'],
      isRecurring: formData.isRecurring
    };

    const validation = validateFinancialItem(item);
    const newErrors: ValidationErrors = {};

    // Validation générale avec Zod
    if (!validation.success && validation.errors) {
      validation.errors.forEach(error => {
        if (error.includes('montant')) {
          newErrors.value = newErrors.value || [];
          newErrors.value.push(error);
        } else if (error.includes('catégorie')) {
          newErrors.category = newErrors.category || [];
          newErrors.category.push(error);
        } else {
          newErrors.general = newErrors.general || [];
          newErrors.general.push(error);
        }
      });
    }

    // Validation spécifique de la catégorie selon le type
    if (formData.category && !validateCategory(formData.category, type)) {
      newErrors.category = newErrors.category || [];
      newErrors.category.push(`Catégorie invalide pour ${type}`);
    }

    // Validation personnalisée du montant
    if (formData.value) {
      const numericValue = parseFloat(formData.value.replace(',', '.'));
      if (isNaN(numericValue)) {
        newErrors.value = newErrors.value || [];
        newErrors.value.push('Le montant doit être numérique');
      } else if (numericValue <= 0) {
        newErrors.value = newErrors.value || [];
        newErrors.value.push('Le montant doit être positif');
      } else if (numericValue > 1000000000) {
        newErrors.value = newErrors.value || [];
        newErrors.value.push('Montant trop élevé');
      }
    }

    setErrors(newErrors);
    setIsValidating(false);

    // Retourner si le formulaire est valide
    return Object.keys(newErrors).length === 0;
  }, [formData, type]);

  // Validation à chaque changement avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(touched).length > 0) {
        validateForm();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData, validateForm, touched]);

  // Gestionnaire de changement générique
  const handleFieldChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  // Gestionnaire de soumission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marquer tous les champs comme touchés
    setTouched({
      value: true,
      category: true,
      description: true,
      frequency: true
    });

    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    const submitData: Partial<FinancialItem> = {
      value: formData.value,
      category: formData.category,
      description: formData.description.trim() || undefined,
      frequency: formData.frequency as FinancialItem['frequency'],
      isRecurring: formData.isRecurring
    };

    try {
      const success = await onSubmit(submitData);
      if (success) {
        // Réinitialiser le formulaire en cas de succès
        setFormData({
          value: '',
          category: '',
          description: '',
          frequency: 'monthly',
          isRecurring: true
        });
        setTouched({});
        setErrors({});
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  }, [formData, validateForm, onSubmit]);

  // Gestionnaire de changement de tags
  const handleTagChange = useCallback((tag: string) => {
    if (!onTagChange) return;
    
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    onTagChange(newTags);
  }, [selectedTags, onTagChange]);

  // Obtenir les catégories pour le type actuel
  const categories = CATEGORY_OPTIONS[type] || [];

  // Vérifier si le formulaire peut être soumis
  const canSubmit = formData.value.trim() !== '' && 
                   formData.category !== '' && 
                   Object.keys(errors).length === 0 && 
                   !isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="bg-black/20 p-6 rounded-lg border border-white/10">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <span className="text-2xl mr-2">
            {type === 'incomes' ? '💰' : 
             type === 'expenses' ? '💸' : 
             type === 'savings' ? '🏦' : '💳'}
          </span>
          {submitLabel} un élément - {type === 'incomes' ? 'Revenus' : 
                                     type === 'expenses' ? 'Dépenses' : 
                                     type === 'savings' ? 'Épargne' : 'Dettes'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Montant */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Montant <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.value}
                onChange={(e) => handleFieldChange('value', e.target.value)}
                className={`w-full bg-black/30 border rounded-lg py-3 px-4 pr-8 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.value && touched.value
                    ? 'border-red-500 focus:ring-red-500/50'
                    : formData.value && !errors.value
                    ? 'border-green-500 focus:ring-green-500/50'
                    : 'border-white/10 focus:ring-indigo-500/50'
                }`}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                €
              </span>
            </div>
            <AnimatePresence>
              {errors.value && touched.value && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 space-y-1"
                >
                  {errors.value.map((error, index) => (
                    <div key={index} className="flex items-center text-red-400 text-sm">
                      <AlertTriangleIcon className="h-4 w-4 mr-1" />
                      {error}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Catégorie <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              className={`w-full bg-black/30 border rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 transition-colors ${
                errors.category && touched.category
                  ? 'border-red-500 focus:ring-red-500/50'
                  : formData.category && !errors.category
                  ? 'border-green-500 focus:ring-green-500/50'
                  : 'border-white/10 focus:ring-indigo-500/50'
              }`}
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
            <AnimatePresence>
              {errors.category && touched.category && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 space-y-1"
                >
                  {errors.category.map((error, index) => (
                    <div key={index} className="flex items-center text-red-400 text-sm">
                      <AlertTriangleIcon className="h-4 w-4 mr-1" />
                      {error}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fréquence */}
          <div>
            <label className="block text-sm font-medium mb-2">Fréquence</label>
            <select
              value={formData.frequency}
              onChange={(e) => handleFieldChange('frequency', e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-gray-400">(optionnel)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors resize-none"
              placeholder="Ajouter une description..."
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-400 mt-1">
              {formData.description.length}/500 caractères
            </div>
          </div>

          {/* Récurrent */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => handleFieldChange('isRecurring', e.target.checked)}
              className="mr-3 w-4 h-4 text-indigo-600 bg-black/30 border-white/10 rounded focus:ring-indigo-500/50"
            />
            <label htmlFor="isRecurring" className="text-sm">
              Récurrent
            </label>
          </div>

          {/* Tags contextuels */}
          {availableTags.length > 0 && onTagChange && (
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <TagIcon className="h-4 w-4 mr-1 text-indigo-400" />
                Tags contextuels
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTagChange(tag)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-black/30 text-gray-300 hover:bg-black/40'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Erreurs générales */}
          <AnimatePresence>
            {errors.general && errors.general.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
              >
                {errors.general.map((error, index) => (
                  <div key={index} className="flex items-center text-red-400 text-sm">
                    <AlertTriangleIcon className="h-4 w-4 mr-2" />
                    {error}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/50"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                canSubmit && !isLoading
                  ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500/50'
                  : 'bg-gray-600 cursor-not-allowed opacity-50 text-gray-300'
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <CheckIcon className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Traitement...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}