import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Clock, 
  Star, 
  CheckCircle, 
  ChevronRight,
  Award,
  Target,
  Lightbulb,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { PersonalizedLesson, Exercise } from '../../services/PersonalizedLessonsService';

interface PersonalizedLessonCardProps {
  lesson: PersonalizedLesson;
  onStartLesson: (lessonId: string) => void;
  onCompleteLesson: (lessonId: string) => void;
  className?: string;
}

const PersonalizedLessonCard: React.FC<PersonalizedLessonCardProps> = ({
  lesson,
  onStartLesson,
  onCompleteLesson,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showExercises, setShowExercises] = useState(false);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  const getCategoryColor = () => {
    switch (lesson.category) {
      case 'bias-management':
        return 'from-purple-500 to-pink-500';
      case 'behavioral-finance':
        return 'from-blue-500 to-indigo-500';
      case 'psychology':
        return 'from-green-500 to-teal-500';
      case 'decision-making':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = () => {
    switch (lesson.category) {
      case 'bias-management':
        return <Brain className="w-5 h-5" />;
      case 'behavioral-finance':
        return <Target className="w-5 h-5" />;
      case 'psychology':
        return <Lightbulb className="w-5 h-5" />;
      case 'decision-making':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const handleStartLesson = () => {
    setIsExpanded(true);
    onStartLesson(lesson.id);
  };

  const handleStartExercises = () => {
    setShowExercises(true);
    setCurrentExerciseIndex(0);
  };

  const handleExerciseAnswer = (exerciseId: string, answer: string) => {
    setExerciseAnswers(prev => ({ ...prev, [exerciseId]: answer }));
  };

  const handleCompleteExercise = (exerciseId: string) => {
    setCompletedExercises(prev => new Set([...prev, exerciseId]));
    
    if (currentExerciseIndex < lesson.content.practicalExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // Toutes les exercices terminées
      onCompleteLesson(lesson.id);
    }
  };

  const currentExercise = lesson.content.practicalExercises[currentExerciseIndex];
  const progressPercentage = (completedExercises.size / lesson.content.practicalExercises.length) * 100;

  return (
    <motion.div
      layout
      className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}
      whileHover={{ y: -2, shadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.2 }}
    >
      {/* Header de la carte */}
      <div className={`bg-gradient-to-r ${getCategoryColor()} p-4 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getCategoryIcon()}
            <div>
              <h3 className="font-bold text-lg leading-tight">{lesson.title}</h3>
              <p className="text-white/80 text-sm mt-1">{lesson.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>{lesson.duration} min</span>
          </div>
        </div>
        
        {/* Badge de priorité et raison personnalisée */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
              Priorité {lesson.priority}/10
            </span>
            <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
              {lesson.level}
            </span>
          </div>
          <Award className="w-5 h-5 text-yellow-300" />
        </div>
      </div>

      {/* Contenu de la carte */}
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600 italic">
            {lesson.personalizedReason}
          </p>
        </div>

        {!isExpanded ? (
          <div className="space-y-3">
            <button
              onClick={handleStartLesson}
              className={`w-full bg-gradient-to-r ${getCategoryColor()} text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2`}
            >
              <span>Commencer la leçon</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <div className="text-center">
              <span className="text-sm text-gray-500">
                Récompense: {lesson.completionReward}
              </span>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!showExercises ? (
              <motion.div
                key="lesson-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Introduction */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Introduction</h4>
                  <p className="text-blue-800 text-sm">{lesson.content.introduction}</p>
                </div>

                {/* Points principaux */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Points clés à retenir</h4>
                  <ul className="space-y-2">
                    {lesson.content.mainPoints.map((point, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Base scientifique */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    Base scientifique
                  </h4>
                  <p className="text-purple-800 text-sm">{lesson.content.scientificBasis}</p>
                </div>

                <button
                  onClick={handleStartExercises}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Passer aux exercices pratiques</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="exercises"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Barre de progression */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Exercice {currentExerciseIndex + 1} sur {lesson.content.practicalExercises.length}</span>
                    <span>{Math.round(progressPercentage)}% complété</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {currentExercise && (
                  <ExerciseComponent
                    exercise={currentExercise}
                    onAnswer={(answer) => handleExerciseAnswer(currentExercise.id, answer)}
                    onComplete={() => handleCompleteExercise(currentExercise.id)}
                    userAnswer={exerciseAnswers[currentExercise.id]}
                  />
                )}

                {completedExercises.size === lesson.content.practicalExercises.length && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 p-4 rounded-lg text-center"
                  >
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-semibold text-green-900 mb-2">Leçon terminée !</h4>
                    <p className="text-green-800 text-sm mb-3">
                      Félicitations ! Vous avez gagné : {lesson.completionReward}
                    </p>
                    
                    {/* Prochaines étapes */}
                    <div className="bg-white p-3 rounded-lg mt-3">
                      <h5 className="font-medium text-gray-900 mb-2">Prochaines étapes</h5>
                      <ul className="text-left space-y-1">
                        {lesson.content.nextSteps.map((step, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

// Composant pour les exercices
interface ExerciseComponentProps {
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  onComplete: () => void;
  userAnswer?: string;
}

const ExerciseComponent: React.FC<ExerciseComponentProps> = ({
  exercise,
  onAnswer,
  onComplete,
  userAnswer
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(userAnswer || '');

  const handleSubmit = () => {
    onAnswer(selectedAnswer);
    setShowExplanation(true);
    setTimeout(() => {
      onComplete();
      setShowExplanation(false);
    }, 3000);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-2">{exercise.title}</h4>
      <p className="text-gray-700 text-sm mb-3">{exercise.description}</p>
      <p className="text-gray-800 font-medium mb-4">{exercise.question}</p>

      {exercise.type === 'scenario' && exercise.options && (
        <div className="space-y-2 mb-4">
          {exercise.options.map((option, index) => (
            <label key={index} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name={exercise.id}
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                className="mt-1"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {exercise.type === 'reflection' && (
        <textarea
          value={selectedAnswer}
          onChange={(e) => setSelectedAnswer(e.target.value)}
          placeholder="Partagez votre réflexion..."
          className="w-full p-3 border border-gray-300 rounded-lg text-sm mb-4"
          rows={3}
        />
      )}

      {exercise.type === 'calculation' && (
        <input
          type="text"
          value={selectedAnswer}
          onChange={(e) => setSelectedAnswer(e.target.value)}
          placeholder="Votre réponse..."
          className="w-full p-3 border border-gray-300 rounded-lg text-sm mb-4"
        />
      )}

      {!showExplanation ? (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Valider la réponse
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 p-3 rounded-lg"
        >
          <h5 className="font-medium text-blue-900 mb-2">Explication</h5>
          <p className="text-blue-800 text-sm">{exercise.explanation}</p>
          {exercise.correctAnswer && selectedAnswer === exercise.correctAnswer && (
            <div className="flex items-center mt-2 text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Bonne réponse !</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PersonalizedLessonCard;