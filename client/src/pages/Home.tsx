import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import HowToPlay from '@/components/HowToPlay';
import PowerupInfo from '@/components/PowerupInfo';

const Home: React.FC = () => {
  const [, navigate] = useLocation();
  const { user, startGame } = useGame();
  const { signInWithGoogle, signOut, isInitializing } = useAuth();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handlePlay = () => {
    console.log('Play button clicked, starting game...');
    startGame();
    console.log('Game started, navigating to game page...');
    navigate('/game');
    console.log('Navigation initiated');
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-background flex flex-col items-center justify-center z-20">
      <div className="text-center mb-12">
        <h1 className="font-game text-4xl text-primary mb-1">ENDLESS</h1>
        <h1 className="font-game text-4xl text-accent mb-4">RUNNER</h1>
        <p className="text-gray-300 text-sm">Collect coins, use powerups, avoid obstacles!</p>
      </div>
      
      <div className="bg-background border-2 border-primary rounded-lg p-6 w-80 text-center">
        {/* Login State */}
        <div className="mb-6">
          {user ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center mb-4">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={`${user.username}'s avatar`} 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-3">
                    <span className="text-white font-bold">{user.username.charAt(0)}</span>
                  </div>
                )}
                <div className="text-left">
                  <p className="text-white font-medium">{user.username}</p>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                </div>
              </div>
              <p className="text-white mb-1">High Score: <span className="text-yellow-300">{user.highScore}</span></p>
              <button onClick={signOut} className="text-gray-400 hover:text-white text-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <p className="text-white mb-4">Sign in to save your high scores</p>
              <Button
                onClick={signInWithGoogle}
                disabled={isInitializing}
                className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-gray-800 py-2 px-4 rounded w-full"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
                  <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
                  <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
                  <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
                </svg>
                <span>{isInitializing ? 'Loading...' : 'Sign in with Google'}</span>
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handlePlay} 
            className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded font-bold"
          >
            PLAY
          </Button>
          <Button 
            onClick={() => setShowHowToPlay(true)} 
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-medium"
          >
            How To Play
          </Button>
        </div>
      </div>
      
      {/* Power-ups Preview */}
      <PowerupInfo />
      
      {/* How To Play Modal */}
      <HowToPlay isVisible={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
    </div>
  );
};

export default Home;
