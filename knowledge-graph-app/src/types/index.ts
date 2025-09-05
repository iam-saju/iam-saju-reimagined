export interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  timestamp: Date;
  author: string;
  tags: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_read_time: number;
  related_topics: string[];
  prerequisites: string[];
  follow_ups: string[];
  category: string;
}

export interface KnowledgeNode {
  id: string;
  title: string;
  snippet: string;
  type: 'post' | 'concept' | 'prerequisite' | 'follow_up';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  size: number;
  category: string;
}

export interface KnowledgeLink {
  source: string;
  target: string;
  relationship: 'prerequisite' | 'related' | 'follow_up' | 'similar';
  strength: number;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  links: KnowledgeLink[];
}

export interface ViewState {
  mode: 'posts' | 'graph';
  selectedPostId: string | null;
  breadcrumb: string[];
}