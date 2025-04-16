// Game dimensions and scaling
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Physics constants
export const GRAVITY = 1000;
export const PLAYER_JUMP_VELOCITY = -600;
export const GAME_SPEED = 300;
export const MAX_GAME_SPEED = 800;
export const GAME_ACCELERATION = 0.001;

// Game elements
export const GROUND_HEIGHT = 64;
export const PLAYER_INITIAL_X = 150;
export const PLAYER_SIZE = { width: 32, height: 64 };

// Scoring
export const COIN_VALUE = 10;
export const DISTANCE_SCORE_MULTIPLIER = 0.1;

// Collectibles
export const COIN_SIZE = 24;
export const POWERUP_SIZE = 32;
export const POWERUP_SPAWN_CHANCE = 0.05; // 5% chance per obstacle group

// Powerups
export const POWERUP_DURATION = 15000; // 15 seconds in milliseconds
export const POWERUP_TYPES = ['magnet', 'doubleCoins', 'speed', 'shield'] as const;
export type PowerupType = typeof POWERUP_TYPES[number];

// Powerup effects
export const MAGNET_RADIUS = 200;
export const DOUBLE_COINS_MULTIPLIER = 2;
export const SPEED_BOOST_MULTIPLIER = 1.5;
export const SHIELD_INVINCIBILITY = true;

// Obstacles
export const OBSTACLE_MIN_DISTANCE = 400;
export const OBSTACLE_MAX_DISTANCE = 800;
export const OBSTACLE_MIN_GAP = 300;
export const OBSTACLE_MIN_HEIGHT = 30;
export const OBSTACLE_MAX_HEIGHT = 80;
export const OBSTACLE_VARIATIONS = 3;

// Colors (in hex format)
export const COLORS = {
  PRIMARY: 0x3B82F6,    // Blue
  ACCENT: 0xF97316,     // Orange
  SUCCESS: 0x10B981,    // Green
  WARNING: 0xFBBF24,    // Yellow
  DANGER: 0xEF4444,     // Red
  PURPLE: 0x8B5CF6      // Purple
};

// Z-Index order for game objects
export const Z_INDEX = {
  BACKGROUND: 0,
  COLLECTIBLES: 10,
  OBSTACLES: 20,
  PLAYER: 30,
  UI: 40
};

// Placeholder assets
export const PLACEHOLDER_ASSETS = {
  PLAYER: 'player',
  GROUND: 'ground',
  OBSTACLE: 'obstacle',
  COIN: 'coin',
  POWERUP_MAGNET: 'powerup-magnet',
  POWERUP_DOUBLE_COINS: 'powerup-double-coins',
  POWERUP_SPEED: 'powerup-speed',
  POWERUP_SHIELD: 'powerup-shield',
  BACKGROUND: 'background'
};

// Asset paths
export const ASSET_PATHS = {
  SPRITES: 'sprites',
  AUDIO: 'audio'
};

// Sound effects
export const SOUNDS = {
  JUMP: 'jump',
  COIN_COLLECT: 'coin-collect',
  POWERUP_COLLECT: 'powerup-collect',
  GAME_OVER: 'game-over',
  SHIELD_HIT: 'shield-hit'
};
