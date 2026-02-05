import React, { useMemo, useRef } from 'react';
import { InstancedRigidBodies } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * IDENTITY: GRADIENT_MORALS_04
 * DIRECTIVE: Visual Refactor (Gradient Shader + Sector Twist)
 */

const CHUNK_SIZE = 16;

// CUSTOM SHADER MATERIAL COMPONENT
const GradientWallMaterial = ({ baseMaterial, wallHeight, texture, isHorizontal, sector }) => {
    const materialRef = useRef();

    React.useLayoutEffect(() => {
        if (!materialRef.current) return;

        materialRef.current.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = { value: 0 };
            const isSector1Comp = (sector || 1.0) < 10.5;
            shader.uniforms.uTopColor = { value: isSector1Comp ? new THREE.Color('#00AAAA') : new THREE.Color('#00FFFF') };
            shader.uniforms.uBotColor = { value: isSector1Comp ? new THREE.Color('#AA00AA') : new THREE.Color('#EA00FF') }; // More vibrant Magenta
            shader.uniforms.uTex = { value: texture };
            shader.uniforms.uScrollDir = { value: isHorizontal ? 1.0 : 0.0 };
            shader.uniforms.uSector = { value: sector || 1.0 };
            shader.uniforms.uBrightness = { value: isSector1Comp ? 0.5 : 0.85 }; // Slightly lower to prevent white washout
            shader.uniforms.uSectorSpeed = { value: isSector1Comp ? 0.012 : 0.0066 };
            shader.uniforms.uBaseLift = { value: isSector1Comp ? 0.1 : 0.05 }; // Sharper contrast
            shader.uniforms.uGlowMult = { value: isSector1Comp ? 1.5 : 3.0 }; // Boosted texture glow
            shader.uniforms.uScrollDirFlag = { value: isSector1Comp ? 0.0 : 1.0 };

            shader.vertexShader = `
                varying vec3 vPos;
                varying vec2 vUv;
                ${shader.vertexShader}
            `.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
                vPos = transformed;
                vUv = uv;
                `
            );

            shader.fragmentShader = `
                uniform float uTime;
                uniform vec3 uTopColor;
                uniform vec3 uBotColor;
                uniform sampler2D uTex; // Asset Layer
                uniform float uScrollDir; // 0 = Vert, 1 = Horiz
                uniform float uSector;
                uniform float uBrightness;
                uniform float uSectorSpeed;
                uniform float uBaseLift;
                uniform float uGlowMult;
                uniform float uScrollDirFlag;
                varying vec3 vPos;
                varying vec2 vUv;
                ${shader.fragmentShader}
            `.replace(
                '#include <dithering_fragment>',
                `
                #include <dithering_fragment>
                
                // 1. BASE LAYER: VERTICAL GRADIENT
                float h = smoothstep(0.0, ${wallHeight.toFixed(1)}, vPos.y + ${(wallHeight / 2).toFixed(1)}); 
                vec3 gradientColor = mix(uBotColor, uTopColor, h);
                
                // 2. LIGHTING LAYER: FRESNEL & GLOSS
                vec3 viewDir = normalize(vViewPosition);
                vec3 fresnelNormal = normalize(vNormal);
                float fresnel = pow(1.0 - abs(dot(viewDir, fresnelNormal)), 2.0);
                
                // 3. ASSET LAYER: CYBER GLOW (Visibility & UV Fix)
                vec2 scaledUv = vUv * vec2(1.0, ${wallHeight / 4.0}); 
                
                vec2 scrollUv = mix(
                    vec2(scaledUv.x, scaledUv.y + uTime * uSectorSpeed),
                    vec2(scaledUv.x + uTime * uSectorSpeed, scaledUv.y),
                    uScrollDirFlag
                );
                
                vec4 texColor = texture2D(uTex, scrollUv);
                float pulse = 0.8 + 0.5 * sin(uTime * 2.0); 
                vec3 glowColor = mix(uBotColor, uTopColor, vUv.y); 
                
                gl_FragColor.rgb *= (gradientColor * 0.4 + uBaseLift) * uBrightness; 
                gl_FragColor.rgb += gradientColor * fresnel * 0.05 * uBrightness; 

                // B. TEXTURE GLOW
                float whiteGlow = texColor.r * uGlowMult * uBrightness; 
                gl_FragColor.rgb += whiteGlow * glowColor * pulse; 

                // 4. EDGE HIGHLIGHT (Restored for Floors 1-5 Only)
                if (uSector <= 5.5) {
                    float edgeX = abs(vUv.x - 0.5) * 2.0;
                    float edgeY = abs(vUv.y - 0.5) * 2.0;
                    float edge = max(edgeX, edgeY);
                    if (edge > 0.95) {
                        gl_FragColor.rgb += uTopColor * 0.5 * uBrightness;
                    }
                }
                `
            );

            materialRef.current.userData.shader = shader;
        };
    }, [wallHeight, texture, isHorizontal, sector]); // Re-compile if props change

    useFrame((state) => {
        if (materialRef.current && materialRef.current.userData.shader) {
            materialRef.current.userData.shader.uniforms.uTime.value = state.clock.elapsedTime;
            // Ensure Texture is updated if swapped
            if (texture && materialRef.current.userData.shader.uniforms.uTex.value !== texture) {
                materialRef.current.userData.shader.uniforms.uTex.value = texture;
            }
        }
    });

    return <primitive object={baseMaterial} ref={materialRef} attach="material" />;
};


const WallChunk = React.memo(({ chunkKey, instances, wallMaterial, cellSize, wallHeight, isSector2, texture, sector }) => {
    // ... (Keep existing implementation logic for WallChunk, just update the return)
    const meshRef = useRef();
    const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // INITIALIZE MATRICES & COLORS
    React.useLayoutEffect(() => {
        if (meshRef.current) {
            const tempColor = new THREE.Color();
            let dirtyColors = false;

            instances.forEach((inst, i) => {
                // 1. TRANSFORM (Connective Logic)
                const { position, rotation, scale, offset } = inst;

                dummy.position.set(
                    position[0] + (offset ? offset[0] : 0),
                    position[1],
                    position[2] + (offset ? offset[2] : 0)
                );
                dummy.rotation.set(rotation[0], rotation[1], rotation[2]);
                dummy.scale.set(scale[0], scale[1], scale[2]);

                // SECTOR 2 TWIST (Nested Cube Look)
                if (isSector2 && Math.random() < 0.1) {
                    dummy.rotation.y += (Math.random() * 0.2) - 0.1;
                }

                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);

                // 2. COLORS (Keep Copper Trace logic if needed, or let Gradient override?)
                // User asked for "Copper Trace" OVERLAY.
                // If Gradient handles base color, Copper Trace might be Tint?
                // Let's keep the TINT logic from before, as it adds variety on top of Gradient.
                if (isSector2 && Math.random() < 0.2) {
                    // Tint Copper (Multiplies with Gradient)
                    tempColor.setHex(0xFFAA88);
                    meshRef.current.setColorAt(i, tempColor);
                    dirtyColors = true;
                } else {
                    tempColor.setHex(0xFFFFFF);
                    meshRef.current.setColorAt(i, tempColor);
                    dirtyColors = true;
                }
            });

            meshRef.current.instanceMatrix.needsUpdate = true;
            if (dirtyColors && meshRef.current.instanceColor) {
                meshRef.current.instanceColor.needsUpdate = true;
            }
        }
    }, [chunkKey, instances, isSector2, cellSize, wallHeight]);

    const uniqueMat = useMemo(() => wallMaterial.clone(), [wallMaterial]);

    return (
        <InstancedRigidBodies instances={instances} type="fixed" colliders="cuboid">
            <instancedMesh
                ref={meshRef}
                args={[null, null, instances.length]}
                count={instances.length}
                castShadow
                receiveShadow
                frustumCulled={false} // DISABLED: Fixes flickering in production builds
            >
                <boxGeometry args={[1, 1, 1]} />
                <GradientWallMaterial
                    baseMaterial={uniqueMat}
                    wallHeight={wallHeight}
                    texture={texture}
                    sector={sector}
                />
            </instancedMesh>
        </InstancedRigidBodies>
    );
});

export default function InstancedWalls({ maze, wallMaterial, cellSize, wallHeight, floorLevel, texture, sector }) {
    const isSector2 = floorLevel >= 11 && floorLevel <= 25;

    const chunks = useMemo(() => {
        if (!maze || !maze.grid) return [];
        const chunkMap = new Map();

        maze.grid.forEach((row, z) => {
            row.forEach((cell, x) => {
                if (cell === 0) {
                    const cx = Math.floor(x / CHUNK_SIZE);
                    const cy = Math.floor(z / CHUNK_SIZE);
                    const key = `${cx}-${cy}`;
                    if (!chunkMap.has(key)) chunkMap.set(key, []);
                    const wallScale = isSector2 ? 0.5 : 1.0;

                    // CONNECTIVE LOGIC: Check neighbors to prevent gaps
                    let minX = -0.5, maxX = 0.5;
                    let minZ = -0.5, maxZ = 0.5;

                    if (isSector2) {
                        const hasLeft = x > 0 && maze.grid[z][x - 1] === 0;
                        const hasRight = x < maze.width - 1 && maze.grid[z][x + 1] === 0;
                        const hasUp = z > 0 && maze.grid[z - 1][x] === 0;
                        const hasDown = z < maze.height - 1 && maze.grid[z + 1][x] === 0;

                        minX = hasLeft ? -0.5 : -0.25;
                        maxX = hasRight ? 0.5 : 0.25;
                        minZ = hasUp ? -0.5 : -0.25;
                        maxZ = hasDown ? 0.5 : 0.25;
                    }

                    const sX = (maxX - minX) * cellSize;
                    const sZ = (maxZ - minZ) * cellSize;
                    const oX = ((minX + maxX) / 2) * cellSize;
                    const oZ = ((minZ + maxZ) / 2) * cellSize;

                    chunkMap.get(key).push({
                        key: `wall-${x}-${z}`,
                        position: [x * cellSize, wallHeight / 2, z * cellSize],
                        offset: [oX, 0, oZ],
                        rotation: [0, 0, 0],
                        scale: [sX, wallHeight, sZ]
                    });
                }
            });
        });
        return Array.from(chunkMap.entries());
    }, [maze, cellSize, wallHeight]);

    return (
        <group>
            {chunks.map(([key, instances]) => (
                <WallChunk
                    key={key}
                    chunkKey={key}
                    instances={instances}
                    wallMaterial={wallMaterial}
                    cellSize={cellSize}
                    wallHeight={wallHeight}
                    isSector2={isSector2}
                    texture={texture}
                    sector={sector}
                />
            ))}
        </group>
    );
}
