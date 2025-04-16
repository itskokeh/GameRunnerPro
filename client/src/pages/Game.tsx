import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useGame } from '@/contexts/GameContext';
import Phaser from 'phaser';
import { config } from '@/game/config';
import GameOverScreen from '@/components/GameOverScreen';
import PauseMenu from '@/components/PauseMenu';
import ActivePowerups from '@/components/ActivePowerups';
import { Pause, Volume2, VolumeX, Circle } from 'lucide-react';

const Game: React.FC = () => {
  const [, navigate] = useLocation();
  const { 
    score, 
    coins, 
    isPaused, 
    isGameOver, 
    pauseGame,
    isGameRunning
  } = useGame();
  
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize Phaser game
  useEffect(() => {
    console.log('Game component mounted, initializing Phaser...');
    if (gameRef.current && !gameInstanceRef.current) {
      console.log('Creating Phaser game instance...');
      gameInstanceRef.current = new Phaser.Game({
        ...config,
        parent: gameRef.current,
      });
      console.log('Phaser game created:', gameInstanceRef.current);
    }

    // Set up game callbacks for communication with React
    window.gameCallbacks = {
      pauseGame: pauseGame,
      resumeGame: () => {},
      gameOver: (score: number) => {},
      updateScore: (score: number) => {},
      collectCoin: (value: number) => {},
      activatePowerup: (type: string, duration: number) => {},
      deactivatePowerup: (type: string) => {}
    };

    // Clean up on unmount
    return () => {
      console.log('Game component unmounting, destroying Phaser...');
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
      delete window.gameCallbacks;
    };
  }, []);

  // If game is not running, redirect to home
  useEffect(() => {
    console.log("Game running state:", isGameRunning, "Game over state:", isGameOver);
    // Comment this for now to prevent redirection while testing
    // if (!isGameRunning && !isGameOver) {
    //   navigate('/');
    // }
  }, [isGameRunning, isGameOver, navigate]);

  // Handle key presses for pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isGameOver) {
        pauseGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pauseGame, isGameOver]);

  // Handle sound toggle
  const handleSound = () => {
    if (gameInstanceRef.current) {
      const newMuteState = !isMuted;
      setIsMuted(newMuteState);
      
      // Mute/unmute all game sounds
      gameInstanceRef.current.sound.mute = newMuteState;
    }
  };

  // Handle pause button click
  const handlePause = () => {
    pauseGame();
  };

  // Handle mobile jump
  const handleJump = () => {
    // This is handled by the Phaser game
    // Just a placeholder for the mobile jump button
  };

  return (
    <div id="game-container" className="relative w-full h-full bg-background">
      {/* Game Canvas */}
      <div id="game-canvas" ref={gameRef} className="w-full h-full" />

      {/* Game UI */}
      <div id="game-ui" className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Top Bar with Score and Coins */}
        <div className="flex justify-between items-center px-4 py-2 bg-black bg-opacity-50">
          <div className="flex items-center space-x-4">
            <div className="text-white font-game text-sm">
              <span>SCORE: </span>
              <span className="text-yellow-300">{score}</span>
            </div>
            <div className="text-white font-game text-sm flex items-center">
              <span className="text-yellow-400 mr-1">
                <Circle size={16} fill="currentColor" />
              </span>
              <span className="text-yellow-300">{coins}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handlePause} 
              className="pointer-events-auto bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full"
            >
              <Pause size={16} />
            </button>
            <button 
              onClick={handleSound} 
              className="pointer-events-auto bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>

        {/* Active Powerups Bar */}
        <ActivePowerups />

        {/* Mobile Controls */}
        <div className="absolute bottom-8 left-0 w-full flex justify-center md:hidden pointer-events-auto">
          <div className="bg-black bg-opacity-40 p-4 rounded-full">
            <button 
              onTouchStart={handleJump} 
              className="w-16 h-16 bg-primary hover:bg-blue-600 active:bg-blue-700 rounded-full flex items-center justify-center"
            >
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Pause Menu */}
      <PauseMenu isVisible={isPaused && !isGameOver} />

      {/* Game Over Screen */}
      <GameOverScreen isVisible={isGameOver} />
    </div>
  );
};

export default Game;
