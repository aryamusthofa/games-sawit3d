import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ThreeCanvas } from './components/ThreeCanvas';
import { MobileHUD } from './components/MobileHUD';
import { LandManagement } from './components/LandManagement';
import { EquipmentUpgrades } from './components/EquipmentUpgrades';
import { MultiplayerCompetition } from './components/MultiplayerCompetition';
import { StoryQuestModal } from './components/StoryQuestModal';
import { CharacterRosterModal } from './components/CharacterRosterModal';
import { BiomeTravelModal } from './components/BiomeTravelModal';
import { BotDuelModal } from './components/BotDuelModal';
import { JumpscareModal } from './components/JumpscareModal';
import { PsychologicalPuzzleModal } from './components/PsychologicalPuzzleModal';
import { BossRaidModal } from './components/BossRaidModal';
import {
  CameraMode,
  ToolType,
  UpgradesState,
  LandPlot,
  InventoryState,
  Tree3DData,
  RemotePlayer,
  ChatMessage,
  WeatherType,
  ControlSettings,
  QuestItem,
  RandomEvent,
  StoryChapter,
  CharacterItem,
  BiomeInfo,
  BiomeType,
  BotPlayer,
  BossRaidState,
  JumpscareState,
  PsychologicalPuzzle
} from './types';
import { soundFx } from './utils/audio';

export default function App() {
  // Game & View States
  const [cameraMode, setCameraMode] = useState<CameraMode>('TPS');
  const [currentTool, setCurrentTool] = useState<ToolType>('egrek');
  const [joystickVector, setJoystickVector] = useState({ x: 0, y: 0 });
  const [isActionPressed, setIsActionPressed] = useState(false);
  const [cameraRotateStep, setCameraRotateStep] = useState<number>(0);
  const [cameraRotateCmd, setCameraRotateCmd] = useState<{ yaw?: number; pitch?: number; reset?: boolean; id: number } | undefined>();

  const handleRotateCamera = (deltaYaw: number) => {
    setCameraRotateStep(prev => prev + deltaYaw);
  };

  const handleRotateCameraCmd = (cmd: { yaw?: number; pitch?: number; reset?: boolean }) => {
    setCameraRotateCmd({ ...cmd, id: Date.now() });
  };

  // Boss Raid Event State
  const [bossRaid, setBossRaid] = useState<BossRaidState>({
    active: false,
    name: 'King Oryctes (Raja Kumbang Sawit)',
    hp: 500,
    maxHp: 500,
    x: 0,
    z: -15,
    timeRemaining: 60,
    stolenTbs: 0.5,
    rewardMoney: 25000000,
    rewardCpo: 3.0,
    mapFragmentFound: false
  });

  // Control Settings for Inversion and Sensitivity
  const [controlSettings, setControlSettings] = useState<ControlSettings>({
    invertJoystickY: false,
    invertJoystickX: false,
    invertCameraYaw: false,
    invertCameraPitch: false,
    cameraSensitivity: 1.0
  });

  // Dynamic Weather Cycle: sunny -> sunset -> night -> rain
  const [weather, setWeather] = useState<WeatherType>('sunny');

  // Player Position Ref for high-performance physics
  const playerPosRef = useRef({ x: 0, z: 0, rotation: 0 });

  // Target tree highlight
  const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);

  // Synchronized Player Pos state for HUD Radar
  const [playerPosState, setPlayerPosState] = useState({ x: 0, z: 0, rotation: 0 });

  // Floating Harvest Popups
  const [harvestPopups, setHarvestPopups] = useState<Array<{ id: number; text: string; x: number; y: number }>>([]);

  // Modals & Panels States
  const [isLandOpen, setIsLandOpen] = useState(false);
  const [isUpgradesOpen, setIsUpgradesOpen] = useState(false);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);
  const [isStoryQuestOpen, setIsStoryQuestOpen] = useState(false);
  const [isCharacterRosterOpen, setIsCharacterRosterOpen] = useState(false);
  const [isBiomeTravelOpen, setIsBiomeTravelOpen] = useState(false);
  const [isBotDuelOpen, setIsBotDuelOpen] = useState(false);
  const [isBossRaidModalOpen, setIsBossRaidModalOpen] = useState(false);

  // Sync player position state at 20fps for HUD radar
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerPosState({
        x: playerPosRef.current.x,
        z: playerPosRef.current.z,
        rotation: playerPosRef.current.rotation
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Weather System Loop (Changes every 40 seconds unless extreme weather is active)
  useEffect(() => {
    const weatherCycle: WeatherType[] = ['sunny', 'sunset', 'night', 'rain'];
    let idx = 0;
    const interval = setInterval(() => {
      if (!bossRaid.active) {
        idx = (idx + 1) % weatherCycle.length;
        setWeather(weatherCycle[idx]);
      }
    }, 40000);
    return () => clearInterval(interval);
  }, [bossRaid.active]);

  // Raid Boss Trigger & Logic (Configurable Difficulty 10% to 100%)
  const triggerBossRaid = (difficultyPercent: number = 50) => {
    soundFx.playSiren();
    setTimeout(() => soundFx.playBossRoar(), 400);

    setWeather('kemarau_extreme');

    const diffPct = Math.max(10, Math.min(100, difficultyPercent));
    let hp = 500;
    let timeRemaining = 60;
    let rewardMoney = 25000000;
    let rewardCpo = 3.0;
    let rank = 'Mudah';

    if (diffPct <= 40) {
      hp = Math.round(300 + (diffPct / 40) * 700); // 300 to 1,000 HP
      timeRemaining = Math.round(60 - (diffPct / 40) * 15); // 60s to 45s
      rewardMoney = Math.round(15000000 + (diffPct / 40) * 35000000); // Rp 15M to 50M
      rewardCpo = Math.round(2 + (diffPct / 40) * 3); // 2 to 5 Ton
      rank = 'Mudah - Normal';
    } else if (diffPct <= 80) {
      const ratio = (diffPct - 40) / 40;
      hp = Math.round(1000 + ratio * 9000); // 1,000 to 10,000 HP
      timeRemaining = Math.round(45 - ratio * 15); // 45s to 30s
      rewardMoney = Math.round(50000000 + ratio * 450000000); // Rp 50M to 500M
      rewardCpo = Math.round(5 + ratio * 20); // 5 to 25 Ton
      rank = 'Sulit / Heroik';
    } else {
      // >80% to 100% SULTAN EKSTREM (BENEFIT FANTASTIS LUAR BIASA!)
      const ratio = (diffPct - 80) / 20;
      hp = Math.round(10000 + ratio * 90000); // 10,000 to 100,000 HP!
      timeRemaining = Math.round(30 - ratio * 10); // 30s to 20s
      rewardMoney = Math.round(500000000 + ratio * 4500000000); // Rp 500M to 5 MILIAR RUPIAH!
      rewardCpo = Math.round(25 + ratio * 175); // 25 to 200 Ton CPO!
      rank = '⚡ SULTAN EKSTREM (>80%)';
    }

    setBossRaid({
      active: true,
      name: diffPct > 80 ? '👑 KING ORYCTES SULTAN OVERLORD' : 'King Oryctes (Raja Kumbang Sawit)',
      hp: hp,
      maxHp: hp,
      x: playerPosRef.current.x + (Math.random() > 0.5 ? 8 : -8),
      z: playerPosRef.current.z + (Math.random() > 0.5 ? 8 : -8),
      timeRemaining: timeRemaining,
      stolenTbs: 0.5,
      rewardMoney: rewardMoney,
      rewardCpo: rewardCpo,
      mapFragmentFound: false,
      difficultyPercent: diffPct,
      difficultyRank: rank
    });

    const popupId = Date.now();
    setHarvestPopups(prev => [
      ...prev,
      {
        id: popupId,
        text: diffPct > 80
          ? `⚡ SERANGAN SULTAN EKSTREM KING ORYCTES (${diffPct}%)! HP: ${hp.toLocaleString('id-ID')}!`
          : `🚨 PERINGATAN! KING ORYCTES SERANG KEBUAN KAMU (${diffPct}%)!`,
        x: 50,
        y: 20
      }
    ]);
    setTimeout(() => {
      setHarvestPopups(prev => prev.filter(p => p.id !== popupId));
    }, 3000);
  };

  // Boss Raid Loss Aversion Countdown Loop
  useEffect(() => {
    if (!bossRaid.active) return;
    const interval = setInterval(() => {
      setBossRaid(prev => {
        if (!prev.active) return prev;
        if (prev.timeRemaining <= 1) {
          soundFx.playThud();
          const popupId = Date.now();
          setHarvestPopups(popups => [
            ...popups,
            { id: popupId, text: '❌ KING ORYCTES KABUR MENCURI TBS KAMU!', x: 50, y: 25 }
          ]);
          setTimeout(() => {
            setHarvestPopups(popups => popups.filter(p => p.id !== popupId));
          }, 3000);

          setWeather('sunny');
          return { ...prev, active: false };
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
          stolenTbs: prev.stolenTbs + 0.05
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [bossRaid.active]);

  const handleHitBoss = () => {
    if (!bossRaid.active) return;
    soundFx.playBossHit();

    const damage = (currentTool === 'tractor' ? 75 : 45) * (1 + upgrades.egrekSharpness * 0.2);
    const newHp = Math.max(0, bossRaid.hp - damage);

    const hitPopupId = Date.now() + Math.random();
    setHarvestPopups(prev => [
      ...prev,
      { id: hitPopupId, text: `💥 HIT! -${Math.floor(damage)} HP`, x: 50, y: 35 }
    ]);
    setTimeout(() => {
      setHarvestPopups(prev => prev.filter(p => p.id !== hitPopupId));
    }, 1000);

    if (newHp <= 0) {
      soundFx.playVictoryFanfare();
      setInventory(prev => ({
        ...prev,
        money: prev.money + bossRaid.rewardMoney,
        cpoTons: prev.cpoTons + bossRaid.rewardCpo,
        playerExp: prev.playerExp + 1500
      }));

      const vicPopupId = Date.now();
      setHarvestPopups(prev => [
        ...prev,
        { id: vicPopupId, text: '🏆 KING ORYCTES TUMBANG! +Rp 25.000.000 & 3 Ton CPO!', x: 50, y: 20 },
        { id: vicPopupId + 1, text: '🧩 Ditemukan: Fragmen Peta Pulau Sawit Legend (1/3)!', x: 50, y: 35 }
      ]);
      setTimeout(() => {
        setHarvestPopups(prev => prev.filter(p => p.id !== vicPopupId && p.id !== vicPopupId + 1));
      }, 4000);

      setBossRaid(prev => ({ ...prev, active: false, hp: 0 }));
      setWeather('sunny');
    } else {
      setBossRaid(prev => ({ ...prev, hp: newHp }));
    }
  };

  const handleWaterIrrigate = () => {
    soundFx.playWaterSplash();
    const popupId = Date.now();
    setHarvestPopups(prev => [
      ...prev,
      { id: popupId, text: '💧 LAHAN DISIRAM! Kebakaran Lahan Dinetralkan!', x: 50, y: 40 }
    ]);
    setTimeout(() => {
      setHarvestPopups(prev => prev.filter(p => p.id !== popupId));
    }, 2000);
  };

  // Inventory, Economy & Prestige State
  const [inventory, setInventory] = useState<InventoryState>({
    money: 15000000, // Rp 15.000.000 starting cash
    tbsTons: 2.5,
    cpoTons: 0.5,
    kernelTons: 0.1,
    fertilizerStock: 10,
    marketPricePerKg: 3200, // Rp 3.200 per kg
    playerLevel: 1,
    playerExp: 0,
    totalHarvestedLifetime: 2.5
  });

  // Fluktuatif TBS Price Ticker (Changes every 12 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const newPrice = Math.floor(2400 + Math.random() * 1800);
      setInventory(prev => ({ ...prev, marketPricePerKg: newPrice }));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Upgrades State
  const [upgrades, setUpgrades] = useState<UpgradesState>({
    egrekSharpness: 1,
    egrekReach: 1,
    tractorHydraulics: 1,
    tractorGrabSize: 1,
    truckCapacity: 1,
    truckSpeed: 1,
    autoHarvesterBots: 0,
    fertilizerBoost: 1
  });

  // --- Jumpscare Event State ---
  const [jumpscare, setJumpscare] = useState<JumpscareState>({
    active: false,
    type: 'ular_sanca',
    title: 'ULAR SANCA RAKSASA!',
    subtitle: 'Ular sanca 7 meter keluar melilit dari pelepah sawit!',
    emoji: '🐍',
    sound: 'snake',
    timeRemaining: 3.0,
    penaltyMoney: 2500000
  });

  const triggerJumpscareEncounter = () => {
    const types: Array<{ type: JumpscareState['type']; title: string; subtitle: string; emoji: string; sound: JumpscareState['sound'] }> = [
      { type: 'ular_sanca', title: 'ULAR SANCA RAKSASA!', subtitle: 'Ular sanca 7 meter melilit jatuh dari pelepah sawit!', emoji: '🐍', sound: 'snake' },
      { type: 'hantu_pokpok', title: 'PENAMPAKAN HANTU POK-POK!', subtitle: 'Suara tawa misterius bergema di tengah kebun sawit!', emoji: '👻', sound: 'jumpscare' },
      { type: 'babirusa_amok', title: 'BABIRUSA HUTAN NGAMUK!', subtitle: 'Babi hutan taring emas menyeruduk kencang dari rimbun rumput!', emoji: '🐗', sound: 'thunder' },
      { type: 'rem_blong', title: 'KABIN TRUK REM BLONG!', subtitle: 'Pipa rem hidrolik traktor pecah meluncur ke jurang!', emoji: '🚜', sound: 'jumpscare' }
    ];
    const picked = types[Math.floor(Math.random() * types.length)];
    setJumpscare({
      active: true,
      type: picked.type,
      title: picked.title,
      subtitle: picked.subtitle,
      emoji: picked.emoji,
      sound: picked.sound,
      timeRemaining: 3.0,
      penaltyMoney: 3000000
    });
  };

  // Jumpscare Countdown Loop
  useEffect(() => {
    if (!jumpscare.active) return;
    const interval = setInterval(() => {
      setJumpscare(prev => {
        if (!prev.active) return prev;
        if (prev.timeRemaining <= 0.1) {
          // Time expired, penalty!
          soundFx.playPuzzleWrong();
          setInventory(inv => ({
            ...inv,
            money: Math.max(0, inv.money - prev.penaltyMoney),
            tbsTons: Math.max(0, inv.tbsTons - 0.5)
          }));
          return { ...prev, active: false };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 0.1 };
      });
    }, 100);
    return () => clearInterval(interval);
  }, [jumpscare.active]);

  const handleDodgeJumpscare = () => {
    soundFx.playPuzzleSuccess();
    setInventory(inv => ({ ...inv, money: inv.money + 5000000 }));
    setHarvestPopups(prev => [
      ...prev,
      { id: Date.now(), text: '💥 REFLEKS SEMPURNA! Berhasil Menghindari Bahaya! +Rp 5.000.000', x: 50, y: 40 }
    ]);
    setTimeout(() => {
      setHarvestPopups(prev => prev.filter(p => p.id !== Date.now()));
    }, 2000);
    setJumpscare(prev => ({ ...prev, active: false }));
  };

  // --- Psychological Mind Puzzle System ---
  const [isPuzzleOpen, setIsPuzzleOpen] = useState(false);
  const [activePuzzle, setActivePuzzle] = useState<PsychologicalPuzzle | null>(null);

  const puzzlePool: PsychologicalPuzzle[] = [
    {
      id: 'puz-1',
      title: 'Paradoks pH Tanah Gambut Acidic',
      category: 'teka_teki_agronomi',
      scenario: 'Lahan gambut Riau memiliki pH 3.8 (sangat asam) dan tergenang air hujan. Pohon sawit mengalami defisiensi Mg (Magnesium) berat. Jika kamu langsung memberikan Pupuk NPK dosis tinggi, apa risiko utamanya?',
      hint: 'Akar sawit pada tanah yang terlalu asam akan terbakar jika diberi pupuk bergaram tinggi tanpa penetralisir pH (Dolomit).',
      options: [
        { text: 'Akar sawit mengalami Shock Osmotik dan terbakar mati, keracunan Alumunium.', isCorrect: true, explanation: 'Tepat! Tanpa pengapuran Kapur Dolomit untuk menaikkan pH ke 5.5, NPK dosis tinggi akan merusak mikoriza akar.' },
        { text: 'Daun sawit langsung tumbuh emas berkilau dalam 2 hari.', isCorrect: false, explanation: 'Salah! Pupuk asam pada tanah asam justru mematikan akar.' },
        { text: 'Buah sawit bertambah tonase 10x lipat secara instan.', isCorrect: false, explanation: 'Salah! Tanaman tidak dapat menyerap hara jika pH tanah terlalu ekstrim.' }
      ],
      rewardMoney: 35000000,
      rewardCpo: 4.0,
      penaltyMoney: 5000000
    },
    {
      id: 'puz-2',
      title: 'Misteri Sandi Peta Tengkulak Sawit',
      category: 'peta_sandi',
      scenario: 'Peta kuno pabrik CPO menuliskan sandi: "Di perbukitan, bila TBS matang beraroma vanila gurih, panenlah saat bayangan pelepah mengarah ke utara." Apa arti logis agronomi dari petunjuk ini?',
      hint: 'Kematangan puncak TBS ditandai oleh 5-10 brondolan jatuh dan kandungan minyak CPO maksimum di siang hari.',
      options: [
        { text: 'Memanen tepat saat matahari berada di zenith (siang hari) ketika brondolan lepas secara alami, menghasilkan kadar asam lemak bebas (ALB) terendah.', isCorrect: true, explanation: 'Benar! Penentuan waktu panen saat zenith menjamin kadar ALB di bawah 5% sehingga harga CPO maksimal.' },
        { text: 'Memotong seluruh pohon sawit hingga rata dengan tanah.', isCorrect: false, explanation: 'Salah! Memotong pohon akan menghancurkan kebun.' },
        { text: 'Menjual TBS ke pasar gelap saat malam hari tanpa ditimbang.', isCorrect: false, explanation: 'Salah! Itu adalah tindakan ilegal.' }
      ],
      rewardMoney: 50000000,
      rewardCpo: 5.0,
      penaltyMoney: 10000000
    },
    {
      id: 'puz-3',
      title: 'Deteksi Pupuk NPK Palsu Batu Merah',
      category: 'teka_teki_agronomi',
      scenario: 'Seorang oknum pedagang menawarkan Pupuk NPK 16-16-16 seharga separuh harga pasar. Saat dilarutkan ke air, butiran merahnya tidak larut dan meninggalkan endapan pasir tanah liat tebal. Apa keputusan terbaikmu?',
      hint: 'Pupuk NPK asli berkualitas tinggi memiliki kelarutan air >90% dan tidak meninggalkan pasir tebal.',
      options: [
        { text: 'Tolak & Laporkan! Itu adalah pupuk bata merah palsu yang tidak mengandung nitrogen/fosfat.', isCorrect: true, explanation: 'Sempurna! Pupuk batu bata merah palsu sangat marak dan dapat memadatkan tanah kebun.' },
        { text: 'Beli 10 ton langsung karena harganya sangat murah.', isCorrect: false, explanation: 'Salah! Pupuk palsu hanya membuang uang dan merusak kebun.' },
        { text: 'Campurkan dengan minyak goreng lalu sebar ke pohon.', isCorrect: false, explanation: 'Salah! Ini justru menutup pori-pori tanah.' }
      ],
      rewardMoney: 40000000,
      rewardCpo: 3.5,
      penaltyMoney: 8000000
    }
  ];

  const handleOpenPuzzleModal = () => {
    soundFx.playClick();
    const picked = puzzlePool[Math.floor(Math.random() * puzzlePool.length)];
    setActivePuzzle(picked);
    setIsPuzzleOpen(true);
  };

  const handleSolvePuzzle = (isCorrect: boolean, puzzle: PsychologicalPuzzle) => {
    if (isCorrect) {
      setInventory(inv => ({
        ...inv,
        money: inv.money + puzzle.rewardMoney,
        cpoTons: inv.cpoTons + puzzle.rewardCpo
      }));
      setHarvestPopups(prev => [
        ...prev,
        { id: Date.now(), text: `🧠 ANALISIS TEPAT! +Rp ${puzzle.rewardMoney.toLocaleString('id-ID')} & +${puzzle.rewardCpo} T CPO`, x: 50, y: 35 }
      ]);
    } else {
      setInventory(inv => ({
        ...inv,
        money: Math.max(0, inv.money - puzzle.penaltyMoney)
      }));
      setHarvestPopups(prev => [
        ...prev,
        { id: Date.now(), text: `⚠️ KEPUTUSAN SALAH! Rugi Rp ${puzzle.penaltyMoney.toLocaleString('id-ID')}`, x: 50, y: 35 }
      ]);
    }
    setTimeout(() => {
      setHarvestPopups(prev => prev.filter(p => p.id !== Date.now()));
    }, 2000);
  };

  // --- Multi-Biome System ---
  const [biomes, setBiomes] = useState<BiomeInfo[]>([
    {
      id: 'gambut_riau',
      name: 'Kebun Gambut Riau',
      description: 'Lahan gambut subur khas Riau dengan pohon sawit produktif.',
      unlockCost: 0,
      unlocked: true,
      groundColor: '#3f6212',
      fogColor: '#bae6fd',
      treeMultiplier: 1.0,
      yieldBonus: 1.0,
      treeCount: 49,
      bgEmoji: '🌴',
      soilType: 'Organik Gambut pH 4.2',
      hazardRisk: 'Genangan Air & Kebakaran Kemarau',
      specialFeature: 'Produktivitas Umur Pohon Stabil'
    },
    {
      id: 'sumatera_hills',
      name: 'Perbukitan Sumatera',
      description: 'Lahan berkabut di dataran tinggi Sumatera. Hasil panen +20%.',
      unlockCost: 20000000,
      unlocked: false,
      groundColor: '#2d4a0f',
      fogColor: '#cbd5e1',
      treeMultiplier: 1.2,
      yieldBonus: 1.2,
      treeCount: 49,
      bgEmoji: '⛰️',
      soilType: 'Vulkanik Podsolik Merah',
      hazardRisk: 'Kabut Tebal & Jalan Licin Longsor',
      specialFeature: 'Kadar Minyak CPO +20%'
    },
    {
      id: 'kalimantan_mega',
      name: 'Mega Industri Kalimantan',
      description: 'Lahan raksasa 81 pohon dengan akses jalan aspal industri. Hasil +50%.',
      unlockCost: 50000000,
      unlocked: false,
      groundColor: '#4d7c0f',
      fogColor: '#93c5fd',
      treeMultiplier: 1.5,
      yieldBonus: 1.5,
      treeCount: 81,
      bgEmoji: '🏭',
      soilType: 'Aluvial Industri Kuarsa',
      hazardRisk: 'Kemacetan Truk Industri & Hama Babi',
      specialFeature: 'Kecepatan Angkut Traktor +30%'
    },
    {
      id: 'pulau_legend',
      name: 'Pulau Sawit Legend',
      description: 'Wilayah pulau rahasia berpasir emas dengan janjang sawit legend (3x Tonase!).',
      unlockCost: 120000000,
      unlocked: false,
      groundColor: '#854d0e',
      fogColor: '#fef08a',
      treeMultiplier: 3.0,
      yieldBonus: 3.0,
      treeCount: 81,
      bgEmoji: '👑',
      soilType: 'Pasir Emas Murni Ajaib',
      hazardRisk: 'Serangan Boss King Oryctes & Jumpscare',
      specialFeature: 'Bonus Tonase Emas 3x Lipat'
    }
  ]);

  const [activeBiomeId, setActiveBiomeId] = useState<BiomeType>('gambut_riau');
  const activeBiome = biomes.find(b => b.id === activeBiomeId) || biomes[0];

  // Dynamic Tree Grid Generator based on Active Biome
  const [trees, setTrees] = useState<Tree3DData[]>(() => generateTreeGrid(49));

  function generateTreeGrid(count: number): Tree3DData[] {
    const list: Tree3DData[] = [];
    let id = 0;
    const gridDim = count === 81 ? 4 : 3;
    for (let r = -gridDim; r <= gridDim; r++) {
      for (let c = -gridDim; c <= gridDim; c++) {
        list.push({
          id: id++,
          x: c * 13 + (r % 2 === 0 ? 3 : -3),
          z: r * 13,
          harvested: false,
          maturity: 'golden',
          fruitCount: 3
        });
      }
    }
    return list;
  }

  // Handle Biome Unlock & Travel
  const handleUnlockBiome = (biomeId: BiomeType) => {
    const target = biomes.find(b => b.id === biomeId);
    if (!target || target.unlocked || inventory.money < target.unlockCost) return;

    setInventory(prev => ({ ...prev, money: prev.money - target.unlockCost }));
    setBiomes(prev => prev.map(b => b.id === biomeId ? { ...b, unlocked: true } : b));
    setActiveBiomeId(biomeId);
    setTrees(generateTreeGrid(target.treeCount));
  };

  const handleTravelToBiome = (biomeId: BiomeType) => {
    const target = biomes.find(b => b.id === biomeId);
    if (!target || !target.unlocked) return;
    setActiveBiomeId(biomeId);
    setTrees(generateTreeGrid(target.treeCount));
  };

  // --- Character Roster System ---
  const [characters, setCharacters] = useState<CharacterItem[]>([
    {
      id: 'pak_budi',
      name: 'Pak Budi',
      role: 'Pemanen Veteran',
      price: 0,
      unlocked: true,
      perkText: 'Karakter utama dengan stamina dan performa panen seimbang.',
      color: '#0284c7',
      avatarEmoji: '👨‍🌾',
      harvestMultiplier: 1.0,
      speedMultiplier: 1.0,
      sellBonus: 1.0,
      specialSkill: 'Teknik Egrek Presisi',
      affinityTool: 'egrek',
      quote: 'Panen sawit bukan cuma soal otot, tapi soal kejelian mata!'
    },
    {
      id: 'kang_asep',
      name: 'Kang Asep',
      role: 'Sopir Traktor Handal',
      price: 25000000,
      unlocked: false,
      perkText: 'Meningkatkan kecepatan jalan & traktor sebesar +25%.',
      color: '#eab308',
      avatarEmoji: '🤠',
      harvestMultiplier: 1.1,
      speedMultiplier: 1.25,
      sellBonus: 1.0,
      specialSkill: 'Ngebut Traktor Turbo',
      affinityTool: 'tractor',
      quote: 'Lahan seluas apapun, traktor saya siap babat habis!'
    },
    {
      id: 'mbak_ani',
      name: 'Mbak Ani',
      role: 'Mandor Kebun',
      price: 60000000,
      unlocked: false,
      perkText: 'Mendapatkan bonus harga jual TBS di pabrik sebesar +15%.',
      color: '#ec4899',
      avatarEmoji: '👩‍🌾',
      harvestMultiplier: 1.1,
      speedMultiplier: 1.0,
      sellBonus: 1.15,
      specialSkill: 'Negosiasi Pabrik CPO',
      affinityTool: 'truck',
      quote: 'Kualitas buah kita nomor satu, pabrik wajib bayar tinggi!'
    },
    {
      id: 'lord_sawit',
      name: 'Lord Sawit',
      role: 'Sultan Sawit Legend',
      price: 150000000,
      unlocked: false,
      perkText: 'Hasil tonase panen +50% & efek aura emas eksklusif!',
      color: '#f59e0b',
      avatarEmoji: '👑',
      harvestMultiplier: 1.5,
      speedMultiplier: 1.2,
      sellBonus: 1.25,
      specialSkill: 'Sentuhan Midas Janjang Emas',
      affinityTool: 'egrek',
      quote: 'Setiap pelepah yang kupotong bernilai triliunan rupiah!'
    },
    {
      id: 'bang_jarwo',
      name: 'Bang Jarwo',
      role: 'Pemberani & Anti-Jumpscare',
      price: 90000000,
      unlocked: false,
      perkText: 'Kebal dari jebakan ular & kecepatan lari +30%.',
      color: '#10b981',
      avatarEmoji: '🥷',
      harvestMultiplier: 1.2,
      speedMultiplier: 1.3,
      sellBonus: 1.1,
      specialSkill: 'Refleks Silat Rimba',
      affinityTool: 'egrek',
      quote: 'Ular sanca sawit pun takut kalau ketemu saya di rimbun pelepah!'
    },
    {
      id: 'bu_tejo_tengkulak',
      name: 'Bu Tejo',
      role: 'Ratu Tengkulak CPO',
      price: 200000000,
      unlocked: false,
      perkText: 'Harga jual TBS di pabrik naik +40% tanpa potongan!',
      color: '#8b5cf6',
      avatarEmoji: '💃',
      harvestMultiplier: 1.3,
      speedMultiplier: 1.1,
      sellBonus: 1.4,
      specialSkill: 'Monopoli Harga CPO',
      affinityTool: 'truck',
      quote: 'Di pabrik manapun, kata-kata Bu Tejo adalah hukum!'
    },
    {
      id: 'sultan_riau_cyber',
      name: 'Sultan Cyber Riau',
      role: 'Mogul Triliuner Sawit',
      price: 500000000,
      unlocked: false,
      perkText: 'Hasil panen 2x Lipat, Kecepatan +50% & Aura Cyber Gold!',
      color: '#3b82f6',
      avatarEmoji: '🚀',
      harvestMultiplier: 2.0,
      speedMultiplier: 1.5,
      sellBonus: 1.5,
      specialSkill: 'Otomatisasi Cyber Satelit',
      affinityTool: 'tractor',
      quote: 'Masa depan kelapa sawit ada di genggaman teknologi cyber!'
    }
  ]);

  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('pak_budi');
  const activeCharacter = characters.find(c => c.id === selectedCharacterId) || characters[0];

  const handleUnlockCharacter = (charId: string) => {
    const target = characters.find(c => c.id === charId);
    if (!target || target.unlocked || inventory.money < target.price) return;

    setInventory(prev => ({ ...prev, money: prev.money - target.price }));
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, unlocked: true } : c));
    setSelectedCharacterId(charId);
  };

  // --- Story Campaign Chapter System ---
  const [storyChapters, setStoryChapters] = useState<StoryChapter[]>([
    {
      id: 1,
      chapterNumber: 1,
      title: 'Awal Mulai Sang Pemanen Muda',
      speakerName: 'Pak Budi',
      speakerRole: 'Pemanen Senior',
      speakerEmoji: '👨‍🌾',
      dialogue: 'Selamat datang di kebun sawit, nak! Awali langkahmu dengan memanen 5 Ton TBS pertama di kebun.',
      objective: 'Panen 5 Ton TBS di kebun',
      targetAmount: 5.0,
      currentAmount: 2.5,
      rewardMoney: 10000000,
      completed: false,
      type: 'harvest_tbs'
    },
    {
      id: 2,
      chapterNumber: 2,
      title: 'Fluktuasi Pasar & Musim Hujan',
      speakerName: 'Mandor Frans',
      speakerRole: 'Mandor Lapangan',
      speakerEmoji: '🧢',
      dialogue: 'Pabrik kelapa sawit membutuhkan pasokan besar! Pasok 15 Ton TBS ke pabrik sebelum badai datang.',
      objective: 'Jual 15 Ton TBS ke Pabrik',
      targetAmount: 15.0,
      currentAmount: 0,
      rewardMoney: 25000000,
      completed: false,
      type: 'sell_factory'
    },
    {
      id: 3,
      chapterNumber: 3,
      title: 'Rivalitas Pemanen & Ekspansi Lahan',
      speakerName: 'Kang Asep',
      speakerRole: 'Rival Pemanen',
      speakerEmoji: '🤠',
      dialogue: 'Hasil panenmu cukup lumayan! Tapi sanggupkah kamu mengumpulkan 35 Ton TBS di wilayah baru?',
      objective: 'Panen 35 Ton TBS',
      targetAmount: 35.0,
      currentAmount: 0,
      rewardMoney: 60000000,
      completed: false,
      type: 'harvest_tbs'
    },
    {
      id: 4,
      chapterNumber: 4,
      title: 'Menjadi Sultan Sawit Nusantara',
      speakerName: 'Lord Sawit',
      speakerRole: 'Sultan Legend',
      speakerEmoji: '👑',
      dialogue: 'Impianmu menjadi Raja Sawit Indonesia sudah di depan mata! Tunjukkan kejayaanmu memanen 80 Ton TBS!',
      objective: 'Panen 80 Ton TBS',
      targetAmount: 80.0,
      currentAmount: 0,
      rewardMoney: 150000000,
      completed: false,
      type: 'harvest_tbs'
    }
  ]);

  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const currentStoryChapter = storyChapters[currentChapterIdx] || storyChapters[0];

  const handleClaimChapterReward = () => {
    soundFx.playChapterComplete();
    setInventory(prev => ({ ...prev, money: prev.money + currentStoryChapter.rewardMoney }));
    setStoryChapters(prev => prev.map((ch, idx) => idx === currentChapterIdx ? { ...ch, completed: true } : ch));

    if (currentChapterIdx < storyChapters.length - 1) {
      setCurrentChapterIdx(prev => prev + 1);
    }
  };

  // Infinite Regrowth
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const regrowSpeed = Math.max(4000, 12000 - upgrades.fertilizerBoost * 800);
      setTrees(prev =>
        prev.map(t => {
          if (t.harvested && t.harvestedAt && now - t.harvestedAt > regrowSpeed) {
            return { ...t, harvested: false, harvestedAt: undefined };
          }
          return t;
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [upgrades.fertilizerBoost]);

  // Auto Harvester Bots
  useEffect(() => {
    if (upgrades.autoHarvesterBots <= 0) return;

    const interval = setInterval(() => {
      setTrees(prev => {
        const available = prev.filter(t => !t.harvested);
        if (available.length === 0) return prev;

        const target = available[Math.floor(Math.random() * available.length)];
        const now = Date.now();

        const yieldGained = 0.3 * upgrades.autoHarvesterBots * activeBiome.yieldBonus;
        setInventory(inv => ({
          ...inv,
          tbsTons: inv.tbsTons + yieldGained,
          totalHarvestedLifetime: inv.totalHarvestedLifetime + yieldGained
        }));

        soundFx.playBotHarvest();

        return prev.map(t => t.id === target.id ? { ...t, harvested: true, harvestedAt: now } : t);
      });
    }, Math.max(1500, 5000 - upgrades.autoHarvesterBots * 350));

    return () => clearInterval(interval);
  }, [upgrades.autoHarvesterBots, activeBiome.yieldBonus]);

  // Quests & Missions
  const [quests, setQuests] = useState<QuestItem[]>([
    {
      id: 'q1',
      title: 'Panen 5 Ton TBS Pertama',
      description: 'Potong TBS matang dari pohon menggunakan Egrek atau Traktor.',
      targetAmount: 5.0,
      currentAmount: 2.5,
      rewardMoney: 10000000,
      rewardScore: 500,
      completed: false,
      type: 'harvest_tbs'
    },
    {
      id: 'q2',
      title: 'Jual TBS ke Pabrik Kelapa Sawit',
      description: 'Antar dan jual hasil panen TBS ke pabrik saat harga naik.',
      targetAmount: 10.0,
      currentAmount: 0,
      rewardMoney: 25000000,
      rewardScore: 1200,
      completed: false,
      type: 'sell_factory'
    }
  ]);

  const generateNewQuest = (level: number) => {
    const isHarvest = Math.random() > 0.4;
    const target = isHarvest ? Math.round(5 + level * 4) : Math.round(10 + level * 6);
    const reward = target * (isHarvest ? 2000000 : 3500000);

    const newQuest: QuestItem = {
      id: `q-inf-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: isHarvest ? `Target Panen ${target} Ton TBS` : `Penjualan ${target} Ton ke Pabrik`,
      description: isHarvest
        ? `Tingkatkan efisiensi panen kebun hingga mencapai ${target} Ton TBS.`
        : `Manfaatkan fluktuasi harga pasar untuk memasok ${target} Ton TBS ke pabrik.`,
      targetAmount: target,
      currentAmount: 0,
      rewardMoney: reward,
      rewardScore: target * 100,
      completed: false,
      type: isHarvest ? 'harvest_tbs' : 'sell_factory'
    };

    setQuests(prev => [...prev.filter(q => !q.completed), newQuest]);
  };

  // Random Events
  const [activeEvents, setActiveEvents] = useState<RandomEvent[]>([
    {
      id: 'evt-1',
      type: 'pupuk_booster',
      title: 'Peti Pupuk Ajaib!',
      message: 'Ambil peti pupuk di kebun!',
      x: 15,
      z: 20,
      active: true,
      expiresAt: Date.now() + 60000
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const rx = (Math.random() - 0.5) * 100;
      const rz = (Math.random() - 0.5) * 100;
      const newEvt: RandomEvent = {
        id: `evt-${Date.now()}`,
        type: 'pupuk_booster',
        title: 'Peti Pupuk Ajaib!',
        message: 'Ambil peti pupuk di kebun!',
        x: rx,
        z: rz,
        active: true,
        expiresAt: Date.now() + 45000
      };
      setActiveEvents([newEvt]);
    }, 35000);
    return () => clearInterval(interval);
  }, []);

  const handleCollectEvent = (eventId: string) => {
    soundFx.playCoin();
    setInventory(prev => ({ ...prev, money: prev.money + 5000000 }));

    const popupId = Date.now();
    setHarvestPopups(prev => [
      ...prev,
      {
        id: popupId,
        text: '🎁 BONUS PETI PUPUK AJAIB! +Rp 5.000.000!',
        x: 50,
        y: 45
      }
    ]);
    setTimeout(() => {
      setHarvestPopups(prev => prev.filter(p => p.id !== popupId));
    }, 2000);

    setActiveEvents(prev => prev.map(e => e.id === eventId ? { ...e, active: false } : e));
  };

  // Plantation Land Plots
  const [plots, setPlots] = useState<LandPlot[]>([
    {
      id: 1,
      name: 'Blok A - Tenera Unggul',
      unlocked: true,
      unlockCost: 0,
      seedType: 'Tenera',
      palmCount: 120,
      soilMoisture: 85,
      fertilizerLevel: 75,
      growthStage: 'super_panen',
      lastHarvested: Date.now()
    },
    {
      id: 2,
      name: 'Blok B - Supergen Gold',
      unlocked: true,
      unlockCost: 0,
      seedType: 'Hybrid Gold',
      palmCount: 140,
      soilMoisture: 90,
      fertilizerLevel: 80,
      growthStage: 'siap_panen',
      lastHarvested: Date.now()
    },
    {
      id: 3,
      name: 'Blok C - Dura Ekstra',
      unlocked: false,
      unlockCost: 15000000,
      seedType: 'Dura',
      palmCount: 160,
      soilMoisture: 60,
      fertilizerLevel: 50,
      growthStage: 'muda',
      lastHarvested: Date.now()
    }
  ]);

  // --- Offline AI Bot Duel System ---
  const [isDuelActive, setIsDuelActive] = useState(false);
  const [duelTimeLeft, setDuelTimeLeft] = useState(120);
  const [botPlayers, setBotPlayers] = useState<BotPlayer[]>([
    { id: 'bot-1', name: 'Bot Tejo (Pemanen Lokal)', x: -20, z: -20, rotation: 0, score: 0, color: '#ef4444', harvestCount: 0 },
    { id: 'bot-2', name: 'Bot Asep (Speedster)', x: 20, z: 20, rotation: 0, score: 0, color: '#f59e0b', harvestCount: 0 },
    { id: 'bot-3', name: 'Bot AI Super Sultan', x: -20, z: 20, rotation: 0, score: 0, color: '#ec4899', harvestCount: 0 }
  ]);

  const handleStartDuel = (durationSec: number) => {
    setIsDuelActive(true);
    setDuelTimeLeft(durationSec);
    setBotPlayers([
      { id: 'bot-1', name: 'Bot Tejo (Pemanen Lokal)', x: -20, z: -20, rotation: 0, score: 0, color: '#ef4444', harvestCount: 0 },
      { id: 'bot-2', name: 'Bot Asep (Speedster)', x: 20, z: 20, rotation: 0, score: 0, color: '#f59e0b', harvestCount: 0 },
      { id: 'bot-3', name: 'Bot AI Super Sultan', x: -20, z: 20, rotation: 0, score: 0, color: '#ec4899', harvestCount: 0 }
    ]);
  };

  const handleStopDuel = () => {
    setIsDuelActive(false);
  };

  // AI Bot Movement & Harvesting Loop
  useEffect(() => {
    if (!isDuelActive) return;

    const interval = setInterval(() => {
      setDuelTimeLeft(time => {
        if (time <= 1) {
          setIsDuelActive(false);
          soundFx.playLevelUp();
          return 0;
        }
        return time - 1;
      });

      // Move AI Bots randomly and harvest trees
      setBotPlayers(bots =>
        bots.map(b => {
          const dx = (Math.random() - 0.5) * 8;
          const dz = (Math.random() - 0.5) * 8;
          const nx = Math.max(-60, Math.min(60, b.x + dx));
          const nz = Math.max(-60, Math.min(60, b.z + dz));
          const rot = Math.atan2(dx, dz);

          // Bot cut chance
          const didCut = Math.random() > 0.45;
          const addedScore = didCut ? Math.floor(80 + Math.random() * 60) : 0;

          return {
            ...b,
            x: nx,
            z: nz,
            rotation: rot,
            score: b.score + addedScore,
            harvestCount: b.harvestCount + (didCut ? 1 : 0)
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isDuelActive]);

  // Socket.io Multiplayer State
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState('global-arena');
  const [playerName, setPlayerName] = useState('Pemanen_01');
  const [remotePlayers, setRemotePlayers] = useState<RemotePlayer[]>([]);
  const [myScore, setMyScore] = useState(0);
  const [myHarvestCount, setMyHarvestCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-room', { roomId, playerName });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room-joined', (data: { roomId: string; playerId: string; roomState: { players: Record<string, RemotePlayer>; timeLeft: number } }) => {
      setRoomId(data.roomId);
      setTimeLeft(data.roomState.timeLeft);
      if (data.roomState.players) {
        setRemotePlayers(Object.values(data.roomState.players).filter(p => p.id !== socket.id));
      }
    });

    socket.on('player-joined', (p: RemotePlayer) => {
      setRemotePlayers(prev => [...prev.filter(rp => rp.id !== p.id), p]);
    });

    socket.on('player-left', (data: { id: string }) => {
      setRemotePlayers(prev => prev.filter(p => p.id !== data.id));
    });

    socket.on('player-moved', (data: { id: string; x: number; z: number; rotation: number; vehicle: ToolType }) => {
      setRemotePlayers(prev => prev.map(p => {
        if (p.id === data.id) {
          return { ...p, x: data.x, z: data.z, rotation: data.rotation, vehicle: data.vehicle };
        }
        return p;
      }));
    });

    socket.on('tree-respawned', (data: { treeId: number }) => {
      setTrees(prev => prev.map(t => t.id === data.treeId ? { ...t, harvested: false } : t));
    });

    socket.on('harvest-success', (data: { playerId: string; treeId: number; scoreGained: number; totalScore: number }) => {
      setTrees(prev => prev.map(t => t.id === data.treeId ? { ...t, harvested: true, harvestedAt: Date.now() } : t));

      if (data.playerId === socket.id) {
        setMyScore(data.totalScore);
        setMyHarvestCount(prev => prev + 1);
      } else {
        setRemotePlayers(prev => prev.map(p => p.id === data.playerId ? { ...p, score: data.totalScore } : p));
      }
    });

    socket.on('timer-sync', (data: { timeLeft: number }) => {
      setTimeLeft(data.timeLeft);
    });

    socket.on('chat-broadcast', (msg: ChatMessage) => {
      setChatMessages(prev => [...prev.slice(-15), msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Sync position over socket
  useEffect(() => {
    const interval = setInterval(() => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('player-move', {
          x: playerPosRef.current.x,
          z: playerPosRef.current.z,
          rotation: playerPosRef.current.rotation,
          vehicle: currentTool
        });
      }
    }, 66);

    return () => clearInterval(interval);
  }, [currentTool]);

  // Handle Harvest Cut Action
  const handleHarvestTree = (treeId: number, qualityBonus = 1.0) => {
    if (currentTool === 'egrek') {
      soundFx.playSlice();
    } else {
      soundFx.playGrab();
    }

    // 6% Chance for a surprise Jumpscare encounter!
    if (Math.random() < 0.06 && !jumpscare.active) {
      triggerJumpscareEncounter();
    }

    const now = Date.now();
    setTrees(prev => prev.map(t => t.id === treeId ? { ...t, harvested: true, harvestedAt: now } : t));

    const baseYield = 0.35 * (1 + upgrades.egrekSharpness * 0.15);
    const yieldPerBunch = baseYield * activeCharacter.harvestMultiplier * activeBiome.yieldBonus;

    setInventory(prev => {
      const newTbs = prev.tbsTons + yieldPerBunch;
      const newLifetime = prev.totalHarvestedLifetime + yieldPerBunch;
      const newExp = prev.playerExp + 50;
      let newLevel = prev.playerLevel;
      if (newExp >= newLevel * 200) {
        newLevel += 1;
        soundFx.playLevelUp();
      }
      return {
        ...prev,
        tbsTons: newTbs,
        totalHarvestedLifetime: newLifetime,
        playerExp: newExp,
        playerLevel: newLevel
      };
    });

    // Story Chapter Progress
    setStoryChapters(prev =>
      prev.map((ch, idx) => {
        if (idx === currentChapterIdx && !ch.completed && ch.type === 'harvest_tbs') {
          return { ...ch, currentAmount: ch.currentAmount + yieldPerBunch };
        }
        return ch;
      })
    );

    // Update active Quests
    setQuests(prev => {
      let questCompleted = false;
      const updated = prev.map(q => {
        if (q.type === 'harvest_tbs' && !q.completed) {
          const newAmt = q.currentAmount + yieldPerBunch;
          const completed = newAmt >= q.targetAmount;
          if (completed) {
            questCompleted = true;
            soundFx.playCoin();
            setInventory(inv => ({ ...inv, money: inv.money + q.rewardMoney }));
          }
          return { ...q, currentAmount: newAmt, completed };
        }
        return q;
      });

      if (questCompleted) {
        setTimeout(() => generateNewQuest(inventory.playerLevel), 1000);
      }
      return updated;
    });

    // Floating Popup
    const popupId = Date.now() + Math.random();
    const newPopup = {
      id: popupId,
      text: `+${yieldPerBunch.toFixed(2)} Ton TBS (+${Math.round(100 * qualityBonus)} Pts)`,
      x: 50 + (Math.random() - 0.5) * 10,
      y: 40 + (Math.random() - 0.5) * 10
    };
    setHarvestPopups(prev => [...prev, newPopup]);
    setTimeout(() => {
      setHarvestPopups(prev => prev.filter(p => p.id !== popupId));
    }, 1200);

    const gainedPts = Math.round(100 * qualityBonus);
    setMyScore(prev => prev + gainedPts);
    setMyHarvestCount(prev => prev + 1);

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('harvest-action', { treeId, qualityBonus });
    }
  };

  // Factory Sale Handler
  const handleSellAtFactory = () => {
    if (inventory.tbsTons <= 0) return;

    soundFx.playCoin();
    const baseEarnings = Math.floor(inventory.tbsTons * 1000 * inventory.marketPricePerKg);
    const earnings = Math.floor(baseEarnings * activeCharacter.sellBonus);

    setInventory(prev => ({
      ...prev,
      money: prev.money + earnings,
      tbsTons: 0,
      playerExp: prev.playerExp + 150
    }));

    // Story Chapter Progress
    setStoryChapters(prev =>
      prev.map((ch, idx) => {
        if (idx === currentChapterIdx && !ch.completed && ch.type === 'sell_factory') {
          return { ...ch, currentAmount: ch.currentAmount + inventory.tbsTons };
        }
        return ch;
      })
    );

    // Update active quests
    setQuests(prev => {
      let questCompleted = false;
      const updated = prev.map(q => {
        if (q.type === 'sell_factory' && !q.completed) {
          const newAmt = q.currentAmount + inventory.tbsTons;
          const completed = newAmt >= q.targetAmount;
          if (completed) {
            questCompleted = true;
            setInventory(inv => ({ ...inv, money: inv.money + q.rewardMoney }));
          }
          return { ...q, currentAmount: newAmt, completed };
        }
        return q;
      });

      if (questCompleted) {
        setTimeout(() => generateNewQuest(inventory.playerLevel), 1000);
      }
      return updated;
    });

    const popupId = Date.now();
    setHarvestPopups(prev => [
      ...prev,
      {
        id: popupId,
        text: `💰 TBS TERJUAL! +Rp ${earnings.toLocaleString('id-ID')}`,
        x: 50,
        y: 35
      }
    ]);
    setTimeout(() => {
      setHarvestPopups(prev => prev.filter(p => p.id !== popupId));
    }, 2000);
  };

  const triggerActionPress = () => {
    setIsActionPressed(true);
    setTimeout(() => setIsActionPressed(false), 200);
  };

  const handleJoinNewRoom = (newRoomId: string) => {
    setRoomId(newRoomId);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join-room', { roomId: newRoomId, playerName });
    }
  };

  const handleSendChat = (text: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('chat-msg', text);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Interactive 3D WebGL Scene */}
      <ThreeCanvas
        cameraMode={cameraMode}
        currentTool={currentTool}
        joystickVector={joystickVector}
        isActionPressed={isActionPressed}
        trees={trees}
        remotePlayers={remotePlayers}
        botPlayers={botPlayers}
        playerPosRef={playerPosRef}
        onHarvest={handleHarvestTree}
        selectedTreeId={selectedTreeId}
        setSelectedTreeId={setSelectedTreeId}
        weather={weather}
        controlSettings={controlSettings}
        activeEvents={activeEvents}
        onCollectEvent={handleCollectEvent}
        activeBiome={activeBiome}
        characterId={selectedCharacterId}
        bossRaid={bossRaid}
        onHitBoss={handleHitBoss}
        cameraRotateStep={cameraRotateStep}
        cameraRotateCmd={cameraRotateCmd}
      />

      {/* 2. Mobile Touch HUD & Control Settings */}
      <MobileHUD
        cameraMode={cameraMode}
        setCameraMode={setCameraMode}
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        onJoystickMove={setJoystickVector}
        onActionPress={triggerActionPress}
        selectedTreeId={selectedTreeId}
        inventory={inventory}
        score={myScore}
        isConnected={isConnected}
        onOpenUpgrades={() => setIsUpgradesOpen(true)}
        onOpenLandManager={() => setIsLandOpen(true)}
        onOpenStoryQuest={() => setIsStoryQuestOpen(true)}
        onOpenCharacterRoster={() => setIsCharacterRosterOpen(true)}
        onOpenBiomeTravel={() => setIsBiomeTravelOpen(true)}
        onOpenBotDuel={() => setIsBotDuelOpen(true)}
        onSellAtFactory={handleSellAtFactory}
        playerPos={playerPosState}
        trees={trees}
        remotePlayers={remotePlayers}
        harvestPopups={harvestPopups}
        weather={weather}
        controlSettings={controlSettings}
        setControlSettings={setControlSettings}
        activeBiome={activeBiome}
        characterAvatarEmoji={activeCharacter.avatarEmoji}
        bossRaid={bossRaid}
        onTriggerBossRaid={() => setIsBossRaidModalOpen(true)}
        onHitBoss={handleHitBoss}
        onWaterIrrigate={handleWaterIrrigate}
        onOpenPuzzle={handleOpenPuzzleModal}
        onTriggerJumpscareTest={triggerJumpscareEncounter}
        onRotateCamera={handleRotateCamera}
        onRotateCameraCmd={handleRotateCameraCmd}
      />

      {/* 3. Jumpscare Sudden Encounter Modal */}
      <JumpscareModal
        jumpscare={jumpscare}
        onDodge={handleDodgeJumpscare}
        onFail={() => setJumpscare(prev => ({ ...prev, active: false }))}
      />

      {/* 4. Psychological Mind Puzzle Modal */}
      <PsychologicalPuzzleModal
        isOpen={isPuzzleOpen}
        onClose={() => setIsPuzzleOpen(false)}
        puzzle={activePuzzle}
        onSolve={handleSolvePuzzle}
      />

      {/* 5. Story Chapter & Mission Modal */}
      <StoryQuestModal
        isOpen={isStoryQuestOpen}
        onClose={() => setIsStoryQuestOpen(false)}
        currentStoryChapter={currentStoryChapter}
        onClaimChapterReward={handleClaimChapterReward}
        quests={quests}
        inventory={inventory}
      />

      {/* 4. Character Roster & Avatar Modal */}
      <CharacterRosterModal
        isOpen={isCharacterRosterOpen}
        onClose={() => setIsCharacterRosterOpen(false)}
        characters={characters}
        selectedCharacterId={selectedCharacterId}
        onSelectCharacter={setSelectedCharacterId}
        onUnlockCharacter={handleUnlockCharacter}
        inventory={inventory}
      />

      {/* 5. Biome Travel & Map Unlock Modal */}
      <BiomeTravelModal
        isOpen={isBiomeTravelOpen}
        onClose={() => setIsBiomeTravelOpen(false)}
        biomes={biomes}
        activeBiomeId={activeBiomeId}
        onTravelToBiome={handleTravelToBiome}
        onUnlockBiome={handleUnlockBiome}
        inventory={inventory}
        onTeleportPlayer={(x, z) => {
          setPlayerPosState(prev => ({ ...prev, x, z }));
        }}
      />

      {/* 6. Offline AI Bot Harvest Duel Modal */}
      <BotDuelModal
        isOpen={isBotDuelOpen}
        onClose={() => setIsBotDuelOpen(false)}
        isDuelActive={isDuelActive}
        duelTimeLeft={duelTimeLeft}
        playerScore={myScore}
        botPlayers={botPlayers}
        onStartDuel={handleStartDuel}
        onStopDuel={handleStopDuel}
        inventory={inventory}
      />

      {/* 7. Land Plantation Management Modal */}
      <LandManagement
        isOpen={isLandOpen}
        onClose={() => setIsLandOpen(false)}
        plots={plots}
        inventory={inventory}
        setInventory={setInventory}
        setPlots={setPlots}
      />

      {/* 8. Equipment & Mechanical Garage Upgrade Modal */}
      <EquipmentUpgrades
        isOpen={isUpgradesOpen}
        onClose={() => setIsUpgradesOpen(false)}
        upgrades={upgrades}
        setUpgrades={setUpgrades}
        inventory={inventory}
        setInventory={setInventory}
      />

      {/* 9. Online Multiplayer Competition Modal */}
      <MultiplayerCompetition
        isOpen={isMultiplayerOpen}
        onClose={() => setIsMultiplayerOpen(false)}
        roomId={roomId}
        onJoinRoom={handleJoinNewRoom}
        players={remotePlayers}
        myScore={myScore}
        myHarvestCount={myHarvestCount}
        timeLeft={timeLeft}
        chatMessages={chatMessages}
        onSendChat={handleSendChat}
        playerName={playerName}
        setPlayerName={setPlayerName}
      />

      {/* 10. Raid Boss Sawit Difficulty Launcher Modal */}
      <BossRaidModal
        isOpen={isBossRaidModalOpen}
        onClose={() => setIsBossRaidModalOpen(false)}
        bossRaid={bossRaid}
        onStartRaid={triggerBossRaid}
        inventory={inventory}
      />
    </div>
  );
}
