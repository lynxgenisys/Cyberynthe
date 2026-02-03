import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useGame } from '../../context/GameState';
import * as THREE from 'three';

const DilemmaOrb = ({ position, id, title }) => {
    const { triggerDilemma } = useGame();
    const [hovered, setHover] = useState(false);
    const meshRef = useRef();

    // Simple animation
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta;
        }
    });

    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <RigidBody type="fixed" colliders="ball" sensor onIntersectionEnter={() => triggerDilemma(id)}>
                    <mesh
                        ref={meshRef}
                        onPointerOver={() => setHover(true)}
                        onPointerOut={() => setHover(false)}
                    >
                        <icosahedronGeometry args={[1, 0]} />
                        <meshStandardMaterial
                            color={hovered ? "white" : "#00ff00"}
                            emissive="#00ff00"
                            emissiveIntensity={2}
                            wireframe
                        />
                    </mesh>
                </RigidBody>

                {/* Floating Label */}
                <Text
                    position={[0, 2, 0]}
                    fontSize={0.5}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                >
                    {title}
                </Text>
            </Float>

            {/* Light Beacon */}
            <pointLight distance={10} intensity={2} color="#00ff00" />
        </group>
    );
};

export default DilemmaOrb;
