import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCw } from 'lucide-react';

interface DemoProps {
  onDemoStep: (step: string) => void;
}

const Demo: React.FC<DemoProps> = ({ onDemoStep }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: "Welcome to Knowledge Graph",
      description: "Explore interconnected learning topics",
      action: "start"
    },
    {
      title: "Browse Posts",
      description: "View topic-based posts with visual cues",
      action: "browse-posts"
    },
    {
      title: "Click a Post",
      description: "Transform into interactive knowledge graph",
      action: "click-post"
    },
    {
      title: "Explore Connections",
      description: "Navigate between related topics",
      action: "explore-connections"
    },
    {
      title: "Interactive Features",
      description: "Pan, zoom, and drag nodes",
      action: "interact"
    }
  ];

  const runDemo = async () => {
    setIsPlaying(true);
    
    for (let i = 0; i < demoSteps.length; i++) {
      setCurrentStep(i);
      onDemoStep(demoSteps[i].action);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    onDemoStep('start');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-xl border p-4 max-w-sm"
    >
      <h3 className="font-bold text-gray-900 mb-2">Interactive Demo</h3>
      
      {isPlaying && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {demoSteps.length}
            </span>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <div className="font-medium">{demoSteps[currentStep].title}</div>
            <div>{demoSteps[currentStep].description}</div>
          </div>
        </div>
      )}
      
      <div className="flex space-x-2">
        <button
          onClick={runDemo}
          disabled={isPlaying}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isPlaying ? 'Running...' : 'Start Demo'}</span>
        </button>
        
        <button
          onClick={resetDemo}
          className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          title="Reset Demo"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default Demo;