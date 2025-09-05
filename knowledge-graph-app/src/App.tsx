import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PostsPage from './components/PostsPage';
import KnowledgeGraph from './components/KnowledgeGraph';
import { samplePosts, generateKnowledgeGraph } from './data/samplePosts';
import { ViewState } from './types';
import './App.css';

function App() {
  const [viewState, setViewState] = useState<ViewState>({
    mode: 'posts',
    selectedPostId: null,
    breadcrumb: []
  });

  const handlePostClick = (postId: string) => {
    const post = samplePosts.find(p => p.id === postId);
    if (!post) return;

    setViewState({
      mode: 'graph',
      selectedPostId: postId,
      breadcrumb: [post.title]
    });
  };

  const handleNodeClick = (nodeId: string) => {
    // Check if the clicked node is a post
    const post = samplePosts.find(p => p.id === nodeId);
    if (post) {
      setViewState(prev => ({
        mode: 'graph',
        selectedPostId: nodeId,
        breadcrumb: [...prev.breadcrumb, post.title]
      }));
    }
  };

  const handleBackToPosts = () => {
    setViewState({
      mode: 'posts',
      selectedPostId: null,
      breadcrumb: []
    });
  };

  const currentGraph = viewState.selectedPostId 
    ? generateKnowledgeGraph(samplePosts, viewState.selectedPostId)
    : { nodes: [], links: [] };

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        {viewState.mode === 'posts' ? (
          <PostsPage
            key="posts"
            posts={samplePosts}
            onPostClick={handlePostClick}
          />
        ) : (
          <KnowledgeGraph
            key="graph"
            nodes={currentGraph.nodes}
            links={currentGraph.links}
            selectedNodeId={viewState.selectedPostId!}
            onNodeClick={handleNodeClick}
            onBackToPosts={handleBackToPosts}
            breadcrumb={viewState.breadcrumb}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;