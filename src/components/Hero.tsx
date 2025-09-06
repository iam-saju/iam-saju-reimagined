import { useState, useEffect } from 'react';
import { useGlobalDonut } from '@/hooks/useGlobalDonut';
import { DonutAnimation } from './DonutAnimation';

interface DonutSettings {
  size: 'small' | 'medium' | 'large';
  speed: number;
  opacity: number;
  color: string;
  paused: boolean;
}

interface HeroProps {
  isDarkMode?: boolean;
}

const Hero = ({ isDarkMode = false }: HeroProps) => {
  const { globalState, subscribe } = useGlobalDonut();
  const [donutSettings, setDonutSettings] = useState<DonutSettings>({
    size: globalState.size,
    speed: globalState.speed,
    opacity: 30,
    color: '#4a9eff',
    paused: !globalState.isRunning
  });

  // Subscribe to global donut state changes
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setDonutSettings(prev => ({
        ...prev,
        size: globalState.size,
        speed: globalState.speed,
        paused: !globalState.isRunning
      }));
    });

    return unsubscribe;
  }, [globalState, subscribe]);

  return (
    <section id="about" className="min-h-screen flex items-center justify-start relative overflow-hidden">
      {/* Donut Animation Background - Connected to Global State */}
      <DonutAnimation 
        settings={donutSettings}
        isVisible={false}
      />
      
      {/* Hero Content */}
      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <div className="space-y-8">
          <h1 className={`text-4xl font-light ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
            yo.
          </h1>
          
          <div className={`space-y-6 text-lg leading-relaxed max-w-2xl ${
            isDarkMode ? 'text-white' : 'text-foreground'
          }`}>
            <p>
              i'm <strong className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>saju</strong>. welcome, i guess :)
            </p>
            
            <p>
              i'm an undergrad in <strong className={`bg-gradient-to-r ${isDarkMode ? 'from-purple-400 to-pink-400' : 'from-purple-600 to-pink-600'} bg-clip-text text-transparent`}>ai & data science</strong>. i spend my time building things that probably shouldn't exist but do anyway. some were big ideas — like a <strong className={`${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>gpu marketplace</strong> that might morph into a gpu cluster center. others were just me having fun, like writing a <strong className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>blockchain in c++</strong> with utxo, merkle trees, pow, and ecdsa just because i wanted to see if i could.
            </p>
            
            <p>
              i like understanding things at the level where you can break them — <strong className={`${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>raw-socket http servers in python</strong>, <strong className={`${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>ml workflows from scratch</strong>, and weird <strong className={`${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>computer vision experiments</strong> using opencv and fastapi.
            </p>
            
            <p>
              i built <strong className={`bg-gradient-to-r ${isDarkMode ? 'from-emerald-400 to-teal-400' : 'from-emerald-600 to-teal-600'} bg-clip-text text-transparent`}>qubit</strong>, which turns telegram into a makeshift cloud storage system with chunked uploads and multi-threaded bots. also built stuff like vue.js dashboards, file assembly pipelines, and random utilities i'll probably never use again but was fun to code.
            </p>
            
            <p>
              outside of code, i'm a die-hard <strong className={`bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent font-bold`}>manchester united</strong> fan.
            </p>
            
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-muted-foreground'}`}>
              i tweet here: <a 
                href="https://x.com/saju0nx" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`hover:underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-primary hover:text-primary/80'}`}
              >
                @saju0nx
              </a>
            </p>
            
            <p className={`text-xs italic ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
              Press Shift+T to enter the donut terminal
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;