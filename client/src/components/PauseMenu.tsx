import React from 'react';
import { useLocation } from 'wouter';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';

interface PauseMenuProps {
  isVisible: boolean;
}

// PauseMenu component displayed when the game is paused
const PauseMenu: React.FC<PauseMenuProps> = ({ isVisible }) => {
  const [, navigate] = useLocation();
  const { resumeGame, restartGame } = useGame();

  if (!isVisible) return null;

  const handleResume = () => {
    resumeGame();
  };

  const handleRestart = () => {
    restartGame();
  };

  const handleMainMenu = () => {
    navigate('/');
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
      <div className="bg-background border-2 border-primary rounded-lg p-6 w-80 text-center">
        <h2 className="font-game text-xl text-white mb-6">PAUSED</h2>
        <div className="space-y-3">
          <Button 
            onClick={handleResume} 
            className="w-full bg-primary hover:bg-blue-600 text-white py-2 rounded font-medium"
          >
            Resume
          </Button>
          <Button 
            onClick={handleRestart} 
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-medium"
          >
            Restart
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

export default PauseMenu;
