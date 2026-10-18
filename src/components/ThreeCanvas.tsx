import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CameraMode, ToolType, Tree3DData, RemotePlayer, WeatherType, ControlSettings, RandomEvent, BiomeInfo, BotPlayer, BossRaidState } from '../types';

interface ThreeCanvasProps {
  cameraMode: CameraMode;
  currentTool: ToolType;
  joystickVector: { x: number; y: number };
  isActionPressed: boolean;
  trees: Tree3DData[];
  remotePlayers: RemotePlayer[];
  botPlayers: BotPlayer[];
  playerPosRef: React.MutableRefObject<{ x: number; z: number; rotation: number }>;
  onHarvest: (treeId: number, sweetSpotBonus: number) => void;
  selectedTreeId: number | null;
  setSelectedTreeId: (id: number | null) => void;
  weather: WeatherType;
  controlSettings: ControlSettings;
  activeEvents: RandomEvent[];
  onCollectEvent?: (eventId: string) => void;
  activeBiome: BiomeInfo;
  characterId: string;
  bossRaid?: BossRaidState;
  onHitBoss?: () => void;
  cameraRotateStep?: number;
  cameraRotateCmd?: { yaw?: number; pitch?: number; reset?: boolean; id: number };
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  cameraMode,
  currentTool,
  joystickVector,
  isActionPressed,
  trees,
  remotePlayers,
  botPlayers,
  playerPosRef,
  onHarvest,
  selectedTreeId,
  setSelectedTreeId,
  weather,
  controlSettings,
  activeEvents,
  onCollectEvent,
  activeBiome,
  characterId,
  bossRaid,
  onHitBoss,
  cameraRotateStep = 0,
  cameraRotateCmd
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const actionCooldownRef = useRef<boolean>(false);

  // Live input refs to prevent stale closures in requestAnimationFrame loop
  const joystickRef = useRef(joystickVector);
  useEffect(() => {
    joystickRef.current = joystickVector;
  }, [joystickVector]);

  const actionPressedRef = useRef(isActionPressed);
  useEffect(() => {
    actionPressedRef.current = isActionPressed;
  }, [isActionPressed]);

  const onHarvestRef = useRef(onHarvest);
  useEffect(() => {
    onHarvestRef.current = onHarvest;
  }, [onHarvest]);

  const treesRef = useRef(trees);
  useEffect(() => {
    treesRef.current = trees;
  }, [trees]);

  const remotePlayersRef = useRef(remotePlayers);
  useEffect(() => {
    remotePlayersRef.current = remotePlayers;
  }, [remotePlayers]);

  const botPlayersRef = useRef(botPlayers);
  useEffect(() => {
    botPlayersRef.current = botPlayers;
  }, [botPlayers]);

  const currentToolRef = useRef(currentTool);
  useEffect(() => {
    currentToolRef.current = currentTool;
  }, [currentTool]);

  const cameraModeRef = useRef(cameraMode);
  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  const weatherRef = useRef(weather);
  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  const controlSettingsRef = useRef(controlSettings);
  useEffect(() => {
    controlSettingsRef.current = controlSettings;
  }, [controlSettings]);

  const activeEventsRef = useRef(activeEvents);
  useEffect(() => {
    activeEventsRef.current = activeEvents;
  }, [activeEvents]);

  const activeBiomeRef = useRef(activeBiome);
  useEffect(() => {
    activeBiomeRef.current = activeBiome;
  }, [activeBiome]);

  const characterIdRef = useRef(characterId);
  useEffect(() => {
    characterIdRef.current = characterId;
  }, [characterId]);

  const bossRaidRef = useRef(bossRaid);
  useEffect(() => {
    bossRaidRef.current = bossRaid;
  }, [bossRaid]);

  const onHitBossRef = useRef(onHitBoss);
  useEffect(() => {
    onHitBossRef.current = onHitBoss;
  }, [onHitBoss]);

  const lastSelectedTreeIdRef = useRef<number | null>(null);

  // Keyboard controls fallback
  const keysRef = useRef<Record<string, boolean>>({});
  const isActionTriggeredByKeyRef = useRef<boolean>(false);

  // Camera 360 Orbit angle states
  const cameraYawRef = useRef<number>(Math.PI);
  const cameraPitchRef = useRef<number>(0.35);
  const cameraDistanceRef = useRef<number>(10.0);
  const activePointerIdRef = useRef<number | null>(null);
  const previousPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle external camera rotation steps from UI buttons
  useEffect(() => {
    if (cameraRotateStep !== 0) {
      cameraYawRef.current += cameraRotateStep;
    }
  }, [cameraRotateStep]);

  useEffect(() => {
    if (!cameraRotateCmd) return;
    if (cameraRotateCmd.reset) {
      cameraYawRef.current = Math.PI;
      cameraPitchRef.current = 0.35;
      cameraDistanceRef.current = 10.0;
    } else {
      if (cameraRotateCmd.yaw) {
        cameraYawRef.current += cameraRotateCmd.yaw;
      }
      if (cameraRotateCmd.pitch) {
        cameraPitchRef.current = Math.max(-0.2, Math.min(1.25, cameraPitchRef.current + cameraRotateCmd.pitch));
      }
    }
  }, [cameraRotateCmd]);

  // Setup Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = true;
      if (e.code === 'Space' || key === 'enter') {
        isActionTriggeredByKeyRef.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Setup 3D Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // --- 1. Scene & Camera Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(activeBiomeRef.current.fogColor || '#38bdf8');
    scene.fog = new THREE.FogExp2(activeBiomeRef.current.fogColor || '#bae6fd', 0.008);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 250);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'default' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    containerRef.current.appendChild(renderer.domElement);

    // --- 2. Lighting ---
    const ambientLight = new THREE.AmbientLight('#fef08a', 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#fffbeb', 1.6);
    sunLight.position.set(50, 75, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 160;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    scene.add(sunLight);

    // Headlight for night shift
    const headlight = new THREE.SpotLight('#fef08a', 0, 35, Math.PI / 5, 0.4, 1);
    headlight.castShadow = true;
    scene.add(headlight);
    scene.add(headlight.target);

    // Rain Particle System
    const rainCount = 500;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPositions[i] = (Math.random() - 0.5) * 160;
      rainPositions[i + 1] = Math.random() * 40;
      rainPositions[i + 2] = (Math.random() - 0.5) * 160;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({ color: '#cbd5e1', size: 0.25, transparent: true, opacity: 0.6 });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    rainPoints.visible = false;
    scene.add(rainPoints);

    // --- 3. Ground & Terrain ---
    const terrainGeo = new THREE.PlaneGeometry(180, 180, 32, 32);
    terrainGeo.rotateX(-Math.PI / 2);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: activeBiomeRef.current.groundColor || '#3f6212',
      roughness: 0.85,
      metalness: 0.1
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.receiveShadow = true;
    scene.add(terrain);

    const grid = new THREE.GridHelper(180, 45, '#15803d', '#166534');
    grid.position.y = 0.01;
    scene.add(grid);

    const roadGeo = new THREE.PlaneGeometry(16, 180);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({ color: '#854d0e', roughness: 0.9 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(0, 0.02, 0);
    road.receiveShadow = true;
    scene.add(road);

    // --- 4. Factory Building ---
    const factoryGroup = new THREE.Group();
    factoryGroup.position.set(0, 0, -75);

    const siloGeo = new THREE.CylinderGeometry(5.5, 5.5, 15, 16);
    const siloMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.6 });
    const silo = new THREE.Mesh(siloGeo, siloMat);
    silo.position.y = 7.5;
    silo.castShadow = true;
    factoryGroup.add(silo);

    const roofGeo = new THREE.BoxGeometry(22, 9, 26);
    const roofMat = new THREE.MeshStandardMaterial({ color: '#b91c1c' });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(-16, 4.5, 0);
    roof.castShadow = true;
    factoryGroup.add(roof);

    scene.add(factoryGroup);

    // --- 5. Palm Trees 3D Mesh Generator ---
    const treeGroupMap = new Map<number, { group: THREE.Group; fruitCluster: THREE.Mesh }>();

    const createPalmTree = (treeData: Tree3DData) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(treeData.x, 0, treeData.z);

      const trunkGeo = new THREE.CylinderGeometry(0.45, 0.6, 7.0, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 3.5;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      for (let i = 1; i <= 7; i++) {
        const ringGeo = new THREE.TorusGeometry(0.5, 0.06, 6, 12);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshStandardMaterial({ color: '#451a03' });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = i * 0.95;
        treeGroup.add(ring);
      }

      const leafCount = 16;
      for (let i = 0; i < leafCount; i++) {
        const angle = (i / leafCount) * Math.PI * 2;
        const leafGroup = new THREE.Group();
        leafGroup.position.set(0, 6.8, 0);
        leafGroup.rotation.y = angle;

        const leafGeo = new THREE.ConeGeometry(0.8, 5.0, 4);
        leafGeo.rotateX(Math.PI / 2.4);
        const leafMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.5 });
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(0, -0.3, 2.2);
        leaf.castShadow = true;
        leafGroup.add(leaf);

        treeGroup.add(leafGroup);
      }

      const fruitGeo = new THREE.DodecahedronGeometry(1.0, 1);
      const fruitMat = new THREE.MeshStandardMaterial({
        color: treeData.harvested ? '#525252' : activeBiomeRef.current.id === 'pulau_legend' ? '#f59e0b' : '#ea580c',
        roughness: 0.4,
        metalness: activeBiomeRef.current.id === 'pulau_legend' ? 0.8 : 0.2
      });
      const fruitCluster = new THREE.Mesh(fruitGeo, fruitMat);
      fruitCluster.position.set(0, 6.0, 0.4);
      fruitCluster.castShadow = true;
      treeGroup.add(fruitCluster);

      scene.add(treeGroup);
      treeGroupMap.set(treeData.id, { group: treeGroup, fruitCluster });
    };

    treesRef.current.forEach(t => createPalmTree(t));

    // Target Ring
    const targetRingGeo = new THREE.RingGeometry(1.4, 1.9, 32);
    targetRingGeo.rotateX(-Math.PI / 2);
    const targetRingMat = new THREE.MeshBasicMaterial({ color: '#f59e0b', side: THREE.DoubleSide });
    const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
    targetRing.position.y = 0.05;
    targetRing.visible = false;
    scene.add(targetRing);

    // Event Crate Mesh (Golden Boost)
    const eventCrateGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const eventCrateMat = new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.8, roughness: 0.2 });
    const eventCrate = new THREE.Mesh(eventCrateGeo, eventCrateMat);
    eventCrate.position.set(0, -10, 0);
    scene.add(eventCrate);

    // --- Boss Raid Mesh (King Oryctes - Giant Palm Rhinoceros Beetle) ---
    const bossGroup = new THREE.Group();
    bossGroup.visible = false;

    // Body carapace
    const bodyGeo = new THREE.DodecahedronGeometry(2.2, 1);
    bodyGeo.scale(1.2, 0.8, 1.5);
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#261b12', roughness: 0.3, metalness: 0.7 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bossGroup.add(bodyMesh);

    // Giant Horn
    const hornGeo = new THREE.ConeGeometry(0.7, 3.2, 8);
    hornGeo.rotateX(-Math.PI / 3);
    const hornMat = new THREE.MeshStandardMaterial({ color: '#b91c1c', metalness: 0.9, roughness: 0.2 });
    const hornMesh = new THREE.Mesh(hornGeo, hornMat);
    hornMesh.position.set(0, 1.2, 2.2);
    hornMesh.castShadow = true;
    bossGroup.add(hornMesh);

    // Glowing Red Eyes
    const eyeGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: '#f87171' });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.9, 0.8, 2.0);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.9, 0.8, 2.0);
    bossGroup.add(eyeL);
    bossGroup.add(eyeR);

    // Legs
    for (let i = -1; i <= 1; i++) {
      const legGeo = new THREE.BoxGeometry(2.2, 0.3, 0.35);
      const legMat = new THREE.MeshStandardMaterial({ color: '#1c1917' });
      const legL = new THREE.Mesh(legGeo, legMat);
      legL.position.set(-1.8, -0.4, i * 1.2);
      legL.rotation.z = -0.3;
      bossGroup.add(legL);

      const legR = new THREE.Mesh(legGeo, legMat);
      legR.position.set(1.8, -0.4, i * 1.2);
      legR.rotation.z = 0.3;
      bossGroup.add(legR);
    }

    // Floating Boss HP Bar
    const hpBarBgGeo = new THREE.PlaneGeometry(4.0, 0.5);
    const hpBarBgMat = new THREE.MeshBasicMaterial({ color: '#0f172a', side: THREE.DoubleSide });
    const hpBarBg = new THREE.Mesh(hpBarBgGeo, hpBarBgMat);
    hpBarBg.position.set(0, 3.5, 0);

    const hpBarFgGeo = new THREE.PlaneGeometry(3.8, 0.35);
    const hpBarFgMat = new THREE.MeshBasicMaterial({ color: '#ef4444', side: THREE.DoubleSide });
    const hpBarFg = new THREE.Mesh(hpBarFgGeo, hpBarFgMat);
    hpBarFg.position.set(0, 3.5, 0.01);

    bossGroup.add(hpBarBg);
    bossGroup.add(hpBarFg);

    scene.add(bossGroup);

    // --- 6. Player 3D Vehicle & Character Models ---
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);

    // Egrek Human
    const humanGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.7, 8);
    const humanMat = new THREE.MeshStandardMaterial({ color: characterIdRef.current === 'lord_sawit' ? '#f59e0b' : '#0284c7' });
    const humanMesh = new THREE.Mesh(humanGeo, humanMat);
    humanMesh.position.y = 0.85;
    humanMesh.castShadow = true;

    const headGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: characterIdRef.current === 'lord_sawit' ? '#fef08a' : '#fde047' });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 1.9;
    headMesh.castShadow = true;

    const poleGeo = new THREE.CylinderGeometry(0.045, 0.045, 5.2, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.85 });
    const poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.rotation.x = Math.PI / 4;
    poleMesh.position.set(0.3, 2.3, 1.2);

    const bladeGeo = new THREE.TorusGeometry(0.5, 0.06, 8, 12, Math.PI);
    const bladeMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.9, roughness: 0.2 });
    const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
    bladeMesh.position.set(0, 2.6, 0);
    bladeMesh.rotation.y = Math.PI / 2;
    poleMesh.add(bladeMesh);

    const egrekGroup = new THREE.Group();
    egrekGroup.add(humanMesh, headMesh, poleMesh);

    // Tractor Grabber
    const tractorGroup = new THREE.Group();

    const tractorBodyGeo = new THREE.BoxGeometry(2.4, 1.5, 3.4);
    const tractorBodyMat = new THREE.MeshStandardMaterial({ color: '#eab308' });
    const tractorBody = new THREE.Mesh(tractorBodyGeo, tractorBodyMat);
    tractorBody.position.y = 1.0;
    tractorBody.castShadow = true;
    tractorGroup.add(tractorBody);

    const wheelGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#1e293b' });
    const wheelFL = new THREE.Mesh(wheelGeo, wheelMat);
    wheelFL.position.set(-1.3, 0.7, 1.2);
    const wheelFR = new THREE.Mesh(wheelGeo, wheelMat);
    wheelFR.position.set(1.3, 0.7, 1.2);
    const wheelBL = new THREE.Mesh(wheelGeo, wheelMat);
    wheelBL.position.set(-1.3, 0.7, -1.2);
    const wheelBR = new THREE.Mesh(wheelGeo, wheelMat);
    wheelBR.position.set(1.3, 0.7, -1.2);
    tractorGroup.add(wheelFL, wheelFR, wheelBL, wheelBR);

    const armGeo = new THREE.BoxGeometry(0.4, 0.4, 3.0);
    const armMat = new THREE.MeshStandardMaterial({ color: '#334155' });
    const armMesh = new THREE.Mesh(armGeo, armMat);
    armMesh.position.set(0, 2.0, 1.7);
    armMesh.rotation.x = -Math.PI / 8;
    tractorGroup.add(armMesh);

    const clawGeo = new THREE.TorusGeometry(0.6, 0.09, 8, 8, Math.PI);
    const clawMat = new THREE.MeshStandardMaterial({ color: '#dc2626' });
    const clawMesh = new THREE.Mesh(clawGeo, clawMat);
    clawMesh.position.set(0, -0.2, 1.4);
    clawMesh.rotation.x = Math.PI / 2;
    armMesh.add(clawMesh);

    playerGroup.add(egrekGroup, tractorGroup);

    // --- 7. Remote & Bot Players Mesh Map ---
    const remoteMeshes = new Map<string, THREE.Group>();

    // --- 8. Robust Multi-Touch & Mouse 360 Camera Drag System ---
    const domContainer = containerRef.current;
    let cameraTouchId: number | null = null;
    let lastTouchPos = { x: 0, y: 0 };
    let isMouseDown = false;
    let lastMousePos = { x: 0, y: 0 };

    const onTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        const elem = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
        if (elem && (elem.closest('button') || elem.closest('input') || elem.closest('.touch-none') || elem.closest('[data-no-cam-drag]'))) {
          continue;
        }
        if (cameraTouchId === null) {
          cameraTouchId = t.identifier;
          lastTouchPos = { x: t.clientX, y: t.clientY };
          break;
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (cameraTouchId === null) return;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        if (t.identifier === cameraTouchId) {
          let deltaX = t.clientX - lastTouchPos.x;
          let deltaY = t.clientY - lastTouchPos.y;
          lastTouchPos = { x: t.clientX, y: t.clientY };

          if (!Number.isFinite(deltaX) || Number.isNaN(deltaX)) deltaX = 0;
          if (!Number.isFinite(deltaY) || Number.isNaN(deltaY)) deltaY = 0;

          const sens = 0.007 * (controlSettingsRef.current.cameraSensitivity || 1.0);

          if (controlSettingsRef.current.invertCameraYaw) deltaX = -deltaX;
          if (controlSettingsRef.current.invertCameraPitch) deltaY = -deltaY;

          cameraYawRef.current -= deltaX * sens;
          cameraPitchRef.current -= deltaY * sens;

          if (!Number.isFinite(cameraYawRef.current) || Number.isNaN(cameraYawRef.current)) cameraYawRef.current = Math.PI;
          if (!Number.isFinite(cameraPitchRef.current) || Number.isNaN(cameraPitchRef.current)) cameraPitchRef.current = 0.35;

          cameraPitchRef.current = Math.max(-0.25, Math.min(1.30, cameraPitchRef.current));
          break;
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (cameraTouchId !== null) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === cameraTouchId) {
            cameraTouchId = null;
            break;
          }
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('input') || target.closest('[data-no-cam-drag]') || target.closest('.touch-none')) return;

      isMouseDown = true;
      lastMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      let deltaX = e.clientX - lastMousePos.x;
      let deltaY = e.clientY - lastMousePos.y;
      lastMousePos = { x: e.clientX, y: e.clientY };

      if (!Number.isFinite(deltaX) || Number.isNaN(deltaX)) deltaX = 0;
      if (!Number.isFinite(deltaY) || Number.isNaN(deltaY)) deltaY = 0;

      const sens = 0.007 * (controlSettingsRef.current.cameraSensitivity || 1.0);

      if (controlSettingsRef.current.invertCameraYaw) deltaX = -deltaX;
      if (controlSettingsRef.current.invertCameraPitch) deltaY = -deltaY;

      cameraYawRef.current -= deltaX * sens;
      cameraPitchRef.current -= deltaY * sens;

      if (!Number.isFinite(cameraYawRef.current) || Number.isNaN(cameraYawRef.current)) cameraYawRef.current = Math.PI;
      if (!Number.isFinite(cameraPitchRef.current) || Number.isNaN(cameraPitchRef.current)) cameraPitchRef.current = 0.35;

      cameraPitchRef.current = Math.max(-0.25, Math.min(1.30, cameraPitchRef.current));
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      cameraDistanceRef.current += e.deltaY * 0.005;
      cameraDistanceRef.current = Math.max(3.5, Math.min(20.0, cameraDistanceRef.current));
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    domContainer.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    domContainer.addEventListener('wheel', onWheel, { passive: true });

    // --- 9. Main Animation Loop ---
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Terrain colors update
      (terrain.material as THREE.MeshStandardMaterial).color.set(activeBiomeRef.current.groundColor || '#3f6212');

      // A. Dynamic Weather Visual Adjustments
      const w = weatherRef.current;
      if (w === 'sunny') {
        scene.background = new THREE.Color(activeBiomeRef.current.fogColor || '#38bdf8');
        scene.fog = new THREE.FogExp2(activeBiomeRef.current.fogColor || '#bae6fd', 0.008);
        ambientLight.color.set('#fef08a');
        ambientLight.intensity = 0.9;
        sunLight.color.set('#fffbeb');
        sunLight.intensity = 1.6;
        sunLight.position.set(50, 75, 40);
        headlight.intensity = 0;
        rainPoints.visible = false;
      } else if (w === 'sunset') {
        scene.background = new THREE.Color('#f97316');
        scene.fog = new THREE.FogExp2('#fdba74', 0.012);
        ambientLight.color.set('#fed7aa');
        ambientLight.intensity = 0.8;
        sunLight.color.set('#ea580c');
        sunLight.intensity = 1.8;
        sunLight.position.set(70, 20, 20);
        headlight.intensity = 0;
        rainPoints.visible = false;
      } else if (w === 'night') {
        scene.background = new THREE.Color('#090d16');
        scene.fog = new THREE.FogExp2('#0f172a', 0.018);
        ambientLight.color.set('#1e293b');
        ambientLight.intensity = 0.25;
        sunLight.color.set('#38bdf8');
        sunLight.intensity = 0.3;
        headlight.intensity = 4.0;
        rainPoints.visible = false;
      } else if (w === 'rain') {
        scene.background = new THREE.Color('#475569');
        scene.fog = new THREE.FogExp2('#64748b', 0.02);
        ambientLight.color.set('#94a3b8');
        ambientLight.intensity = 0.6;
        sunLight.color.set('#cbd5e1');
        sunLight.intensity = 0.8;
        headlight.intensity = 1.5;
        rainPoints.visible = true;

        const positions = rainPoints.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.8;
          if (positions[i] < 0) positions[i] = 40;
        }
        rainPoints.geometry.attributes.position.needsUpdate = true;
      } else if (w === 'kemarau_extreme') {
        scene.background = new THREE.Color('#c2410c');
        scene.fog = new THREE.FogExp2('#ea580c', 0.025);
        ambientLight.color.set('#fde047');
        ambientLight.intensity = 1.2;
        sunLight.color.set('#f97316');
        sunLight.intensity = 2.2;
        headlight.intensity = 0;
        rainPoints.visible = false;
      }

      // B. Input Vector Processing
      let inputY = -joystickRef.current.y;
      let inputX = joystickRef.current.x;

      if (!Number.isFinite(inputX) || Number.isNaN(inputX)) inputX = 0;
      if (!Number.isFinite(inputY) || Number.isNaN(inputY)) inputY = 0;

      if (keysRef.current['w'] || keysRef.current['arrowup']) inputY += 1.0;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) inputY -= 1.0;
      if (keysRef.current['d'] || keysRef.current['arrowright']) inputX += 1.0;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) inputX -= 1.0;

      if (controlSettingsRef.current.invertJoystickY) inputY = -inputY;
      if (controlSettingsRef.current.invertJoystickX) inputX = -inputX;

      const magnitude = Math.sqrt(inputX * inputX + inputY * inputY);
      if (magnitude > 0.08) {
        const normX = inputX / Math.max(1.0, magnitude);
        const normY = inputY / Math.max(1.0, magnitude);

        const yaw = cameraYawRef.current;
        const forwardX = Math.sin(yaw);
        const forwardZ = Math.cos(yaw);
        const rightX = Math.cos(yaw);
        const rightZ = -Math.sin(yaw);

        const dx = normY * forwardX + normX * rightX;
        const dz = normY * forwardZ + normX * rightZ;

        const speedMult = characterIdRef.current === 'kang_asep' ? 1.25 : 1.0;
        const moveSpeed = (currentToolRef.current === 'tractor' ? 0.25 : 0.20) * speedMult;

        if (Number.isFinite(dx) && Number.isFinite(dz)) {
          playerPosRef.current.x += dx * moveSpeed;
          playerPosRef.current.z += dz * moveSpeed;

          const targetRotation = Math.atan2(dx, dz);
          if (Number.isFinite(targetRotation)) {
            playerPosRef.current.rotation = targetRotation;
          }
        }
      }

      // Clamp inside plantation perimeter and sanitize NaN
      if (!Number.isFinite(playerPosRef.current.x) || Number.isNaN(playerPosRef.current.x)) playerPosRef.current.x = 0;
      if (!Number.isFinite(playerPosRef.current.z) || Number.isNaN(playerPosRef.current.z)) playerPosRef.current.z = 0;
      if (!Number.isFinite(playerPosRef.current.rotation) || Number.isNaN(playerPosRef.current.rotation)) playerPosRef.current.rotation = 0;

      playerPosRef.current.x = Math.max(-80, Math.min(80, playerPosRef.current.x));
      playerPosRef.current.z = Math.max(-80, Math.min(80, playerPosRef.current.z));

      playerGroup.position.set(playerPosRef.current.x, 0, playerPosRef.current.z);
      playerGroup.rotation.y = playerPosRef.current.rotation;

      // Night Headlight position & target update
      headlight.position.set(
        playerPosRef.current.x,
        1.8,
        playerPosRef.current.z
      );
      headlight.target.position.set(
        playerPosRef.current.x + Math.sin(playerPosRef.current.rotation) * 12,
        0.5,
        playerPosRef.current.z + Math.cos(playerPosRef.current.rotation) * 12
      );

      // Tool Visibilities
      egrekGroup.visible = currentToolRef.current === 'egrek';
      tractorGroup.visible = currentToolRef.current === 'tractor' || currentToolRef.current === 'truck';

      // C. Target Palm Tree Selection
      let closestTreeId: number | null = null;
      let minDistance = 7.0;

      treesRef.current.forEach(t => {
        if (!t.harvested) {
          const dx = t.x - playerPosRef.current.x;
          const dz = t.z - playerPosRef.current.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < minDistance) {
            minDistance = dist;
            closestTreeId = t.id;
          }
        }
      });

      if (closestTreeId !== lastSelectedTreeIdRef.current) {
        lastSelectedTreeIdRef.current = closestTreeId;
        setSelectedTreeId(closestTreeId);
      }

      if (closestTreeId !== null) {
        const targetTree = treesRef.current.find(t => t.id === closestTreeId);
        if (targetTree) {
          targetRing.position.set(targetTree.x, 0.05, targetTree.z);
          targetRing.visible = true;
        }
      } else {
        targetRing.visible = false;
      }

      // D. Action Harvest Swing
      const isActing = actionPressedRef.current || isActionTriggeredByKeyRef.current;
      if (isActionTriggeredByKeyRef.current) {
        isActionTriggeredByKeyRef.current = false;
      }

      if (isActing && !actionCooldownRef.current && closestTreeId !== null) {
        actionCooldownRef.current = true;

        poleMesh.rotation.x = Math.PI / 1.8;
        armMesh.rotation.x = Math.PI / 3.5;

        onHarvestRef.current(closestTreeId, 1.3);

        setTimeout(() => {
          poleMesh.rotation.x = Math.PI / 4;
          armMesh.rotation.x = -Math.PI / 8;
          actionCooldownRef.current = false;
        }, 320);
      }

      // E. Update & Sync Palm Trees
      const currentTreeIds = new Set(treesRef.current.map(t => t.id));
      treeGroupMap.forEach((entry, id) => {
        if (!currentTreeIds.has(id)) {
          scene.remove(entry.group);
          treeGroupMap.delete(id);
        }
      });

      treesRef.current.forEach(t => {
        if (!treeGroupMap.has(t.id)) {
          createPalmTree(t);
        }
        const entry = treeGroupMap.get(t.id);
        if (entry) {
          (entry.fruitCluster.material as THREE.MeshStandardMaterial).color.set(
            t.harvested ? '#525252' : activeBiomeRef.current.id === 'pulau_legend' ? '#f59e0b' : '#ea580c'
          );
        }
      });

      // F. Event Crate Check & Rotation
      const activeEvt = activeEventsRef.current.find(e => e.active);
      if (activeEvt && activeEvt.x !== undefined && activeEvt.z !== undefined) {
        eventCrate.position.set(activeEvt.x, 1.0 + Math.sin(Date.now() * 0.005) * 0.3, activeEvt.z);
        eventCrate.rotation.y += 0.03;

        const edx = activeEvt.x - playerPosRef.current.x;
        const edz = activeEvt.z - playerPosRef.current.z;
        if (Math.sqrt(edx * edx + edz * edz) < 4.0 && onCollectEvent) {
          onCollectEvent(activeEvt.id);
        }
      } else {
        eventCrate.position.set(0, -10, 0);
      }

      // F2. Boss Raid Update & Hit Check
      const bRaid = bossRaidRef.current;
      if (bRaid && bRaid.active) {
        bossGroup.visible = true;
        bossGroup.position.set(bRaid.x, 1.2 + Math.sin(Date.now() * 0.008) * 0.25, bRaid.z);
        bossGroup.rotation.y = Math.sin(Date.now() * 0.003) * 0.6;

        const hpPercent = Math.max(0, Math.min(1, bRaid.hp / bRaid.maxHp));
        hpBarFg.scale.x = hpPercent;
        hpBarFg.position.x = (hpPercent - 1) * 1.9;

        const bdx = bRaid.x - playerPosRef.current.x;
        const bdz = bRaid.z - playerPosRef.current.z;
        const bDist = Math.sqrt(bdx * bdx + bdz * bdz);

        if (isActing && !actionCooldownRef.current && bDist < 7.5 && onHitBossRef.current) {
          actionCooldownRef.current = true;
          onHitBossRef.current();
          setTimeout(() => {
            actionCooldownRef.current = false;
          }, 300);
        }
      } else {
        bossGroup.visible = false;
      }

      // G. Update Remote & Bot Players in 3D
      const allOtherPlayers = [
        ...remotePlayersRef.current.map(p => ({ id: p.id, name: p.name, x: p.x, z: p.z, rotation: p.rotation, color: p.color })),
        ...botPlayersRef.current.map(b => ({ id: b.id, name: b.name, x: b.x, z: b.z, rotation: b.rotation, color: b.color }))
      ];

      allOtherPlayers.forEach(rp => {
        let rMesh = remoteMeshes.get(rp.id);
        if (!rMesh) {
          rMesh = new THREE.Group();
          
          // Body (Farmer Work Clothes)
          const npcBodyGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.5, 8);
          const npcBodyMat = new THREE.MeshStandardMaterial({ color: rp.color || '#0284c7', roughness: 0.7 });
          const npcBody = new THREE.Mesh(npcBodyGeo, npcBodyMat);
          npcBody.position.y = 0.75;
          npcBody.castShadow = true;
          rMesh.add(npcBody);

          // Head
          const npcHeadGeo = new THREE.SphereGeometry(0.35, 10, 10);
          const npcHeadMat = new THREE.MeshStandardMaterial({ color: '#fde047' });
          const npcHead = new THREE.Mesh(npcHeadGeo, npcHeadMat);
          npcHead.position.y = 1.75;
          npcHead.castShadow = true;
          rMesh.add(npcHead);

          // Caping Straw Hat
          const hatGeo = new THREE.ConeGeometry(0.85, 0.35, 12);
          const hatMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.9 });
          const hatMesh = new THREE.Mesh(hatGeo, hatMat);
          hatMesh.position.y = 2.1;
          hatMesh.castShadow = true;
          rMesh.add(hatMesh);

          // Egrek Tool in hand
          const npcPoleGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.2, 6);
          const npcPoleMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.8 });
          const npcPole = new THREE.Mesh(npcPoleGeo, npcPoleMat);
          npcPole.rotation.x = Math.PI / 4;
          npcPole.position.set(0.35, 1.4, 0.7);
          rMesh.add(npcPole);

          const npcBladeGeo = new THREE.TorusGeometry(0.4, 0.05, 6, 10, Math.PI);
          const npcBladeMat = new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.9 });
          const npcBlade = new THREE.Mesh(npcBladeGeo, npcBladeMat);
          npcBlade.position.set(0, 1.6, 0);
          npcBlade.rotation.y = Math.PI / 2;
          npcPole.add(npcBlade);

          // Aura Ring on ground
          const npcRingGeo = new THREE.RingGeometry(0.7, 1.0, 16);
          npcRingGeo.rotateX(-Math.PI / 2);
          const npcRingMat = new THREE.MeshBasicMaterial({ color: '#f59e0b', side: THREE.DoubleSide });
          const npcRing = new THREE.Mesh(npcRingGeo, npcRingMat);
          npcRing.position.y = 0.02;
          rMesh.add(npcRing);

          scene.add(rMesh);
          remoteMeshes.set(rp.id, rMesh);
        }

        rMesh.position.set(rp.x, 0, rp.z);
        rMesh.rotation.y = rp.rotation;
      });

      // H. Camera Positioning
      const px = playerPosRef.current.x;
      const pz = playerPosRef.current.z;
      const yaw = cameraYawRef.current;
      const pitch = cameraPitchRef.current;
      const dist = cameraDistanceRef.current;

      if (cameraModeRef.current === 'TPS') {
        const camX = px - Math.sin(yaw) * Math.cos(pitch) * dist;
        const camY = Math.sin(pitch) * dist + 1.8;
        const camZ = pz - Math.cos(yaw) * Math.cos(pitch) * dist;

        camera.position.set(camX, Math.max(0.8, camY), camZ);
        camera.lookAt(px, 1.6, pz);
      } else {
        const eyeHeight = currentToolRef.current === 'tractor' ? 2.2 : 1.7;
        camera.position.set(px, eyeHeight, pz);

        const lookX = px + Math.sin(yaw) * Math.cos(pitch) * 10;
        const lookY = eyeHeight + Math.sin(pitch) * 10;
        const lookZ = pz + Math.cos(yaw) * Math.cos(pitch) * 10;

        camera.lookAt(lookX, lookY, lookZ);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width || window.innerWidth;
        const h = entry.contentRect.height || window.innerHeight;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);

      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);

      domContainer.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      domContainer.removeEventListener('wheel', onWheel);

      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-slate-950 touch-none cursor-grab active:cursor-grabbing"
    />
  );
};
