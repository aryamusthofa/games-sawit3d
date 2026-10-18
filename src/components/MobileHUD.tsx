import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CameraMode, ToolType, Tree3DData, RemotePlayer, WeatherType, ControlSettings, InventoryState, BiomeInfo, HUDLayoutSettings, CustomHudElementPositions } from '../types';
import {
  Eye,
  Camera,
  Scissors,
  Truck,
  Wrench,
  Sparkles,
  Wifi,
  WifiOff,
  Zap,
  Smartphone,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  TrendingUp,
  Award,
  X,
  Sliders,
  RotateCcw,
  BookOpen,
  Users,
  MapPin,
  Swords,
  Move,
  Flame,
  Compass
} from 'lucide-react';

interface MobileHUDProps {
  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;
  currentTool: ToolType;
  setCurrentTool: (tool: ToolType) => void;
  onJoystickMove: (vec: { x: number; y: number }) => void;
  onActionPress: () => void;
  selectedTreeId: number | null;
  inventory: InventoryState;
  score: number;
  isConnected: boolean;
  onOpenUpgrades: () => void;
  onOpenLandManager: () => void;
  onOpenStoryQuest: () => void;
  onOpenCharacterRoster: () => void;
  onOpenBiomeTravel: () => void;
  onOpenBotDuel: () => void;
  onSellAtFactory: () => void;
  playerPos: { x: number; z: number; rotation: number };
  trees: Tree3DData[];
  remotePlayers: RemotePlayer[];
  harvestPopups: Array<{ id: number; text: string; x: number; y: number }>;
  weather: WeatherType;
  controlSettings: ControlSettings;
  setControlSettings: React.Dispatch<React.SetStateAction<ControlSettings>>;
  activeBiome: BiomeInfo;
  characterAvatarEmoji: string;
  bossRaid?: import('../types').BossRaidState;
  onTriggerBossRaid?: () => void;
  onHitBoss?: () => void;
  onWaterIrrigate?: () => void;
  onOpenPuzzle?: () => void;
  onTriggerJumpscareTest?: () => void;
  onRotateCamera?: (deltaYaw: number) => void;
  onRotateCameraCmd?: (cmd: { yaw?: number; pitch?: number; reset?: boolean }) => void;
}

export const MobileHUD: React.FC<MobileHUDProps> = ({
  cameraMode,
  setCameraMode,
  currentTool,
  setCurrentTool,
  onJoystickMove,
  onActionPress,
  selectedTreeId,
  inventory,
  score,
  isConnected,
  onOpenUpgrades,
  onOpenLandManager,
  onOpenStoryQuest,
  onOpenCharacterRoster,
  onOpenBiomeTravel,
  onOpenBotDuel,
  onSellAtFactory,
  playerPos,
  trees,
  remotePlayers,
  harvestPopups,
  weather,
  controlSettings,
  setControlSettings,
  activeBiome,
  characterAvatarEmoji,
  bossRaid,
  onTriggerBossRaid,
  onHitBoss,
  onWaterIrrigate,
  onOpenPuzzle,
  onTriggerJumpscareTest,
  onRotateCamera,
  onRotateCameraCmd
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isPortrait, setIsPortrait] = useState(false);
  const [showDpad, setShowDpad] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const [isMenuMinimized, setIsMenuMinimized] = useState(false);

  // HUD Layout Customizer State
  const defaultCustomPositions: CustomHudElementPositions = {
    joystick: { x: 18, y: 80 },
    actionButton: { x: 82, y: 80 },
    quickActions: { x: 88, y: 45 },
    topInfoBar: { x: 22, y: 6 },
    topControlsBar: { x: 78, y: 6 },
    sprintButton: { x: 50, y: 80 },
    cameraControls: { x: 88, y: 15 }
  };

  const [hudLayout, setHudLayout] = useState<HUDLayoutSettings>(() => {
    const saved = localStorage.getItem('sawit_hud_layout');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          customPositions: {
            ...defaultCustomPositions,
            ...(parsed.customPositions || {})
          }
        };
      } catch (e) {}
    }
    return {
      joystickPosition: 'bottom_left',
      actionButtonPosition: 'bottom_right',
      menuPosition: 'left_stack',
      customJoystickOffset: { x: 0, y: 0 },
      customActionOffset: { x: 0, y: 0 },
      preset: 'default',
      hudScale: 1.0,
      isEditHudMode: false,
      customPositions: defaultCustomPositions
    };
  });

  const [isEditHudMode, setIsEditHudMode] = useState<boolean>(false);
  const [activeDragElement, setActiveDragElement] = useState<keyof CustomHudElementPositions | null>(null);

  const saveHudLayout = (newLayout: HUDLayoutSettings) => {
    setHudLayout(newLayout);
    try {
      localStorage.setItem('sawit_hud_layout', JSON.stringify(newLayout));
    } catch (err) {}
  };

  const currentPositions = hudLayout.customPositions || defaultCustomPositions;

  // Listen for 'Enter' key to save & exit custom UI mode
  useEffect(() => {
    if (!isEditHudMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        saveHudLayout({
          ...hudLayout,
          customPositions: hudLayout.customPositions || defaultCustomPositions,
          isEditHudMode: false
        });
        setIsEditHudMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditHudMode, hudLayout]);

  // Handle Dragging HUD Elements in Edit Mode
  const handleStartDrag = (elementKey: keyof CustomHudElementPositions, e: React.TouchEvent | React.MouseEvent) => {
    if (!isEditHudMode) return;
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    setActiveDragElement(elementKey);
  };

  useEffect(() => {
    if (!isEditHudMode || !activeDragElement) return;

    const handleMove = (clientX: number, clientY: number) => {
      const pctX = Math.max(5, Math.min(95, Math.round((clientX / window.innerWidth) * 100)));
      const pctY = Math.max(5, Math.min(95, Math.round((clientY / window.innerHeight) * 100)));

      setHudLayout(prev => {
        const prevPos = prev.customPositions || defaultCustomPositions;
        const updated = {
          ...prev,
          customPositions: {
            ...prevPos,
            [activeDragElement]: { x: pctX, y: pctY }
          }
        };
        try {
          localStorage.setItem('sawit_hud_layout', JSON.stringify(updated));
        } catch (err) {}
        return updated;
      });
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        if (e.cancelable) e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const onEnd = () => {
      setActiveDragElement(null);
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    window.addEventListener('mouseup', onEnd);

    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
      window.removeEventListener('mouseup', onEnd);
    };
  }, [isEditHudMode, activeDragElement]);

  // Check orientation
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Joystick touch logic with global window tracking
  const touchIdRef = useRef<number | null>(null);

  const updateJoystick = useCallback((clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxDist = rect.width / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxDist);

    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    setKnobPos({ x: kx, y: ky });

    let nx = dx / maxDist;
    let ny = dy / maxDist;
    if (dist > maxDist) {
      nx = Math.cos(angle);
      ny = Math.sin(angle);
    }

    if (controlSettings.invertJoystickX) nx = -nx;
    if (controlSettings.invertJoystickY) ny = -ny;

    const mult = isSprinting ? 2.3 : 1.0;
    onJoystickMove({ x: nx * mult, y: ny * mult });
  }, [controlSettings.invertJoystickX, controlSettings.invertJoystickY, isSprinting, onJoystickMove]);

  const resetJoystick = useCallback(() => {
    touchIdRef.current = null;
    setKnobPos({ x: 0, y: 0 });
    onJoystickMove({ x: 0, y: 0 });
  }, [onJoystickMove]);

  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    if (isEditHudMode) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    updateJoystick(touch.clientX, touch.clientY);
  };

  // Window-level touch tracking for joystick when active
  useEffect(() => {
    const onWindowTouchMove = (e: TouchEvent) => {
      if (touchIdRef.current === null) return;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === touchIdRef.current) {
          updateJoystick(e.touches[i].clientX, e.touches[i].clientY);
          break;
        }
      }
    };

    const onWindowTouchEnd = (e: TouchEvent) => {
      if (touchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) {
          resetJoystick();
          break;
        }
      }
    };

    window.addEventListener('touchmove', onWindowTouchMove, { passive: true });
    window.addEventListener('touchend', onWindowTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onWindowTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchmove', onWindowTouchMove);
      window.removeEventListener('touchend', onWindowTouchEnd);
      window.removeEventListener('touchcancel', onWindowTouchEnd);
    };
  }, [updateJoystick, resetJoystick]);

  const handleDpadDir = (dx: number, dy: number) => {
    const mult = isSprinting ? 2.3 : 1.0;
    onJoystickMove({ x: dx * mult, y: dy * mult });
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden">
      {/* Floating Harvest Popups */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {harvestPopups.map((popup, idx) => (
          <div
            key={`${popup.id}-${idx}`}
            style={{ left: `${popup.x}%`, top: `${popup.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-3 py-1 rounded-full shadow-2xl animate-bounce border border-white"
          >
            {popup.text}
          </div>
        ))}
      </div>

      {/* MLBB Custom HUD Editor Banner Top Overlay */}
      {isEditHudMode && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border-2 border-amber-400 p-3 rounded-2xl shadow-2xl backdrop-blur-md text-white text-center flex flex-col items-center gap-2 max-w-md w-[90vw] pointer-events-auto animate-pulse">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-amber-300 text-xs sm:text-sm">
              🎮 MODE KUSTOMISASI HUD (ALA MLBB)
            </h3>
          </div>
          <p className="text-3xs sm:text-2xs text-slate-300 font-medium leading-tight">
            Sentuh &amp; geser (drag) tombol-tombol di layar untuk memposisikan lokasi paling nyaman bagimu.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                saveHudLayout({
                  ...hudLayout,
                  customPositions: defaultCustomPositions
                });
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-2xs rounded-xl border border-slate-600 active:scale-95 transition-all"
            >
              🔄 Reset Default
            </button>
            <button
              onClick={() => {
                saveHudLayout({
                  ...hudLayout,
                  customPositions: currentPositions,
                  isEditHudMode: false
                });
                setIsEditHudMode(false);
              }}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              ✅ Konfirmasi &amp; Simpan (Enter)
            </button>
          </div>
        </div>
      )}

      {/* --- TOP LEFT: MONEY & INVENTORY HUD BADGE --- */}
      <div
        onTouchStartCapture={(e) => handleStartDrag('topInfoBar', e)}
        onMouseDownCapture={(e) => handleStartDrag('topInfoBar', e)}
        style={{
          position: 'fixed',
          left: `${currentPositions.topInfoBar?.x ?? 22}%`,
          top: `${currentPositions.topInfoBar?.y ?? 6}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: isEditHudMode ? 45 : 30
        }}
        className={`pointer-events-auto transition-all ${
          isEditHudMode ? 'border-2 border-dashed border-amber-400 bg-amber-400/20 p-1.5 rounded-2xl cursor-move shadow-2xl touch-none select-none' : ''
        }`}
      >
        {isEditHudMode && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-3xs px-2 py-0.5 rounded-full whitespace-nowrap shadow">
            ✥ GESER INFO KEUANGAN
          </div>
        )}

        <div className={`flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-amber-500/30 text-white rounded-2xl px-3 py-1.5 shadow-xl max-w-sm ${isEditHudMode ? 'pointer-events-none' : ''}`}>
          <div className="flex items-center gap-1 font-extrabold text-amber-400 text-xs sm:text-sm">
            <span className="text-3xs bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded font-mono">Rp</span>
            <span>{inventory.money.toLocaleString('id-ID')}</span>
          </div>

          <div className="h-3.5 w-px bg-slate-700 mx-0.5" />

          <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{inventory.tbsTons.toFixed(1)} T</span>
          </div>

          <div className="h-3.5 w-px bg-slate-700 mx-0.5" />

          <div className="flex items-center gap-1 text-amber-300 text-2xs font-bold bg-amber-950/60 border border-amber-500/40 px-1.5 py-0.5 rounded-lg">
            <Award className="w-3 h-3 text-amber-400" />
            <span>Lvl {inventory.playerLevel}</span>
          </div>

          <div className="h-3.5 w-px bg-slate-700 mx-0.5" />

          <div className="flex items-center gap-1 text-sky-300 text-2xs font-bold bg-sky-950/60 border border-sky-500/40 px-1.5 py-0.5 rounded-lg">
            <TrendingUp className="w-3 h-3 text-sky-400" />
            <span>Rp {inventory.marketPricePerKg}/kg</span>
          </div>

          {inventory.tbsTons > 0 && (
            <button
              onClick={onSellAtFactory}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 text-slate-950 font-black text-3xs px-2 py-0.5 rounded-lg shadow animate-pulse border border-white ml-auto"
            >
              💰 JUAL PABRIK (+Rp {(inventory.tbsTons * 1000 * inventory.marketPricePerKg).toLocaleString('id-ID')})
            </button>
          )}
        </div>
      </div>

      {/* --- TOP CONTROLS & WEATHER BAR --- */}
      <div
        onTouchStartCapture={(e) => handleStartDrag('topControlsBar', e)}
        onMouseDownCapture={(e) => handleStartDrag('topControlsBar', e)}
        style={{
          position: 'fixed',
          left: `${currentPositions.topControlsBar?.x ?? 78}%`,
          top: `${currentPositions.topControlsBar?.y ?? 6}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: isEditHudMode ? 45 : 30
        }}
        className={`pointer-events-auto transition-all ${
          isEditHudMode ? 'border-2 border-dashed border-amber-400 bg-amber-400/20 p-1.5 rounded-2xl cursor-move shadow-2xl touch-none select-none' : ''
        }`}
      >
        {isEditHudMode && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-3xs px-2 py-0.5 rounded-full whitespace-nowrap shadow">
            ✥ GESER KONTROL ATAS
          </div>
        )}

        <div className={`flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-xl ${isEditHudMode ? 'pointer-events-none' : ''}`}>
          {/* Weather */}
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/80 rounded-xl text-3xs text-amber-300 font-bold border border-slate-700">
            {weather === 'sunny' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
            {weather === 'sunset' && <Sunset className="w-3.5 h-3.5 text-orange-400" />}
            {weather === 'night' && <Moon className="w-3.5 h-3.5 text-sky-300" />}
            {weather === 'rain' && <CloudRain className="w-3.5 h-3.5 text-slate-300" />}
            <span className="capitalize hidden sm:inline">{weather}</span>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-600 shadow active:scale-95"
            title="Pengaturan Kontrol"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Kustom UI MLBB Button */}
          <button
            onClick={() => setIsEditHudMode(!isEditHudMode)}
            className={`px-2 py-1 rounded-xl border text-3xs font-black flex items-center gap-1 shadow active:scale-95 transition-all ${
              isEditHudMode
                ? 'bg-amber-400 text-slate-950 border-white ring-2 ring-amber-300 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-600'
            }`}
          >
            <Sliders className="w-3 h-3 text-amber-400" />
            <span>Kustom UI</span>
          </button>

          {/* Online Wifi */}
          <div className={`flex items-center gap-1 px-1.5 py-1 rounded-xl text-3xs font-medium border ${
            isConnected ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
          }`}>
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          </div>

          {/* Camera View Toggle */}
          <button
            onClick={() => setCameraMode(cameraMode === 'TPS' ? 'FPS' : 'TPS')}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-3xs px-2 py-1 rounded-xl border border-indigo-400/30 shadow active:scale-95"
          >
            {cameraMode === 'TPS' ? <Eye className="w-3 h-3 text-amber-300" /> : <Camera className="w-3 h-3 text-sky-300" />}
            <span>{cameraMode === 'TPS' ? '3D TPS' : '1ST FPS'}</span>
          </button>

          {/* Quick Rotation Buttons */}
          {onRotateCameraCmd && (
            <div className="flex items-center gap-0.5 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => onRotateCameraCmd({ yaw: -Math.PI / 6 })}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded active:scale-95"
                title="Putar Kiri 30°"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <button
                onClick={() => onRotateCameraCmd({ yaw: Math.PI / 6 })}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded active:scale-95"
                title="Putar Kanan 30°"
              >
                <RotateCcw className="w-3 h-3 scale-x-[-1]" />
              </button>
              <button
                onClick={() => onRotateCameraCmd({ reset: true })}
                className="p-1 bg-amber-600/30 hover:bg-amber-600 text-amber-200 rounded active:scale-95"
                title="Reset Kamera"
              >
                <Compass className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Mini-map Radar */}
          <div className="relative w-11 h-11 bg-slate-950/90 border border-slate-700 rounded-full overflow-hidden shadow-lg flex items-center justify-center shrink-0">
            {trees.map(t => {
              const mx = (t.x / 160) * 100 + 50;
              const my = (t.z / 160) * 100 + 50;
              return (
                <div
                  key={t.id}
                  style={{ left: `${mx}%`, top: `${my}%` }}
                  className={`absolute w-1 h-1 rounded-full ${t.harvested ? 'bg-slate-600' : 'bg-amber-500'}`}
                />
              );
            })}
            <div
              style={{
                left: `${(playerPos.x / 160) * 100 + 50}%`,
                top: `${(playerPos.z / 160) * 100 + 50}%`,
                transform: `translate(-50%, -50%) rotate(${playerPos.rotation}rad)`
              }}
              className="absolute w-2 h-2 bg-emerald-400 rounded-full border border-white z-10"
            />
          </div>
        </div>
      </div>

      {/* --- RAID BOSS ALERT BANNER --- */}
      {bossRaid && bossRaid.active && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-xl pointer-events-auto bg-gradient-to-r from-red-950/95 via-rose-900/95 to-red-950/95 border-2 border-red-500 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md animate-pulse text-white flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-600/40 border border-red-400 flex items-center justify-center text-base animate-bounce">
              🪲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-amber-300 text-xs tracking-wide">
                  🚨 {bossRaid.name}
                </span>
                <span className="bg-red-900 border border-red-400 text-red-200 font-mono text-3xs px-1.5 py-0.5 rounded-md font-bold">
                  {bossRaid.timeRemaining}s TERSI
                </span>
              </div>
              <p className="text-3xs text-red-200 font-medium">
                Loss Risk: <span className="text-amber-300 font-bold">{bossRaid.stolenTbs.toFixed(1)} Ton</span> | HP: {bossRaid.hp}/{bossRaid.maxHp}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            {onHitBoss && (
              <button
                onClick={onHitBoss}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-3xs px-3 py-1.5 rounded-xl shadow border border-white active:scale-95 transition-all"
              >
                ⚔️ SERANG BOSS!
              </button>
            )}
            {onWaterIrrigate && (
              <button
                onClick={onWaterIrrigate}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-3xs px-2.5 py-1.5 rounded-xl shadow border border-white active:scale-95 transition-all"
              >
                💧 SIRAM AIR
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- QUICK ACTIONS FEATURE MENU (DRAGGABLE & COLLAPSIBLE) --- */}
      <div
        onTouchStartCapture={(e) => handleStartDrag('quickActions', e)}
        onMouseDownCapture={(e) => handleStartDrag('quickActions', e)}
        style={{
          position: 'fixed',
          left: `${currentPositions.quickActions?.x ?? 88}%`,
          top: `${currentPositions.quickActions?.y ?? 45}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: isEditHudMode ? 45 : 30
        }}
        className={`pointer-events-auto transition-all ${
          isEditHudMode ? 'border-2 border-dashed border-amber-400 bg-amber-400/20 p-2 rounded-2xl cursor-move shadow-2xl touch-none select-none' : ''
        }`}
      >
        {isEditHudMode && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-3xs px-2 py-0.5 rounded-full whitespace-nowrap shadow">
            ✥ GESER MENU FITUR
          </div>
        )}

        <div className={`flex flex-col items-end gap-1 ${isEditHudMode ? 'pointer-events-none' : ''}`}>
          {/* Minimize / Expand Toggle Button */}
          <button
            onClick={() => setIsMenuMinimized(!isMenuMinimized)}
            className="px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-black text-3xs rounded-xl border border-amber-500/40 shadow-lg flex items-center gap-1 active:scale-95 transition-all mb-1"
          >
            {isMenuMinimized ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            <span>{isMenuMinimized ? '🎮 Buka Menu Fitur (8)' : '▼ Sembunyikan Menu'}</span>
          </button>

          {!isMenuMinimized && (
            <div className="grid grid-cols-1 gap-1.5 max-w-[200px]">
              <button
                onClick={onOpenStoryQuest}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-900/90 to-amber-700/90 hover:brightness-110 text-white text-3xs font-black px-2.5 py-1.5 rounded-xl shadow-md border border-amber-400/40 active:scale-95 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="truncate">Misi &amp; Alur Cerita</span>
              </button>

              <button
                onClick={onOpenCharacterRoster}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-900/90 to-indigo-700/90 hover:brightness-110 text-white text-3xs font-black px-2.5 py-1.5 rounded-xl shadow-md border border-indigo-400/40 active:scale-95 transition-all"
              >
                <span className="text-xs shrink-0">{characterAvatarEmoji}</span>
                <span className="truncate">Roster Karakter</span>
              </button>

              <button
                onClick={onOpenLandManager}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-900/90 to-emerald-700/90 hover:brightness-110 text-white text-3xs font-black px-2.5 py-1.5 rounded-xl shadow-md border border-emerald-400/40 active:scale-95 transition-all"
              >
                <span className="text-xs shrink-0">🌱</span>
                <span className="truncate">Lahan Kebun</span>
              </button>

              {onOpenPuzzle && (
                <button
                  onClick={onOpenPuzzle}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-purple-800/90 to-indigo-800/90 hover:brightness-110 text-white text-3xs font-black px-2.5 py-1.5 rounded-xl shadow-md border border-purple-400/40 active:scale-95 transition-all"
                >
                  <span className="text-xs shrink-0">🧩</span>
                  <span className="truncate">Teka-Teki Agronomi</span>
                </button>
              )}

              {onTriggerBossRaid && (
                <button
                  onClick={onTriggerBossRaid}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-red-600 hover:brightness-110 text-white text-3xs font-black px-2.5 py-1.5 rounded-xl shadow-md border border-amber-300 animate-pulse active:scale-95 transition-all"
                >
                  <span className="text-xs shrink-0">⚡</span>
                  <span className="truncate">Raid Boss Sawit</span>
                </button>
              )}

              <button
                onClick={onOpenBiomeTravel}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-800/90 to-teal-700/90 hover:brightness-110 text-white text-3xs font-black px-2.5 py-1.5 rounded-xl shadow-md border border-emerald-400/40 active:scale-95 transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span className="truncate">Peta &amp; Biome ({activeBiome.name})</span>
              </button>

              <button
                onClick={onOpenBotDuel}
                className="flex items-center gap-1.5 bg-gradient-to-r from-red-900/90 to-red-700/90 hover:brightness-110 text-white text-3xs font-black px-2.5 py-1.5 rounded-xl shadow-md border border-red-400/40 active:scale-95 transition-all"
              >
                <Swords className="w-3.5 h-3.5 text-red-300 shrink-0" />
                <span className="truncate">Duel Bot AI</span>
              </button>

              <button
                onClick={onOpenUpgrades}
                className="flex items-center gap-1.5 bg-gradient-to-r from-orange-900/90 to-amber-700/90 hover:brightness-110 text-white text-3xs font-black px-2.5 py-1.5 rounded-xl shadow-md border border-orange-400/40 active:scale-95 transition-all"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="truncate">Bengkel Equipment</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- BOTTOM LEFT: JOYSTICK --- */}
      <div
        onTouchStartCapture={(e) => handleStartDrag('joystick', e)}
        onMouseDownCapture={(e) => handleStartDrag('joystick', e)}
        style={{
          position: 'fixed',
          left: `${currentPositions.joystick?.x ?? 18}%`,
          top: `${currentPositions.joystick?.y ?? 80}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: isEditHudMode ? 45 : 30
        }}
        className={`pointer-events-auto flex items-center gap-2 transition-all ${
          isEditHudMode ? 'border-2 border-dashed border-amber-400 bg-amber-400/20 p-2 rounded-full cursor-move shadow-2xl touch-none select-none' : ''
        }`}
      >
        {isEditHudMode && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-3xs px-2 py-0.5 rounded-full whitespace-nowrap shadow">
            ✥ GESER JOYSTICK
          </div>
        )}
        {!showDpad ? (
          <div
            ref={joystickRef}
            onTouchStart={handleJoystickTouchStart}
            onTouchEnd={resetJoystick}
            onTouchCancel={resetJoystick}
            onMouseDown={(e) => {
              if (isEditHudMode) return;
              updateJoystick(e.clientX, e.clientY);
            }}
            onMouseMove={(e) => {
              if (isEditHudMode) return;
              if (e.buttons === 1) updateJoystick(e.clientX, e.clientY);
            }}
            onMouseUp={resetJoystick}
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900/80 backdrop-blur-md border-2 border-slate-700/80 shadow-2xl flex items-center justify-center relative touch-none ${isEditHudMode ? 'pointer-events-none' : ''}`}
          >
            <div className="absolute w-12 h-12 rounded-full border border-slate-700" />
            <div
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-white shadow-xl flex items-center justify-center transition-transform duration-75"
            >
              <div className="w-4 h-4 rounded-full bg-slate-950/40" />
            </div>
          </div>
        ) : (
          <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-900/80 border-2 border-slate-700 rounded-3xl p-1.5 grid grid-cols-3 gap-1 shadow-2xl">
            <div />
            <button
              onTouchStart={() => handleDpadDir(0, -1)}
              onTouchEnd={resetJoystick}
              onMouseDown={() => handleDpadDir(0, -1)}
              onMouseUp={resetJoystick}
              className="bg-emerald-600 active:bg-emerald-400 text-white rounded-lg flex items-center justify-center shadow"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <div />
            <button
              onTouchStart={() => handleDpadDir(-1, 0)}
              onTouchEnd={resetJoystick}
              onMouseDown={() => handleDpadDir(-1, 0)}
              onMouseUp={resetJoystick}
              className="bg-emerald-600 active:bg-emerald-400 text-white rounded-lg flex items-center justify-center shadow"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="bg-slate-800 rounded-lg flex items-center justify-center font-bold text-3xs text-amber-400">
              PAD
            </div>
            <button
              onTouchStart={() => handleDpadDir(1, 0)}
              onTouchEnd={resetJoystick}
              onMouseDown={() => handleDpadDir(1, 0)}
              onMouseUp={resetJoystick}
              className="bg-emerald-600 active:bg-emerald-400 text-white rounded-lg flex items-center justify-center shadow"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div />
            <button
              onTouchStart={() => handleDpadDir(0, 1)}
              onTouchEnd={resetJoystick}
              onMouseDown={() => handleDpadDir(0, 1)}
              onMouseUp={resetJoystick}
              className="bg-emerald-600 active:bg-emerald-400 text-white rounded-lg flex items-center justify-center shadow"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <div />
          </div>
        )}
      </div>

      {/* --- CENTER BOTTOM: SPRINT & TOOL SWITCHER --- */}
      <div
        onTouchStartCapture={(e) => handleStartDrag('sprintButton', e)}
        onMouseDownCapture={(e) => handleStartDrag('sprintButton', e)}
        style={{
          position: 'fixed',
          left: `${currentPositions.sprintButton?.x ?? 50}%`,
          top: `${currentPositions.sprintButton?.y ?? 80}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: isEditHudMode ? 45 : 30
        }}
        className={`pointer-events-auto flex flex-col items-center gap-1.5 transition-all ${
          isEditHudMode ? 'border-2 border-dashed border-amber-400 bg-amber-400/20 p-2 rounded-2xl cursor-move shadow-2xl touch-none select-none' : ''
        }`}
      >
        {isEditHudMode && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-3xs px-2 py-0.5 rounded-full whitespace-nowrap shadow">
            ✥ GESER SPRINT &amp; ALAT
          </div>
        )}

        <div className={`flex flex-col items-center gap-1.5 ${isEditHudMode ? 'pointer-events-none' : ''}`}>
          {/* Turbo Sprint Button */}
          <button
            onClick={() => setIsSprinting(!isSprinting)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full font-black text-3xs transition-all shadow-lg border ${
              isSprinting
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 border-amber-300 animate-bounce'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-600'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isSprinting ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>{isSprinting ? '⚡ TURBO SPRINT (2.3x)' : '🏃 LARI TURBO'}</span>
          </button>

          {/* Tool Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700/80">
            <button
              onClick={() => setCurrentTool('egrek')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-3xs transition-all ${
                currentTool === 'egrek'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Egrek</span>
            </button>

            <button
              onClick={() => setCurrentTool('tractor')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-3xs transition-all ${
                currentTool === 'tractor'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Traktor</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- BOTTOM RIGHT: HARVEST ACTION BUTTON --- */}
      <div
        onTouchStartCapture={(e) => handleStartDrag('actionButton', e)}
        onMouseDownCapture={(e) => handleStartDrag('actionButton', e)}
        style={{
          position: 'fixed',
          left: `${currentPositions.actionButton?.x ?? 82}%`,
          top: `${currentPositions.actionButton?.y ?? 80}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: isEditHudMode ? 45 : 30
        }}
        className={`pointer-events-auto relative transition-all ${
          isEditHudMode ? 'border-2 border-dashed border-amber-400 bg-amber-400/20 p-2 rounded-full cursor-move shadow-2xl touch-none select-none' : ''
        }`}
      >
        {isEditHudMode && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-3xs px-2 py-0.5 rounded-full whitespace-nowrap shadow">
            ✥ GESER CAPIT
          </div>
        )}
        {selectedTreeId !== null && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-3xs px-2 py-0.5 rounded-full animate-bounce whitespace-nowrap shadow-lg">
            🎯 TARGET SIAP PANEN!
          </div>
        )}

        <button
          onClick={onActionPress}
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 shadow-2xl flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-all ${isEditHudMode ? 'pointer-events-none' : ''} ${
            selectedTreeId !== null
              ? 'bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600 border-amber-200 text-slate-950 animate-pulse'
              : 'bg-gradient-to-b from-emerald-600 to-green-800 border-emerald-300/40 text-white'
          }`}
        >
          <Scissors className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="font-black text-3xs tracking-wider uppercase">
            {currentTool === 'egrek' ? 'POTONG!' : 'CAPIT!'}
          </span>
        </button>
      </div>

      {/* --- CONTROL & UI LAYOUT SETTINGS MODAL --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 pointer-events-auto overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-md w-full shadow-2xl text-white relative my-auto max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-amber-400">Pengaturan Kontrol &amp; Kustom UI</h3>
            </div>

            <div className="space-y-4 text-xs">
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setIsEditHudMode(true);
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl border border-amber-300 flex items-center justify-center gap-2 active:scale-95 transition-all mb-3"
              >
                <Sliders className="w-5 h-5 text-slate-950" />
                <span>🎮 MODE DRAG KUSTOM UI (ALA MLBB)</span>
              </button>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Move className="w-4 h-4" />
                  <span>Preset Posisi Joystick &amp; Tombol</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => saveHudLayout({
                      ...hudLayout,
                      joystickPosition: 'bottom_left',
                      actionButtonPosition: 'bottom_right',
                      customJoystickOffset: { x: 0, y: 0 },
                      customActionOffset: { x: 0, y: 0 },
                      customPositions: defaultCustomPositions,
                      preset: 'default'
                    })}
                    className={`py-2 px-2 rounded-xl text-2xs font-extrabold border transition-all ${
                      hudLayout.preset === 'default'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    Standard Mobile
                  </button>
                  <button
                    onClick={() => saveHudLayout({
                      ...hudLayout,
                      customPositions: {
                        ...defaultCustomPositions,
                        joystick: { x: 82, y: 80 },
                        actionButton: { x: 18, y: 80 }
                      },
                      preset: 'left_handed'
                    })}
                    className={`py-2 px-2 rounded-xl text-2xs font-extrabold border transition-all ${
                      hudLayout.preset === 'left_handed'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    Kidal (Left Hand)
                  </button>
                </div>
              </div>

              {/* D-Pad Toggle */}
              <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <span className="font-bold text-slate-200">Gunakan D-Pad Tombol Panah:</span>
                <button
                  onClick={() => setShowDpad(!showDpad)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    showDpad ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      showDpad ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Invert Controls */}
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 space-y-2">
                <span className="font-bold text-amber-300 block">Inversi Sumbu Analog</span>
                <div className="flex items-center justify-between text-2xs">
                  <span className="text-slate-300">Invert Sumbu Y Joystick</span>
                  <button
                    onClick={() => setControlSettings(s => ({ ...s, invertJoystickY: !s.invertJoystickY }))}
                    className={`px-3 py-1 rounded-lg font-bold border ${
                      controlSettings.invertJoystickY ? 'bg-emerald-500 text-slate-950 border-white' : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {controlSettings.invertJoystickY ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
