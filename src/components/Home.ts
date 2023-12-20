import { Component, Ref, Vue } from "vue-property-decorator";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { DataTexture } from "three";
import { USDZInstance } from "three-usdz-loader/lib/USDZInstance";
import { USDZLoader } from "three-usdz-loader";

import GetFBXModelAsync from '../modules/fbx/fbx_Model';
import Get_GLTF_GLB_ModelAsync from '../modules/gltf/gltf_Model';
import GetPLYModelAsync from '../modules/ply/ply_Model';
import Stats from 'stats.js';

@Component
export default class Home extends Vue 
{
  @Ref("three-container") threeContainer!: HTMLElement;
  @Ref("file") fileInput!: HTMLInputElement;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  currentFileName!: string;
  controls!: OrbitControls;
  stats!: Stats;

  // Tells if a model is currently visible
  modelIsVisible = false;

  // Tells if a file is loading currently
  modelIsLoading = false;

  // Dialog open or closed
  dialog = false;

  // Loaded models
  loadedModels: USDZInstance[] = [];

  // USDZ loader instance. Only one should be instantiated in the DOM scope
  loader_usdz!: USDZLoader;

  // Simple error handling
  error: string | null = null;

  // Tells if the loader has loaded with success
  loaderReady: boolean | null = null;

  // Load URL
  modelUrl: string | null = null;

  async mounted(): Promise<void> 
  {
     //this.modelUrl = 'https://threejs.org/examples/models/fbx/Samba%20Dancing.fbx';
     //this.modelUrl = 'http://localhost:8080/models/gltf/eve_j_gonzales.gltf';        // Set URL from Local
     //this.modelUrl = 'http://localhost:8080/models/gltf/eve_j_gonzales_glb.glb';     // Set URL from Local
     //this.modelUrl = 'http://localhost:8080/models/usdz/AirForce.usdz';              // Set URL from Local
     this.modelUrl = 'http://localhost:8080/models/fbx/eve_j_gonzales.fbx';            // Set URL from Local
     //this.modelUrl = 'http://localhost:8080/models/fbx/Zombie_Idle.fbx';             // Set URL from Local
     //this.modelUrl = 'http://localhost:8080/models/ply/eve_j_gonzales.ply';          // Set URL from Local
     const fileExtension = this.getFileExtension(this.modelUrl);
     if(fileExtension)
     {
        switch(fileExtension)
        {
          case 'usdz':
            this.usdz_loaders(this.modelUrl);
            break;
          default:
            this.default_loaders(this.modelUrl);
            break;
        }
     }
     else
     {
       console.error('Invalid URL');
     }
  }

  usdz_loaders(modelurl: string): void 
  {
    // Setup camera
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    this.camera.position.set(0, 50, 350);

    // Setup scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    // Setup light
    const ambiantLight = new THREE.AmbientLight(0x111111);
    ambiantLight.intensity = 1;
    this.scene.add(ambiantLight);

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000),new THREE.MeshBasicMaterial({ color: 0xffffff, depthWrite: false}));
    mesh.rotation.x = Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    
 
    const grid:any = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    this.scene.add(grid);

    // Setup main scene
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.CineonToneMapping;
    this.renderer.toneMappingExposure = 2;
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;

    // Setup cubemap for reflection
    new Promise((resolve) => 
    {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      pmremGenerator.compileCubemapShader();
      new RGBELoader().load("studio_country_hall_1k.hdr",(texture: DataTexture) => 
      {
          const hdrRenderTarget = pmremGenerator.fromEquirectangular(texture);
          texture.mapping = THREE.EquirectangularReflectionMapping;
          texture.needsUpdate = true;
          window.envMap = hdrRenderTarget.texture;
          resolve(true);
        }
      );
    });

    //Add the canvas to the document
    this.threeContainer.appendChild(this.renderer.domElement);

    // Setup navigation
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    // Setup Event
    this.ConvertUSDZFileFromURL(modelurl);

    // Setup main animation update loop
    window.addEventListener( 'resize', this.onWindowResize );
    this.animate();
  }



  default_loaders(modelurl: string): void 
  {    
    const container = document.createElement('div');
    document.body.appendChild(container);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    this.camera.position.set(0, 50, 350);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5);
    hemiLight.position.set(0, 200, 0);
    this.scene.add(hemiLight);
 
    const dirLight = new THREE.DirectionalLight(0xffffff, 5);
    dirLight.position.set(0, 200, 100);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.camera.left = -120;
    dirLight.shadow.camera.right = 120;
    this.scene.add(dirLight);

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000),new THREE.MeshBasicMaterial({ color: 0xffffff, depthWrite: false}));
    mesh.rotation.x = Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
 
    const grid:any = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    this.scene.add(grid);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.CineonToneMapping;
    this.renderer.toneMappingExposure = 2;
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;

    // Setup cubemap for reflection
    new Promise((resolve) => 
    {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      pmremGenerator.compileCubemapShader();
      new RGBELoader().load("studio_country_hall_1k.hdr",(texture: DataTexture) => 
      {
          const hdrRenderTarget = pmremGenerator.fromEquirectangular(texture);
          texture.mapping = THREE.EquirectangularReflectionMapping;
          texture.needsUpdate = true;
          window.envMap = hdrRenderTarget.texture;
          resolve(true);
        }
      );
    });

    //Add the canvas to the document
    this.threeContainer.appendChild(this.renderer.domElement);

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    const fileExtension = this.getFileExtension(modelurl);

    if (fileExtension) 
    {
      switch (fileExtension) 
      {
          case 'fbx':
              GetFBXModelAsync(modelurl).then((fbxModel) => 
              {
                this.adjustCameraForDefaultLoadedModels(fbxModel);
                console.log(fileExtension+" model added to the scene.");
              }).catch((error) => 
              {
                console.error("Error loading " + fileExtension + " model : ", error);
              });
              break;
          case 'gltf':
          case 'glb':
              Get_GLTF_GLB_ModelAsync(modelurl).then((gltfOrGlbModel) => 
              {
                this.adjustCameraForDefaultLoadedModels(gltfOrGlbModel);
                console.log(fileExtension+" model added to the scene.");
              }).catch((error) => 
              {
                console.error("Error loading " + fileExtension + " model : ", error);
              });
              break;
          case 'ply':
              GetPLYModelAsync(modelurl).then((plyModel) => 
              {
                this.adjustCameraForDefaultLoadedModels(plyModel);
                console.log(fileExtension+" model added to the scene.");
              }).catch((error) => 
              {
                console.error("Error loading " + fileExtension + " model : ", error);
              });
              break;
          default:
              console.error('Unsupported file extension');
              break;
            }
    } 
    else 
    {
        console.error('Invalid URL');
    }
    window.addEventListener( 'resize', this.onWindowResize );
    this.animate();
  }

  getFileExtension(url: string): string | null 
  {
    const match = url.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : null;
  }

  onWindowResize(): void 
  {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  async animate(): Promise<void> 
  {
    this.stats.begin();
    const secs = new Date().getTime() / 1000;
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Update all models animations (in our exemple there is only one model at a time)
    for (const loadedModel of this.loadedModels) 
    {
      loadedModel.update(secs);
    }

    this.renderer.render(this.scene, this.camera);
    this.stats.end();
    //requestAnimationFrame(this.animate.bind(null));
    requestAnimationFrame(this.animate);
  }

  ConvertUSDZFileFromURL(defaultFilePath:string)
  {
    fetch(defaultFilePath)
    .then(response => response.blob())
    .then(blob => {
        // Create a new File object directly from the blob
        const defaultFile = new File([blob], 'AirfForce.usdz', { type: blob.type });

        // Call the loadFile function directly with the file
        //this.loadFile(defaultFile);
        const filelist = new DataTransfer();
        filelist.items.add(defaultFile);
        // Optionally trigger the file input's change event if needed
        // Assuming this.fileInput is the input element that you want to update
        if (this.fileInput)
        {
          this.fileInput.files=filelist.files;
          this.loadUSDZFilesIntoScene(this.fileInput.files[0]);
        }
      })
      .catch(error => {
        console.error('Error loading default file:', error);
      });
  }

  /**
   * Load a USDZ file in the scene
   * @param file
   * @returns
   */
  async loadUSDZFilesIntoScene(file: File): Promise<void> 
  {
    // Prevents multiple loadings in parallel
    if (this.modelIsLoading) 
    {
      return;
    }

    // Notice model is now loading
    this.modelIsLoading = true;

    // Reset any previous error
    this.error = null;

    // Clearup any previsouly loaded model
    // We could technically load multiple files by removing this for loop
    for (const el of this.loadedModels) 
    {
      el.clear();
    }
    this.loadedModels = [];

    // Create the ThreeJs Group in which the loaded USDZ model will be placed
    const group = new THREE.Group();
    this.scene.add(group);

    // Load file and catch any error to show the user
    try 
    {
      this.loader_usdz = new USDZLoader("/wasm");
      const loadedModel = await this.loader_usdz.loadFile(file, group);
      this.loadedModels.push(loadedModel);
    } 
    catch (e) 
    {
      this.error = e as string;
      console.error("An error occured when trying to load the model" + e);
      this.modelIsLoading = false;
      return;
    }

    // Fits the camera to match the loaded model
    const allContainers = this.loadedModels.map((el: USDZInstance) => 
    {
      return el.getGroup();
    });
    
    this.adjustCameraForUSDZLoadedModels(this.camera, this.controls, allContainers);

    // Notice end
    this.modelIsLoading = false;
    this.modelIsVisible = true;
  }


  /**
   * Fits the camera view to the imported objects
   */
  adjustCameraForUSDZLoadedModels(camera: THREE.PerspectiveCamera,controls: OrbitControls,selection: THREE.Group[],fitOffset = 1.5): void 
  {
    const cam = camera as THREE.PerspectiveCamera;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    const box = new THREE.Box3();

    box.makeEmpty();
    for (const object of selection) 
    {
      box.expandByObject(object);
    }

    box.getSize(size);
    box.getCenter(center);

    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxSize / (2 * Math.atan((Math.PI * cam.fov) / 360));
    const fitWidthDistance = fitHeightDistance / cam.aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

    const direction = controls.target
      .clone()
      .sub(cam.position)
      .normalize()
      .multiplyScalar(distance);

    controls.maxDistance = distance * 10;
    controls.target.copy(center);

    cam.near = distance / 100;
    cam.far = distance * 100;
    cam.updateProjectionMatrix();

    camera.position.copy(controls.target).sub(direction);

    controls.update();
  }
  
  adjustCameraForDefaultLoadedModels(presentModel: any)
  {
    const bbox = new THREE.Box3().setFromObject(presentModel);
    const modelWidth = bbox.max.x - bbox.min.x;
    const modelHeight = bbox.max.y - bbox.min.y;
    const modelDepth = bbox.max.z - bbox.min.z;
  
    const maxDimension = Math.max(modelWidth, modelHeight, modelDepth);
    const cameraDistance = maxDimension / Math.tan((45 / 2) * (Math.PI / 180));
  
    // Adjust the near and far values based on your requirements
    const nearClamp = 1;    // Adjust this value as needed
    const farClamp = 5000;  // Adjust this value as needed
  
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, nearClamp, farClamp);
  
    const center = new THREE.Vector3();
    bbox.getCenter(center);
  
    this.camera.position.copy(center);
    this.camera.position.z += cameraDistance;
    this.camera.lookAt(center);
  
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(center);
  
    // Set up distance constraints
    this.controls.minDistance = 100;   // Adjust this value as needed (minimum distance)
    this.controls.maxDistance = 800;   // Adjust this value as needed (maximum distance)
  
    this.controls.update();
    this.scene.add(presentModel);
  }
}
