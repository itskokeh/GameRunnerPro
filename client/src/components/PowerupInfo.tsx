import React from 'react';
import { 
  Magnet, 
  Coins, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

// PowerupInfo component displays information about available powerups
const PowerupInfo: React.FC = () => {
  // Powerup data with icons, names, and descriptions
  const powerups = [
    {
      icon: <Magnet className="text-white" />,
      name: "Magnet",
      description: "Attracts all coins",
      bgColor: "bg-accent"
    },
    {
      icon: <Coins className="text-white" />,
      name: "Double Coins",
      description: "2x coin value",
      bgColor: "bg-yellow-500"
    },
    {
      icon: <Zap className="text-white" />,
      name: "Speed Boost",
      description: "Run faster",
      bgColor: "bg-green-500"
    },
    {
      icon: <ShieldCheck className="text-white" />,
      name: "Shield",
      description: "Invincibility",
      bgColor: "bg-purple-500"
    }
  ];

  return (
    <div className="mt-8 w-80">
      <h3 className="font-game text-sm text-white mb-3 text-center">POWERUPS</h3>
      <div className="grid grid-cols-2 gap-3">
        {powerups.map((powerup, index) => (
          <div key={index} className="bg-black bg-opacity-60 p-3 rounded flex items-center">
            <div className={`w-8 h-8 rounded-full ${powerup.bgColor} flex items-center justify-center mr-3`}>
              {powerup.icon}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{powerup.name}</p>
              <p className="text-gray-400 text-xs">{powerup.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PowerupInfo;
