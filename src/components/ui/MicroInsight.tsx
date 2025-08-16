import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  AlertTriangle, 
  Lightbulb, 
  Heart, 
  GraduationCap,
  ExternalLink,
  X,
  CheckCircle
} from 'lucide-react';
import { MicroInsight as MicroInsightType } from '../../types/psychology';
import { getBiasById, getFactById } from '../../data/psychologyDatabase';

interface MicroInsightProps {
  insight: MicroInsightType;
  onDismiss?: () => void;
  className?: string;
}

const MicroInsight: React.FC<MicroInsightProps> = ({ 
  insight, 
  onDismiss,
  className = '' 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = () => {
    switch (insight.type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
      case 'encouragement':
        return <Heart className="w-4 h-4 text-green-500" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-purple-500" />;
      default:
        return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (insight.type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 hover:bg-amber-100';
      case 'tip':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'encouragement':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'education':
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const psychologyData = insight.psychologyReference 
    ? insight.psychologyReference.type === 'bias' 
      ? getBiasById(insight.psychologyReference.id)
      : getFactById(insight.psychologyReference.id)
    : null;

  const handleExpand = () => {
    if (psychologyData) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative border rounded-lg p-3 cursor-pointer transition-all duration-200 ${getBackgroundColor()} ${className}`}
      onClick={handleExpand}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 leading-relaxed">
            {insight.content}
          </p>
          
          {psychologyData && (
            <div className="flex items-center gap-2 mt-2">
              <ScienceVerifiedBadge />
              <span className="text-xs text-gray-600">
                Cliquez pour en savoir plus
              </span>
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Détails étendus */}
      <AnimatePresence>
        {isExpanded && psychologyData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <PsychologyDetails data={psychologyData} type={insight.psychologyReference?.type} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Badge "Science Vérifiée"
const ScienceVerifiedBadge: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
      <CheckCircle className="w-3 h-3" />
      <span>Science Vérifiée</span>
    </div>
  );
};

// Composant pour afficher les détails psychologiques
interface PsychologyDetailsProps {
  data: any;
  type?: 'bias' | 'fact';
}

const PsychologyDetails: React.FC<PsychologyDetailsProps> = ({ data, type }) => {
  if (!data) return null;

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">
          {type === 'bias' ? data.name : data.title}
        </h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          {data.definition || data.description}
        </p>
      </div>

      {data.financialExplanation && (
        <div>
          <h5 className="font-medium text-gray-800 mb-1">Impact financier</h5>
          <p className="text-sm text-gray-600 leading-relaxed">
            {data.financialExplanation}
          </p>
        </div>
      )}

      {data.counterStrategies && data.counterStrategies.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-800 mb-2">Stratégies pour contrer ce biais</h5>
          <ul className="space-y-1">
            {data.counterStrategies.slice(0, 3).map((strategy: string, index: number) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{strategy}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.practicalApplication && (
        <div>
          <h5 className="font-medium text-gray-800 mb-1">Application pratique</h5>
          <p className="text-sm text-gray-600 leading-relaxed">
            {data.practicalApplication}
          </p>
        </div>
      )}

      {data.scientificReferences && data.scientificReferences.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-800 mb-2">Références scientifiques</h5>
          <div className="space-y-2">
            {data.scientificReferences.slice(0, 2).map((ref: any, index: number) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                <div className="font-medium text-gray-800">{ref.title}</div>
                <div className="text-gray-600 mt-1">
                  {ref.authors.join(', ')} ({ref.year})
                  {ref.journal && ` - ${ref.journal}`}
                </div>
                {ref.summary && (
                  <p className="text-gray-600 mt-1 leading-relaxed">{ref.summary}</p>
                )}
                {(ref.doi || ref.url) && (
                  <a
                    href={ref.url || `https://doi.org/${ref.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Voir l'étude</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MicroInsight;