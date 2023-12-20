import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

// FBX Model
export default function GetFBXModelAsync(url: string): Promise<THREE.Group> 
{
  return new Promise((resolve, reject) => 
  {
    console.log(url);
    const loader = new FBXLoader();
    loader.load(url, (object) => 
    {
      if (object instanceof THREE.Group) 
      {
        resolve(object);
      } 
      else 
      {
        reject(new Error('Loaded object is not an instance of THREE.Group.'));
      }
    }, 
    undefined, (error) => 
    {
      reject(error);
    });
  });
}