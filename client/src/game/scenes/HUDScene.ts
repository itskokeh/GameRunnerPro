import Phaser from 'phaser';

/**
 * HUDScene overlays the GameScene and displays UI elements
 * Note: This is minimal as most UI is handled by React, but
 * this demonstrates how to create a separate UI scene in Phaser
 */
export default class HUDScene extends Phaser.Scene {
  // References to game objects
  private gameScene!: Phaser.Scene;
  
  // Game state from GameScene
  private score: number = 0;
  private coins: number = 0;
  
  // UI elements
  private debugText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create(): void {
    // Get reference to the main game scene
    this.gameScene = this.scene.get('GameScene');
    
    // Create debug text (only visible in development mode)
    if (process.env.NODE_ENV === 'development') {
      this.createDebugText();
    }
    
    // Listen for events from the game scene
    this.listenToGameEvents();
  }

  update(): void {
    // Update debug text if enabled
    if (process.env.NODE_ENV === 'development' && this.debugText) {
      this.updateDebugText();
    }
  }

  /**
   * Creates debug text display for development
   */
  private createDebugText(): void {
    this.debugText = this.add.text(
      10, 
      10, 
      'DEBUG INFO', 
      { 
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 5, y: 5 }
      }
    );
    this.debugText.setDepth(1000);
  }

  /**
   * Updates the debug text with current game state
   */
  private updateDebugText(): void {
    // Get data from the game scene using custom methods we'll define
    // @ts-ignore - We know these methods exist on our GameScene
    const gameSpeed = this.gameScene.getGameSpeed?.() || 0;
    
    // Create debug info text
    const debugInfo = [
      `Score: ${this.score}`,
      `Coins: ${this.coins}`,
      `Game Speed: ${gameSpeed.toFixed(2)}`,
      `FPS: ${this.game.loop.actualFps.toFixed(1)}`,
      // Add more debug info as needed
    ].join('\n');
    
    // Update the text
    this.debugText.setText(debugInfo);
  }

  /**
   * Set up event listeners for the game scene
   */
  private listenToGameEvents(): void {
    // Listen for score updates
    this.gameScene.events.on('update-score', (score: number) => {
      this.score = score;
    }, this);
    
    // Listen for coin updates
    this.gameScene.events.on('collect-coin', (coins: number) => {
      this.coins = coins;
    }, this);
    
    // Clean up when scene shuts down
    this.events.on('shutdown', () => {
      this.gameScene.events.off('update-score', this.updateDebugText, this);
      this.gameScene.events.off('collect-coin', this.updateDebugText, this);
    }, this);
  }
}
