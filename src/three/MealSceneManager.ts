import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type FoodGroupId =
  | 'vegetables'
  | 'grains'
  | 'proteins'
  | 'fruitsNuts'
  | 'hydration'
  | 'thaliBase';

export type CameraPresetId = 'overview' | 'topDown' | 'proteins' | 'produce' | 'hydration';

export interface FoodGroupMetadata {
  id: FoodGroupId;
  title: string;
  subtitle: string;
  portionShare: string;
  keyNutrients: string[];
  examples: string[];
  absorptionTip: string;
  targetRoute: 'nutrients' | 'vitamins' | 'foods' | 'deficiencies';
}

export const FOOD_GROUP_METADATA: Record<FoodGroupId, FoodGroupMetadata> = {
  vegetables: {
    id: 'vegetables',
    title: 'Leafy Greens & Crucifers',
    subtitle: 'Spinach, Methi, Broccoli & Carrots',
    portionShare: '35% of plate',
    keyNutrients: ['Vitamin A', 'Vitamin K', 'Folate (B9)', 'Non-Heme Iron', 'Dietary Fiber'],
    examples: ['Palak (Spinach)', 'Methi Leaves', 'Steamed Broccoli', 'Red Carrots'],
    absorptionTip:
      'Pair dark leafy greens with a squeeze of fresh lemon (Vitamin C) to boost plant iron absorption.',
    targetRoute: 'vitamins',
  },
  grains: {
    id: 'grains',
    title: 'Whole Grains & Millets',
    subtitle: 'Whole-Wheat Chapati & Foxtail/Ragi Millets',
    portionShare: '25% of plate',
    keyNutrients: ['Complex Carbohydrates', 'B-Complex', 'Magnesium', 'Insoluble Fiber'],
    examples: ['Phulka Chapati', 'Ragi (Finger Millet)', 'Jowar', 'Brown Basmati Rice'],
    absorptionTip:
      'Unrefined bran and millets release glucose gradually, preventing energy spikes and feeding gut microbiota.',
    targetRoute: 'nutrients',
  },
  proteins: {
    id: 'proteins',
    title: 'Dal, Paneer & Lemon Pairing',
    subtitle: 'Yellow Moong Dal, Cottage Cheese & Citrus',
    portionShare: '25% of plate',
    keyNutrients: ['Complete Amino Acids', 'Calcium', 'Zinc', 'Vitamin B12', 'Vitamin C'],
    examples: ['Yellow Moong Dal', 'Fresh Paneer', 'Kala Chana', 'Lemon Wedge'],
    absorptionTip:
      'Combining lentils with whole grains creates a complete essential amino acid profile for muscle and enzyme repair.',
    targetRoute: 'deficiencies',
  },
  fruitsNuts: {
    id: 'fruitsNuts',
    title: 'Fresh Fruits & Soaked Nuts',
    subtitle: 'Pomegranate, Amla, Almonds & Walnuts',
    portionShare: '15% + Healthy Fats',
    keyNutrients: ['Vitamin C', 'Vitamin E', 'Omega-3 ALA', 'Polyphenols', 'Potassium'],
    examples: ['Pomegranate Arils', 'Indian Gooseberry (Amla)', 'Soaked Almonds', 'Walnuts'],
    absorptionTip:
      'Healthy fats in almonds and walnuts unlock fat-soluble Vitamins A, D, E, and K from your meal.',
    targetRoute: 'foods',
  },
  hydration: {
    id: 'hydration',
    title: 'Pure Water & Mint Infusion',
    subtitle: 'Cellular Transport & Thermoregulation',
    portionShare: '2.5–3 L daily',
    keyNutrients: ['Water (H2O)', 'Trace Electrolytes', 'Phytonutrients'],
    examples: ['Filtered Water', 'Mint-Infused Water', 'Spiced Chaas (Buttermilk)'],
    absorptionTip:
      'Water dissolves water-soluble B-complex and Vitamin C nutrients so they travel smoothly through the bloodstream.',
    targetRoute: 'nutrients',
  },
  thaliBase: {
    id: 'thaliBase',
    title: 'Balanced Thali Proportions',
    subtitle: 'Visual Guide to Daily Nutrient Diversity',
    portionShare: '100% Harmony',
    keyNutrients: ['Macronutrient Balance', 'Micronutrient Synergy', 'Portion Awareness'],
    examples: ['Half Plate Produce', 'Quarter Plate Protein', 'Quarter Plate Whole Grains'],
    absorptionTip:
      'Click any food group on the 3D thali or drag the Exploded View slider to inspect every nutrient layer.',
    targetRoute: 'foods',
  },
};

interface InteractiveGroupEntry {
  id: FoodGroupId;
  group: THREE.Group;
  basePosition: THREE.Vector3;
  explodeOffset: THREE.Vector3;
  emissiveMaterials: THREE.MeshStandardMaterial[];
}

const CAMERA_PRESETS: Record<
  CameraPresetId,
  { position: THREE.Vector3; target: THREE.Vector3 }
> = {
  overview: {
    position: new THREE.Vector3(3.4, 3.1, 4.3),
    target: new THREE.Vector3(0, 0.35, 0),
  },
  topDown: {
    position: new THREE.Vector3(0.05, 5.2, 0.65),
    target: new THREE.Vector3(0, 0.25, 0),
  },
  proteins: {
    position: new THREE.Vector3(2.2, 2.1, 2.35),
    target: new THREE.Vector3(0.45, 0.35, 0.55),
  },
  produce: {
    position: new THREE.Vector3(-2.45, 2.25, 2.3),
    target: new THREE.Vector3(-0.55, 0.38, 0.1),
  },
  hydration: {
    position: new THREE.Vector3(3.2, 1.95, -1.6),
    target: new THREE.Vector3(1.55, 0.55, -0.85),
  },
};

function detectSoftwareWebGL(canvas: HTMLCanvasElement): boolean {
  try {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return false;
    const rendererStr = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
    return /SwiftShader|llvmpipe|Software Rasterizer|Apple Paravirtual/i.test(rendererStr);
  } catch {
    return false;
  }
}

function createWoodTableTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#EFE9DC';
  ctx.fillRect(0, 0, 512, 512);

  for (let y = 0; y < 512; y += 2) {
    const wave = Math.sin(y * 0.045) * 6;
    ctx.strokeStyle = y % 6 === 0 ? 'rgba(182, 165, 134, 0.28)' : 'rgba(204, 192, 166, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y + wave, 340, y - wave, 512, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createCeramicTexture(
  baseHex: string,
  speckHex: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = speckHex;
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < 420; i++) {
    const x = rand() * 256;
    const y = rand() * 256;
    const r = 0.6 + rand() * 1.3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createChapatiTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 130);
  grad.addColorStop(0, '#E9C68D');
  grad.addColorStop(0.75, '#D7A967');
  grad.addColorStop(1, '#BC8947');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  let seed = 109;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < 65; i++) {
    const x = 24 + rand() * 208;
    const y = 24 + rand() * 208;
    const rx = 3 + rand() * 10;
    const ry = 2 + rand() * 7;
    ctx.fillStyle = rand() > 0.4 ? 'rgba(116, 70, 25, 0.34)' : 'rgba(92, 52, 16, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
  grad.addColorStop(0, 'rgba(20, 36, 25, 0.45)');
  grad.addColorStop(0.55, 'rgba(20, 36, 25, 0.18)');
  grad.addColorStop(1, 'rgba(20, 36, 25, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function tagGroupForRaycast(group: THREE.Group, groupId: FoodGroupId): void {
  group.traverse((obj) => {
    obj.layers.enable(1);
    obj.userData.foodGroupId = groupId;
  });
}

export class MealSceneManager {
  private readonly container: HTMLElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly pmremGenerator: THREE.PMREMGenerator;
  private readonly envRT: THREE.WebGLRenderTarget;
  private readonly isSoftwareGl: boolean;
  private readonly interactiveEntries: InteractiveGroupEntry[] = [];
  private readonly disposableGeometries: THREE.BufferGeometry[] = [];
  private readonly disposableMaterials: THREE.Material[] = [];
  private readonly disposableTextures: THREE.Texture[] = [];

  // Pre-allocated scratch helpers (Zero GC in render loop)
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointerNdc = new THREE.Vector2();
  private readonly clock = new THREE.Clock();
  private readonly targetCamPos = new THREE.Vector3().copy(CAMERA_PRESETS.overview.position);
  private readonly targetLookAt = new THREE.Vector3().copy(CAMERA_PRESETS.overview.target);

  private selectedGroup: FoodGroupId | null = 'thaliBase';
  private explodeFactor = 0;
  private currentExplodeFactor = 0;
  private autoOrbit = true;
  private transitioningPreset = false;
  private isDisposed = false;
  private contextLost = false;
  private renderScheduled = false;
  private rafId = 0;
  private timerId = 0;
  private pointerDownPos = { x: 0, y: 0 };

  private onSelectGroup?: (groupId: FoodGroupId) => void;
  private onContextStatusChange?: (lost: boolean) => void;

  constructor(
    container: HTMLElement,
    callbacks: {
      onSelectGroup?: (groupId: FoodGroupId) => void;
      onContextStatusChange?: (lost: boolean) => void;
    } = {}
  ) {
    this.container = container;
    this.onSelectGroup = callbacks.onSelectGroup;
    this.onContextStatusChange = callbacks.onContextStatusChange;

    const tempCanvas = document.createElement('canvas');
    this.isSoftwareGl = detectSoftwareWebGL(tempCanvas);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: this.isSoftwareGl ? 'low-power' : 'high-performance',
    });
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, this.isSoftwareGl ? 1.5 : 2)
    );
    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';

    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf6f8f3);
    this.scene.fog = new THREE.FogExp2(0xf6f8f3, 0.032);

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 45);
    this.camera.position.copy(CAMERA_PRESETS.overview.position);

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.envRT = this.pmremGenerator.fromScene(roomEnv, 0.04);
    roomEnv.dispose();
    this.scene.environment = this.envRT.texture;
    this.scene.environmentIntensity = 0.65;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(CAMERA_PRESETS.overview.target);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 9.2;
    this.controls.maxPolarAngle = Math.PI * 0.46;
    this.controls.minPolarAngle = 0.15;
    this.controls.autoRotate = this.autoOrbit;
    this.controls.autoRotateSpeed = 0.55;

    this.raycaster.layers.set(1);

    this.setupLighting();
    this.buildNutritionScene();

    this.controls.addEventListener('start', this.handleOrbitStart);
    this.controls.addEventListener('change', this.requestRender);
    window.addEventListener('resize', this.handleResize);
    this.renderer.domElement.addEventListener('pointerdown', this.handlePointerDown);
    this.renderer.domElement.addEventListener('pointerup', this.handlePointerUp);
    this.renderer.domElement.addEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.handleContextRestored);

    this.updateSelectionHighlight();
    this.requestRender();
  }

  private trackGeo<T extends THREE.BufferGeometry>(geo: T): T {
    this.disposableGeometries.push(geo);
    return geo;
  }

  private trackMat<T extends THREE.Material>(mat: T): T {
    this.disposableMaterials.push(mat);
    return mat;
  }

  private trackTex<T extends THREE.Texture>(tex: T): T {
    this.disposableTextures.push(tex);
    return tex;
  }

  private setupLighting(): void {
    const hemi = new THREE.HemisphereLight(0xfffdf5, 0xd6e4d8, 0.6);
    this.scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff3de, 2.0);
    keyLight.position.set(5.5, 8.5, 4.5);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.camera.left = -4.2;
    keyLight.shadow.camera.right = 4.2;
    keyLight.shadow.camera.top = 4.2;
    keyLight.shadow.camera.bottom = -4.2;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.bias = -0.0004;
    const shadowSize = this.isSoftwareGl ? 512 : 1024;
    keyLight.shadow.mapSize.set(shadowSize, shadowSize);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xdcfce7, 0.72);
    rimLight.position.set(-5.0, 3.8, -4.5);
    this.scene.add(rimLight);
  }

  private buildNutritionScene(): void {
    const maxAniso = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 4);
    const woodTex = this.trackTex(createWoodTableTexture(maxAniso));
    const ceramicCreamTex = this.trackTex(createCeramicTexture('#FAF8F2', '#DCD5C6', maxAniso));
    const ceramicSageTex = this.trackTex(createCeramicTexture('#E6F2E8', '#C6DEC9', maxAniso));
    const chapatiTex = this.trackTex(createChapatiTexture(maxAniso));
    const shadowTex = this.trackTex(createContactShadowTexture());

    const shadowMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      })
    );

    const addContactShadow = (parent: THREE.Group, radius: number, yOffset = 0.004) => {
      const geo = this.trackGeo(new THREE.CircleGeometry(radius, 32));
      const mesh = new THREE.Mesh(geo, shadowMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = yOffset;
      parent.add(mesh);
    };

    // 0. Dining Tabletop & Runner Mat (grounded at y = 0)
    const tableGroup = new THREE.Group();
    const tableGeo = this.trackGeo(new THREE.CylinderGeometry(5.6, 5.7, 0.24, 64));
    const tableMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: woodTex,
        roughness: 0.72,
        metalness: 0.04,
      })
    );
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = -0.12;
    tableMesh.receiveShadow = !this.isSoftwareGl;
    tableGroup.add(tableMesh);

    const matGeo = this.trackGeo(new THREE.CylinderGeometry(2.35, 2.38, 0.02, 56));
    const matMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xe7efe6,
        roughness: 0.92,
        metalness: 0.0,
      })
    );
    const placeMat = new THREE.Mesh(matGeo, matMat);
    placeMat.position.y = 0.01;
    placeMat.receiveShadow = !this.isSoftwareGl;
    tableGroup.add(placeMat);
    this.scene.add(tableGroup);

    // 1. Thali Platter Base Group
    const thaliGroup = new THREE.Group();
    thaliGroup.position.set(0, 0.02, 0);

    const thaliProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(1.48, 0.0),
      new THREE.Vector2(1.62, 0.06),
      new THREE.Vector2(1.74, 0.14),
      new THREE.Vector2(1.78, 0.17),
      new THREE.Vector2(1.73, 0.185),
      new THREE.Vector2(1.56, 0.08),
      new THREE.Vector2(1.42, 0.03),
      new THREE.Vector2(0.0, 0.03),
    ];
    const thaliGeo = this.trackGeo(new THREE.LatheGeometry(thaliProfile, 64));
    const steelMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd9e0dc,
        roughness: 0.28,
        metalness: 0.85,
      })
    );
    const thaliMesh = new THREE.Mesh(thaliGeo, steelMat);
    thaliMesh.castShadow = !this.isSoftwareGl;
    thaliMesh.receiveShadow = !this.isSoftwareGl;
    thaliGroup.add(thaliMesh);

    // Inner brass accent ring
    const ringGeo = this.trackGeo(new THREE.TorusGeometry(1.44, 0.014, 12, 64));
    const brassMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd4a946,
        roughness: 0.34,
        metalness: 0.78,
      })
    );
    const brassRing = new THREE.Mesh(ringGeo, brassMat);
    brassRing.rotation.x = Math.PI / 2;
    brassRing.position.y = 0.04;
    thaliGroup.add(brassRing);

    addContactShadow(thaliGroup, 1.88, 0.002);
    tagGroupForRaycast(thaliGroup, 'thaliBase');
    this.scene.add(thaliGroup);
    this.interactiveEntries.push({
      id: 'thaliBase',
      group: thaliGroup,
      basePosition: thaliGroup.position.clone(),
      explodeOffset: new THREE.Vector3(0, -0.05, 0),
      emissiveMaterials: [steelMat, brassMat],
    });

    // Helper for small katori / ceramic bowls
    const buildKatori = (
      radius: number,
      height: number,
      mat: THREE.Material
    ): THREE.Mesh => {
      const pts = [
        new THREE.Vector2(0.0, 0.0),
        new THREE.Vector2(radius * 0.65, 0.0),
        new THREE.Vector2(radius * 0.92, height * 0.45),
        new THREE.Vector2(radius, height),
        new THREE.Vector2(radius * 0.93, height),
        new THREE.Vector2(radius * 0.84, height * 0.45),
        new THREE.Vector2(radius * 0.58, 0.04),
        new THREE.Vector2(0.0, 0.04),
      ];
      const geo = this.trackGeo(new THREE.LatheGeometry(pts, 40));
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = !this.isSoftwareGl;
      mesh.receiveShadow = !this.isSoftwareGl;
      return mesh;
    };

    // 2. Leafy Greens & Broccoli Cluster Group (left side of thali)
    const vegGroup = new THREE.Group();
    vegGroup.position.set(-0.66, 0.055, 0.04);

    const vegBowlMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: ceramicSageTex,
        roughness: 0.35,
        metalness: 0.05,
      })
    );
    const vegBowl = buildKatori(0.56, 0.22, vegBowlMat);
    vegGroup.add(vegBowl);

    // Extruded leafy greens (spinach & methi)
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.bezierCurveTo(0.12, 0.06, 0.16, 0.22, 0.0, 0.34);
    leafShape.bezierCurveTo(-0.16, 0.22, -0.12, 0.06, 0, 0);
    const leafGeo = this.trackGeo(
      new THREE.ExtrudeGeometry(leafShape, {
        depth: 0.012,
        bevelEnabled: true,
        bevelThickness: 0.004,
        bevelSize: 0.004,
        bevelSegments: 2,
      })
    );
    const spinachMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x15803d,
        roughness: 0.58,
        metalness: 0.02,
      })
    );
    const lightLeafMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        roughness: 0.52,
        metalness: 0.02,
      })
    );
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(leafGeo, i % 2 === 0 ? spinachMat : lightLeafMat);
      const angle = (i / 6) * Math.PI * 2;
      leaf.position.set(Math.cos(angle) * 0.12, 0.13 + (i % 2) * 0.03, Math.sin(angle) * 0.12);
      leaf.rotation.set(-1.15 + (i % 3) * 0.14, angle, 0.2);
      leaf.castShadow = !this.isSoftwareGl;
      vegGroup.add(leaf);
    }

    // 3 Composite Broccoli Florets (stem + clustered canopy spheres)
    const stemMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.65 })
    );
    const floretMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 })
    );
    const stemGeo = this.trackGeo(new THREE.CylinderGeometry(0.03, 0.042, 0.16, 12));
    const puffGeo = this.trackGeo(new THREE.SphereGeometry(0.075, 14, 12));

    const floretPositions = [
      new THREE.Vector3(-0.16, 0.16, 0.08),
      new THREE.Vector3(0.14, 0.18, -0.08),
      new THREE.Vector3(0.0, 0.21, 0.14),
    ];
    floretPositions.forEach((pos, idx) => {
      const floretCluster = new THREE.Group();
      floretCluster.position.copy(pos);
      floretCluster.rotation.set(0.15 * (idx - 1), idx * 1.1, 0.1);
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.05;
      floretCluster.add(stem);

      for (let p = 0; p < 4; p++) {
        const puff = new THREE.Mesh(puffGeo, floretMat);
        const a = (p / 4) * Math.PI * 2;
        puff.position.set(Math.cos(a) * 0.055, 0.14 + (p === 0 ? 0.04 : 0), Math.sin(a) * 0.055);
        puff.castShadow = !this.isSoftwareGl;
        floretCluster.add(puff);
      }
      vegGroup.add(floretCluster);
    });

    // Carrot coins (Vitamin A)
    const carrotGeo = this.trackGeo(new THREE.CylinderGeometry(0.085, 0.085, 0.024, 18));
    const carrotMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.45 })
    );
    [
      [-0.22, 0.17, -0.15],
      [0.2, 0.16, 0.15],
      [0.05, 0.19, -0.22],
    ].forEach(([cx, cy, cz], i) => {
      const coin = new THREE.Mesh(carrotGeo, carrotMat);
      coin.position.set(cx, cy, cz);
      coin.rotation.set(0.2 * i, 0.5, 0.18);
      vegGroup.add(coin);
    });

    addContactShadow(vegGroup, 0.62, 0.002);
    tagGroupForRaycast(vegGroup, 'vegetables');
    this.scene.add(vegGroup);
    this.interactiveEntries.push({
      id: 'vegetables',
      group: vegGroup,
      basePosition: vegGroup.position.clone(),
      explodeOffset: new THREE.Vector3(-0.45, 0.55, 0.05),
      emissiveMaterials: [vegBowlMat, spinachMat, floretMat, carrotMat],
    });

    // 3. Whole Grains, Millets (InstancedMesh) & Stacked Chapati Group
    const grainsGroup = new THREE.Group();
    grainsGroup.position.set(0.06, 0.055, -0.78);

    const chapatiMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: chapatiTex,
        roughness: 0.85,
        metalness: 0.0,
      })
    );
    const chapatiGeo = this.trackGeo(new THREE.CylinderGeometry(0.46, 0.46, 0.022, 36));
    for (let i = 0; i < 3; i++) {
      const chapati = new THREE.Mesh(chapatiGeo, chapatiMat);
      chapati.position.set(-0.22 + i * 0.03, 0.02 + i * 0.024, 0.04 - i * 0.02);
      chapati.rotation.y = i * 0.5;
      chapati.rotation.z = (i - 1) * 0.02;
      chapati.castShadow = !this.isSoftwareGl;
      chapati.receiveShadow = !this.isSoftwareGl;
      grainsGroup.add(chapati);
    }

    // Millet / Brown Basmati Katori with InstancedMesh grains (84 grains)
    const milletBowlMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: ceramicCreamTex,
        roughness: 0.34,
        metalness: 0.04,
      })
    );
    const milletBowl = buildKatori(0.44, 0.21, milletBowlMat);
    milletBowl.position.set(0.42, 0, 0.06);
    grainsGroup.add(milletBowl);

    const milletBaseGeo = this.trackGeo(new THREE.SphereGeometry(0.36, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.5));
    const milletBaseMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0xe6d3a7, roughness: 0.88 })
    );
    const milletMound = new THREE.Mesh(milletBaseGeo, milletBaseMat);
    milletMound.scale.set(1, 0.34, 1);
    milletMound.position.set(0.42, 0.14, 0.06);
    grainsGroup.add(milletMound);

    const grainCount = 84;
    const singleGrainGeo = this.trackGeo(new THREE.SphereGeometry(0.026, 8, 6));
    singleGrainGeo.scale(1.35, 0.7, 0.85);
    const grainMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd9b672,
        roughness: 0.65,
      })
    );
    const grainInstances = new THREE.InstancedMesh(singleGrainGeo, grainMat, grainCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < grainCount; i++) {
      const r = Math.sqrt((i + 0.5) / grainCount) * 0.31;
      const theta = i * 2.39996; // golden angle
      const moundHeight = Math.max(0, 1 - (r / 0.34) * (r / 0.34)) * 0.11;
      dummy.position.set(
        0.42 + Math.cos(theta) * r,
        0.16 + moundHeight,
        0.06 + Math.sin(theta) * r
      );
      dummy.rotation.set((i % 5) * 0.3, theta, (i % 3) * 0.2);
      dummy.updateMatrix();
      grainInstances.setMatrixAt(i, dummy.matrix);
    }
    grainInstances.instanceMatrix.needsUpdate = true;
    grainInstances.computeBoundingSphere();
    grainsGroup.add(grainInstances);

    addContactShadow(grainsGroup, 0.78, 0.002);
    tagGroupForRaycast(grainsGroup, 'grains');
    this.scene.add(grainsGroup);
    this.interactiveEntries.push({
      id: 'grains',
      group: grainsGroup,
      basePosition: grainsGroup.position.clone(),
      explodeOffset: new THREE.Vector3(0.05, 0.65, -0.45),
      emissiveMaterials: [chapatiMat, milletBowlMat, milletBaseMat, grainMat],
    });

    // 4. Yellow Moong Dal, Paneer Cubes & Lemon Wedge Group
    const proteinGroup = new THREE.Group();
    proteinGroup.position.set(0.55, 0.055, 0.54);

    const dalBowlMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xcbd5d0,
        roughness: 0.25,
        metalness: 0.86,
      })
    );
    const dalBowl = buildKatori(0.46, 0.22, dalBowlMat);
    proteinGroup.add(dalBowl);

    const dalSurfaceGeo = this.trackGeo(new THREE.CylinderGeometry(0.4, 0.36, 0.03, 32));
    const dalMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xeab308,
        roughness: 0.38,
        metalness: 0.04,
      })
    );
    const dalSurface = new THREE.Mesh(dalSurfaceGeo, dalMat);
    dalSurface.position.y = 0.165;
    proteinGroup.add(dalSurface);

    // Tadka spices floating on top
    const tadkaGeo = this.trackGeo(new THREE.SphereGeometry(0.015, 8, 6));
    const tadkaMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0x5c2b12, roughness: 0.6 })
    );
    [
      [0.06, 0.182, 0.08],
      [-0.1, 0.182, 0.04],
      [0.02, 0.182, -0.11],
      [0.14, 0.182, -0.05],
    ].forEach(([tx, ty, tz]) => {
      const seed = new THREE.Mesh(tadkaGeo, tadkaMat);
      seed.position.set(tx, ty, tz);
      proteinGroup.add(seed);
    });

    // Paneer cubes alongside dal
    const paneerGeo = this.trackGeo(new THREE.BoxGeometry(0.14, 0.11, 0.14));
    const paneerMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfefce8,
        roughness: 0.7,
        metalness: 0.0,
      })
    );
    [
      [-0.56, 0.07, 0.22, 0.2],
      [-0.42, 0.07, 0.36, -0.4],
      [-0.64, 0.07, 0.4, 0.7],
    ].forEach(([px, py, pz, rotY]) => {
      const cube = new THREE.Mesh(paneerGeo, paneerMat);
      cube.position.set(px, py, pz);
      cube.rotation.y = rotY;
      cube.castShadow = !this.isSoftwareGl;
      proteinGroup.add(cube);
    });

    // Fresh Lemon Wedge (Vitamin C pairing)
    const lemonShape = new THREE.Shape();
    lemonShape.absarc(0, 0, 0.16, 0, Math.PI, false);
    lemonShape.closePath();
    const lemonGeo = this.trackGeo(
      new THREE.ExtrudeGeometry(lemonShape, {
        depth: 0.09,
        bevelEnabled: true,
        bevelSize: 0.012,
        bevelThickness: 0.012,
        bevelSegments: 2,
      })
    );
    const lemonMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.42 })
    );
    const lemon = new THREE.Mesh(lemonGeo, lemonMat);
    lemon.position.set(0.48, 0.03, -0.25);
    lemon.rotation.set(-0.35, 0.8, 0);
    lemon.castShadow = !this.isSoftwareGl;
    proteinGroup.add(lemon);

    addContactShadow(proteinGroup, 0.7, 0.002);
    tagGroupForRaycast(proteinGroup, 'proteins');
    this.scene.add(proteinGroup);
    this.interactiveEntries.push({
      id: 'proteins',
      group: proteinGroup,
      basePosition: proteinGroup.position.clone(),
      explodeOffset: new THREE.Vector3(0.45, 0.52, 0.38),
      emissiveMaterials: [dalBowlMat, dalMat, paneerMat, lemonMat],
    });

    // 5. Fruits & Soaked Nuts Bowl Group (Pomegranate, Amla, Orange, Almonds)
    const fruitGroup = new THREE.Group();
    fruitGroup.position.set(0.74, 0.055, -0.18);

    const fruitBowlMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: ceramicCreamTex,
        roughness: 0.32,
        metalness: 0.05,
      })
    );
    const fruitBowl = buildKatori(0.45, 0.21, fruitBowlMat);
    fruitGroup.add(fruitBowl);

    // Pomegranate
    const pomGeo = this.trackGeo(new THREE.SphereGeometry(0.15, 20, 16));
    const pomMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.42 })
    );
    const pom = new THREE.Mesh(pomGeo, pomMat);
    pom.position.set(-0.1, 0.17, 0.04);
    pom.castShadow = !this.isSoftwareGl;
    fruitGroup.add(pom);

    // Amla / Guava (Indian Vitamin C powerhouse)
    const amlaGeo = this.trackGeo(new THREE.SphereGeometry(0.11, 18, 14));
    const amlaMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.38 })
    );
    const amla = new THREE.Mesh(amlaGeo, amlaMat);
    amla.position.set(0.14, 0.16, -0.06);
    amla.castShadow = !this.isSoftwareGl;
    fruitGroup.add(amla);

    // Orange slice
    const orangeGeo = this.trackGeo(new THREE.SphereGeometry(0.115, 18, 14));
    const orangeMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 })
    );
    const orange = new THREE.Mesh(orangeGeo, orangeMat);
    orange.position.set(0.08, 0.17, 0.14);
    orange.castShadow = !this.isSoftwareGl;
    fruitGroup.add(orange);

    // Whole Almonds (Vitamin E & Magnesium)
    const almondGeo = this.trackGeo(new THREE.SphereGeometry(0.048, 12, 10));
    almondGeo.scale(1.5, 0.72, 0.92);
    const almondMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 })
    );
    [
      [-0.14, 0.16, -0.14, 0.4],
      [-0.02, 0.19, -0.18, 1.2],
      [0.2, 0.16, 0.08, 2.1],
      [-0.22, 0.16, -0.04, 0.9],
    ].forEach(([ax, ay, az, rotY]) => {
      const almond = new THREE.Mesh(almondGeo, almondMat);
      almond.position.set(ax, ay, az);
      almond.rotation.set(0.25, rotY, 0.1);
      fruitGroup.add(almond);
    });

    addContactShadow(fruitGroup, 0.52, 0.002);
    tagGroupForRaycast(fruitGroup, 'fruitsNuts');
    this.scene.add(fruitGroup);
    this.interactiveEntries.push({
      id: 'fruitsNuts',
      group: fruitGroup,
      basePosition: fruitGroup.position.clone(),
      explodeOffset: new THREE.Vector3(0.55, 0.68, -0.15),
      emissiveMaterials: [fruitBowlMat, pomMat, amlaMat, orangeMat, almondMat],
    });

    // 6. Water Glass & Mint Sprig Group (beside thali at top-right)
    const hydroGroup = new THREE.Group();
    hydroGroup.position.set(1.92, 0.015, -1.05);

    const glassProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.24, 0.0),
      new THREE.Vector2(0.31, 0.85),
      new THREE.Vector2(0.295, 0.85),
      new THREE.Vector2(0.225, 0.05),
      new THREE.Vector2(0.0, 0.05),
    ];
    const glassGeo = this.trackGeo(new THREE.LatheGeometry(glassProfile, 40));
    const glassMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xeffaf8,
        roughness: 0.08,
        metalness: 0.0,
        transmission: this.isSoftwareGl ? 0 : 0.88,
        transparent: true,
        opacity: this.isSoftwareGl ? 0.45 : 1.0,
        ior: 1.48,
        depthWrite: false,
      })
    );
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    hydroGroup.add(glassMesh);

    // Water column inside
    const waterGeo = this.trackGeo(new THREE.CylinderGeometry(0.265, 0.21, 0.64, 32));
    const waterMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        roughness: 0.14,
        metalness: 0.05,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
      })
    );
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = 0.37;
    hydroGroup.add(waterMesh);

    // Mint stem via TubeGeometry
    const mintCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 0.15, 0),
      new THREE.Vector3(0.02, 0.48, 0.03),
      new THREE.Vector3(0.09, 0.78, -0.02),
      new THREE.Vector3(0.14, 0.96, 0.02),
    ]);
    const mintStemGeo = this.trackGeo(new THREE.TubeGeometry(mintCurve, 16, 0.012, 8, false));
    const mintMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.52 })
    );
    const mintStem = new THREE.Mesh(mintStemGeo, mintMat);
    hydroGroup.add(mintStem);

    const mintLeafGeo = this.trackGeo(new THREE.SphereGeometry(0.065, 10, 8));
    mintLeafGeo.scale(1.5, 0.2, 0.85);
    [
      [0.12, 0.88, 0.05, 0.4],
      [0.16, 0.95, -0.03, -0.5],
    ].forEach(([mx, my, mz, rz]) => {
      const mLeaf = new THREE.Mesh(mintLeafGeo, mintMat);
      mLeaf.position.set(mx, my, mz);
      mLeaf.rotation.set(0.3, 0.4, rz);
      hydroGroup.add(mLeaf);
    });

    addContactShadow(hydroGroup, 0.38, 0.002);
    tagGroupForRaycast(hydroGroup, 'hydration');
    this.scene.add(hydroGroup);
    this.interactiveEntries.push({
      id: 'hydration',
      group: hydroGroup,
      basePosition: hydroGroup.position.clone(),
      explodeOffset: new THREE.Vector3(0.35, 0.42, -0.35),
      emissiveMaterials: [waterMat, mintMat],
    });
  }

  public setExplodeFactor(value: number): void {
    this.explodeFactor = THREE.MathUtils.clamp(value, 0, 1);
    this.requestRender();
  }

  public setAutoOrbit(enabled: boolean): void {
    this.autoOrbit = enabled;
    this.controls.autoRotate = enabled;
    this.requestRender();
  }

  public setCameraPreset(preset: CameraPresetId): void {
    const target = CAMERA_PRESETS[preset];
    this.targetCamPos.copy(target.position);
    this.targetLookAt.copy(target.target);
    this.transitioningPreset = true;
    this.requestRender();
  }

  public selectFoodGroup(groupId: FoodGroupId): void {
    this.selectedGroup = groupId;
    this.updateSelectionHighlight();
    this.requestRender();
  }

  private updateSelectionHighlight(): void {
    for (const entry of this.interactiveEntries) {
      const isSelected = entry.id === this.selectedGroup && entry.id !== 'thaliBase';
      for (const mat of entry.emissiveMaterials) {
        if ('emissive' in mat) {
          mat.emissive.setHex(isSelected ? 0x15803d : 0x000000);
          mat.emissiveIntensity = isSelected ? 0.18 : 0;
        }
      }
    }
  }

  private handleOrbitStart = (): void => {
    this.transitioningPreset = false;
  };

  private handlePointerDown = (event: PointerEvent): void => {
    this.pointerDownPos = { x: event.clientX, y: event.clientY };
  };

  private handlePointerUp = (event: PointerEvent): void => {
    const dx = event.clientX - this.pointerDownPos.x;
    const dy = event.clientY - this.pointerDownPos.y;
    if (dx * dx + dy * dy > 36) return; // Dragged camera, not a click

    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    this.pointerNdc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hits = this.raycaster.intersectObjects(this.scene.children, true);
    for (const hit of hits) {
      const groupId = hit.object.userData?.foodGroupId as FoodGroupId | undefined;
      if (groupId) {
        this.selectedGroup = groupId;
        this.updateSelectionHighlight();
        this.onSelectGroup?.(groupId);
        this.requestRender();
        return;
      }
    }
  };

  private handleResize = (): void => {
    if (this.isDisposed) return;
    const width = Math.max(this.container.clientWidth, 320);
    const height = Math.max(this.container.clientHeight, 320);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.requestRender();
  };

  private handleContextLost = (event: Event): void => {
    event.preventDefault();
    this.contextLost = true;
    this.onContextStatusChange?.(true);
  };

  private handleContextRestored = (): void => {
    this.contextLost = false;
    this.onContextStatusChange?.(false);
    this.requestRender();
  };

  public requestRender = (): void => {
    if (this.isDisposed || this.contextLost || this.renderScheduled) return;
    this.renderScheduled = true;
    this.rafId = requestAnimationFrame(this.tick);
  };

  private afterDraw(): void {
    const needsContinue =
      this.autoOrbit ||
      this.transitioningPreset ||
      Math.abs(this.explodeFactor - this.currentExplodeFactor) > 0.002;

    if (!needsContinue || this.isDisposed || this.contextLost) return;

    if (this.isSoftwareGl) {
      this.timerId = window.setTimeout(this.requestRender, 100);
    } else {
      this.requestRender();
    }
  }

  private tick = (): void => {
    this.renderScheduled = false;
    if (this.isDisposed || this.contextLost) return;

    const dt = Math.min(this.clock.getDelta(), 0.05);

    // Smooth Exploded Layer View damping
    if (Math.abs(this.explodeFactor - this.currentExplodeFactor) > 0.001) {
      this.currentExplodeFactor = THREE.MathUtils.damp(
        this.currentExplodeFactor,
        this.explodeFactor,
        8,
        dt
      );
      for (const entry of this.interactiveEntries) {
        entry.group.position.copy(entry.basePosition).addScaledVector(
          entry.explodeOffset,
          this.currentExplodeFactor
        );
      }
    }

    // Smooth camera preset damping
    if (this.transitioningPreset) {
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCamPos.x, 6, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCamPos.y, 6, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCamPos.z, 6, dt);
      this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, this.targetLookAt.x, 6, dt);
      this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, this.targetLookAt.y, 6, dt);
      this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, this.targetLookAt.z, 6, dt);

      if (
        this.camera.position.distanceToSquared(this.targetCamPos) < 0.0015 &&
        this.controls.target.distanceToSquared(this.targetLookAt) < 0.0015
      ) {
        this.camera.position.copy(this.targetCamPos);
        this.controls.target.copy(this.targetLookAt);
        this.transitioningPreset = false;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.afterDraw();
  };

  public dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    cancelAnimationFrame(this.rafId);
    window.clearTimeout(this.timerId);

    this.controls.removeEventListener('start', this.handleOrbitStart);
    this.controls.removeEventListener('change', this.requestRender);
    window.removeEventListener('resize', this.handleResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);
    this.renderer.domElement.removeEventListener('pointerup', this.handlePointerUp);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.handleContextRestored);

    this.controls.dispose();
    this.disposableGeometries.forEach((g) => g.dispose());
    this.disposableMaterials.forEach((m) => m.dispose());
    this.disposableTextures.forEach((t) => t.dispose());
    this.envRT.dispose();
    this.pmremGenerator.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
