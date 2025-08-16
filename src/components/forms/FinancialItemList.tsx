import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, CopyIcon, MoveIcon, MoreVerticalIcon } from 'lucide-react';
import { FinancialItem } from '../../types/finance';
import { FinancialDataType } from '../../hooks/useFinancialData';
interface FinancialItemListProps {
  type: FinancialDataType;
  items: FinancialItem[];
  onEdit: (id: string, updates: Partial<FinancialItem>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onDuplicate: (id: string) => Promise<boolean>;
  onMove?: (id: string, toType: FinancialDataType) => Promise<boolean>;
  isLoading?: boolean;
}
interface EditableItemProps {
  item: FinancialItem;
  type: FinancialDataType;
  onSave: (updates: Partial<FinancialItem>) => Promise<boolean>;
  onCancel: () => void;
}

// Catégories avec labels
const CATEGORY_LABELS: Record<string, string> = {
  // Revenus
  salary: 'Salaire',
  freelance: 'Freelance',
  investments: 'Investissements',
  rental: 'Revenus locatifs',
  other_income: 'Autres revenus',
  // Dépenses
  housing: 'Logement',
  food: 'Alimentation',
  transport: 'Transport',
  utilities: 'Factures',
  entertainment: 'Loisirs',
  health: 'Santé',
  education: 'Éducation',
  other_expense: 'Autres dépenses',
  // Épargne
  emergency: "Fonds d'urgence",
  retirement: 'Retraite',
  savings: 'Épargne générale',
  project: 'Projet',
  // Dettes
  mortgage: 'Prêt immobilier',
  credit_card: 'Carte de crédit',
  loan: 'Prêt personnel',
  other_debt: 'Autre dette'
};
const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Quotidien',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  yearly: 'Annuel',
  once: 'Ponctuel'
};

// Composant pour l'édition inline
function EditableItem({
  item,
  type,
  onSave,
  onCancel
}: EditableItemProps) {
  const [editData, setEditData] = useState({
    value: item.value.toString(),
    category: item.category,
    description: item.description || '',
    frequency: item.frequency || 'monthly',
    isRecurring: item.isRecurring ?? true
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation simple
    const newErrors: string[] = [];
    const numericValue = parseFloat(editData.value.replace(',', '.'));
    if (!editData.value || isNaN(numericValue) || numericValue <= 0) {
      newErrors.push('Le montant doit être un nombre positif');
    }
    if (!editData.category) {
      newErrors.push('La catégorie est requise');
    }
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const success = await onSave({
        value: numericValue,
        category: editData.category,
        description: editData.description.trim() || undefined,
        frequency: editData.frequency as FinancialItem['frequency'],
        isRecurring: editData.isRecurring
      });
      if (success) {
        onCancel(); // Fermer le mode édition
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [editData, onSave, onCancel]);
  return <motion.div initial={{
    opacity: 0,
    scale: 0.95
  }} animate={{
    opacity: 1,
    scale: 1
  }} className="bg-black/40 p-4 rounded-lg border border-indigo-500/30">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Montant */}
        <div className="flex items-center">
          <input type="number" value={editData.value} onChange={e => setEditData(prev => ({
          ...prev,
          value: e.target.value
        }))} className="bg-black/30 border border-white/10 rounded-lg py-2 px-3 w-32 text-white mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Montant" min="0.01" step="0.01" required />
          <span className="text-sm text-gray-400">€</span>
        </div>

        {/* Catégorie et Fréquence */}
        <div className="grid grid-cols-2 gap-2">
          <select value={editData.category} onChange={e => setEditData(prev => ({
          ...prev,
          category: e.target.value
        }))} className="bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" required>
            <option value="">Catégorie</option>
            {Object.entries(CATEGORY_LABELS).filter(([key]) => {
            // Filtrer selon le type
            if (type === 'incomes') return ['salary', 'freelance', 'investments', 'rental', 'other_income'].includes(key);
            if (type === 'expenses') return ['housing', 'food', 'transport', 'utilities', 'entertainment', 'health', 'education', 'other_expense'].includes(key);
            if (type === 'savings') return ['emergency', 'retirement', 'savings', 'project'].includes(key);
            if (type === 'debts') return ['mortgage', 'credit_card', 'loan', 'other_debt'].includes(key);
            return false;
          }).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          
          <select value={editData.frequency} onChange={e => setEditData(prev => ({
          ...prev,
          frequency: e.target.value
        }))} className="bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
            {Object.entries(FREQUENCY_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>

        {/* Description */}
        <input type="text" value={editData.description} onChange={e => setEditData(prev => ({
        ...prev,
        description: e.target.value
      }))} className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Description (optionnel)" maxLength={500} />

        {/* Erreurs */}
        {errors.length > 0 && <div className="space-y-1">
            {errors.map((error, index) => <div key={index} className="text-red-400 text-xs">{error}</div>)}
          </div>}

        {/* Boutons */}
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onCancel} className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors" disabled={isSubmitting}>
            <XIcon className="h-4 w-4 text-white" />
          </button>
          <button type="submit" className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50" disabled={isSubmitting}>
            {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <CheckIcon className="h-4 w-4 text-white" />}
          </button>
        </div>
      </form>
    </motion.div>;
}

// Composant principal
export function FinancialItemList({
  type,
  items,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
  isLoading = false
}: FinancialItemListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
    setExpandedMenu(null);
  }, []);
  const handleSaveEdit = useCallback(async (id: string, updates: Partial<FinancialItem>) => {
    const success = await onEdit(id, updates);
    if (success) {
      setEditingId(null);
    }
    return success;
  }, [onEdit]);
  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);
  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      await onDelete(id);
    }
    setExpandedMenu(null);
  }, [onDelete]);
  const handleDuplicate = useCallback(async (id: string) => {
    await onDuplicate(id);
    setExpandedMenu(null);
  }, [onDuplicate]);
  const handleMove = useCallback(async (id: string, toType: FinancialDataType) => {
    if (onMove) {
      await onMove(id, toType);
    }
    setExpandedMenu(null);
  }, [onMove]);
  const formatValue = useCallback((value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '0' : numValue.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, []);
  if (items.length === 0) {
    return <div className="text-center py-12">
        <div className="text-6xl mb-4">
          {type === 'incomes' ? '💰' : type === 'expenses' ? '💸' : type === 'savings' ? '🏦' : '💳'}
        </div>
        <p className="text-gray-400 mb-2">Aucun élément ajouté</p>
        <p className="text-sm text-gray-500">
          Cliquez sur "Ajouter" pour commencer
        </p>
      </div>;
  }
  return <div className="space-y-3">
      <AnimatePresence>
        {items.map(item => {
        const isEditing = editingId === item.id;
        const isMenuExpanded = expandedMenu === item.id;
        return <motion.div key={item.id} layout initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} className="relative">
              {isEditing ? <EditableItem item={item} type={type} onSave={updates => handleSaveEdit(item.id!, updates)} onCancel={handleCancelEdit} /> : <div className="bg-black/20 p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-center justify-between">
                    {/* Informations principales */}
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-lg font-medium mr-2">
                          {formatValue(item.value)}
                        </span>
                        <span className="text-sm text-gray-400">€</span>
                        {item.isRecurring && <span className="ml-2 px-2 py-1 bg-indigo-600/20 text-indigo-300 text-xs rounded-full">
                            Récurrent
                          </span>}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-black/30 px-3 py-1 rounded-lg text-xs">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </div>
                        <div className="bg-black/30 px-3 py-1 rounded-lg text-xs">
                          {FREQUENCY_LABELS[item.frequency || 'monthly']}
                        </div>
                      </div>
                      
                      {item.description && <div className="text-sm text-gray-300 mt-2">
                          {item.description}
                        </div>}
                    </div>

                    {/* Menu d'actions */}
                    <div className="relative">
                      <button onClick={() => setExpandedMenu(isMenuExpanded ? null : item.id!)} className="p-2 bg-black/30 hover:bg-black/50 rounded-lg transition-colors">
                        <MoreVerticalIcon className="h-4 w-4" />
                      </button>

                      <AnimatePresence>
                        {isMenuExpanded && <motion.div initial={{
                    opacity: 0,
                    scale: 0.95,
                    y: -10
                  }} animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0
                  }} exit={{
                    opacity: 0,
                    scale: 0.95,
                    y: -10
                  }} className="absolute right-0 mt-2 w-48 bg-black/90 border border-white/10 rounded-lg shadow-lg z-10">
                            <div className="py-1">
                              <button onClick={() => handleEdit(item.id!)} className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Modifier
                              </button>
                              
                              <button onClick={() => handleDuplicate(item.id!)} className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                                <CopyIcon className="h-4 w-4 mr-2" />
                                Dupliquer
                              </button>

                              {onMove && <>
                                  <div className="border-t border-white/10 my-1"></div>
                                  <div className="px-4 py-2 text-xs text-gray-400 font-medium">
                                    Déplacer vers
                                  </div>
                                  {(['incomes', 'expenses', 'savings', 'debts'] as FinancialDataType[]).filter(t => t !== type).map(targetType => <button key={targetType} onClick={() => handleMove(item.id!, targetType)} className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                                        <MoveIcon className="h-4 w-4 mr-2" />
                                        {targetType === 'incomes' ? 'Revenus' : targetType === 'expenses' ? 'Dépenses' : targetType === 'savings' ? 'Épargne' : 'Dettes'}
                                      </button>)}
                                </>}

                              <div className="border-t border-white/10 my-1"></div>
                              <button onClick={() => handleDelete(item.id!)} className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Supprimer
                              </button>
                            </div>
                          </motion.div>}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>}
            </motion.div>;
      })}
      </AnimatePresence>

      {/* Overlay pour fermer le menu */}
      {expandedMenu && <div className="fixed inset-0 z-5" onClick={() => setExpandedMenu(null)}></div>}
    </div>;
}