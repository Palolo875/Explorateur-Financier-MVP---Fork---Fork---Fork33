import { BiasDetectionResult, PsychologicalInsight } from '../types/psychology';
import { getBiasById, getFactById } from '../data/psychologyDatabase';

export interface PersonalizedLesson {
  id: string;
  title: string;
  description: string;
  category: 'psychology' | 'bias-management' | 'behavioral-finance' | 'decision-making';
  level: 'débutant' | 'intermédiaire' | 'avancé';
  duration: number; // minutes
  content: LessonContent;
  relatedBias?: string;
  personalizedReason: string;
  priority: number; // 1-10
  completionReward: string;
}

export interface LessonContent {
  introduction: string;
  mainPoints: string[];
  practicalExercises: Exercise[];
  keyTakeaways: string[];
  scientificBasis: string;
  nextSteps: string[];
}

export interface Exercise {
  id: string;
  type: 'reflection' | 'scenario' | 'calculation' | 'decision-tree';
  title: string;
  description: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation: string;
}

export class PersonalizedLessonsService {
  private static instance: PersonalizedLessonsService;

  public static getInstance(): PersonalizedLessonsService {
    if (!PersonalizedLessonsService.instance) {
      PersonalizedLessonsService.instance = new PersonalizedLessonsService();
    }
    return PersonalizedLessonsService.instance;
  }

  // Générer des leçons personnalisées basées sur les biais détectés
  public generatePersonalizedLessons(
    detectedBiases: BiasDetectionResult[],
    psychologicalInsights: PsychologicalInsight[]
  ): PersonalizedLesson[] {
    const lessons: PersonalizedLesson[] = [];

    // Générer des leçons pour chaque biais détecté
    for (const biasResult of detectedBiases) {
      const bias = getBiasById(biasResult.biasId);
      if (!bias) continue;

      const lesson = this.createBiasLesson(bias, biasResult);
      if (lesson) lessons.push(lesson);
    }

    // Ajouter des leçons générales basées sur les insights psychologiques
    const generalLessons = this.createGeneralPsychologyLessons(psychologicalInsights);
    lessons.push(...generalLessons);

    // Trier par priorité
    return lessons.sort((a, b) => b.priority - a.priority);
  }

  // Créer une leçon spécifique à un biais
  private createBiasLesson(bias: any, biasResult: BiasDetectionResult): PersonalizedLesson {
    const lessonTemplates = {
      'anchoring-bias': {
        title: 'Maîtriser le biais d\'ancrage dans vos décisions financières',
        description: 'Apprenez à identifier et contrer votre tendance à vous fixer sur les premiers prix ou informations reçus.',
        content: {
          introduction: `Vous avez montré une tendance au biais d'ancrage avec ${Math.round(biasResult.confidence * 100)}% de confiance. Ce biais vous fait vous accrocher à la première information reçue, souvent un prix ou une valeur de référence, influençant toutes vos décisions suivantes.`,
          mainPoints: [
            'Le biais d\'ancrage nous fait surévaluer la première information reçue',
            'En finance, cela se manifeste par une fixation sur les prix initiaux',
            'Ce biais peut vous coûter de l\'argent en vous empêchant de négocier',
            'La prise de conscience est la première étape pour le contrer'
          ],
          practicalExercises: [
            {
              id: 'anchoring-exercise-1',
              type: 'scenario',
              title: 'Scénario d\'achat immobilier',
              description: 'Vous visitez un appartement affiché à 300 000€',
              question: 'Quelle devrait être votre première action avant de faire une offre ?',
              options: [
                'Faire une offre à 280 000€ (7% de moins)',
                'Rechercher les prix du marché dans le quartier',
                'Demander pourquoi ce prix spécifique',
                'Accepter le prix affiché'
              ],
              correctAnswer: 'Rechercher les prix du marché dans le quartier',
              explanation: 'Avant de vous laisser influencer par le prix d\'ancrage, recherchez toujours des comparables pour établir la vraie valeur marchande.'
            }
          ],
          keyTakeaways: [
            'Toujours rechercher plusieurs sources de prix',
            'Ignorer consciemment le prix initial mentionné',
            'Établir vos propres critères de valeur',
            'Prendre du recul avant toute décision importante'
          ],
          scientificBasis: 'Les études de Kahneman et Tversky (1974) ont démontré que même des ancres totalement arbitraires influencent nos jugements de valeur.',
          nextSteps: [
            'Créez une checklist anti-ancrage pour vos achats',
            'Pratiquez la recherche comparative systématique',
            'Développez votre sens critique des prix'
          ]
        },
        priority: Math.round(biasResult.confidence * 10)
      },
      'loss-aversion': {
        title: 'Surmonter l\'aversion à la perte pour optimiser vos finances',
        description: 'Comprenez pourquoi vous ressentez les pertes plus intensément que les gains et comment cela affecte vos décisions.',
        content: {
          introduction: `Votre profil montre une aversion à la perte détectée avec ${Math.round(biasResult.confidence * 100)}% de confiance. Cette tendance naturelle vous fait éviter les risques même quand ils sont justifiés financièrement.`,
          mainPoints: [
            'Les pertes sont ressenties 2x plus intensément que les gains équivalents',
            'Cette aversion peut vous faire manquer des opportunités d\'investissement',
            'Elle explique pourquoi vous gardez des investissements perdants',
            'Un peu de risque calculé est nécessaire pour faire fructifier son argent'
          ],
          practicalExercises: [
            {
              id: 'loss-aversion-exercise-1',
              type: 'reflection',
              title: 'Analyse de votre portefeuille',
              description: 'Réfléchissez à vos investissements actuels',
              question: 'Avez-vous des investissements en perte que vous gardez en espérant qu\'ils remontent ?',
              explanation: 'C\'est un signe classique d\'aversion à la perte. Parfois, il vaut mieux accepter une petite perte pour éviter une plus grande.'
            }
          ],
          keyTakeaways: [
            'Définir des règles de stop-loss à l\'avance',
            'Se concentrer sur les gains potentiels à long terme',
            'Diversifier pour réduire l\'impact émotionnel des pertes',
            'Calculer le coût d\'opportunité de l\'inaction'
          ],
          scientificBasis: 'La théorie des perspectives de Kahneman et Tversky (1979) a révolutionné notre compréhension de la prise de décision sous incertitude.',
          nextSteps: [
            'Établissez des règles d\'investissement objectives',
            'Pratiquez la visualisation des gains futurs',
            'Consultez un conseiller pour une perspective externe'
          ]
        },
        priority: Math.round(biasResult.confidence * 10)
      },
      'present-bias': {
        title: 'Vaincre la procrastination financière et le biais du présent',
        description: 'Apprenez à privilégier vos objectifs à long terme malgré la tentation de la gratification immédiate.',
        content: {
          introduction: `Votre comportement révèle un biais du présent avec ${Math.round(biasResult.confidence * 100)}% de confiance. Vous avez tendance à privilégier les plaisirs immédiats au détriment de vos objectifs financiers futurs.`,
          mainPoints: [
            'Notre cerveau surestime la valeur des récompenses immédiates',
            'Ce biais explique pourquoi épargner est si difficile',
            'Il nous fait reporter les décisions financières importantes',
            'L\'automatisation peut contourner ce biais naturel'
          ],
          practicalExercises: [
            {
              id: 'present-bias-exercise-1',
              type: 'calculation',
              title: 'Le coût de la gratification immédiate',
              description: 'Calculez l\'impact de vos achats impulsifs',
              question: 'Si vous dépensez 50€/mois en achats impulsifs, combien cela représente-t-il investi à 5% sur 20 ans ?',
              correctAnswer: '20 549€',
              explanation: '50€/mois pendant 20 ans à 5% = 20 549€. Votre café quotidien pourrait financer une partie de votre retraite !'
            }
          ],
          keyTakeaways: [
            'Automatiser l\'épargne pour contourner la tentation',
            'Visualiser concrètement vos objectifs futurs',
            'Utiliser la règle des 24h pour les achats importants',
            'Calculer le coût d\'opportunité de vos dépenses'
          ],
          scientificBasis: 'Les recherches de David Laibson sur l\'actualisation hyperbolique montrent pourquoi nous privilégions le présent.',
          nextSteps: [
            'Mettez en place des virements automatiques',
            'Créez un tableau de visualisation de vos objectifs',
            'Utilisez des applications de contrôle des dépenses'
          ]
        },
        priority: Math.round(biasResult.confidence * 10)
      }
    };

    const template = lessonTemplates[biasResult.biasId as keyof typeof lessonTemplates];
    if (!template) return null;

    return {
      id: `lesson-${biasResult.biasId}-${Date.now()}`,
      title: template.title,
      description: template.description,
      category: 'bias-management',
      level: 'intermédiaire',
      duration: 15,
      content: template.content,
      relatedBias: biasResult.biasId,
      personalizedReason: `Cette leçon a été générée spécifiquement pour vous car nous avons détecté ce biais dans votre comportement financier avec ${Math.round(biasResult.confidence * 100)}% de confiance.`,
      priority: template.priority,
      completionReward: `+10 points de compréhension psychologique`
    };
  }

  // Créer des leçons générales de psychologie financière
  private createGeneralPsychologyLessons(insights: PsychologicalInsight[]): PersonalizedLesson[] {
    const lessons: PersonalizedLesson[] = [];

    // Leçon sur les émotions et l'argent
    if (insights.some(i => i.type === 'fact' && i.contentId === 'emotional-spending-triggers')) {
      lessons.push({
        id: 'lesson-emotional-spending',
        title: 'Maîtriser ses émotions face à l\'argent',
        description: 'Comprenez comment vos émotions influencent vos décisions financières et apprenez à les gérer.',
        category: 'behavioral-finance',
        level: 'débutant',
        duration: 12,
        content: {
          introduction: 'Vos données suggèrent que vos émotions influencent vos dépenses. Apprenons à reconnaître et gérer ces déclencheurs émotionnels.',
          mainPoints: [
            '70% des achats impulsifs sont déclenchés par des émotions',
            'Le stress, la tristesse et l\'ennui sont des déclencheurs majeurs',
            'Comprendre ses émotions permet de mieux contrôler ses dépenses',
            'Il existe des stratégies simples pour gérer l\'achat émotionnel'
          ],
          practicalExercises: [
            {
              id: 'emotional-exercise-1',
              type: 'reflection',
              title: 'Journal émotionnel des dépenses',
              description: 'Identifiez vos déclencheurs personnels',
              question: 'Quand avez-vous fait votre dernier achat impulsif ? Quelle émotion ressentiez-vous ?',
              explanation: 'Tenir un journal émotionnel vous aide à identifier vos patterns et à développer des stratégies alternatives.'
            }
          ],
          keyTakeaways: [
            'Pausez avant tout achat non planifié',
            'Identifiez l\'émotion derrière l\'envie d\'acheter',
            'Développez des alternatives non financières',
            'Créez un budget "plaisir" pour les achats émotionnels'
          ],
          scientificBasis: 'Les recherches en neuroéconomie montrent que les décisions d\'achat activent les mêmes circuits cérébraux que les addictions.',
          nextSteps: [
            'Commencez un journal émotionnel des dépenses',
            'Identifiez 3 activités alternatives gratuites',
            'Mettez en place une règle de pause de 24h'
          ]
        },
        personalizedReason: 'Cette leçon vous est recommandée car votre profil montre des signes d\'achats émotionnels.',
        priority: 7,
        completionReward: '+5 points de self-control financier'
      });
    }

    // Leçon sur les intérêts composés
    if (insights.some(i => i.type === 'fact' && i.contentId === 'compound-interest-psychology')) {
      lessons.push({
        id: 'lesson-compound-interest',
        title: 'La magie des intérêts composés expliquée simplement',
        description: 'Découvrez pourquoi Einstein appelait les intérêts composés "la force la plus puissante de l\'univers".',
        category: 'behavioral-finance',
        level: 'débutant',
        duration: 10,
        content: {
          introduction: 'Votre profil suggère que vous pourriez bénéficier d\'une meilleure compréhension des intérêts composés pour optimiser votre épargne.',
          mainPoints: [
            'Les intérêts composés font que votre argent travaille pour vous',
            'Commencer tôt fait une différence énorme',
            'Même de petites sommes peuvent devenir importantes',
            'La régularité est plus importante que les gros montants'
          ],
          practicalExercises: [
            {
              id: 'compound-exercise-1',
              type: 'calculation',
              title: 'Calculez votre potentiel',
              description: 'Voyez l\'impact du temps sur vos économies',
              question: 'Combien vaut 100€/mois pendant 30 ans à 7% d\'intérêt annuel ?',
              correctAnswer: '121 997€',
              explanation: 'En 30 ans, vous aurez versé 36 000€ mais récupéré 121 997€. Les 85 997€ de différence, c\'est la magie des intérêts composés !'
            }
          ],
          keyTakeaways: [
            'Commencez à épargner le plus tôt possible',
            'La régularité bat les gros montants occasionnels',
            'Réinvestissez toujours vos gains',
            'Le temps est votre meilleur allié financier'
          ],
          scientificBasis: 'Les études comportementales montrent que nous sous-estimons systématiquement la croissance exponentielle.',
          nextSteps: [
            'Ouvrez un compte d\'épargne automatique',
            'Calculez vos objectifs avec un simulateur',
            'Augmentez progressivement vos versements'
          ]
        },
        personalizedReason: 'Cette leçon vous aidera à mieux comprendre le potentiel de croissance de votre épargne.',
        priority: 6,
        completionReward: '+10 points de vision long terme'
      });
    }

    return lessons;
  }

  // Marquer une leçon comme terminée
  public markLessonCompleted(lessonId: string): void {
    // Dans une vraie application, ceci serait sauvegardé
    console.log(`Leçon ${lessonId} marquée comme terminée`);
  }

  // Obtenir les leçons recommandées pour un utilisateur
  public getRecommendedLessons(
    detectedBiases: BiasDetectionResult[],
    psychologicalInsights: PsychologicalInsight[],
    completedLessons: string[] = []
  ): PersonalizedLesson[] {
    const allLessons = this.generatePersonalizedLessons(detectedBiases, psychologicalInsights);
    
    // Filtrer les leçons déjà terminées
    const availableLessons = allLessons.filter(lesson => 
      !completedLessons.includes(lesson.id)
    );

    // Retourner les 5 leçons les plus prioritaires
    return availableLessons.slice(0, 5);
  }
}