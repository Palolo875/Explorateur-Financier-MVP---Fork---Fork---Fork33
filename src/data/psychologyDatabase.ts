import { CognitiveBias, PsychologicalFact, Quote, PsychologyKnowledgeBase } from '../types/psychology';

export const cognitiveBiases: CognitiveBias[] = [
  {
    id: 'anchoring-bias',
    name: 'Biais d\'ancrage',
    category: 'decision',
    definition: 'Tendance à s\'appuyer trop fortement sur la première information reçue (l\'ancre) lors de la prise de décision.',
    financialExplanation: 'En finance, ce biais vous fait focaliser sur un prix initial ou une valeur de référence, vous empêchant d\'évaluer objectivement la vraie valeur d\'un achat ou investissement.',
    commonTriggers: ['Prix barrés', 'Promotions "avant/après"', 'Prix de référence mentionnés', 'Première offre reçue'],
    counterStrategies: [
      'Recherchez plusieurs sources de prix avant d\'acheter',
      'Ignorez le prix initial et concentrez-vous sur la valeur réelle',
      'Utilisez une liste de critères objectifs pour évaluer',
      'Attendez 24h avant tout achat important'
    ],
    examples: [
      'Acheter un produit "soldé" à 50€ au lieu de 100€ sans vérifier si 50€ est un prix raisonnable',
      'Accepter une offre de prêt parce que le taux semble bon par rapport au premier taux mentionné'
    ],
    scientificReferences: [
      {
        title: 'Judgment Under Uncertainty: Heuristics and Biases',
        authors: ['Amos Tversky', 'Daniel Kahneman'],
        journal: 'Science',
        year: 1974,
        doi: '10.1126/science.185.4157.1124',
        summary: 'Étude fondatrice démontrant l\'impact de l\'ancrage sur les jugements humains'
      }
    ],
    severity: 'high',
    keywords: ['ancrage', 'prix', 'référence', 'première impression', 'négociation']
  },
  {
    id: 'loss-aversion',
    name: 'Aversion à la perte',
    category: 'emotional',
    definition: 'Tendance à préférer éviter les pertes plutôt qu\'à acquérir des gains équivalents. Une perte de 100€ est ressentie plus intensément qu\'un gain de 100€.',
    financialExplanation: 'Ce biais vous pousse à prendre des décisions financières irrationnelles : garder des investissements perdants trop longtemps, éviter des opportunités d\'investissement, ou payer des assurances excessives.',
    commonTriggers: ['Investissements en perte', 'Changement de fournisseur', 'Nouveaux placements', 'Renégociation de contrats'],
    counterStrategies: [
      'Définissez des règles de stop-loss à l\'avance',
      'Concentrez-vous sur les gains potentiels, pas les pertes',
      'Utilisez la comptabilité mentale pour séparer les décisions',
      'Calculez le coût d\'opportunité de l\'inaction'
    ],
    examples: [
      'Garder des actions qui perdent de la valeur en espérant qu\'elles remontent',
      'Refuser de changer de banque malgré des frais plus élevés'
    ],
    scientificReferences: [
      {
        title: 'Prospect Theory: An Analysis of Decision under Risk',
        authors: ['Daniel Kahneman', 'Amos Tversky'],
        journal: 'Econometrica',
        year: 1979,
        doi: '10.2307/1914185',
        summary: 'Théorie révolutionnaire expliquant pourquoi nous ressentons les pertes plus intensément que les gains'
      }
    ],
    severity: 'high',
    keywords: ['perte', 'gain', 'risque', 'investissement', 'changement']
  },
  {
    id: 'confirmation-bias',
    name: 'Biais de confirmation',
    category: 'perception',
    definition: 'Tendance à rechercher, interpréter et mémoriser les informations qui confirment nos croyances préexistantes.',
    financialExplanation: 'Vous cherchez uniquement les informations qui valident vos décisions financières actuelles, ignorant les signaux d\'alarme ou les opportunités alternatives.',
    commonTriggers: ['Recherche d\'informations', 'Validation de décisions', 'Choix d\'experts', 'Sélection de sources'],
    counterStrategies: [
      'Cherchez activement des opinions contraires',
      'Consultez des sources diversifiées',
      'Jouez l\'avocat du diable avec vos propres décisions',
      'Utilisez des critères objectifs prédéfinis'
    ],
    examples: [
      'Ne lire que les articles positifs sur un investissement que vous possédez',
      'Choisir un conseiller financier qui confirme vos idées préconçues'
    ],
    scientificReferences: [
      {
        title: 'The Confirmation Bias: A Ubiquitous Phenomenon in Many Guises',
        authors: ['Raymond Nickerson'],
        journal: 'Review of General Psychology',
        year: 1998,
        doi: '10.1037/1089-2680.2.2.175',
        summary: 'Revue complète du biais de confirmation et de ses manifestations dans différents domaines'
      }
    ],
    severity: 'medium',
    keywords: ['confirmation', 'croyance', 'information', 'validation', 'objectivité']
  },
  {
    id: 'present-bias',
    name: 'Biais du présent',
    category: 'decision',
    definition: 'Tendance à surévaluer les récompenses immédiates par rapport aux récompenses futures, même si ces dernières sont objectivement plus importantes.',
    financialExplanation: 'Ce biais vous pousse à privilégier la gratification immédiate : dépenser maintenant plutôt qu\'épargner, éviter les investissements à long terme, ou reporter les décisions financières importantes.',
    commonTriggers: ['Achats impulsifs', 'Épargne vs dépense', 'Investissements long terme', 'Remboursement de dettes'],
    counterStrategies: [
      'Automatisez vos épargnes et investissements',
      'Visualisez concrètement vos objectifs futurs',
      'Utilisez la règle des 24h pour les achats importants',
      'Calculez la valeur future de vos économies'
    ],
    examples: [
      'Acheter un gadget à 200€ au lieu d\'épargner pour les vacances',
      'Reporter l\'ouverture d\'un plan retraite'
    ],
    scientificReferences: [
      {
        title: 'Golden Eggs and Hyperbolic Discounting',
        authors: ['David Laibson'],
        journal: 'Quarterly Journal of Economics',
        year: 1997,
        doi: '10.1162/003355397555253',
        summary: 'Analyse de la préférence temporelle et son impact sur les décisions d\'épargne'
      }
    ],
    severity: 'high',
    keywords: ['présent', 'futur', 'gratification', 'épargne', 'investissement']
  },
  {
    id: 'endowment-effect',
    name: 'Effet de dotation',
    category: 'emotional',
    definition: 'Tendance à surévaluer un objet que l\'on possède par rapport à sa valeur objective sur le marché.',
    financialExplanation: 'Vous attachez une valeur émotionnelle excessive à vos biens, vous empêchant de prendre des décisions rationnelles de vente ou d\'échange.',
    commonTriggers: ['Vente de biens', 'Échange d\'investissements', 'Déménagement', 'Optimisation fiscale'],
    counterStrategies: [
      'Évaluez vos biens comme si vous deviez les racheter aujourd\'hui',
      'Concentrez-vous sur l\'utilité réelle, pas la valeur sentimentale',
      'Utilisez des outils d\'évaluation objectifs',
      'Considérez le coût d\'opportunité'
    ],
    examples: [
      'Refuser de vendre sa voiture à sa juste valeur marchande',
      'Garder des actions héritées malgré de meilleures opportunités'
    ],
    scientificReferences: [
      {
        title: 'Experimental Tests of the Endowment Effect and the Coase Theorem',
        authors: ['Daniel Kahneman', 'Jack Knetsch', 'Richard Thaler'],
        journal: 'Journal of Political Economy',
        year: 1990,
        doi: '10.1086/261737',
        summary: 'Démonstration expérimentale de l\'effet de dotation et ses implications économiques'
      }
    ],
    severity: 'medium',
    keywords: ['possession', 'valeur', 'attachement', 'vente', 'objectivité']
  }
];

export const psychologicalFacts: PsychologicalFact[] = [
  {
    id: 'money-stress-correlation',
    title: 'L\'argent est la première cause de stress',
    category: 'emotional_finance',
    description: 'Les études montrent que les préoccupations financières sont la principale source de stress chez 64% des adultes, dépassant le travail, la santé et les relations.',
    financialImplication: 'Le stress financier altère votre capacité de prise de décision, vous poussant vers des choix irrationnels et court-termistes.',
    practicalApplication: 'Créez un fonds d\'urgence et un budget clair pour réduire l\'anxiété financière et améliorer vos décisions.',
    scientificReferences: [
      {
        title: 'Financial Stress and Its Physical Effects on Individuals and Communities',
        authors: ['American Psychological Association'],
        year: 2023,
        url: 'https://www.apa.org/science/about/psa/2023/01/financial-stress',
        summary: 'Rapport détaillé sur l\'impact du stress financier sur la santé physique et mentale'
      }
    ],
    relatedBiases: ['present-bias', 'loss-aversion'],
    keywords: ['stress', 'anxiété', 'décision', 'santé', 'urgence']
  },
  {
    id: 'compound-interest-psychology',
    title: 'Notre cerveau sous-estime les intérêts composés',
    category: 'neuroeconomics',
    description: 'Les humains ont naturellement du mal à comprendre la croissance exponentielle. Nous sous-estimons systématiquement le pouvoir des intérêts composés sur le long terme.',
    financialImplication: 'Cette limitation cognitive nous fait reporter l\'épargne et sous-investir pour la retraite, perdant des années de croissance potentielle.',
    practicalApplication: 'Utilisez des calculateurs visuels et automatisez vos investissements pour contourner cette limitation naturelle.',
    scientificReferences: [
      {
        title: 'Exponential Growth Bias and Household Finance',
        authors: ['Matthew Levy', 'Joshua Tasoff'],
        journal: 'Journal of Finance',
        year: 2016,
        doi: '10.1111/jofi.12498',
        summary: 'Étude démontrant comment la sous-estimation de la croissance exponentielle affecte les décisions financières'
      }
    ],
    relatedBiases: ['present-bias'],
    keywords: ['intérêts composés', 'croissance', 'épargne', 'retraite', 'temps']
  },
  {
    id: 'emotional-spending-triggers',
    title: 'Les émotions déclenchent 70% des achats impulsifs',
    category: 'behavioral_finance',
    description: 'La recherche montre que la majorité des achats impulsifs sont déclenchés par des états émotionnels : stress, tristesse, excitation, ou ennui.',
    financialImplication: 'Comprendre vos déclencheurs émotionnels peut vous aider à éviter des dépenses non planifiées qui sabotent votre budget.',
    practicalApplication: 'Tenez un journal émotionnel de vos dépenses et mettez en place des stratégies alternatives pour gérer vos émotions.',
    scientificReferences: [
      {
        title: 'Emotion and Consumer Behavior',
        authors: ['Rajagopal Raghunathan', 'Michel Pham', 'Kim Corfman'],
        journal: 'Journal of Consumer Psychology',
        year: 2006,
        doi: '10.1207/s15327663jcp1601_2',
        summary: 'Analyse de l\'impact des émotions sur les comportements de consommation'
      }
    ],
    relatedBiases: ['present-bias'],
    keywords: ['émotion', 'impulsif', 'achat', 'stress', 'budget']
  }
];

export const quotes: Quote[] = [
  {
    id: 'buffett-compound',
    text: 'L\'intérêt composé est la huitième merveille du monde. Celui qui le comprend le gagne, celui qui ne le comprend pas le paie.',
    author: 'Warren Buffett',
    authorDescription: 'Investisseur légendaire et PDG de Berkshire Hathaway',
    category: 'investment',
    context: 'Lors de discussions sur l\'épargne à long terme et les investissements',
    relatedConcepts: ['intérêts composés', 'épargne', 'investissement', 'temps'],
    source: 'Diverses interviews'
  },
  {
    id: 'kahneman-blindness',
    text: 'Nous sommes aveugles à notre propre cécité. Nous avons très peu conscience de notre ignorance.',
    author: 'Daniel Kahneman',
    authorDescription: 'Psychologue et prix Nobel d\'économie',
    category: 'psychology',
    context: 'Quand l\'utilisateur découvre un biais cognitif dans son comportement',
    relatedConcepts: ['biais cognitifs', 'conscience de soi', 'métacognition'],
    source: 'Thinking, Fast and Slow',
    year: 2011
  },
  {
    id: 'wilde-price-value',
    text: 'Il connaît le prix de tout et la valeur de rien.',
    author: 'Oscar Wilde',
    authorDescription: 'Écrivain et dramaturge irlandais',
    category: 'wisdom',
    context: 'Lors d\'analyses de dépenses montrant une focalisation excessive sur les prix',
    relatedConcepts: ['valeur', 'prix', 'consumérisme'],
    source: 'Lady Windermere\'s Fan',
    year: 1892
  },
  {
    id: 'thaler-nudge',
    text: 'Un petit coup de pouce peut parfois avoir un impact énorme sur nos décisions.',
    author: 'Richard Thaler',
    authorDescription: 'Économiste comportemental et prix Nobel d\'économie',
    category: 'psychology',
    context: 'Lors de suggestions d\'amélioration des habitudes financières',
    relatedConcepts: ['nudge', 'architecture de choix', 'habitudes'],
    source: 'Nudge',
    year: 2008
  },
  {
    id: 'franklin-investment',
    text: 'Un investissement dans la connaissance paie les meilleurs intérêts.',
    author: 'Benjamin Franklin',
    authorDescription: 'Père fondateur des États-Unis et polymathe',
    category: 'wisdom',
    context: 'Lors de recommandations d\'apprentissage financier',
    relatedConcepts: ['éducation', 'connaissance', 'investissement personnel'],
    source: 'Poor Richard\'s Almanack'
  },
  {
    id: 'einstein-compound',
    text: 'L\'intérêt composé est la force la plus puissante de l\'univers.',
    author: 'Albert Einstein',
    authorDescription: 'Physicien théoricien',
    category: 'investment',
    context: 'Pour motiver l\'épargne à long terme',
    relatedConcepts: ['intérêts composés', 'épargne', 'temps'],
    source: 'Citation attribuée (authenticité débattue)'
  }
];

export const psychologyKnowledgeBase: PsychologyKnowledgeBase = {
  biases: cognitiveBiases,
  facts: psychologicalFacts,
  quotes: quotes,
  lastUpdated: new Date(),
  version: '1.0.0'
};

// Fonctions utilitaires pour rechercher dans la base de connaissances
export const findBiasByKeyword = (keyword: string): CognitiveBias[] => {
  return cognitiveBiases.filter(bias => 
    bias.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase())) ||
    bias.name.toLowerCase().includes(keyword.toLowerCase()) ||
    bias.definition.toLowerCase().includes(keyword.toLowerCase())
  );
};

export const findFactsByCategory = (category: PsychologicalFact['category']): PsychologicalFact[] => {
  return psychologicalFacts.filter(fact => fact.category === category);
};

export const findQuotesByContext = (context: string): Quote[] => {
  return quotes.filter(quote => 
    quote.context.toLowerCase().includes(context.toLowerCase()) ||
    quote.relatedConcepts.some(concept => concept.toLowerCase().includes(context.toLowerCase()))
  );
};

export const getBiasById = (id: string): CognitiveBias | undefined => {
  return cognitiveBiases.find(bias => bias.id === id);
};

export const getFactById = (id: string): PsychologicalFact | undefined => {
  return psychologicalFacts.find(fact => fact.id === id);
};

export const getQuoteById = (id: string): Quote | undefined => {
  return quotes.find(quote => quote.id === id);
};