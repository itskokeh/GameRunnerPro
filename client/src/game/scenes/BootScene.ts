import Phaser from 'phaser';
import { PLACEHOLDER_ASSETS, COLORS } from '../utils/constants';

/**
 * BootScene is responsible for preloading all assets
 * and transitioning to the GameScene
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Display loading progress
    this.createLoadingScreen();

    // Load game assets - these are placeholder graphics
    this.loadAssets();

    // Update loading progress
    this.load.on('progress', (value: number) => {
      this.updateLoadingProgress(value);
    });
  }

  create(): void {
    // Start the game scene once assets are loaded
    this.scene.start('GameScene');
  }

  /**
   * Creates a visual loading screen with progress bar
   */
  private createLoadingScreen(): void {
    // Create a loading text
    const loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      'Loading...',
      {
        fontFamily: '"Press Start 2P"',
        fontSize: '24px',
        color: '#FFFFFF'
      }
    );
    loadingText.setOrigin(0.5);

    // Create a loading progress container
    const progressBarBg = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      300,
      30,
      0x000000
    );
    progressBarBg.setOrigin(0.5);
    progressBarBg.setStrokeStyle(2, COLORS.PRIMARY);

    // Create progress bar that will be updated during loading
    this.progressBar = this.add.rectangle(
      this.cameras.main.width / 2 - 150,
      this.cameras.main.height / 2,
      0,
      30,
      COLORS.PRIMARY
    );
    this.progressBar.setOrigin(0, 0.5);
  }

  /**
   * Updates the loading progress bar based on asset loading progress
   */
  private updateLoadingProgress(value: number): void {
    if (this.progressBar) {
      this.progressBar.width = 300 * value;
    }
  }

  /**
   * Loads all necessary game assets
   */
  private loadAssets(): void {
    // Load placeholder sprites using shapes
    this.generatePlaceholderSprites();

    // Load sounds - instead of actual files, we'll use the built-in Phaser sounds
    this.loadSounds();
  }

  /**
   * Generates placeholder sprites using Phaser graphics
   */
  private generatePlaceholderSprites(): void {
    // Player character placeholder (blue rectangle)
    this.createPlaceholderSprite(PLACEHOLDER_ASSETS.PLAYER, 32, 64, COLORS.PRIMARY);

    // Ground placeholder (gray rectangle)
    this.createPlaceholderSprite(PLACEHOLDER_ASSETS.GROUND, 800, 64, 0x505050);

    // Obstacle placeholder (red rectangle)
    this.createPlaceholderSprite(PLACEHOLDER_ASSETS.OBSTACLE, 32, 64, COLORS.DANGER);

    // Coin placeholder (yellow circle)
    this.createPlaceholderCircle(PLACEHOLDER_ASSETS.COIN, 12, COLORS.WARNING);

    // Powerup placeholders
    this.createPlaceholderCircle(PLACEHOLDER_ASSETS.POWERUP_MAGNET, 16, COLORS.ACCENT);
    this.createPlaceholderCircle(PLACEHOLDER_ASSETS.POWERUP_DOUBLE_COINS, 16, COLORS.WARNING);
    this.createPlaceholderCircle(PLACEHOLDER_ASSETS.POWERUP_SPEED, 16, COLORS.SUCCESS);
    this.createPlaceholderCircle(PLACEHOLDER_ASSETS.POWERUP_SHIELD, 16, COLORS.PURPLE);

    // Background placeholder (gradient)
    this.createPlaceholderBackground(PLACEHOLDER_ASSETS.BACKGROUND, 800, 600);
  }

  /**
   * Creates a rectangle placeholder sprite
   */
  private createPlaceholderSprite(
    key: string,
    width: number,
    height: number,
    color: number
  ): void {
    // Create a canvas texture directly
    const rt = this.add.renderTexture(0, 0, width, height);
    rt.fill(color);
    rt.saveTexture(key);
    rt.destroy();
  }

  /**
   * Creates a circular placeholder sprite
   */
  private createPlaceholderCircle(key: string, radius: number, color: number): void {
    // Create a canvas and draw a circle
    const rt = this.add.renderTexture(0, 0, radius * 2, radius * 2);
    
    // Draw a filled circle using a temp graphics object
    const tempGraphics = this.add.graphics();
    tempGraphics.fillStyle(color);
    tempGraphics.fillCircle(radius, radius, radius);
    
    // Draw the graphics to the render texture
    rt.draw(tempGraphics);
    tempGraphics.destroy();
    
    // Save as texture and cleanup
    rt.saveTexture(key);
    rt.destroy();
  }

  /**
   * Creates a placeholder background with gradient
   */
  private createPlaceholderBackground(key: string, width: number, height: number): void {
    // Create a canvas
    const rt = this.add.renderTexture(0, 0, width, height);
    
    // Draw a filled rectangle for top and bottom using temp graphics objects
    const topRect = this.add.graphics();
    topRect.fillStyle(0x1E3A8A);
    topRect.fillRect(0, 0, width, height/2);
    
    const bottomRect = this.add.graphics();
    bottomRect.fillStyle(0x111827);
    bottomRect.fillRect(0, height/2, width, height/2);
    
    // Draw the graphics to the render texture
    rt.draw(topRect);
    rt.draw(bottomRect);
    
    // Clean up graphics objects
    topRect.destroy();
    bottomRect.destroy();
    
    // Save as texture and cleanup
    rt.saveTexture(key);
    rt.destroy();
  }

  /**
   * Load necessary sound effects
   */
  private loadSounds(): void {
    // We're using Phaser's built-in audio capabilities instead of loading external files
    // In a real game, you would load audio files like this:
    // this.load.audio('jump', 'assets/audio/jump.mp3');
  }

  // Class property for progress bar
  private progressBar!: Phaser.GameObjects.Rectangle;
}
