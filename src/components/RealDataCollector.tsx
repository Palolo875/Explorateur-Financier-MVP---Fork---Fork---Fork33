import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Plus, FileText, AlertCircle, CheckCircle, Zap, Heart, Brain } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { DataCollectionService, CSVMapping, ManualTransactionInput } from '../services/DataCollectionService';
import { RealDataStorageService } from '../services/RealDataStorageService';
import { DataEncryptionService } from '../services/DataEncryptionService';
import toast from 'react-hot-toast';

interface RealDataCollectorProps {
  userId: string;
  onDataImported?: (count: number) => void;
}

export const RealDataCollector: React.FC<RealDataCollectorProps> = ({ userId, onDataImported }) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'ocr' | 'manual'>('manual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvMapping, setCsvMapping] = useState<CSVMapping>({});
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [ocrResult, setOcrResult] = useState<string>('');
  
  // État pour la saisie manuelle
  const [manualData, setManualData] = useState<ManualTransactionInput>({
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    emotionalContext: {
      mood: 5,
      tags: [],
      notes: ''
    }
  });

  const dataCollectionService = DataCollectionService.getInstance();
  const storageService = RealDataStorageService.getInstance();
  const encryptionService = DataEncryptionService.getInstance();

  // Configuration du dropzone pour CSV
  const onDropCSV = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // Lecture des premières lignes pour mapper les colonnes
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          setCsvHeaders(headers);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error('Erreur lors de la lecture du fichier CSV');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Configuration du dropzone pour OCR
  const onDropOCR = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await dataCollectionService.processReceiptOCR(file, userId);
      
      if (result.success) {
        setOcrResult(result.extractedText || '');
        toast.success('Reçu traité avec succès !');
        if (result.transactionId && onDataImported) {
          onDataImported(1);
        }
      } else {
        toast.error(result.error || 'Erreur lors du traitement OCR');
      }
    } catch (error) {
      toast.error('Erreur lors du traitement de l\'image');
    } finally {
      setIsProcessing(false);
    }
  }, [userId, onDataImported]);

  const { getRootProps: getCSVRootProps, getInputProps: getCSVInputProps, isDragActive: isCSVDragActive } = useDropzone({
    onDrop: onDropCSV,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1
  });

  const { getRootProps: getOCRRootProps, getInputProps: getOCRInputProps, isDragActive: isOCRDragActive } = useDropzone({
    onDrop: onDropOCR,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    },
    maxFiles: 1
  });

  const handleCSVImport = async () => {
    if (csvHeaders.length === 0) {
      toast.error('Veuillez d\'abord sélectionner un fichier CSV');
      return;
    }

    // Validation du mapping
    if (!csvMapping.amount || !csvMapping.description) {
      toast.error('Veuillez mapper au minimum les colonnes "Montant" et "Description"');
      return;
    }

    setIsProcessing(true);
    try {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      if (file) {
        const result = await dataCollectionService.importFromCSV(file, userId, csvMapping);
        
        if (result.success) {
          toast.success(`${result.importedCount} transactions importées avec succès !`);
          if (result.errors.length > 0) {
            console.warn('Erreurs lors de l\'import:', result.errors);
          }
          if (onDataImported) {
            onDataImported(result.importedCount);
          }
          // Reset
          setCsvHeaders([]);
          setCsvMapping({});
        } else {
          toast.error('Erreur lors de l\'import CSV');
        }
      }
    } catch (error) {
      toast.error('Erreur lors de l\'import CSV');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualData.amount || !manualData.description || !manualData.category) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsProcessing(true);
    try {
      const transactionId = await dataCollectionService.addManualTransaction(userId, manualData);
      toast.success('Transaction ajoutée avec succès !');
      
      // Reset du formulaire
      setManualData({
        amount: 0,
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        emotionalContext: {
          mood: 5,
          tags: [],
          notes: ''
        }
      });

      if (onDataImported) {
        onDataImported(1);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  const addEmotionalTag = (tag: string) => {
    if (manualData.emotionalContext && !manualData.emotionalContext.tags.includes(tag)) {
      setManualData({
        ...manualData,
        emotionalContext: {
          ...manualData.emotionalContext,
          tags: [...manualData.emotionalContext.tags, tag]
        }
      });
    }
  };

  const removeEmotionalTag = (tag: string) => {
    if (manualData.emotionalContext) {
      setManualData({
        ...manualData,
        emotionalContext: {
          ...manualData.emotionalContext,
          tags: manualData.emotionalContext.tags.filter(t => t !== tag)
        }
      });
    }
  };

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return '😢';
    if (mood <= 4) return '😐';
    if (mood <= 6) return '🙂';
    if (mood <= 8) return '😊';
    return '😄';
  };

  const predefinedCategories = [
    'Alimentation', 'Transport', 'Logement', 'Loisirs', 'Santé',
    'Vêtements', 'Éducation', 'Restaurant', 'Shopping', 'Divers'
  ];

  const emotionalTags = [
    'Stress', 'Joie', 'Impulsif', 'Planifié', 'Nécessaire',
    'Plaisir', 'Urgence', 'Regret', 'Satisfaction', 'Économie'
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Collecte de Données Réelles
        </h2>
        <p className="text-gray-600">
          Importez vos vraies données financières pour des insights authentiques et personnalisés
        </p>
      </div>

      {/* Onglets */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'manual', label: 'Saisie Manuelle', icon: Plus },
          { id: 'csv', label: 'Import CSV', icon: FileText },
          { id: 'ocr', label: 'Scanner Reçu', icon: Camera }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all ${
              activeTab === id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Saisie Manuelle */}
        {activeTab === 'manual' && (
          <motion.div
            key="manual"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={manualData.amount || ''}
                  onChange={(e) => setManualData({ ...manualData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={manualData.date}
                  onChange={(e) => setManualData({ ...manualData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <input
                type="text"
                value={manualData.description}
                onChange={(e) => setManualData({ ...manualData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Courses au supermarché"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                value={manualData.category}
                onChange={(e) => setManualData({ ...manualData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionnez une catégorie</option>
                {predefinedCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Contexte Émotionnel */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-3">
                <Heart className="text-purple-500" size={20} />
                <h3 className="font-medium text-purple-800">Contexte Émotionnel</h3>
                <Brain className="text-purple-500" size={16} />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Humeur lors de cet achat {getMoodEmoji(manualData.emotionalContext?.mood || 5)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={manualData.emotionalContext?.mood || 5}
                    onChange={(e) => setManualData({
                      ...manualData,
                      emotionalContext: {
                        ...manualData.emotionalContext!,
                        mood: parseInt(e.target.value)
                      }
                    })}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-purple-600 mt-1">
                    <span>Très triste</span>
                    <span>Neutre</span>
                    <span>Très joyeux</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Tags émotionnels
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {emotionalTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => addEmotionalTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs transition-all ${
                          manualData.emotionalContext?.tags.includes(tag)
                            ? 'bg-purple-500 text-white'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {manualData.emotionalContext?.tags.map(tag => (
                      <span
                        key={tag}
                        onClick={() => removeEmotionalTag(tag)}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-500 text-white cursor-pointer hover:bg-purple-600"
                      >
                        {tag} ×
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={manualData.emotionalContext?.notes || ''}
                    onChange={(e) => setManualData({
                      ...manualData,
                      emotionalContext: {
                        ...manualData.emotionalContext!,
                        notes: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={2}
                    placeholder="Comment vous sentiez-vous lors de cet achat ?"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleManualSubmit}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Ajout en cours...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Ajouter la Transaction</span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Import CSV */}
        {activeTab === 'csv' && (
          <motion.div
            key="csv"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div
              {...getCSVRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isCSVDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getCSVInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Glissez-déposez votre fichier CSV
              </p>
              <p className="text-gray-500">
                ou cliquez pour sélectionner un fichier
              </p>
            </div>

            {csvHeaders.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-3">Mapper les colonnes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'date', label: 'Date', required: false },
                    { key: 'description', label: 'Description', required: true },
                    { key: 'amount', label: 'Montant', required: true },
                    { key: 'category', label: 'Catégorie', required: false }
                  ].map(({ key, label, required }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label} {required && '*'}
                      </label>
                      <select
                        value={csvMapping[key as keyof CSVMapping] || ''}
                        onChange={(e) => setCsvMapping({
                          ...csvMapping,
                          [key]: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionnez une colonne</option>
                        {csvHeaders.map((header, index) => (
                          <option key={index} value={index}>{header}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleCSVImport}
                  disabled={isProcessing}
                  className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Import en cours...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Importer les Données</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Scanner OCR */}
        {activeTab === 'ocr' && (
          <motion.div
            key="ocr"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div
              {...getOCRRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isOCRDragActive
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getOCRInputProps()} />
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Scannez un reçu ou une facture
              </p>
              <p className="text-gray-500">
                Glissez une image ou cliquez pour sélectionner
              </p>
            </div>

            {ocrResult && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Texte extrait</span>
                </h3>
                <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-3 rounded border">
                  {ocrResult}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Informations de sécurité */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Zap className="text-blue-500 mt-0.5" size={16} />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Sécurité et Confidentialité</h4>
            <p className="text-sm text-blue-700">
              Toutes vos données sont chiffrées localement avec AES-256-GCM et ne quittent jamais votre appareil. 
              Le traitement OCR est simulé pour la démonstration - dans la version finale, 
              il utiliserait Tesseract.js en local.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};