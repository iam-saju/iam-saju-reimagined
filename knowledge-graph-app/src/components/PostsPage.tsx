import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Tag, ArrowRight, BookOpen } from 'lucide-react';
import { Post } from '../types';

interface PostsPageProps {
  posts: Post[];
  onPostClick: (postId: string) => void;
}

const PostsPage: React.FC<PostsPageProps> = ({ posts, onPostClick }) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'AI/ML': 'bg-blue-100 text-blue-800',
      'Data Science': 'bg-purple-100 text-purple-800',
      'Computer Vision': 'bg-indigo-100 text-indigo-800',
      'NLP': 'bg-pink-100 text-pink-800',
      'Statistics': 'bg-orange-100 text-orange-800',
      'Programming': 'bg-emerald-100 text-emerald-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Knowledge Explorer
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover interconnected learning paths through our interactive knowledge graph. 
              Click on any post to explore its relationships and dive deeper into the topic.
            </p>
          </div>
        </div>
      </header>

      {/* Posts Grid */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => onPostClick(post.id)}
            >
              {/* Category Badge */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                  <div className={`px-2 py-1 rounded-md text-xs font-medium border ${getDifficultyColor(post.difficulty_level)}`}>
                    {post.difficulty_level}
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{post.tags.length - 3} more</span>
                  )}
                </div>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {post.author}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {post.estimated_read_time} min
                    </span>
                  </div>
                  <span>{formatDate(post.timestamp)}</span>
                </div>

                {/* Connection Indicators */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex space-x-3 text-gray-400">
                    {post.prerequisites.length > 0 && (
                      <span className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mr-1"></div>
                        {post.prerequisites.length} prereq
                      </span>
                    )}
                    {post.related_topics.length > 0 && (
                      <span className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-400 mr-1"></div>
                        {post.related_topics.length} related
                      </span>
                    )}
                    {post.follow_ups.length > 0 && (
                      <span className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-400 mr-1"></div>
                        {post.follow_ups.length} follow-up
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                    <BookOpen className="w-3 h-3 mr-1" />
                    <span className="font-medium">Explore</span>
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Hover Effect Indicator */}
              <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.article>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 py-8 text-gray-500">
          <p className="text-sm">
            Click on any post to explore its knowledge graph and discover learning pathways
          </p>
        </footer>
      </main>
    </div>
  );
};

export default PostsPage;