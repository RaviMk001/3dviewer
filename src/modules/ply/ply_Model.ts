import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';

// PLY Model
export default function GetPLYModelAsync(url: string): Promise<THREE.Group> 
{
    return new Promise((resolve, reject) => 
    {
        const loader = new PLYLoader();
        loader.load(url, function (geometry: THREE.BufferGeometry) 
        {
            geometry.computeVertexNormals();

            const material = new THREE.MeshStandardMaterial({ color: 0x009cff, flatShading: true });
            const mesh = new THREE.Mesh(geometry, material);

            //mesh.castShadow = true;
            //mesh.receiveShadow = true;

            const group = new THREE.Group();
            group.add(mesh);

            // You can also add other elements to the group if needed

            // Resolve the promise with the group containing the mesh
            resolve(group);
        });
    });
}
