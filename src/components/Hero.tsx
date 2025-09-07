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
    size: 'medium',
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
        speed: globalState.speed,
        paused: !globalState.isRunning
      }));
    });

    return unsubscribe;
  }, [globalState, subscribe]);

  return (
    <section id="about" className="h-screen flex items-center justify-start relative overflow-hidden bg-white">
      {/* Donut Animation Background - Connected to Global State */}
      <DonutAnimation 
        settings={donutSettings}
        isVisible={false}
      />
      
      {/* Hero Content */}
      <div className="max-w-4xl mx-auto px-6 pt-10 relative z-10">
        <div className="space-y-4">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
            hey.
          </h1>
          
          <div className={`space-y-2 text-base leading-relaxed max-w-3xl ${
            isDarkMode ? 'text-gray-200' : 'text-foreground'
          }`}>
            <p>
              i'm <span className="font-bold">saju</span>. :)
            </p>
            
            <p>
              undergrad in ai & data science. i build random stuff — from a gpu marketplace to a c++ blockchain — mostly to see if it works (or breaks).
            </p>
            
            <p>
              i like tearing tech apart — raw-socket http, ml theories, weird opencv hacks.
            </p>
            
            <p>
              built qubit to hack Telegram into serving as cloud storage.
            </p>
            <br>
            </br>
            
            <div className="space-y-2 my-12">
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-foreground'} mb-1`}>experiments</h3>
              <ul className={`space-y-0.5 ${isDarkMode ? 'text-gray-300' : 'text-muted-foreground'}`}>
                <li>• gpu marketplaces & cluster management</li>
                <li>• messing with ml theories until they click (or break)</li>
                <li>• blockchain protocols for fun</li>
                <li>• writing servers & protocols just to see how deep it goes</li>
              </ul>
            </div>

            <br></br>
            
            <div className="space-y-2 my-12">
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-foreground'}`}>philosophy</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-muted-foreground'}>
              break it, poke it, twist it, see what happens, rebuild it—or don’t.              </p>
              <p className={isDarkMode ? 'text-gray-300' : 'text-muted-foreground'}>
                <span className='font-bold bg-gradient-to-r from-red-900 to-red-600 bg-clip-text text-transparent'>manchester united </span>forever.
              </p>
            </div>
            
            <p className="mt-8">
              tweets : <a 
                href="https://x.com/saju0nx" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-primary hover:text-primary/80'} hover:underline`}
              >
                @saju0nx
              </a>
            </p>
            <br></br>
            <p className={`text-xs italic ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
              shift+t to enter the donut terminal
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;