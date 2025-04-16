import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Magnet, Coins, Zap, ShieldCheck } from 'lucide-react';

// ActivePowerups component displays currently active powerups
const ActivePowerups: React.FC = () => {
  const { activePowerups } = useGame();

  if (activePowerups.length === 0) return null;

  // Helper function to get the right icon for each powerup type
  const getPowerupIcon = (type: string) => {
    switch(type) {
      case 'magnet':
        return <Magnet className="text-accent" size={16} />;
      case 'doubleCoins':
        return <Coins className="text-yellow-400" size={16} />;
      case 'speed':
        return <Zap className="text-green-500" size={16} />;
      case 'shield':
        return <ShieldCheck className="text-purple-500" size={16} />;
      default:
        return null;
    }
  };

  // Helper function to get the right color for the timer bar
  const getTimerColor = (type: string) => {
    switch(type) {
      case 'magnet':
        return 'bg-accent';
      case 'doubleCoins':
        return 'bg-yellow-400';
      case 'speed':
        return 'bg-green-500';
      case 'shield':
        return 'bg-purple-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="absolute top-12 right-4 flex flex-col items-end space-y-2">
      {activePowerups.map((powerup, index) => {
        // Calculate percentage of time remaining
        const percentRemaining = (powerup.timeRemaining / powerup.duration) * 100;
        
        return (
          <div key={index} className="bg-black bg-opacity-60 px-3 py-1 rounded-full flex items-center">
            <div className="powerup-icon mr-2">
              {getPowerupIcon(powerup.type)}
            </div>
            <div className="powerup-timer w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getTimerColor(powerup.type)}`} 
                style={{ width: `${percentRemaining}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivePowerups;
