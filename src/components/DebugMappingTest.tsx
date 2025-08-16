import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { FinancialItem } from '../types/finance';
import { toast } from 'react-hot-toast';

export function DebugMappingTest() {
  const { financialData, setFinancialData } = useFinance();
  const [testItem, setTestItem] = useState<FinancialItem>({
    value: '1000',
    category: 'salary',
    description: 'Test item',
    frequency: 'monthly',
    isRecurring: true
  });

  const handleTestAdd = () => {
    console.log('=== DÉBUT TEST D\'AJOUT ===');
    console.log('financialData:', financialData);
    console.log('testItem:', testItem);

    try {
      // Conversion du montant
      const numericValue = parseFloat(testItem.value as string);
      if (isNaN(numericValue)) {
        toast.error('Montant invalide');
        return;
      }

      // Création de l'élément
      const newItem: FinancialItem = {
        id: `test_${Date.now()}`,
        value: numericValue,
        category: testItem.category,
        description: testItem.description || '',
        frequency: testItem.frequency,
        isRecurring: testItem.isRecurring
      };

      console.log('Nouvel élément à ajouter:', newItem);

      // Test de mise à jour
      setFinancialData(prevData => {
        console.log('prevData dans setFinancialData:', prevData);
        
        if (!prevData || typeof prevData !== 'object') {
          console.error('prevData invalide');
          return {
            incomes: [newItem],
            expenses: [],
            savings: [],
            debts: [],
            investments: []
          };
        }

        const updatedData = {
          ...prevData,
          incomes: [...(prevData.incomes || []), newItem],
          expenses: prevData.expenses || [],
          savings: prevData.savings || [],
          debts: prevData.debts || [],
          investments: prevData.investments || []
        };

        console.log('Données mises à jour:', updatedData);
        return updatedData;
      });

      toast.success('Élément de test ajouté !');
      console.log('=== TEST D\'AJOUT TERMINÉ ===');

    } catch (error) {
      console.error('Erreur dans le test:', error);
      toast.error('Erreur dans le test d\'ajout');
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg m-4">
      <h2 className="text-xl font-bold text-white mb-4">🔧 Test Debug - Ajout d'Élément</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-white text-sm mb-2">État des données financières:</label>
          <pre className="bg-gray-700 text-green-400 p-2 rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(financialData, null, 2)}
          </pre>
        </div>

        <div>
          <label className="block text-white text-sm mb-2">Montant de test:</label>
          <input
            type="number"
            value={testItem.value}
            onChange={e => setTestItem({...testItem, value: e.target.value})}
            className="bg-gray-700 text-white p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-white text-sm mb-2">Catégorie:</label>
          <select
            value={testItem.category}
            onChange={e => setTestItem({...testItem, category: e.target.value})}
            className="bg-gray-700 text-white p-2 rounded w-full"
          >
            <option value="salary">Salaire</option>
            <option value="freelance">Freelance</option>
            <option value="investments">Investissements</option>
          </select>
        </div>

        <button
          onClick={handleTestAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
        >
          🧪 Tester l'Ajout
        </button>

        <div>
          <span className="text-white text-sm">
            Revenus actuels: {financialData?.incomes?.length || 0} éléments
          </span>
        </div>
      </div>
    </div>
  );
}