import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Zap, Shield, Brain, TrendingUp, Plus } from 'lucide-react';
import { RealDataCollector } from './RealDataCollector';
import { PersonalizedInsightsDisplay } from './PersonalizedInsightsDisplay';
import { DataEncryptionService } from '../services/DataEncryptionService';
import { RealDataStorageService } from '../services/RealDataStorageService';
import toast from 'react-hot-toast';

interface RealDataDashboardProps {
  userId: string;
}

export const RealDataDashboard: React.FC<RealDataDashboardProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'collector'>('insights');
  const [isInitialized, setIsInitialized] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalInsights: 0,
    dataEncrypted: false
  });

  const encryptionService = DataEncryptionService.getInstance();
  const storageService = RealDataStorageService.getInstance();

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      // Initialisation du chiffrement avec un mot de passe par défaut
      // Dans une vraie application, ce serait demandé à l'utilisateur
      await encryptionService.initializeKey('rivela-demo-key-2024');
      
      // Initialisation de la base de données
      await storageService.initializeDatabase();
      
      setIsInitialized(true);
      setStats(prev => ({ ...prev, dataEncrypted: true }));
      
      toast.success('Services de données réelles initialisés avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      toast.error('Erreur lors de l\'initialisation des services');
    }
  };

  const handleDataImported = (count: number) => {
    setStats(prev => ({
      ...prev,
      totalTransactions: prev.totalTransactions + count
    }));
    
    // Déclenche un rafraîchissement des insights
    setRefreshTrigger(prev => prev + 1);
    
    // Bascule vers les insights après import
    setActiveTab('insights');
  };

  const tabs = [
    {
      id: 'insights',
      label: 'Révélations Personnalisées',
      icon: Brain,
      description: 'Insights basés sur vos vraies données'
    },
    {
      id: 'collector',
      label: 'Collecte de Données',
      icon: Plus,
      description: 'Importez vos données financières'
    }
  ];

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-md w-full mx-4"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Initialisation de Rivela
          </h2>
          <p className="text-gray-600 mb-4">
            Configuration du chiffrement et de la base de données sécurisée...
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Shield className="text-green-500" size={16} />
            <span>Chiffrement AES-256-GCM</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Rivela
            </span>
            : Données Réelles & Authentiques
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez des insights véritablement personnalisés basés sur vos vraies données financières.
            Chaque révélation est unique et s'adapte à votre situation réelle.
          </p>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Database className="mx-auto h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</div>
            <div className="text-sm text-gray-600">Transactions Réelles</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Zap className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalInsights}</div>
            <div className="text-sm text-gray-600">Insights Générés</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Shield className="mx-auto h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {stats.dataEncrypted ? 'Actif' : 'Inactif'}
            </div>
            <div className="text-sm text-gray-600">Chiffrement AES-256</div>
          </div>
        </motion.div>

        {/* Navigation par onglets */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 flex space-x-2">
            {tabs.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <div className="text-left">
                  <div className="font-medium">{label}</div>
                  <div className="text-xs opacity-75">{description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'insights' && (
            <PersonalizedInsightsDisplay 
              userId={userId} 
              refreshTrigger={refreshTrigger}
            />
          )}
          
          {activeTab === 'collector' && (
            <RealDataCollector 
              userId={userId}
              onDataImported={handleDataImported}
            />
          )}
        </motion.div>

        {/* Pied de page avec informations de sécurité */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl p-8 text-white"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">
              🔒 Sécurité et Confidentialité Maximales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Shield size={16} />
                <span>Chiffrement AES-256-GCM</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Database size={16} />
                <span>Stockage local IndexedDB</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Zap size={16} />
                <span>Zero Data Policy</span>
              </div>
            </div>
            <p className="mt-4 text-blue-100 max-w-2xl mx-auto">
              Vos données financières ne quittent jamais votre appareil. 
              Tous les calculs et analyses sont effectués localement pour garantir 
              votre confidentialité absolue.
            </p>
          </div>
        </motion.div>

        {/* Démonstration des fonctionnalités */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            🚀 Fonctionnalités Avancées Implémentées
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Import CSV Multi-Sources', desc: 'Relevés bancaires, exports logiciels' },
              { title: 'OCR Intelligent', desc: 'Scan de reçus et factures' },
              { title: 'Contexte Émotionnel', desc: 'Corrélation humeur/dépenses' },
              { title: 'Insights Personnalisés', desc: 'Révélations basées sur VOS données' },
              { title: 'Comparaisons Symboliques', desc: '"Vos 5 cafés = 1 place de cinéma"' },
              { title: 'Détection Frais Cachés', desc: 'Abonnements oubliés automatiquement' }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};