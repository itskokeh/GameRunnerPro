import Phaser from 'phaser';
import { PLACEHOLDER_ASSETS } from '../utils/constants';

/**
 * Obstacle class for objects the player must avoid
 */
export default class Obstacle extends Phaser.Physics.Arcade.Sprite {
  // Obstacle properties
  private active: boolean = false;
  private obstacleSpeed: number = 0;
  private obstacleType: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PLACEHOLDER_ASSETS.OBSTACLE);
    
    // Add the sprite to the scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configure physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(false);
    
    // Set depth to ensure obstacles are drawn correctly
    this.setDepth(20);
    
    // Initially deactivate the obstacle
    this.setActive(false);
    this.setVisible(false);
  }

  /**
   * Update method called by the scene
   */
  update(delta: number, gameSpeed: number): void {
    if (!this.active) return;
    
    // Move obstacle to the left based on game speed
    this.x -= (gameSpeed * delta) / 1000;
    
    // Check if obstacle is off screen and deactivate
    if (this.x < -this.width) {
      this.deactivate();
    }
  }

  /**
   * Spawn the obstacle at the given position
   */
  spawn(x: number, y: number, width: number, height: number, speed: number, type: number = 0): void {
    // Set position and size
    this.setPosition(x, y);
    this.setSize(width, height);
    this.setDisplaySize(width, height);
    
    // Set obstacle properties
    this.obstacleSpeed = speed;
    this.obstacleType = type;
    
    // Activate the obstacle
    this.setActive(true);
    this.setVisible(true);
    this.active = true;
    
    // Set different appearance based on obstacle type
    this.setObstacleAppearance(type);
  }

  /**
   * Deactivate the obstacle (recycle it)
   */
  deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.active = false;
    this.body.reset(0, 0);
  }

  /**
   * Set the obstacle's appearance based on its type
   */
  private setObstacleAppearance(type: number): void {
    // Clear any previous modifications
    this.clearTint();
    this.setScale(1);
    
    // Apply different appearance based on type
    switch (type) {
      case 0: // Normal obstacle
        // Default appearance
        break;
      case 1: // Tall obstacle
        this.setTint(0xD97706); // Amber color
        break;
      case 2: // Wide obstacle
        this.setTint(0xDC2626); // Red color
        break;
      default:
        // Default appearance
        break;
    }
  }

  /**
   * Check if the obstacle is currently active
   */
  isActive(): boolean {
    return this.active;
  }
}
