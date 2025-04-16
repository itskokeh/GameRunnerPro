import Phaser from 'phaser';
import Player from './Player';
import { PLACEHOLDER_ASSETS, MAGNET_RADIUS } from '../utils/constants';

/**
 * Coin class for collectible coins
 */
export default class Coin extends Phaser.Physics.Arcade.Sprite {
  // Coin properties
  private active: boolean = false;
  private coinSpeed: number = 0;
  private magnetAttraction: boolean = false;
  
  // Visual effects
  private glowEffect?: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PLACEHOLDER_ASSETS.COIN);
    
    // Add the sprite to the scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configure physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    
    // Set depth to ensure coins are drawn correctly
    this.setDepth(10);
    
    // Add animation
    this.createAnimations();
    
    // Initially deactivate the coin
    this.setActive(false);
    this.setVisible(false);
  }

  /**
   * Create coin animations
   */
  private createAnimations(): void {
    // Spinning animation would normally be done with sprite sheets
    // For our placeholder, we'll just use a simple scale animation
    
    // Add rotation animation
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 1500,
      repeat: -1,
      yoyo: false
    });
  }

  /**
   * Update method called by the scene
   */
  update(delta: number, gameSpeed: number): void {
    if (!this.active) return;
    
    // If not being attracted by magnet, move with game speed
    if (!this.magnetAttraction) {
      this.x -= (gameSpeed * delta) / 1000;
    }
    
    // Check if coin is off screen and deactivate
    if (this.x < -this.width) {
      this.deactivate();
    }
  }

  /**
   * Spawn the coin at the given position
   */
  spawn(x: number, y: number, speed: number): void {
    // Set position
    this.setPosition(x, y);
    
    // Set coin properties
    this.coinSpeed = speed;
    
    // Reset attraction flag
    this.magnetAttraction = false;
    
    // Activate the coin
    this.setActive(true);
    this.setVisible(true);
    this.active = true;
    
    // Reset body velocity
    this.body.reset(x, y);
    
    // Add bobbing animation
    this.scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  /**
   * Deactivate the coin (recycle it)
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
   * Collect the coin with animation
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
   * Attract the coin toward the player (magnet powerup effect)
   */
  attractToPlayer(player: Player): void {
    // Check if player is close enough
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      player.x, player.y
    );
    
    if (distance < MAGNET_RADIUS) {
      // Set attraction flag
      this.magnetAttraction = true;
      
      // Calculate direction and move toward player
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        player.x, player.y
      );
      
      // Calculate attraction speed based on distance
      const speed = Math.max(100, 400 * (1 - distance / MAGNET_RADIUS));
      
      // Set velocity to move toward player
      this.body.velocity.x = Math.cos(angle) * speed;
      this.body.velocity.y = Math.sin(angle) * speed;
    } else if (this.magnetAttraction) {
      // If was attracted but now out of range, reset movement
      this.magnetAttraction = false;
      this.body.velocity.set(0, 0);
    }
  }

  /**
   * Check if the coin is currently active
   */
  isActive(): boolean {
    return this.active;
  }
}
