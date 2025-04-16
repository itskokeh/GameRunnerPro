import Phaser from 'phaser';
import Obstacle from '../entities/Obstacle';
import Coin from '../entities/Coin';
import { 
  OBSTACLE_MIN_DISTANCE, 
  OBSTACLE_MAX_DISTANCE,
  OBSTACLE_MIN_HEIGHT,
  OBSTACLE_MAX_HEIGHT,
  OBSTACLE_VARIATIONS,
  GROUND_HEIGHT,
  COIN_SIZE,
  POWERUP_SPAWN_CHANCE,
  POWERUP_TYPES
} from '../utils/constants';

/**
 * ObstacleManager handles creation, positioning and recycling of obstacles
 */
export default class ObstacleManager {
  // Reference to the scene
  private scene: Phaser.Scene;
  
  // Obstacle group
  private obstacles: Phaser.Physics.Arcade.Group;
  
  // Tracking variables
  private nextObstacleDistance: number = 0;
  private lastObstacleX: number = 0;
  private distanceTraveled: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Create obstacle group
    this.obstacles = this.scene.physics.add.group({
      classType: Obstacle,
      maxSize: 10,
      runChildUpdate: true
    });
    
    // Initialize starting position
    this.lastObstacleX = this.scene.cameras.main.width;
    this.calculateNextObstacleDistance();
  }

  /**
   * Update method called by the scene
   */
  update(delta: number, gameSpeed: number): void {
    // Update distance traveled
    this.distanceTraveled += (gameSpeed * delta) / 1000;
    
    // Check if it's time to spawn a new obstacle
    if (this.distanceTraveled >= this.nextObstacleDistance) {
      this.spawnObstacle(gameSpeed);
      this.calculateNextObstacleDistance();
    }
    
    // Update all obstacles
    this.obstacles.getChildren().forEach((obstacle: Phaser.GameObjects.GameObject) => {
      const obstacleSprite = obstacle as Obstacle;
      obstacleSprite.update(delta, gameSpeed);
    });
  }

  /**
   * Spawn a new obstacle
   */
  private spawnObstacle(gameSpeed: number): void {
    // Reset distance tracker
    this.distanceTraveled = 0;
    
    // Calculate spawn position
    const spawnX = this.scene.cameras.main.width + 100;
    const groundY = this.scene.cameras.main.height - GROUND_HEIGHT;
    
    // Determine obstacle type and dimensions
    const obstacleType = Math.floor(Math.random() * OBSTACLE_VARIATIONS);
    let obstacleWidth: number;
    let obstacleHeight: number;
    
    switch (obstacleType) {
      case 0: // Standard obstacle
        obstacleWidth = 40;
        obstacleHeight = Phaser.Math.Between(OBSTACLE_MIN_HEIGHT, OBSTACLE_MAX_HEIGHT);
        break;
      case 1: // Tall obstacle
        obstacleWidth = 30;
        obstacleHeight = OBSTACLE_MAX_HEIGHT + 20;
        break;
      case 2: // Wide obstacle
        obstacleWidth = 80;
        obstacleHeight = OBSTACLE_MIN_HEIGHT;
        break;
      default:
        obstacleWidth = 40;
        obstacleHeight = OBSTACLE_MIN_HEIGHT;
    }
    
    // Get an obstacle from the pool
    const obstacle = this.obstacles.get() as Obstacle;
    if (obstacle) {
      // Position the obstacle on the ground
      const obstacleY = groundY - obstacleHeight / 2;
      obstacle.spawn(spawnX, obstacleY, obstacleWidth, obstacleHeight, gameSpeed, obstacleType);
      
      // Save the x position for distance calculation
      this.lastObstacleX = spawnX;
      
      // Spawn coins above the obstacle
      this.spawnCoinsAboveObstacle(spawnX, obstacleY, obstacleWidth, obstacleHeight);
      
      // Randomly spawn a powerup
      this.trySpawnPowerup(spawnX, obstacleY, obstacleHeight);
    }
  }

  /**
   * Calculate the distance until the next obstacle should spawn
   */
  private calculateNextObstacleDistance(): void {
    this.nextObstacleDistance = Phaser.Math.Between(
      OBSTACLE_MIN_DISTANCE,
      OBSTACLE_MAX_DISTANCE
    );
  }

  /**
   * Spawn coins above an obstacle
   */
  private spawnCoinsAboveObstacle(
    obstacleX: number, 
    obstacleY: number, 
    obstacleWidth: number, 
    obstacleHeight: number
  ): void {
    // Determine how many coins to spawn (0-5)
    const coinCount = Phaser.Math.Between(0, 5);
    
    if (coinCount === 0) return;
    
    // Calculate coin positions
    const coinY = obstacleY - obstacleHeight / 2 - COIN_SIZE - 20; // Above the obstacle
    
    // Determine coin formation
    if (coinCount <= 3) {
      // Horizontal line of coins
      for (let i = 0; i < coinCount; i++) {
        const coinX = obstacleX - obstacleWidth / 2 + (i + 0.5) * (obstacleWidth / coinCount);
        this.spawnCoin(coinX, coinY);
      }
    } else {
      // Arc of coins
      const radius = obstacleWidth / 2;
      const angleStep = Math.PI / (coinCount - 1);
      
      for (let i = 0; i < coinCount; i++) {
        const angle = Math.PI - (i * angleStep);
        const coinX = obstacleX + Math.cos(angle) * radius;
        const coinY = obstacleY - obstacleHeight / 2 - 20 + Math.sin(angle) * radius;
        this.spawnCoin(coinX, coinY);
      }
    }
  }

  /**
   * Spawn a single coin
   */
  private spawnCoin(x: number, y: number): void {
    // Access the createCoin method from GameScene
    // @ts-ignore - We know this method exists on our GameScene
    if (this.scene.createCoin) {
      this.scene.createCoin(x, y);
    }
  }

  /**
   * Try to spawn a powerup with a random chance
   */
  private trySpawnPowerup(obstacleX: number, obstacleY: number, obstacleHeight: number): void {
    // Random chance to spawn a powerup
    if (Math.random() < POWERUP_SPAWN_CHANCE) {
      // Randomly choose a powerup type
      const randomTypeIndex = Math.floor(Math.random() * POWERUP_TYPES.length);
      const powerupType = POWERUP_TYPES[randomTypeIndex];
      
      // Calculate position (above the obstacle)
      const powerupX = obstacleX + Phaser.Math.Between(-50, 50); // Offset from obstacle
      const powerupY = obstacleY - obstacleHeight - 40; // Above the obstacle
      
      // Access the createPowerup method from GameScene via the PowerupManager
      // @ts-ignore - We know this PowerupManager is available
      if (this.scene.powerupManager) {
        // @ts-ignore - We know this method exists
        this.scene.powerupManager.spawnPowerup(powerupX, powerupY, powerupType);
      }
    }
  }

  /**
   * Get the obstacle group for collision detection
   */
  getObstacles(): Phaser.Physics.Arcade.Group {
    return this.obstacles;
  }
}
