import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MissionControl from './components/MissionControl';
import ParticleBackground from './components/ParticleBackground';

function App() {
  const [isLaunched, setIsLaunched] = useState(true); // Auto-launch directly to Mission Control

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />
      
      {!isLaunched ? (
        <LaunchScreen onLaunch={() => setIsLaunched(true)} />
      ) : (
        <MissionControl />
      )}
    </div>
  );
}

function LaunchScreen({ onLaunch }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-9xl mb-8"
        >
          🚀
        </motion.div>
        
        <h1 className="text-6xl font-bold mb-4 text-glow">
          SCOUT94
        </h1>
        
        <p className="text-2xl text-blue-200 mb-12">
          Mission Control
        </p>
        
        <motion.button
          onClick={onLaunch}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
        >
          🎮 Launch Mission Control
        </motion.button>
        
        <p className="mt-8 text-sm text-gray-400">
          Your Testing Dream Team Awaits...
        </p>
      </motion.div>
    </div>
  );
}

export default App;
