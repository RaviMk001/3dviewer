import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// GLTF Model or GLB
export default function Get_GLTF_GLB_ModelAsync(url: string): Promise<THREE.Object3D> 
{
    return new Promise((resolve, reject) => 
    {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
        
        const gLTFloader = new GLTFLoader();
        gLTFloader.setDRACOLoader(dracoLoader);

        gLTFloader.load(url,
            function (gltf: GLTF) 
            {
                console.log('GLTF loaded successfully:', gltf);
                resolve(gltf.scene);
            },
            function (xhr: ProgressEvent) 
            {
                if (xhr.lengthComputable) {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
                }
            },
            function (error: any) 
            {
                console.error('An error happened', error);
                reject(error);
            }
        );
    });
}