import Phaser from 'phaser';
import { 
  PLAYER_JUMP_VELOCITY, 
  PLACEHOLDER_ASSETS,
  SPEED_BOOST_MULTIPLIER 
} from '../utils/constants';

/**
 * Player class representing the controllable character
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
  // Player state
  private isJumping: boolean = false;
  private canJump: boolean = true;
  private hasSpeedBoost: boolean = false;
  private hasShield: boolean = false;
  
  // Visual effects
  private shieldEffect?: Phaser.GameObjects.Ellipse;
  private jumpEffect?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PLACEHOLDER_ASSETS.PLAYER);
    
    // Add the sprite to the scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configure physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(28, 64); // Make hitbox slightly smaller than sprite
    
    // Create animations
    this.createAnimations();
    
    // Create visual effects
    this.createEffects();
    
    // Set depth to ensure player is drawn above other elements
    this.setDepth(30);
    
    // Initial animation
    this.play('run');
  }

  /**
   * Create player animations
   */
  private createAnimations(): void {
    // Create a simple run animation for the player
    this.scene.anims.create({
      key: 'run',
      frames: [{ key: PLACEHOLDER_ASSETS.PLAYER }],
      frameRate: 10,
      repeat: -1
    });
    
    // Create jump animation
    this.scene.anims.create({
      key: 'jump',
      frames: [{ key: PLACEHOLDER_ASSETS.PLAYER }],
      frameRate: 10,
      repeat: 0
    });
  }

  /**
   * Create visual effects for the player
   */
  private createEffects(): void {
    // Create shield effect (invisible by default)
    this.shieldEffect = this.scene.add.ellipse(
      this.x,
      this.y,
      this.width + 20,
      this.height + 10,
      0x8B5CF6,
      0.4
    );
    this.shieldEffect.setVisible(false);
    this.shieldEffect.setDepth(25);
    
    // We would create particle effects here for jumping, running etc.
    // For simplicity, we're skipping this in the placeholder version
  }

  /**
   * Update method called by the scene
   */
  update(delta: number): void {
    // Update shield effect position if active
    if (this.hasShield && this.shieldEffect) {
      this.shieldEffect.setPosition(this.x, this.y);
    }
    
    // Reset can jump if player is on the ground
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body && body.touching.down) {
      this.isJumping = false;
      this.canJump = true;
    }
    
    // Apply speed boost visual effect
    if (this.hasSpeedBoost) {
      // In a real game, we would add a trailing effect or particles here
    }
  }

  /**
   * Make the player jump
   */
  jump(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;
    
    // Only allow jumping if on the ground or can double-jump
    if ((body.touching.down || !this.isJumping) && this.canJump) {
      // Apply upward velocity
      body.setVelocityY(PLAYER_JUMP_VELOCITY);
      
      // Update state
      this.isJumping = true;
      
      // Play jump sound
      this.scene.sound.play('jump');
      
      // If already jumping, prevent further jumps until landing
      if (!body.touching.down) {
        this.canJump = false;
      }
      
      // Play jump animation
      this.play('jump', true);
    }
  }

  /**
   * Set speed boost state
   */
  setSpeedBoost(active: boolean): void {
    this.hasSpeedBoost = active;
    
    // Apply visual changes
    if (active) {
      // Add speed lines or effect
      this.setTint(0x10B981); // Green tint
    } else {
      this.clearTint();
    }
  }

  /**
   * Set shield state
   */
  setShield(active: boolean): void {
    this.hasShield = active;
    
    // Show/hide shield effect
    if (this.shieldEffect) {
      this.shieldEffect.setVisible(active);
    }
  }

  /**
   * Get player's current speed including any boosts
   */
  getSpeed(): number {
    return this.hasSpeedBoost ? SPEED_BOOST_MULTIPLIER : 1;
  }

  /**
   * Handle player death
   */
  die(): void {
    // Play death animation
    this.setTint(0xff0000);
    
    // In a real game, we would play a death animation
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y - 50,
      angle: 180,
      duration: 800,
      ease: 'Power2'
    });
    
    // Hide shield if active
    if (this.shieldEffect) {
      this.shieldEffect.setVisible(false);
    }
  }
}
