import Phaser from 'phaser';
import Powerup from '../entities/Powerup';
import { POWERUP_TYPES } from '../utils/constants';

/**
 * PowerupManager handles creation, positioning and recycling of powerups
 */
export default class PowerupManager {
  // Reference to the scene
  private scene: Phaser.Scene;
  
  // Powerup group
  private powerups: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Create powerup group
    this.powerups = this.scene.physics.add.group({
      classType: Powerup,
      maxSize: 5,
      runChildUpdate: true
    });
  }

  /**
   * Update method called by the scene
   */
  update(delta: number, gameSpeed: number): void {
    // Update all powerups
    this.powerups.getChildren().forEach((powerup: Phaser.GameObjects.GameObject) => {
      const powerupSprite = powerup as Powerup;
      powerupSprite.update(delta, gameSpeed);
    });
  }

  /**
   * Spawn a new powerup
   */
  spawnPowerup(x: number, y: number, type: typeof POWERUP_TYPES[number]): void {
    // Get a powerup from the pool
    const powerup = this.powerups.get() as Powerup;
    if (powerup) {
      // Spawn the powerup
      powerup.spawn(x, y, this.scene.getGameSpeed(), type);
    }
  }

  /**
   * Get the powerups group for collision detection
   */
  getPowerups(): Phaser.Physics.Arcade.Group {
    return this.powerups;
  }
}
