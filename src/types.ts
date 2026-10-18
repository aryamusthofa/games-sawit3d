export type CameraMode = 'TPS' | 'FPS';
export type ToolType = 'egrek' | 'tractor' | 'truck';
export type WeatherType = 'sunny' | 'sunset' | 'night' | 'rain' | 'kemarau_extreme';
export type BiomeType = 'gambut_riau' | 'sumatera_hills' | 'kalimantan_mega' | 'pulau_legend';

export interface BossRaidState {
  active: boolean;
  name: string;
  hp: number;
  maxHp: number;
  x: number;
  z: number;
  timeRemaining: number; // Loss aversion countdown (seconds)
  stolenTbs: number; // TBS threatened to be eaten
  rewardMoney: number;
  rewardCpo: number;
  mapFragmentFound?: boolean;
  lastHitTime?: number;
  difficultyPercent?: number; // 10% to 100%
  difficultyRank?: string; // 'Normal' | 'Sulit' | 'SULTAN EKSTREM (>80%)'
  difficultyMultiplier?: number;
}

export interface UpgradesState {
  egrekSharpness: number;   // Lvl 1-15
  egrekStage: number;       // Stage 1 (Carbon) to 5 (Quantum Laser)
  tractorHydraulics: number;// Lvl 1-15
  tractorStage: number;     // Stage 1 (Mini Loader) to 5 (Giant Heavy Duty)
  truckCapacity: number;    // Lvl 1-15
  truckStage: number;       // Stage 1 (Colt) to 5 (Titan Hydro Dump)
  autoHarvesterBots: number;// Lvl 0-15
  workerStage: number;      // Stage 1 (Buruh) to 5 (Satelit AI Sultan)
  fertilizerBoost: number;  // Lvl 1-15
  fertilizerStage: number;  // Stage 1 (NPK) to 5 (Bio-Quantum Gold)
  sprayerLevel: number;     // Lvl 0-15
  sprayerStage: number;     // Stage 1 (Sprayer Manual) to 5 (Drone Fogging)
  safetyGearLevel: number;  // Lvl 0-15
  safetyGearStage: number;  // Stage 1 (Boot Karet) to 5 (Exoskeleton Anti-Jumpscare)
}

export interface ElementPosition {
  x: number; // percentage from screen left (0 to 100)
  y: number; // percentage from screen top (0 to 100)
}

export interface CustomHudElementPositions {
  joystick: ElementPosition;
  actionButton: ElementPosition;
  quickActions: ElementPosition;
  topInfoBar: ElementPosition;
  topControlsBar: ElementPosition;
  cameraControls: ElementPosition;
  sprintButton: ElementPosition;
  minimap?: ElementPosition;
  weatherBar?: ElementPosition;
}

export interface HUDLayoutSettings {
  joystickPosition: 'bottom_left' | 'bottom_right' | 'top_left';
  actionButtonPosition: 'bottom_right' | 'bottom_left' | 'bottom_center';
  menuPosition: 'left_stack' | 'right_stack' | 'top_bar';
  customJoystickOffset: { x: number; y: number };
  customActionOffset: { x: number; y: number };
  preset: 'default' | 'left_handed' | 'pro_claw' | 'custom';
  hudScale: number; // 0.8 to 1.2
  isEditHudMode?: boolean;
  customPositions?: CustomHudElementPositions;
}

export interface MapWaypoint {
  id: string;
  name: string;
  x: number;
  z: number;
  icon: string;
  description: string;
  biomeId: BiomeType;
  isUnlocked?: boolean;
}

export interface ControlSettings {
  invertJoystickY: boolean;
  invertJoystickX: boolean;
  invertCameraYaw: boolean;
  invertCameraPitch: boolean;
  cameraSensitivity: number; // 0.5 - 2.0
}

export interface QuestItem {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  rewardMoney: number;
  rewardScore: number;
  completed: boolean;
  type: 'harvest_tbs' | 'sell_factory' | 'drive_tractor' | 'weather_harvest';
}

export interface StoryChapter {
  id: number;
  chapterNumber: number;
  title: string;
  speakerName: string;
  speakerRole: string;
  speakerEmoji: string;
  dialogue: string;
  objective: string;
  targetAmount: number;
  currentAmount: number;
  rewardMoney: number;
  completed: boolean;
  type: 'harvest_tbs' | 'sell_factory';
}

export interface JumpscareState {
  active: boolean;
  type: 'ular_sanca' | 'hantu_pokpok' | 'babirusa_amok' | 'rem_blong';
  title: string;
  subtitle: string;
  emoji: string;
  sound: 'jumpscare' | 'snake' | 'thunder';
  timeRemaining: number; // Reaction test countdown (seconds)
  penaltyMoney: number;
}

export interface PsychologicalPuzzleOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface PsychologicalPuzzle {
  id: string;
  title: string;
  category: 'peta_sandi' | 'teka_teki_agronomi' | 'arbitrase_pasar';
  scenario: string;
  hint: string;
  options: PsychologicalPuzzleOption[];
  rewardMoney: number;
  rewardCpo: number;
  penaltyMoney: number;
}

export interface CharacterItem {
  id: string;
  name: string;
  role: string;
  price: number;
  unlocked: boolean;
  perkText: string;
  color: string;
  avatarEmoji: string;
  harvestMultiplier: number;
  speedMultiplier: number;
  sellBonus: number;
  specialSkill: string;
  affinityTool: ToolType;
  quote: string;
}

export interface BiomeInfo {
  id: BiomeType;
  name: string;
  description: string;
  unlockCost: number;
  unlocked: boolean;
  groundColor: string;
  fogColor: string;
  treeMultiplier: number;
  yieldBonus: number;
  treeCount: number;
  bgEmoji: string;
  soilType: string;
  hazardRisk: string;
  specialFeature: string;
}

export interface BotPlayer {
  id: string;
  name: string;
  x: number;
  z: number;
  rotation: number;
  score: number;
  color: string;
  harvestCount: number;
  targetTreeId?: number;
}

export interface RandomEvent {
  id: string;
  type: 'hama_babi' | 'pupuk_booster' | 'pabrik_surge';
  title: string;
  message: string;
  x?: number;
  z?: number;
  active: boolean;
  expiresAt: number;
}

export interface LandPlot {
  id: number;
  name: string;
  unlocked: boolean;
  unlockCost: number;
  seedType: 'Tenera' | 'Dura' | 'Hybrid Gold';
  palmCount: number;
  soilMoisture: number; // 0 - 100%
  fertilizerLevel: number; // 0 - 100%
  growthStage: 'bibit' | 'muda' | 'siap_panen' | 'super_panen';
  lastHarvested: number;
}

export interface InventoryState {
  money: number; // Rp
  tbsTons: number; // Stored TBS in truck
  cpoTons: number;
  kernelTons: number;
  fertilizerStock: number;
  marketPricePerKg: number; // e.g. 3200 Rp/kg
  playerLevel: number;
  playerExp: number;
  totalHarvestedLifetime: number; // Total Ton lifetime
}

export interface Tree3DData {
  id: number;
  x: number;
  z: number;
  harvested: boolean;
  harvestedAt?: number;
  maturity: 'young' | 'golden' | 'overripe';
  fruitCount: number;
}

export interface RemotePlayer {
  id: string;
  name: string;
  x: number;
  z: number;
  rotation: number;
  vehicle: ToolType;
  score: number;
  color: string;
}

export interface ChatMessage {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}
