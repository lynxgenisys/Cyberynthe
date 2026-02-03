import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import { KeyboardControls, PointerLockControls, useKeyboardControls } from '@react-three/drei';
import { useGame } from '../../context/GameContext'; // Import Logic Breach Link
import { useCombat } from '../../context/CombatContext';
import { usePlayer } from '../../context/PlayerContext';
import * as THREE from 'three';

// CONSTANTS Moved to PlayerController for easier tuning

// 1. MEMORY POOLING (Static objects to prevent GC)
const _playerForward = new THREE.Vector3();
const _playerRight = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _cameraDirection = new THREE.Vector3();
const _spawnVector = new THREE.Vector3();
const _upDir = new THREE.Vector3(0, 1, 0);

const PlayerController = () => {
    const body = useRef();
    const [subscribeKeys, getKeys] = useKeyboardControls();
    const { camera } = useThree();
    const { updatePlayerPos, triggerScan, getLevelFromXP, playerRotationRef, enterBestiaryMode, setChargingWeapon } = useGame();

    // Raycaster for ground check
    const rapier = useRapier();
    // Pre-instantiating the Ray to reuse
    const ray = useMemo(() => new rapier.rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 }), [rapier]);

    // Force Camera to look forward on spawn
    React.useEffect(() => {
        camera.rotation.set(0, 0, 0); // Reset rotation
        camera.lookAt(new THREE.Vector3(0, 5, -100)); // Look at horizon
    }, [camera]);

    const { fireProjectile, fireBurst } = useCombat();
    const { lockResource, state: playerState } = usePlayer(); // Access full state
    const { clockSpeed } = playerState.stats;

    // CLOCK SPEED FACTOR: 3x Scaling (User Request)
    // 5% Stat -> 15% Boost (1.15x)
    const cycleMultiplier = (100 + (clockSpeed * 3)) / 100;

    // Movement: 3.0 Base * Multiplier
    const SPEED = 3.0 * cycleMultiplier;

    // DEBUG: Prove Speed Update
    React.useEffect(() => {
        // useGame's addNotification might not be available directly if destructured earlier without memo?
        // It is available from useGame() hook above.
        // addNotification(`SYSTEM_SYNC: SPEED_CALIBRATED [${(SPEED).toFixed(2)}m/s]`);
    }, [SPEED]); // Only fire when SPEED changes (e.g. on upgrade)

    const JUMP_FORCE = 4.375; // +25% Total Boost (Final Calibration)
    const CELL_SIZE = 2;   // Must match MazeRenderer

    // RESET POSITION ON FLOOR CHANGE (Dynamic Spawn)
    const { gameState } = useGame();
    React.useEffect(() => {
        if (body.current && gameState.spawnPoint) {
            const { x, y, z } = gameState.spawnPoint;
            body.current.setTranslation({ x, y: 1.5, z }, true);
            body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        }
    }, [gameState.floorLevel, gameState.spawnPoint]);

    // INPUT STATE
    const mouseDownTime = useRef(0);
    const [isCharging, setIsCharging] = useState(false);

    // GHOST MODE INPUT HANDLER (Isolated to prevent resets)
    React.useEffect(() => {
        if (gameState.gameMode !== 'ghost') return;

        const handleMouseDownGlobal = (e) => { if (e.button === 2) window.ghostRightClick = true; };
        const handleMouseUpGlobal = (e) => { if (e.button === 2) window.ghostRightClick = false; };

        const handleKeyDownGhost = (e) => {
            if (e.key === 'Shift' && !e.repeat) {
                window.ghostRunToggle = !window.ghostRunToggle;
            }
        };

        window.addEventListener('mousedown', handleMouseDownGlobal);
        window.addEventListener('mouseup', handleMouseUpGlobal);
        window.addEventListener('keydown', handleKeyDownGhost);

        return () => {
            window.ghostRightClick = false;
            window.ghostRunToggle = false;
            window.removeEventListener('mousedown', handleMouseDownGlobal);
            window.removeEventListener('mouseup', handleMouseUpGlobal);
            window.removeEventListener('keydown', handleKeyDownGhost);
        };
    }, [gameState.gameMode]);

    // STANDARD MODE / COMBAT INPUT
    React.useEffect(() => {
        if (gameState.isPaused) return;

        const handleMouseDown = (e) => {
            if (!document.pointerLockElement) return;

            // GHOST MODE: Controls Override (Only Click Actions here, State handled above)
            if (gameState.gameMode === 'ghost') {
                // LEFT CLICK (0): TRIGGER SCAN (No Weapon)
                if (e.button === 0) {
                    if (lockResource(10)) triggerScan();
                }
                return;
            }

            // STANDARD MODE
            // LEFT CLICK: Record Start Time
            if (e.button === 0) {
                mouseDownTime.current = Date.now();
                setIsCharging(true); // Start charging visual
                setChargingWeapon(true); // Update global state for HUD
            }

            // RIGHT CLICK (2) -> BIT_FLIP (Magenta, 5 M-RAM)
            if (e.button === 2) {
                // ... calculation for position ...
                const direction = new THREE.Vector3();
                camera.getWorldDirection(direction);
                const startPos = body.current.translation();
                const spawnPos = new THREE.Vector3(startPos.x, startPos.y + 1.5, startPos.z).add(direction.clone().multiplyScalar(0.2));

                if (lockResource(5)) {
                    fireProjectile(spawnPos, direction, 'SHRED');
                }
            }
        };

        const handleMouseUp = (e) => {
            if (!document.pointerLockElement) return;

            if (gameState.gameMode === 'ghost') return;

            if (e.button !== 0) return;

            setIsCharging(false); // Stop charging visual
            setChargingWeapon(false); // Update global state for HUD

            const rawDuration = Date.now() - mouseDownTime.current;
            // APPLY CYCLE SPEED: Faster charging with higher clock
            const duration = rawDuration * cycleMultiplier;

            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            const startPos = body.current.translation();
            const spawnPos = new THREE.Vector3(startPos.x, startPos.y + 1.5, startPos.z).add(direction.clone().multiplyScalar(0.2));

            // LEVEL 5 CHECK (Exponential Curve)
            const playerLevel = getLevelFromXP(gameState.xp || 0);
            const canBurst = playerLevel >= 5;

            // CHARGE SHOT (Hold > 1000ms)
            if (canBurst && duration > 1000) {
                if (lockResource(25)) // higher cost, efficiency
                    fireBurst(spawnPos, direction, 'PING');
            } else {
                // STANDARD TAP
                if (lockResource(10)) // 10 M-RAM for single shot
                    fireProjectile(spawnPos, direction, 'PING');
            }
        };

        const handleKeyDown = (e) => {
            if (!document.pointerLockElement) return;
            if (gameState.gameMode === 'ghost') return; // Ghost keys handled in other effect

            // 'E' -> SCAN PULSE (Green, 10 M-RAM)
            if (e.code === 'KeyE') {
                if (lockResource(10)) {
                    triggerScan();
                }
            } else if (e.code === 'Digit9' || e.code === 'Numpad9') {
                if (enterBestiaryMode) enterBestiaryMode();
            }
        };

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [gameState.isPaused, camera, fireProjectile, fireBurst, lockResource, triggerScan, gameState.gameMode]);

    useFrame((state, delta) => {
        if (!body.current) return;

        // PAUSE LOGIC
        if (gameState.isPaused) {
            // Ensure zero velocity when paused to prevent drift
            body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            body.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            return;
        }

        let linvel = body.current.linvel();
        let translation = body.current.translation();

        // 1. FREEZE LOGIC
        const isFrozen = gameState.isTransitioning || !gameState.spawnPoint;



        if (isFrozen) {
            body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            body.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            // Even if frozen, we must read valid translation for camera sync
            translation = body.current.translation();
        }
        else {
            // 2. MOVEMENT LOGIC (Only if Active)
            const { forward, backward, leftward, rightward, jump, run } = getKeys();

            // GHOST MODE INPUT LOGIC
            let effectiveRun = run;
            if (gameState.gameMode === 'ghost') {
                // Check Mouse Right Click (Native Browser State)
                const isRightClickDown = (window.performance.now() - 0) > 0; // Placeholder? No, we need real state.
                // We'll use a Ref for mouse state since we are inside standard React loop
            }
            // Actually, we need to track this state OUTSIDE useFrame.
            // Let's rely on the updated Refs from the useEffect listeners we just added? 
            // OR checks props passed down? 
            // Better: Add "ghostRun" state to component.

            // RE-WRITING BLOCK to include state capture properly:

            // GROUND CHECK (Phase V: Hybrid Strategy)
            const origin = ray.origin;
            origin.x = translation.x;
            origin.y = translation.y + 0.5;
            origin.z = translation.z;

            const playerCollider = body.current.collider(0);
            const hit = rapier.world.castRay(ray, 4.5, true, null, null, null, playerCollider);

            const isOnFloor = translation.y < 1.1;
            const hasRayHit = hit !== null && hit.toi < 2.0 && hit.toi > 0.01;
            const isGrounded = isOnFloor || hasRayHit;

            // JUMP CALCULATION
            let targetYVel = linvel.y;
            if (jump && isGrounded) {
                targetYVel = JUMP_FORCE;
            }

            // Calculate Movement Vector relative to Camera
            camera.getWorldDirection(_playerForward);
            _playerForward.y = 0;
            _playerForward.normalize();

            _playerRight.crossVectors(_playerForward, _upDir);

            _moveDir.set(0, 0, 0);
            if (forward) _moveDir.add(_playerForward);
            if (backward) _moveDir.sub(_playerForward);
            if (rightward) _moveDir.add(_playerRight);
            if (leftward) _moveDir.sub(_playerRight);

            // SPEED CALCULATION
            let currentSpeed = SPEED;
            if (gameState.gameMode === 'ghost') {
                // GHOST MODE: Check Ref Flags
                const isRunToggled = window.ghostRunToggle || false;
                const isRightClick = window.ghostRightClick || false;
                if (isRunToggled || isRightClick) currentSpeed = SPEED * 1.6;
            } else {
                if (run) currentSpeed = SPEED * 1.6;
            }

            if (_moveDir.lengthSq() > 0) {
                _moveDir.normalize().multiplyScalar(currentSpeed);
            }

            // Apply Velocity
            body.current.setLinvel({ x: _moveDir.x, y: targetYVel, z: _moveDir.z }, true);

            // SECTOR 4: MAGNETIC PULL
            if (gameState.floorLevel >= 76 && gameState.floorLevel <= 100) {
                const centerX = 50;
                const centerZ = 50;
                const dx = centerX - translation.x;
                const dz = centerZ - translation.z;
                body.current.applyImpulse({ x: dx * 0.01, y: 0, z: dz * 0.01 }, true);
            }
        }

        // 3. SYNC CAMERA (ALWAYS RUNS)
        camera.position.set(translation.x, translation.y + 1.5, translation.z);

        // SYNC MAP
        const gridX = Math.round(translation.x / CELL_SIZE);
        const gridY = Math.round(translation.z / CELL_SIZE);
        updatePlayerPos(gridX, gridY, translation);

        // VOID CATCH PROTOCOL (Bug -> Feature)
        if (translation.y < -10) {
            // Respawn at Spawn Point if available, else Start
            const spawnX = gameState.spawnPoint ? gameState.spawnPoint.x : 2;
            const spawnZ = gameState.spawnPoint ? gameState.spawnPoint.z : 2;

            body.current.setTranslation({ x: spawnX, y: 5, z: spawnZ }, true); // Drop from safer height
            body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        }

        // SYNC CAMERA FOR COMPASS (Vector Math - Gimbal Lock Safe)
        if (playerRotationRef) {
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            // 0 = North (-Z), PI/2 = West (-X), PI = South (+Z), -PI/2 = East (+X)
            // atan2(x, z) standard: 0 at (1,0) usually.
            // We want 0 at (0, -1). 
            // Math.atan2(x, z) -> angle from +Z axis?
            // Let's just pass the raw atan2(x, z) and let HUD shift if needed, 
            // BUT aligning 0 to North is safest.
            // North: x=0, z=-1.
            // atan2(0, -1) = PI.
            // atan2(0, 1) = 0. (South)
            // To make North 0: atan2(x, -z)?
            // North z=-1 -> -z=1. atan2(0, 1) = 0. Correct.
            playerRotationRef.current = Math.atan2(dir.x, -dir.z);
        }
    });

    return (
        <group>
            <RigidBody
                ref={body}
                colliders={false}
                position={[2, 2, 2]} // Lowered spawn
                enabledRotations={[false, false, false]}
                gravityScale={0.37} // Moderated Float
                friction={0}
            >
                <CapsuleCollider args={[0.5, 0.5]} />
                <mesh visible={false}>
                    <capsuleGeometry args={[0.5, 1]} />
                    <meshStandardMaterial color="cyan" />
                </mesh>
            </RigidBody>

            {/* Only lock pointer if game is NOT paused */}
            {!gameState.isPaused && <PointerLockControls />}
        </group>
    );
};

const Player = () => {
    const keyboardMap = [
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
        { name: 'jump', keys: ['Space'] },
        { name: 'run', keys: ['Shift'] },
    ];

    return (
        <KeyboardControls map={keyboardMap}>
            <PlayerController />
        </KeyboardControls>
    );
};

export default Player;
