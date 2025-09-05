import { Post } from '../types';

export const samplePosts: Post[] = [
  {
    id: 'intro-machine-learning',
    title: 'Introduction to Machine Learning',
    description: 'A comprehensive overview of machine learning fundamentals, covering supervised and unsupervised learning approaches.',
    content: 'Machine learning is a subset of artificial intelligence that focuses on creating algorithms that can learn and make decisions from data...',
    timestamp: new Date('2024-01-15'),
    author: 'Dr. Sarah Chen',
    tags: ['machine-learning', 'ai', 'fundamentals'],
    difficulty_level: 'beginner',
    estimated_read_time: 12,
    related_topics: ['neural-networks', 'data-science', 'statistics'],
    prerequisites: ['basic-statistics', 'python-programming'],
    follow_ups: ['deep-learning-basics', 'supervised-learning'],
    category: 'AI/ML'
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks Demystified',
    description: 'Understanding the building blocks of neural networks, from perceptrons to multi-layer architectures.',
    content: 'Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes...',
    timestamp: new Date('2024-01-20'),
    author: 'Prof. Michael Rodriguez',
    tags: ['neural-networks', 'deep-learning', 'ai'],
    difficulty_level: 'intermediate',
    estimated_read_time: 18,
    related_topics: ['intro-machine-learning', 'backpropagation', 'activation-functions'],
    prerequisites: ['intro-machine-learning', 'linear-algebra'],
    follow_ups: ['deep-learning-basics', 'convolutional-networks'],
    category: 'AI/ML'
  },
  {
    id: 'deep-learning-basics',
    title: 'Deep Learning Fundamentals',
    description: 'Exploring deep neural networks, their architecture, and applications in modern AI systems.',
    content: 'Deep learning extends neural networks with multiple hidden layers, enabling the learning of complex patterns...',
    timestamp: new Date('2024-01-25'),
    author: 'Dr. Emily Watson',
    tags: ['deep-learning', 'neural-networks', 'ai'],
    difficulty_level: 'intermediate',
    estimated_read_time: 22,
    related_topics: ['neural-networks', 'convolutional-networks', 'transformer-models'],
    prerequisites: ['neural-networks', 'calculus'],
    follow_ups: ['convolutional-networks', 'recurrent-networks'],
    category: 'AI/ML'
  },
  {
    id: 'data-science',
    title: 'Data Science Methodology',
    description: 'A systematic approach to data science projects, from problem definition to deployment.',
    content: 'Data science combines domain expertise, programming skills, and statistical knowledge to extract insights...',
    timestamp: new Date('2024-01-10'),
    author: 'Dr. James Liu',
    tags: ['data-science', 'methodology', 'analytics'],
    difficulty_level: 'beginner',
    estimated_read_time: 15,
    related_topics: ['intro-machine-learning', 'statistics', 'data-visualization'],
    prerequisites: ['basic-statistics', 'python-programming'],
    follow_ups: ['exploratory-data-analysis', 'feature-engineering'],
    category: 'Data Science'
  },
  {
    id: 'convolutional-networks',
    title: 'Convolutional Neural Networks',
    description: 'Understanding CNNs and their applications in computer vision and image processing.',
    content: 'Convolutional Neural Networks (CNNs) are specialized neural networks designed for processing grid-like data...',
    timestamp: new Date('2024-02-01'),
    author: 'Dr. Lisa Park',
    tags: ['cnn', 'computer-vision', 'deep-learning'],
    difficulty_level: 'advanced',
    estimated_read_time: 25,
    related_topics: ['deep-learning-basics', 'image-processing', 'feature-maps'],
    prerequisites: ['deep-learning-basics', 'linear-algebra'],
    follow_ups: ['object-detection', 'image-segmentation'],
    category: 'Computer Vision'
  },
  {
    id: 'transformer-models',
    title: 'Transformer Architecture',
    description: 'The revolutionary transformer model that changed natural language processing and beyond.',
    content: 'Transformers introduced the attention mechanism, revolutionizing how we approach sequence-to-sequence tasks...',
    timestamp: new Date('2024-02-05'),
    author: 'Dr. Alex Kumar',
    tags: ['transformers', 'attention', 'nlp'],
    difficulty_level: 'advanced',
    estimated_read_time: 30,
    related_topics: ['attention-mechanism', 'language-models', 'deep-learning-basics'],
    prerequisites: ['deep-learning-basics', 'recurrent-networks'],
    follow_ups: ['bert-models', 'gpt-architecture'],
    category: 'NLP'
  },
  {
    id: 'statistics',
    title: 'Statistical Foundations',
    description: 'Essential statistical concepts for data science and machine learning applications.',
    content: 'Statistics provides the mathematical foundation for understanding data, uncertainty, and inference...',
    timestamp: new Date('2024-01-05'),
    author: 'Prof. Rachel Green',
    tags: ['statistics', 'probability', 'inference'],
    difficulty_level: 'beginner',
    estimated_read_time: 20,
    related_topics: ['probability-theory', 'hypothesis-testing', 'regression-analysis'],
    prerequisites: ['basic-mathematics'],
    follow_ups: ['bayesian-statistics', 'statistical-modeling'],
    category: 'Statistics'
  },
  {
    id: 'python-programming',
    title: 'Python for Data Science',
    description: 'Essential Python programming skills for data science and machine learning projects.',
    content: 'Python has become the de facto language for data science due to its simplicity and powerful libraries...',
    timestamp: new Date('2024-01-01'),
    author: 'John Smith',
    tags: ['python', 'programming', 'data-science'],
    difficulty_level: 'beginner',
    estimated_read_time: 16,
    related_topics: ['pandas', 'numpy', 'matplotlib'],
    prerequisites: ['basic-programming'],
    follow_ups: ['advanced-python', 'data-manipulation'],
    category: 'Programming'
  }
];

// Helper function to generate knowledge graph from posts
export const generateKnowledgeGraph = (posts: Post[], selectedPostId: string) => {
  const selectedPost = posts.find(p => p.id === selectedPostId);
  if (!selectedPost) return { nodes: [], links: [] };

  const nodes: any[] = [];
  const links: any[] = [];

  // Add the central node (selected post)
  nodes.push({
    id: selectedPost.id,
    title: selectedPost.title,
    snippet: selectedPost.description,
    type: 'post',
    difficulty_level: selectedPost.difficulty_level,
    size: 40,
    category: selectedPost.category,
    x: 0,
    y: 0
  });

  // Add prerequisite nodes
  selectedPost.prerequisites.forEach((prereqId, index) => {
    const prereqPost = posts.find(p => p.id === prereqId);
    if (prereqPost) {
      nodes.push({
        id: prereqId,
        title: prereqPost.title,
        snippet: prereqPost.description,
        type: 'prerequisite',
        difficulty_level: prereqPost.difficulty_level,
        size: 25,
        category: prereqPost.category
      });
      links.push({
        source: prereqId,
        target: selectedPost.id,
        relationship: 'prerequisite',
        strength: 0.8
      });
    } else {
      // Create concept node for missing prerequisites
      nodes.push({
        id: prereqId,
        title: prereqId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        snippet: `Prerequisite concept: ${prereqId}`,
        type: 'concept',
        difficulty_level: 'beginner',
        size: 20,
        category: 'Concept'
      });
      links.push({
        source: prereqId,
        target: selectedPost.id,
        relationship: 'prerequisite',
        strength: 0.6
      });
    }
  });

  // Add related topic nodes
  selectedPost.related_topics.forEach((relatedId) => {
    const relatedPost = posts.find(p => p.id === relatedId);
    if (relatedPost && !nodes.find(n => n.id === relatedId)) {
      nodes.push({
        id: relatedId,
        title: relatedPost.title,
        snippet: relatedPost.description,
        type: 'post',
        difficulty_level: relatedPost.difficulty_level,
        size: 30,
        category: relatedPost.category
      });
      links.push({
        source: selectedPost.id,
        target: relatedId,
        relationship: 'related',
        strength: 0.7
      });
    }
  });

  // Add follow-up nodes
  selectedPost.follow_ups.forEach((followUpId) => {
    const followUpPost = posts.find(p => p.id === followUpId);
    if (followUpPost && !nodes.find(n => n.id === followUpId)) {
      nodes.push({
        id: followUpId,
        title: followUpPost.title,
        snippet: followUpPost.description,
        type: 'follow_up',
        difficulty_level: followUpPost.difficulty_level,
        size: 30,
        category: followUpPost.category
      });
      links.push({
        source: selectedPost.id,
        target: followUpId,
        relationship: 'follow_up',
        strength: 0.8
      });
    }
  });

  return { nodes, links };
};