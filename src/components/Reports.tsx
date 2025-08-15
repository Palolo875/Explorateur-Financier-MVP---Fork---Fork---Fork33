import React, { useEffect, useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { FileBarChartIcon, DownloadIcon, ShareIcon, ClockIcon, CheckCircleIcon, CalendarIcon, BookIcon, PlusIcon } from 'lucide-react';
import { FinancialReport } from '../types/finance';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
// Set locale
dayjs.locale('fr');
export function Reports() {
  const navigate = useNavigate();
  const {
    themeColors
  } = useTheme();
  const {
    generateInsights,
    runSimulation
  } = useFinance();
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  // Generate example reports on mount
  useEffect(() => {
    const generateReports = async () => {
      const insights = await generateInsights();
      const simulationResults = await runSimulation({
        name: 'Simulation standard',
        incomeGrowth: 2,
        expenseReduction: 1,
        savingsRate: 50,
        investmentReturn: 5,
        inflationRate: 2,
        years: 10
      });

      const reports: FinancialReport[] = [{
        id: '1',
        title: 'Rapport financier mensuel',
        date: dayjs().subtract(2, 'day').toISOString(),
        insights: insights,
        summary: "Ce rapport mensuel met en évidence une amélioration de votre taux d'épargne de 3% par rapport au mois précédent. Vos dépenses en loisirs ont diminué, tandis que vos revenus sont restés stables.",
        recommendations: ['Continuez à optimiser vos dépenses en loisirs', "Envisagez d'investir votre surplus d'épargne", 'Revoyez votre budget alimentaire qui a augmenté de 5%'],
        simulationResults
      }, {
        id: '2',
        title: "Analyse d'objectif d'achat immobilier",
        date: dayjs().subtract(15, 'day').toISOString(),
        insights: insights.filter(i => i.category === 'savings' || i.category === 'expense') || [],
        summary: "Cette analyse évalue votre capacité à atteindre votre objectif d'achat immobilier. Avec votre taux d'épargne actuel, vous pourriez constituer un apport de 50 000€ en 7 ans et 3 mois.",
        recommendations: ["Augmentez votre taux d'épargne de 5% pour réduire le délai à 6 ans", "Explorez les aides à l'accession à la propriété", 'Optimisez vos placements pour un meilleur rendement'],
        simulationResults
      }, {
        id: '3',
        title: 'Audit financier trimestriel',
        date: dayjs().subtract(45, 'day').toISOString(),
        insights: insights,
        summary: "Ce rapport trimestriel analyse l'évolution de votre situation financière. Votre patrimoine net a augmenté de 4.2% ce trimestre, principalement grâce à la performance de vos investissements.",
        recommendations: ["Rééquilibrez votre portefeuille d'investissement", 'Consolidez vos petites dettes', "Augmentez votre fonds d'urgence pour atteindre 6 mois de dépenses"],
        simulationResults
      }];
      setReports(reports);
      if (reports.length > 0) {
        setSelectedReport(reports[0]);
      }
    };
    generateReports();
  }, [generateInsights, runSimulation]);
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD MMMM YYYY');
  };
  const handleExportPDF = async () => {
    if (!selectedReport) return;
    try {
      setExportLoading(true);
      const element = document.getElementById('report-content');
      if (!element) return;
      const dataUrl = await toPng(element, {
        quality: 0.95
      });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      // Add title
      pdf.setFontSize(22);
      pdf.text(`Rivela - ${selectedReport.title}`, 20, 20);
      // Add date
      pdf.setFontSize(12);
      pdf.text(`Généré le ${formatDate(new Date().toISOString())}`, 20, 30);
      // Add original date
      pdf.setFontSize(10);
      pdf.text(`Rapport créé le ${formatDate(selectedReport.date)}`, 20, 35);
      // Add image
      const imgWidth = 170;
      const imgHeight = element.offsetHeight * imgWidth / element.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 20, 45, imgWidth, Math.min(imgHeight, 220));
      // Save PDF
      pdf.save(`rivela-${selectedReport.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      setExportLoading(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setExportLoading(false);
    }
  };
  return <div className="w-full max-w-6xl mx-auto pb-20">
      <motion.div className="mb-6" initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Rapports Financiers</h1>
            <p className="text-gray-400">
              Analyses détaillées et recommandations personnalisées
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-black/30 hover:bg-black/40 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300">
              <PlusIcon className="mr-2 h-4 w-4" />
              Nouveau rapport
            </button>
          </div>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <GlassCard className="p-4 mb-6" animate>
            <h3 className="font-medium mb-4 flex items-center">
              <FileBarChartIcon className="h-5 w-5 mr-2 text-indigo-400" />
              Mes rapports
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reports.map(report => <div key={report.id} onClick={() => setSelectedReport(report)} className={`p-3 rounded-lg cursor-pointer ${selectedReport?.id === report.id ? `bg-gradient-to-r ${themeColors.primary} bg-opacity-30` : 'bg-black/20 hover:bg-black/30'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium">{report.title}</h4>
                    <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {dayjs(report.date).fromNow()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {report.summary}
                  </p>
                </div>)}
            </div>
          </GlassCard>
          <GlassCard className="p-4" animate>
            <h3 className="font-medium mb-3">Types de rapports disponibles</h3>
            <div className="space-y-2">
              <div className="bg-black/20 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-1">Rapport mensuel</h4>
                <p className="text-xs text-gray-400">
                  Suivi mensuel de vos finances avec analyse des tendances
                </p>
              </div>
              <div className="bg-black/20 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-1">Analyse d'objectif</h4>
                <p className="text-xs text-gray-400">
                  Évaluation détaillée d'un objectif financier spécifique
                </p>
              </div>
              <div className="bg-black/20 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-1">Audit trimestriel</h4>
                <p className="text-xs text-gray-400">
                  Analyse approfondie de votre situation financière tous les 3
                  mois
                </p>
              </div>
              <div className="bg-black/20 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-1">Rapport fiscal</h4>
                <p className="text-xs text-gray-400">
                  Préparation et optimisation de votre situation fiscale
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
        <div className="lg:col-span-2">
          {selectedReport ? <GlassCard className="p-6" animate>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {selectedReport.title}
                  </h2>
                  <div className="flex items-center text-sm text-gray-400">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {formatDate(selectedReport.date)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={handleExportPDF} disabled={exportLoading} className="bg-black/30 hover:bg-black/40 text-white p-2 rounded-lg flex items-center transition-all duration-300">
                    {exportLoading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : <DownloadIcon className="h-5 w-5" />}
                  </button>
                  <button className="bg-black/30 hover:bg-black/40 text-white p-2 rounded-lg flex items-center transition-all duration-300">
                    <ShareIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div id="report-content">
                <div className="bg-black/20 p-4 rounded-xl mb-6">
                  <h3 className="font-medium mb-2 flex items-center">
                    <BookIcon className="h-5 w-5 mr-2 text-indigo-400" />
                    Résumé
                  </h3>
                  <p className="text-gray-300">{selectedReport.summary}</p>
                </div>
                <h3 className="font-medium mb-3 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2 text-green-400" />
                  Recommandations
                </h3>
                <div className="space-y-2 mb-6">
                  {selectedReport.recommendations.map((recommendation, index) => <div key={index} className="bg-black/20 p-3 rounded-lg">
                        <div className="flex items-start">
                          <span className="w-5 h-5 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">
                            {index + 1}
                          </span>
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      </div>)}
                </div>
                <h3 className="font-medium mb-3">Insights identifiés</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {selectedReport.insights.slice(0, 4).map(insight => <div key={insight.id} className={`p-3 rounded-lg ${insight.impact === 'high' ? 'bg-red-900/20 border border-red-500/30' : insight.impact === 'medium' ? 'bg-yellow-900/20 border border-yellow-500/30' : 'bg-green-900/20 border border-green-500/30'}`}>
                      <div className="flex items-center mb-1">
                        <span className={`w-2 h-2 rounded-full mr-2 ${insight.impact === 'high' ? 'bg-red-500' : insight.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                        <h4 className="text-sm font-medium">{insight.title}</h4>
                      </div>
                      <p className="text-xs text-gray-300">
                        {insight.description}
                      </p>
                    </div>)}
                </div>
                {selectedReport.simulationResults && <div className="bg-black/20 p-4 rounded-xl">
                    <h3 className="font-medium mb-3">Projection financière</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-black/30 p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-400 mb-1">
                          Patrimoine à 10 ans
                        </div>
                        <div className="text-lg font-bold text-indigo-400">
                          {selectedReport.simulationResults.netWorth[selectedReport.simulationResults.netWorth.length - 1].toLocaleString()}
                          €
                        </div>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-400 mb-1">
                          Croissance
                        </div>
                        <div className="text-lg font-bold text-green-400">
                          {((selectedReport.simulationResults.netWorth[selectedReport.simulationResults.netWorth.length - 1] / selectedReport.simulationResults.netWorth[0] - 1) * 100).toFixed(0)}
                          %
                        </div>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-400 mb-1">
                          Épargne mensuelle
                        </div>
                        <div className="text-lg font-bold text-blue-400">
                          {(selectedReport.simulationResults.income[0] - selectedReport.simulationResults.expenses[0]).toLocaleString()}
                          €
                        </div>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-400 mb-1">
                          Taux d'épargne
                        </div>
                        <div className="text-lg font-bold text-yellow-400">
                          {selectedReport.simulationResults.income[0] > 0 ? ((selectedReport.simulationResults.income[0] - selectedReport.simulationResults.expenses[0]) / selectedReport.simulationResults.income[0] * 100).toFixed(0) : 0}
                          %
                        </div>
                      </div>
                    </div>
                  </div>}
              </div>
            </GlassCard> : <GlassCard className="p-6 flex items-center justify-center h-96" animate>
              <div className="text-center">
                <FileBarChartIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  Aucun rapport sélectionné
                </h3>
                <p className="text-gray-400">
                  Sélectionnez un rapport pour afficher son contenu
                </p>
              </div>
            </GlassCard>}
        </div>
      </div>
    </div>;
}