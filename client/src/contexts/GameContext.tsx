import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

// Define the types for our game context
type PowerupType = 'magnet' | 'doubleCoins' | 'speed' | 'shield';

interface ActivePowerup {
  type: PowerupType;
  timeRemaining: number;
  startTime: number;
  duration: number;
}

interface GameContextType {
  // User state
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  
  // Game state
  score: number;
  coins: number;
  highScore: number;
  isGameRunning: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  activePowerups: ActivePowerup[];
  
  // Game control functions
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: (finalScore: number) => void;
  restartGame: () => void;
  
  // Powerup functions
  addPowerup: (type: PowerupType, duration: number) => void;
  removePowerup: (type: PowerupType) => void;
  
  // Game data functions
  updateScore: (newScore: number) => void;
  updateCoins: (newCoins: number) => void;
}

// Create the context with default values
const GameContext = createContext<GameContextType>({
  user: null,
  isLoggedIn: false,
  setUser: () => {},
  score: 0,
  coins: 0,
  highScore: 0,
  isGameRunning: false,
  isPaused: false,
  isGameOver: false,
  activePowerups: [],
  startGame: () => {},
  pauseGame: () => {},
  resumeGame: () => {},
  endGame: () => {},
  restartGame: () => {},
  addPowerup: () => {},
  removePowerup: () => {},
  updateScore: () => {},
  updateCoins: () => {},
});

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // User state
  const [user, setUser] = useState<User | null>(null);
  
  // Game state
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [activePowerups, setActivePowerups] = useState<ActivePowerup[]>([]);

  // Update high score mutation
  const updateHighScoreMutation = useMutation({
    mutationFn: async ({ userId, score }: { userId: number, score: number }) => {
      const res = await apiRequest('PUT', `/api/users/${userId}/highscore`, { score });
      return res.json();
    },
    onSuccess: (data: User) => {
      setHighScore(data.highScore);
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating high score',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Game control functions
  const startGame = () => {
    setScore(0);
    setCoins(0);
    setActivePowerups([]);
    setIsGameRunning(true);
    setIsPaused(false);
    setIsGameOver(false);
  };

  const pauseGame = () => {
    if (isGameRunning && !isGameOver) {
      setIsPaused(true);
    }
  };

  const resumeGame = () => {
    if (isGameRunning && !isGameOver) {
      setIsPaused(false);
    }
  };

  const endGame = (finalScore: number) => {
    setScore(finalScore);
    setIsGameRunning(false);
    setIsGameOver(true);
    
    // Update high score if user is logged in and the score is higher
    if (user && finalScore > highScore) {
      updateHighScoreMutation.mutate({ userId: user.id, score: finalScore });
    }
    
    // If not logged in, still track high score for the session
    if (!user && finalScore > highScore) {
      setHighScore(finalScore);
    }
  };

  const restartGame = () => {
    startGame();
  };

  // Powerup functions
  const addPowerup = (type: PowerupType, duration: number) => {
    // Remove any existing powerup of the same type
    const updatedPowerups = activePowerups.filter(p => p.type !== type);
    
    // Add the new powerup
    setActivePowerups([
      ...updatedPowerups,
      {
        type,
        timeRemaining: duration,
        startTime: Date.now(),
        duration,
      }
    ]);
  };

  const removePowerup = (type: PowerupType) => {
    setActivePowerups(activePowerups.filter(p => p.type !== type));
  };

  // Update game data functions
  const updateScore = (newScore: number) => {
    setScore(newScore);
  };

  const updateCoins = (newCoins: number) => {
    setCoins(prev => prev + newCoins);
  };

  // Check for expired powerups (runs every second)
  useEffect(() => {
    if (!isGameRunning || isPaused) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setActivePowerups(current => 
        current
          .map(powerup => ({
            ...powerup,
            timeRemaining: Math.max(0, powerup.duration - ((now - powerup.startTime) / 1000))
          }))
          .filter(powerup => powerup.timeRemaining > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameRunning, isPaused]);

  // Provide the context value
  const contextValue = {
    user,
    isLoggedIn: !!user,
    setUser,
    score,
    coins,
    highScore,
    isGameRunning,
    isPaused,
    isGameOver,
    activePowerups,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    restartGame,
    addPowerup,
    removePowerup,
    updateScore,
    updateCoins,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the context
export const useGame = () => useContext(GameContext);
