import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedRigidBodies, RigidBody } from '@react-three/rapier';
import { usePlayer } from '../../context/PlayerContext';
import { useGame } from '../../context/GameContext';
import * as THREE from 'three';

/**
 * IDENTITY: LOGIC_BREACH_02
 * DIRECTIVE: Environmental Hazards (Sector 2 & 3)
 */

export default function HazardManager({ maze, floorLevel }) {
    const isSector2 = floorLevel >= 11 && floorLevel <= 25;
    const isSector3 = floorLevel >= 51 && floorLevel <= 75;

    // SECTOR 3: BUS_HIGHWAY (Floors 51-75)
    // Hazard: High Speed Data Packets (Moving Obstacles)
    const trafficCount = isSector3 ? 10 : 0;
    const trafficRef = useRef([]);

    const instances = useMemo(() => {
        if (!isSector3) return [];

        const data = [];
        const openCells = [];
        maze.grid.forEach((row, z) => {
            row.forEach((cell, x) => {
                if (cell !== 0) openCells.push({ x, z });
            });
        });

        for (let i = 0; i < trafficCount; i++) {
            if (openCells.length === 0) break;
            const idx = Math.floor(Math.random() * openCells.length);
            const pos = openCells[idx];
            data.push({
                key: `traffic-${i}`,
                position: [pos.x * 2, 1, pos.z * 2],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            });
            trafficRef.current[i] = {
                dir: Math.random() > 0.5 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1),
                speed: 5 + Math.random() * 5
            };
        }
        return data;
    }, [maze, isSector3, trafficCount]);

    // SECTOR 2: LOGIC LEAK (Floors 11-25)
    // Hazard: Logic Leak (Min 1 per floor)
    const logicLeaks = useMemo(() => {
        if (!isSector2) return [];
        const leaks = [];
        const openCells = [];

        // Find open cells, excluding spawn (roughly) and exit
        maze.grid.forEach((row, z) => {
            row.forEach((cell, x) => {
                if (cell !== 0) openCells.push({ x, z });
            });
        });

        // Spawn 1 Leak
        if (openCells.length > 0) {
            const idx = Math.floor(Math.random() * openCells.length);
            const pos = openCells[idx];
            leaks.push({ x: pos.x * 2, z: pos.z * 2 });
        }
        return leaks;
    }, [maze, isSector2]);


    const api = useRef();

    useFrame((state, delta) => {
        if (isSector3 && api.current) {
            // Kinematic updates if needed here via API if we used InstancedRigidBodies
        }
    });

    return (
        <group>
            {/* SECTOR 3 TRAFFIC */}
            {isSector3 && instances.map((data, i) => (
                <DataPacket
                    key={data.key}
                    initPos={data.position}
                    dir={trafficRef.current[i].dir}
                    speed={trafficRef.current[i].speed}
                />
            ))}

            {/* SECTOR 2 LOGIC LEAKS */}
            {isSector2 && logicLeaks.map((pos, i) => (
                <LogicLeak key={`leak-${i}`} x={pos.x} z={pos.z} />
            ))}
        </group>
    );
}

// SECTOR 3 HAZARD
const DataPacket = ({ initPos, dir, speed }) => {
    const body = useRef();
    const time = useRef(0);

    useFrame((state, delta) => {
        if (!body.current) return;
        time.current += delta;
        const offset = Math.sin(time.current * 0.5 * speed) * 4;

        const nextPos = {
            x: initPos[0] + dir.x * offset,
            y: initPos[1],
            z: initPos[2] + dir.z * offset
        };
        body.current.setNextKinematicTranslation(nextPos);
    });

    return (
        <RigidBody ref={body} type="kinematicPosition">
            <mesh castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                    color="#FFaa00"
                    emissive="#FF4400"
                    emissiveIntensity={2}
                    roughness={0}
                />
            </mesh>
        </RigidBody>
    );
};

// SECTOR 2 HAZARD
const LogicLeak = ({ x, z }) => {
    const { damageKernel } = usePlayer();
    const { addNotification } = useGame();
    const [triggered, setTriggered] = useState(false);
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            // Glitch visual
            meshRef.current.visible = Math.random() > 0.1;
            meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.1);
        }
    });

    const onEnter = () => {
        if (triggered) return;
        setTriggered(true);
        damageKernel(10);
        addNotification("WARNING: LOGIC_LEAK_DETECTED // INTEGRITY_-10");

        // Reset trigger after delay? Or one-shot trap?
        // Let's make it re-arm after 2 seconds
        setTimeout(() => setTriggered(false), 2000);
    };

    return (
        <RigidBody type="fixed" sensor onIntersectionEnter={onEnter} position={[x, 0.1, z]}>
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.8, 1.8]} />
                <meshBasicMaterial color="#000088" transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>
            {/* Visual Markers */}
            <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[1.5, 0.1, 1.5]} />
                <meshBasicMaterial color="#0000FF" wireframe />
            </mesh>
        </RigidBody>
    );
};
