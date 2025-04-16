import React from 'react';
import { 
  Magnet, 
  Coins, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HowToPlayProps {
  isVisible: boolean;
  onClose: () => void;
}

// HowToPlay component displays game instructions
const HowToPlay: React.FC<HowToPlayProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;
  
  return (
    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-20">
      <div className="bg-background border-2 border-primary rounded-lg p-6 w-11/12 max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="font-game text-xl text-primary mb-6 text-center">HOW TO PLAY</h2>
        
        <div className="space-y-6 text-white">
          <div>
            <h3 className="font-medium text-accent mb-2">Controls</h3>
            <div className="bg-black bg-opacity-50 rounded p-3">
              <p className="mb-2"><span className="font-medium">Mobile:</span> Tap screen to jump</p>
              <p><span className="font-medium">Desktop:</span> Press Space or Up Arrow to jump</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-accent mb-2">Gameplay</h3>
            <div className="bg-black bg-opacity-50 rounded p-3 space-y-2">
              <p>• Run as far as you can without hitting obstacles</p>
              <p>• Collect coins to increase your score</p>
              <p>• Grab powerups for special abilities</p>
              <p>• Each powerup lasts for 15 seconds</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-accent mb-2">Powerups</h3>
            <div className="bg-black bg-opacity-50 rounded p-3 space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center mr-3">
                  <Magnet className="text-white" />
                </div>
                <p>Magnet: Attracts all nearby coins</p>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center mr-3">
                  <Coins className="text-white" />
                </div>
                <p>Double Coins: Doubles the value of collected coins</p>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3">
                  <Zap className="text-white" />
                </div>
                <p>Speed Boost: Increases running speed</p>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-3">
                  <ShieldCheck className="text-white" />
                </div>
                <p>Shield: Makes you invincible to obstacles</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Button 
            onClick={onClose}
            className="bg-primary hover:bg-blue-600 text-white py-2 px-6 rounded font-medium"
          >
            Got It
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;
