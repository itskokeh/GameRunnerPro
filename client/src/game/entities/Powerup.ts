import Phaser from 'phaser';
import { PLACEHOLDER_ASSETS, POWERUP_TYPES } from '../utils/constants';

/**
 * Powerup class for collectible powerups
 */
export default class Powerup extends Phaser.Physics.Arcade.Sprite {
  // Powerup properties
  private active: boolean = false;
  private powerupSpeed: number = 0;
  public powerupType: typeof POWERUP_TYPES[number] = 'magnet';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PLACEHOLDER_ASSETS.POWERUP_MAGNET); // Default texture
    
    // Add the sprite to the scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configure physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    
    // Set depth to ensure powerups are drawn correctly
    this.setDepth(15);
    
    // Add animation
    this.createAnimations();
    
    // Initially deactivate the powerup
    this.setActive(false);
    this.setVisible(false);
  }

  /**
   * Create powerup animations
   */
  private createAnimations(): void {
    // Pulsing animation
    this.scene.tweens.add({
      targets: this,
      scale: 1.2,
      duration: 500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  /**
   * Update method called by the scene
   */
  update(delta: number, gameSpeed: number): void {
    if (!this.active) return;
    
    // Move powerup to the left based on game speed
    this.x -= (gameSpeed * delta) / 1000;
    
    // Check if powerup is off screen and deactivate
    if (this.x < -this.width) {
      this.deactivate();
    }
  }

  /**
   * Spawn the powerup at the given position with the specified type
   */
  spawn(x: number, y: number, speed: number, type: typeof POWERUP_TYPES[number]): void {
    // Set position
    this.setPosition(x, y);
    
    // Set powerup properties
    this.powerupSpeed = speed;
    this.powerupType = type;
    
    // Set texture based on powerup type
    this.setTexture(this.getTextureForType(type));
    
    // Set tint based on powerup type
    this.setTint(this.getTintForType(type));
    
    // Activate the powerup
    this.setActive(true);
    this.setVisible(true);
    this.active = true;
    
    // Reset body and scale
    this.body.reset(x, y);
    this.setScale(1);
    
    // Add floating animation
    this.scene.tweens.add({
      targets: this,
      y: y - 15,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  /**
   * Deactivate the powerup (recycle it)
   */
  deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.active = false;
    this.body.reset(0, 0);
    
    // Stop any active tweens
    this.scene.tweens.killTweensOf(this);
  }

  /**
   * Collect the powerup with animation
   */
  collect(): void {
    // Stop any active tweens
    this.scene.tweens.killTweensOf(this);
    
    // Play collection animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.deactivate();
      }
    });
  }

  /**
   * Get the appropriate texture for the powerup type
   */
  private getTextureForType(type: typeof POWERUP_TYPES[number]): string {
    switch (type) {
      case 'magnet':
        return PLACEHOLDER_ASSETS.POWERUP_MAGNET;
      case 'doubleCoins':
        return PLACEHOLDER_ASSETS.POWERUP_DOUBLE_COINS;
      case 'speed':
        return PLACEHOLDER_ASSETS.POWERUP_SPEED;
      case 'shield':
        return PLACEHOLDER_ASSETS.POWERUP_SHIELD;
      default:
        return PLACEHOLDER_ASSETS.POWERUP_MAGNET;
    }
  }

  /**
   * Get the appropriate tint color for the powerup type
   */
  private getTintForType(type: typeof POWERUP_TYPES[number]): number {
    switch (type) {
      case 'magnet':
        return 0xF97316; // Orange
      case 'doubleCoins':
        return 0xFBBF24; // Yellow
      case 'speed':
        return 0x10B981; // Green
      case 'shield':
        return 0x8B5CF6; // Purple
      default:
        return 0xFFFFFF; // White
    }
  }

  /**
   * Check if the powerup is currently active
   */
  isActive(): boolean {
    return this.active;
  }
}
