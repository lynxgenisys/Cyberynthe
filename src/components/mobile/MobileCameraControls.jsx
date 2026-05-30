import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function MobileCameraControls() {
    const { camera } = useThree();
    
    // We store Euler angles to manage pitch and yaw safely
    const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
    
    useEffect(() => {
        // Sync initial rotation
        euler.current.copy(camera.rotation);
        
        const onCameraMove = (e) => {
            const { x, y } = e.detail;
            const sensitivity = 0.005; // Base sensitivity for touch
            
            euler.current.setFromQuaternion(camera.quaternion);
            
            euler.current.y -= x * sensitivity;
            euler.current.x -= y * sensitivity;
            
            // Clamp pitch (up/down) to avoid flipping
            euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
            euler.current.z = 0; // Lock roll
            
            camera.quaternion.setFromEuler(euler.current);
        };

        window.addEventListener('mobileCameraMove', onCameraMove);
        return () => window.removeEventListener('mobileCameraMove', onCameraMove);
    }, [camera]);

    return null;
}
