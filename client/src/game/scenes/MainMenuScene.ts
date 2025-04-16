import Phaser from 'phaser';
import { COLORS, PLACEHOLDER_ASSETS } from '../utils/constants';

/**
 * MainMenuScene handles the game's main menu
 * 
 * This scene is primarily here for educational purposes. In our implementation,
 * we're actually using React for the main menu UI, but this demonstrates how to
 * create a menu scene in Phaser for games that don't use a separate UI framework.
 */
export default class MainMenuScene extends Phaser.Scene {
  // UI elements
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private playButton!: Phaser.GameObjects.Container;
  private playButtonText!: Phaser.GameObjects.Text;
  private howToPlayButton!: Phaser.GameObjects.Container;
  private howToPlayButtonText!: Phaser.GameObjects.Text;
  private background!: Phaser.GameObjects.Rectangle;

  // Powerup preview elements
  private powerupPreviewContainers: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    // Create gradient background
    this.createBackground();

    // Create title
    this.createTitle();

    // Create buttons
    this.createButtons();

    // Create powerup preview
    this.createPowerupPreview();

    // Create event listeners
    this.createEventListeners();
  }

  /**
   * Create a gradient background for the menu
   */
  private createBackground(): void {
    // Create a gradient rectangle (similar to our React UI)
    this.background = this.add.rectangle(
      0, 
      0, 
      this.cameras.main.width, 
      this.cameras.main.height, 
      0x1E3A8A
    );
    this.background.setOrigin(0, 0);

    // Create gradient effect with additional rectangles
    const gradientSteps = 10;
    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / gradientSteps;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        { r: 30, g: 58, b: 138 }, // Blue (0x1E3A8A)
        { r: 17, g: 24, b: 39 },  // Dark (0x111827)
        gradientSteps,
        i
      );
      
      const rect = this.add.rectangle(
        0,
        this.cameras.main.height * (ratio),
        this.cameras.main.width,
        this.cameras.main.height / gradientSteps,
        Phaser.Display.Color.GetColor(color.r, color.g, color.b)
      );
      rect.setOrigin(0, 0);
    }
  }

  /**
   * Create the title and subtitle text
   */
  private createTitle(): void {
    const centerX = this.cameras.main.width / 2;
    
    // Create title text
    this.titleText = this.add.text(centerX, 100, 'ENDLESS', {
      fontFamily: '"Press Start 2P"',
      fontSize: '48px',
      color: '#3B82F6', // Primary color
      align: 'center'
    });
    this.titleText.setOrigin(0.5);

    // Create subtitle text
    this.subtitleText = this.add.text(centerX, 150, 'RUNNER', {
      fontFamily: '"Press Start 2P"',
      fontSize: '48px',
      color: '#F97316', // Accent color
      align: 'center'
    });
    this.subtitleText.setOrigin(0.5);

    // Create description text
    const descText = this.add.text(centerX, 200, 'Collect coins, use powerups, avoid obstacles!', {
      fontFamily: 'Rubik',
      fontSize: '16px',
      color: '#D1D5DB', // Light gray
      align: 'center'
    });
    descText.setOrigin(0.5);
  }

  /**
   * Create menu buttons
   */
  private createButtons(): void {
    const centerX = this.cameras.main.width / 2;
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonY = 300;
    
    // Create play button
    this.playButton = this.createButton(
      centerX, 
      buttonY, 
      buttonWidth, 
      buttonHeight, 
      'PLAY', 
      COLORS.PRIMARY
    );
    
    // Create how to play button
    this.howToPlayButton = this.createButton(
      centerX, 
      buttonY + 70, 
      buttonWidth, 
      buttonHeight, 
      'How To Play', 
      0x374151 // Dark gray
    );
  }

  /**
   * Helper function to create a button
   */
  private createButton(
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    text: string, 
    color: number
  ): Phaser.GameObjects.Container {
    // Create container for the button
    const container = this.add.container(x, y);
    
    // Create button background
    const background = this.add.rectangle(0, 0, width, height, color, 1);
    background.setOrigin(0.5);
    background.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        background.fillColor = Phaser.Display.Color.ValueLighten(color, 0.1);
      })
      .on('pointerout', () => {
        background.fillColor = color;
      })
      .on('pointerdown', () => {
        background.fillColor = Phaser.Display.Color.ValueDarken(color, 0.1);
      })
      .on('pointerup', () => {
        background.fillColor = color;
      });
    
    // Create button text
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: text === 'PLAY' ? '"Press Start 2P"' : 'Rubik',
      fontSize: text === 'PLAY' ? '20px' : '16px',
      color: '#FFFFFF'
    });
    buttonText.setOrigin(0.5);
    
    // Add to container
    container.add([background, buttonText]);
    
    // Store text reference for easy access
    if (text === 'PLAY') {
      this.playButtonText = buttonText;
    } else {
      this.howToPlayButtonText = buttonText;
    }
    
    return container;
  }

  /**
   * Create powerup preview section
   */
  private createPowerupPreview(): void {
    const centerX = this.cameras.main.width / 2;
    const startY = 400;
    
    // Add header
    const header = this.add.text(centerX, startY, 'POWERUPS', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#FFFFFF'
    });
    header.setOrigin(0.5);
    
    // Define powerups to display
    const powerups = [
      { name: 'Magnet', desc: 'Attracts all coins', color: COLORS.ACCENT, texture: PLACEHOLDER_ASSETS.POWERUP_MAGNET },
      { name: 'Double Coins', desc: '2x coin value', color: COLORS.WARNING, texture: PLACEHOLDER_ASSETS.POWERUP_DOUBLE_COINS },
      { name: 'Speed Boost', desc: 'Run faster', color: COLORS.SUCCESS, texture: PLACEHOLDER_ASSETS.POWERUP_SPEED },
      { name: 'Shield', desc: 'Invincibility', color: COLORS.PURPLE, texture: PLACEHOLDER_ASSETS.POWERUP_SHIELD }
    ];
    
    // Create grid layout
    const gridWidth = 2;
    const cellWidth = 150;
    const cellHeight = 80;
    const startX = centerX - (cellWidth * gridWidth) / 2 + cellWidth / 2;
    
    // Create powerup previews
    for (let i = 0; i < powerups.length; i++) {
      const col = i % gridWidth;
      const row = Math.floor(i / gridWidth);
      
      const x = startX + col * cellWidth;
      const y = startY + 50 + row * cellHeight;
      
      // Create powerup preview container
      this.createPowerupPreviewItem(x, y, powerups[i]);
    }
  }

  /**
   * Create a single powerup preview item
   */
  private createPowerupPreviewItem(
    x: number, 
    y: number, 
    powerup: { name: string, desc: string, color: number, texture: string }
  ): void {
    // Create container
    const container = this.add.container(x, y);
    
    // Create background
    const bg = this.add.rectangle(0, 0, 140, 70, 0x000000, 0.6);
    bg.setOrigin(0.5);
    bg.setStrokeStyle(1, 0x374151);
    
    // Create powerup icon background
    const iconBg = this.add.circle(-50, 0, 16, powerup.color);
    
    // Create powerup icon
    const icon = this.add.image(-50, 0, powerup.texture);
    icon.setScale(0.8);
    
    // Create text
    const nameText = this.add.text(-25, -12, powerup.name, {
      fontFamily: 'Rubik',
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    nameText.setOrigin(0, 0.5);
    
    const descText = this.add.text(-25, 8, powerup.desc, {
      fontFamily: 'Rubik',
      fontSize: '12px',
      color: '#9CA3AF' // Gray
    });
    descText.setOrigin(0, 0.5);
    
    // Add to container
    container.add([bg, iconBg, icon, nameText, descText]);
    
    // Add to array for easy access
    this.powerupPreviewContainers.push(container);
  }

  /**
   * Set up event listeners for buttons
   */
  private createEventListeners(): void {
    // Get button backgrounds
    const playButtonBg = this.playButton.getAt(0) as Phaser.GameObjects.Rectangle;
    const howToPlayButtonBg = this.howToPlayButton.getAt(0) as Phaser.GameObjects.Rectangle;
    
    // Add click handlers
    playButtonBg.on('pointerup', () => {
      // Start the game
      this.scene.start('GameScene');
    });
    
    howToPlayButtonBg.on('pointerup', () => {
      // In our real implementation, this would open the how to play dialog
      // But since we're using React for UI, this is for educational purposes only
      console.log('How to play clicked');
      
      // We could also dispatch a custom event that React can listen for
      if (typeof window !== 'undefined') {
        const howToPlayEvent = new CustomEvent('game:howToPlay');
        window.dispatchEvent(howToPlayEvent);
      }
    });
  }
}
