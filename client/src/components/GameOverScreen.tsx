import React from 'react';
import { useLocation } from 'wouter';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';

interface GameOverScreenProps {
  isVisible: boolean;
}

// GameOverScreen component displayed when the game ends
const GameOverScreen: React.FC<GameOverScreenProps> = ({ isVisible }) => {
  const [, navigate] = useLocation();
  const { score, highScore, restartGame } = useGame();

  if (!isVisible) return null;

  const handleRestart = () => {
    restartGame();
  };

  const handleMainMenu = () => {
    navigate('/');
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10">
      <div className="bg-background border-2 border-red-600 rounded-lg p-6 w-80 text-center">
        <h2 className="font-game text-xl text-red-500 mb-2">GAME OVER</h2>
        <div className="text-white mb-4">
          <p className="text-lg font-medium">Score: <span className="text-yellow-300">{score}</span></p>
          <p className="text-sm">Best: <span className="text-yellow-300">{highScore}</span></p>
        </div>
        <div className="space-y-3">
          <Button 
            onClick={handleRestart} 
            className="w-full bg-primary hover:bg-blue-600 text-white py-2 rounded font-medium"
          >
            Play Again
          </Button>
          <Button 
            onClick={handleMainMenu} 
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-medium"
          >
            Main Menu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
