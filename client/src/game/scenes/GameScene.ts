import Phaser from 'phaser';
import Player from '../entities/Player';
import ObstacleManager from '../managers/ObstacleManager';
import PowerupManager from '../managers/PowerupManager';
import Coin from '../entities/Coin';
import { 
  PLAYER_INITIAL_X, 
  GROUND_HEIGHT, 
  GAME_SPEED, 
  GAME_ACCELERATION, 
  COIN_VALUE,
  POWERUP_TYPES,
  PLACEHOLDER_ASSETS,
  POWERUP_DURATION,
  DISTANCE_SCORE_MULTIPLIER
} from '../utils/constants';

/**
 * GameScene is the main game scene where gameplay happens
 */
export default class GameScene extends Phaser.Scene {
  // Game objects
  private player!: Player;
  private ground!: Phaser.GameObjects.TileSprite;
  private obstacleManager!: ObstacleManager;
  private powerupManager!: PowerupManager;
  private background!: Phaser.GameObjects.TileSprite;

  // Game state
  private gameSpeed: number = GAME_SPEED;
  private gameTime: number = 0;
  private distance: number = 0;
  private score: number = 0;
  private coins: number = 0;
  private isGameOver: boolean = false;
  private isPaused: boolean = false;

  // Powerup states
  private activePowerups: Map<string, number> = new Map();

  // Collectibles
  private coinGroup!: Phaser.Physics.Arcade.Group;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Get the React game context to sync state
    this.getGameContext();

    // Reset game state
    this.resetGameState();

    // Create background
    this.createBackground();

    // Create ground
    this.createGround();

    // Create the player
    this.player = new Player(this, PLAYER_INITIAL_X, this.cameras.main.height - GROUND_HEIGHT - 32);

    // Create obstacle manager
    this.obstacleManager = new ObstacleManager(this);

    // Create powerup manager
    this.powerupManager = new PowerupManager(this);

    // Create coins group
    this.createCoins();

    // Setup collisions
    this.setupCollisions();

    // Setup input handlers
    this.setupInputHandlers();

    // Start HUD scene
    this.scene.launch('HUDScene');

    // Connect React state and game state
    this.syncWithReactState();
  }

  update(time: number, delta: number): void {
    if (this.isGameOver || this.isPaused) return;

    // Update game time and score
    this.gameTime += delta;
    this.distance += (this.gameSpeed * delta) / 1000;
    this.updateScore();

    // Update game speed (accelerate over time)
    this.gameSpeed += delta * GAME_ACCELERATION;

    // Move the ground
    this.moveGround();

    // Update obstacle manager
    this.obstacleManager.update(delta, this.gameSpeed);

    // Update powerup manager
    this.powerupManager.update(delta, this.gameSpeed);

    // Update coins
    this.updateCoins(delta);

    // Update powerups timers
    this.updatePowerups(delta);

    // Update player
    this.player.update(delta);
  }

  /**
   * Connect to React context to get/set game state
   */
  private getGameContext(): void {
    // This function will be called by React to set up callbacks
    if (window.gameCallbacks) {
      const { 
        pauseGame, 
        resumeGame, 
        gameOver, 
        updateScore, 
        collectCoin,
        activatePowerup,
        deactivatePowerup
      } = window.gameCallbacks;

      this.reactCallbacks = {
        pauseGame,
        resumeGame,
        gameOver,
        updateScore,
        collectCoin,
        activatePowerup,
        deactivatePowerup
      };
    }
  }

  /**
   * Set up React-to-Phaser communication
   */
  private syncWithReactState(): void {
    // Listen for pause events from React
    if (window.addEventListener) {
      window.addEventListener('game:pause', () => this.pauseGame());
      window.addEventListener('game:resume', () => this.resumeGame());
      window.addEventListener('game:restart', () => this.restartGame());
    }
  }

  /**
   * Reset all game state variables
   */
  private resetGameState(): void {
    this.gameSpeed = GAME_SPEED;
    this.gameTime = 0;
    this.distance = 0;
    this.score = 0;
    this.coins = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.activePowerups.clear();
  }

  /**
   * Creates scrolling background
   */
  private createBackground(): void {
    this.background = this.add.tileSprite(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      PLACEHOLDER_ASSETS.BACKGROUND
    );
    this.background.setOrigin(0, 0);
  }

  /**
   * Creates the scrolling ground
   */
  private groundPhysics!: Phaser.Physics.Arcade.Image;
  
  private createGround(): void {
    // Create a visible ground sprite that scrolls
    this.ground = this.add.tileSprite(
      0,
      this.cameras.main.height - GROUND_HEIGHT,
      this.cameras.main.width,
      GROUND_HEIGHT,
      PLACEHOLDER_ASSETS.GROUND
    );
    this.ground.setOrigin(0, 0);

    // Create an invisible physics body for the ground
    this.groundPhysics = this.physics.add.staticImage(
      this.cameras.main.width / 2,
      this.cameras.main.height - GROUND_HEIGHT / 2,
      PLACEHOLDER_ASSETS.GROUND
    );
    this.groundPhysics.setVisible(false);
    this.groundPhysics.setDisplaySize(this.cameras.main.width, GROUND_HEIGHT);
    this.groundPhysics.refreshBody();
  }

  /**
   * Creates the coin group
   */
  private createCoins(): void {
    this.coinGroup = this.physics.add.group({
      classType: Coin,
      maxSize: 20,
      runChildUpdate: true
    });
  }

  /**
   * Setup collision handlers
   */
  private setupCollisions(): void {
    // Player collides with the ground
    this.physics.add.collider(this.player, this.groundPhysics);

    // Player collides with obstacles
    this.physics.add.collider(
      this.player,
      this.obstacleManager.getObstacles(),
      this.handleObstacleCollision,
      undefined,
      this
    );

    // Player collects coins
    this.physics.add.overlap(
      this.player,
      this.coinGroup,
      this.handleCoinCollection as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Player collects powerups
    this.physics.add.overlap(
      this.player,
      this.powerupManager.getPowerups(),
      this.handlePowerupCollection as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }

  /**
   * Setup input handlers for the game
   */
  private setupInputHandlers(): void {
    // Space bar and up arrow for jumping
    this.input.keyboard?.on('keydown-SPACE', this.handleJump, this);
    this.input.keyboard?.on('keydown-UP', this.handleJump, this);
    
    // Touch input for mobile
    this.input.on('pointerdown', this.handleJump, this);
  }

  /**
   * Handle player jumping
   */
  private handleJump(): void {
    if (this.isGameOver || this.isPaused) return;
    this.player.jump();
  }

  /**
   * Moves the ground to create scrolling effect
   */
  private moveGround(): void {
    this.ground.tilePositionX += this.gameSpeed / 60;
    this.background.tilePositionX += this.gameSpeed / 240; // Slower parallax effect
  }

  /**
   * Creates a coin at the specified position
   */
  public createCoin(x: number, y: number): void {
    const coin = this.coinGroup.get(x, y) as Coin;
    if (coin) {
      coin.spawn(x, y, this.gameSpeed);
    }
  }

  /**
   * Update coins movement and check if they need to be removed
   */
  private updateCoins(delta: number): void {
    this.coinGroup.getChildren().forEach((coin: Phaser.GameObjects.GameObject) => {
      // Use type assertion with unknown intermediary to avoid direct cast warning
      const coinSprite = coin as unknown as Coin;
      coinSprite.update(delta, this.gameSpeed);

      // Check if we need to attract coins with magnet powerup
      if (this.activePowerups.has('magnet')) {
        coinSprite.attractToPlayer(this.player);
      }
    });
  }

  /**
   * Handle collision with obstacles
   */
  private handleObstacleCollision(): void {
    // If player has shield, ignore collision
    if (this.activePowerups.has('shield')) {
      // Play shield hit sound effect
      // Disabled for now to prevent errors
      // this.sound.play('shield-hit');
      return;
    }

    this.gameOver();
  }

  /**
   * Handle collecting coins
   */
  private handleCoinCollection(_player: Phaser.GameObjects.GameObject, coin: Phaser.GameObjects.GameObject): void {
    const coinValue = this.activePowerups.has('doubleCoins') 
      ? COIN_VALUE * 2 
      : COIN_VALUE;
    
    this.coins += coinValue;
    this.score += coinValue;
    this.updateScore();
    
    // Notify React about coin collection
    if (this.reactCallbacks?.collectCoin) {
      this.reactCallbacks.collectCoin(coinValue);
    }
    
    // Play coin collection sound
    // Disabled for now to prevent errors
    // this.sound.play('coin-collect');
    
    // Hide and recycle the coin
    (coin as unknown as Coin).collect();
  }

  /**
   * Handle collecting powerups
   */
  private handlePowerupCollection(_player: Phaser.GameObjects.GameObject, powerup: Phaser.GameObjects.GameObject): void {
    const powerupEntity = powerup as any; // Type cast to access powerup properties
    const powerupType = powerupEntity.powerupType as typeof POWERUP_TYPES[number];
    
    // Activate the powerup effect
    this.activatePowerup(powerupType);
    
    // Notify React about powerup activation
    if (this.reactCallbacks?.activatePowerup) {
      this.reactCallbacks.activatePowerup(powerupType, POWERUP_DURATION / 1000);
    }
    
    // Play powerup collection sound
    // Disabled for now to prevent errors
    // this.sound.play('powerup-collect');
    
    // Hide and recycle the powerup
    powerupEntity.collect();
  }

  /**
   * Activate a powerup effect
   */
  private activatePowerup(type: typeof POWERUP_TYPES[number]): void {
    // Set powerup timer
    this.activePowerups.set(type, POWERUP_DURATION);
    
    // Apply powerup effects
    switch (type) {
      case 'speed':
        this.player.setSpeedBoost(true);
        break;
      case 'shield':
        this.player.setShield(true);
        break;
      // Other powerups don't need immediate application as they're checked during gameplay
    }
  }

  /**
   * Update powerups timers and deactivate expired ones
   */
  private updatePowerups(delta: number): void {
    this.activePowerups.forEach((timeLeft, type) => {
      const newTime = timeLeft - delta;
      
      if (newTime <= 0) {
        // Deactivate powerup
        // Cast to the valid powerup type to avoid type errors
        this.deactivatePowerup(type as 'shield' | 'doubleCoins' | 'magnet' | 'speed');
      } else {
        // Update timer
        this.activePowerups.set(type, newTime);
      }
    });
  }

  /**
   * Deactivate a powerup effect
   */
  private deactivatePowerup(type: typeof POWERUP_TYPES[number]): void {
    this.activePowerups.delete(type);
    
    // Remove powerup effects
    switch (type) {
      case 'speed':
        this.player.setSpeedBoost(false);
        break;
      case 'shield':
        this.player.setShield(false);
        break;
      // Other powerups don't need immediate removal as they're checked during gameplay
    }
    
    // Notify React about powerup deactivation
    if (this.reactCallbacks?.deactivatePowerup) {
      this.reactCallbacks.deactivatePowerup(type);
    }
  }

  /**
   * Update the game score based on distance and coins
   */
  private updateScore(): void {
    // Calculate score based on distance and coins
    const distanceScore = Math.floor(this.distance * DISTANCE_SCORE_MULTIPLIER);
    const totalScore = distanceScore + this.coins;
    
    if (this.score !== totalScore) {
      this.score = totalScore;
      
      // Update score in React state
      if (this.reactCallbacks?.updateScore) {
        this.reactCallbacks.updateScore(this.score);
      }
    }
  }

  /**
   * Game over handler
   */
  private gameOver(): void {
    if (this.isGameOver) return;
    
    // Set game over state
    this.isGameOver = true;
    
    // Stop the physics
    this.physics.pause();
    
    // Show game over animation
    this.player.die();
    
    // Play game over sound
    // Disabled for now to prevent errors
    // this.sound.play('game-over');
    
    // Notify React about game over
    if (this.reactCallbacks?.gameOver) {
      this.reactCallbacks.gameOver(this.score);
    }
  }

  /**
   * Pause the game
   */
  private pauseGame(): void {
    if (this.isGameOver) return;
    
    this.isPaused = true;
    this.physics.pause();
    this.scene.pause();
    
    // Notify React about pause
    if (this.reactCallbacks?.pauseGame) {
      this.reactCallbacks.pauseGame();
    }
  }

  /**
   * Resume the game
   */
  private resumeGame(): void {
    if (this.isGameOver) return;
    
    this.isPaused = false;
    this.physics.resume();
    this.scene.resume();
    
    // Notify React about resume
    if (this.reactCallbacks?.resumeGame) {
      this.reactCallbacks.resumeGame();
    }
  }

  /**
   * Restart the game
   */
  private restartGame(): void {
    this.scene.restart();
  }

  /**
   * Check if a powerup is active
   */
  public isPowerupActive(type: typeof POWERUP_TYPES[number]): boolean {
    return this.activePowerups.has(type);
  }

  /**
   * Get current game speed
   */
  public getGameSpeed(): number {
    return this.gameSpeed;
  }

  // React callbacks for state synchronization
  private reactCallbacks?: {
    pauseGame: () => void;
    resumeGame: () => void;
    gameOver: (score: number) => void;
    updateScore: (score: number) => void;
    collectCoin: (value: number) => void;
    activatePowerup: (type: string, duration: number) => void;
    deactivatePowerup: (type: string) => void;
  };
}

// Extend the Window interface to include game callbacks
declare global {
  interface Window {
    gameCallbacks?: {
      pauseGame: () => void;
      resumeGame: () => void;
      gameOver: (score: number) => void;
      updateScore: (score: number) => void;
      collectCoin: (value: number) => void;
      activatePowerup: (type: string, duration: number) => void;
      deactivatePowerup: (type: string) => void;
    };
  }
}
