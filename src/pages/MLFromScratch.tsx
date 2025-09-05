import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MLFromScratch = () => {
  const [activeTopic, setActiveTopic] = useState(1);

  const mlTopics = [
    {
      id: 1,
      title: "gradient descent",
      description: "understanding the core optimization algorithm behind machine learning, from mathematical foundations to practical implementations",
      image: "/lovable-uploads/fbf90e6e-1606-410d-a383-8b6853f25fd2.png",
      category: "optimization",
      externalLink: "https://harmless-bed-5d7.notion.site/gradient-descent-1fb97604c89d8054b6c0c62eba56a889",
      readingTime: "15 min read",
      wordCount: "3,200 words"
    },
    {
      id: 2,
      title: "neural networks",
      description: "building neural networks from scratch, understanding backpropagation, activation functions, and network architectures",
      image: "/lovable-uploads/fbf90e6e-1606-410d-a383-8b6853f25fd2.png",
      category: "deep learning",
      readingTime: "22 min read",
      wordCount: "4,800 words"
    },
    {
      id: 3,
      title: "linear regression",
      description: "implementing linear regression from scratch, understanding the mathematics behind ordinary least squares",
      image: "/lovable-uploads/fbf90e6e-1606-410d-a383-8b6853f25fd2.png",
      category: "supervised learning",
      readingTime: "12 min read",
      wordCount: "2,600 words"
    },
    {
      id: 4,
      title: "logistic regression",
      description: "binary classification with logistic regression, understanding sigmoid function and maximum likelihood estimation",
      image: "/lovable-uploads/fbf90e6e-1606-410d-a383-8b6853f25fd2.png",
      category: "classification",
      readingTime: "18 min read",
      wordCount: "3,900 words"
    },
    {
      id: 5,
      title: "decision trees",
      description: "building decision trees from scratch, understanding entropy, information gain, and tree pruning",
      image: "/lovable-uploads/fbf90e6e-1606-410d-a383-8b6853f25fd2.png",
      category: "tree methods",
      readingTime: "20 min read",
      wordCount: "4,200 words"
    },
    {
      id: 6,
      title: "k-means clustering",
      description: "implementing k-means clustering algorithm from scratch, understanding centroids and convergence",
      image: "/lovable-uploads/fbf90e6e-1606-410d-a383-8b6853f25fd2.png",
      category: "unsupervised learning",
      readingTime: "14 min read",
      wordCount: "3,100 words"
    }
  ];

  const activeTopicData = mlTopics.find(topic => topic.id === activeTopic);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/posts" className="text-ui text-gray-600 hover:text-gray-900 transition-colors">
            ← back to posts
          </a>
          <h1 className="text-ui text-lg font-medium text-gray-900">ml from scratch</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="pt-20 flex flex-col lg:flex-row">
        {/* Left Sidebar - Table of Contents */}
        <aside className="w-full lg:w-80 bg-gray-50 border-r border-gray-200 lg:min-h-screen">
          <div className="p-6">
            <h2 className="text-academic text-lg font-bold text-gray-900 mb-6">
              Table of Contents
            </h2>
            
            <nav className="space-y-1">
              {mlTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic.id)}
                  className={`w-full text-left px-6 py-3 rounded-sm transition-all duration-200 group ${
                    activeTopic === topic.id
                      ? 'bg-white shadow-sm border border-gray-200'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="space-y-1">
                    <h3 className={`text-academic text-sm leading-tight transition-colors ${
                      activeTopic === topic.id
                        ? 'text-gray-900 font-semibold'
                        : 'text-gray-600 group-hover:text-gray-800'
                    }`}>
                      {topic.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="text-ui">{topic.readingTime}</span>
                      <span className="text-ui">•</span>
                      <span className="text-ui">{topic.wordCount}</span>
                    </div>
                    {topic.externalLink && (
                      <div className="text-xs text-blue-600 text-ui">
                        available now
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
            {activeTopicData ? (
              <article className="space-y-8">
                {/* Article Header */}
                <header className="space-y-4">
                  <div className="flex items-center gap-2 text-ui text-sm text-gray-600">
                    <span className="px-2 py-1 bg-gray-100 rounded-sm text-xs">
                      {activeTopicData.category}
                    </span>
                    <span>•</span>
                    <span>{activeTopicData.readingTime}</span>
                    <span>•</span>
                    <span>{activeTopicData.wordCount}</span>
                  </div>
                  
                  <h1 className="text-academic text-3xl font-bold text-gray-900 leading-tight">
                    {activeTopicData.title}
                  </h1>
                  
                  <p className="text-academic text-lg text-gray-700 leading-relaxed">
                    {activeTopicData.description}
                  </p>
                </header>

                {/* Article Content */}
                <div className="space-y-6">
                  {activeTopicData.externalLink ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-sm p-6">
                      <h3 className="text-academic text-lg font-semibold text-blue-900 mb-3">
                        This article is available
                      </h3>
                      <p className="text-academic text-blue-800 mb-4">
                        The complete article has been published and is ready to read. Click below to access the full content.
                      </p>
                      <a
                        href={activeTopicData.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-ui text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Read full article →
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-gray-50 border border-gray-200 rounded-sm p-6">
                        <h3 className="text-academic text-lg font-semibold text-gray-900 mb-3">
                          Coming Soon
                        </h3>
                        <p className="text-academic text-gray-700">
                          This article is currently being written and will be available soon. 
                          Check back later for the complete implementation and mathematical derivations.
              </p>
            </div>

                      {/* Placeholder content structure */}
                      <div className="space-y-4">
                        <h2 className="text-academic text-xl font-semibold text-gray-900">
                          What to Expect
                        </h2>
                        <ul className="space-y-2 text-academic text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            <span>Mathematical foundations and derivations</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            <span>Step-by-step implementation from scratch</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            <span>Visualizations and examples</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            <span>Performance analysis and optimizations</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                          )}
                        </div>

                {/* Navigation */}
                <nav className="flex justify-between items-center pt-8 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    {activeTopic > 1 && (
                      <button
                        onClick={() => setActiveTopic(activeTopic - 1)}
                        className="text-ui text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        ← Previous
                      </button>
                    )}
            </div>

                  <div className="flex items-center gap-4">
                    {activeTopic < mlTopics.length && (
                      <button
                        onClick={() => setActiveTopic(activeTopic + 1)}
                        className="text-ui text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </nav>
              </article>
            ) : (
              <div className="text-center py-12">
                <p className="text-academic text-gray-600">
                  Select a topic from the sidebar to view its content.
                </p>
              </div>
            )}
          </div>
        </main>
        </div>
    </div>
  );
};

export default MLFromScratch;