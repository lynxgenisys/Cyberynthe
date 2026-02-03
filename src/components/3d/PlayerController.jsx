import React, { useRef, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { PointerLockControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../../context/GameContext';

/**
 * IDENTITY: LOGIC_BREACH_02
 * DIRECTIVE: First-Person Player Controller
 */

export default function PlayerController() {
    const rigidBodyRef = useRef();
    const controlsRef = useRef();
    const { triggerScan, triggerInteract, enterBestiaryMode } = useGame();

    // Input State
    const input = useRef({ forward: false, backward: false, left: false, right: false });

    useEffect(() => {

        const handleKeyDown = (e) => {
            switch (e.code) {
                case 'KeyW': input.current.forward = true; break;
                case 'KeyS': input.current.backward = true; break;
                case 'KeyA': input.current.left = true; break;
                case 'KeyD': input.current.right = true; break;
                // Add Scan Trigger
                case 'KeyE':
                    triggerScan();
                    break;
                case 'KeyR':
                    triggerInteract();
                    break;
                case 'Digit9':
                case 'Numpad9':
                    if (typeof enterBestiaryMode === 'function') {
                        enterBestiaryMode();
                    }
                    break;
            }
        };
        const handleKeyUp = (e) => {
            switch (e.code) {
                case 'KeyW': input.current.forward = false; break;
                case 'KeyS': input.current.backward = false; break;
                case 'KeyA': input.current.left = false; break;
                case 'KeyD': input.current.right = false; break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useFrame((state, delta) => {
        if (!rigidBodyRef.current) {
            console.warn("[PLAYER]: RIGID_BODY_REF_MISSING");
            return;
        }

        // 1. Get Camera Direction (Forward/Right)
        // We only care about X/Z plane for movement
        const camera = state.camera;
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        right.y = 0;
        right.normalize();

        // 2. Calculate Impulse based on Input relative to Camera
        const speed = 15 * delta * 50; // Adjusted speed
        const impulse = new THREE.Vector3();

        if (input.current.forward) impulse.add(forward.multiplyScalar(speed));
        if (input.current.backward) impulse.add(forward.multiplyScalar(-speed));
        if (input.current.left) impulse.add(right.multiplyScalar(-speed));
        if (input.current.right) impulse.add(right.multiplyScalar(speed));

        if (impulse.lengthSq() > 0) {
            // console.log("[PLAYER]: APPLYING_IMPULSE", impulse);
        }

        // Apply movement
        rigidBodyRef.current.applyImpulse(impulse, true);

        // 3. Sync Camera Position to Player Body (Eye Level)
        const playerPos = rigidBodyRef.current.translation();
        camera.position.set(playerPos.x, playerPos.y + 0.6, playerPos.z);
    });

    return (
        <>
            <PointerLockControls ref={controlsRef} />

            <RigidBody
                ref={rigidBodyRef}
                position={[2, 5, 2]}
                colliders="capsule"
                friction={0}
                linearDamping={4} // Stop sliding
                lockRotations
                enabledRotations={[false, false, false]}
            >
                <mesh visible={false}>
                    <capsuleGeometry args={[0.5, 1, 4, 8]} />
                    <meshStandardMaterial color="#00FFFF" />
                </mesh>
            </RigidBody>
        </>
    );
}
