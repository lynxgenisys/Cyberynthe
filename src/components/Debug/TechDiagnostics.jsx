import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * IDENTITY: OMNI_VIEW
 * DIRECTIVE: Performance Benchmarking
 */

export default function TechDiagnostics() {
    const { gl } = useThree();
    const [metrics, setMetrics] = useState({
        drawCalls: 0,
        geometries: 0,
        textures: 0,
        fps: 0
    });

    useEffect(() => {
        let lastTime = performance.now();
        let frameCount = 0;

        const loop = () => {
            const now = performance.now();
            frameCount++;

            if (now - lastTime >= 1000) {
                setMetrics({
                    drawCalls: gl.info.render.calls,
                    geometries: gl.info.memory.geometries,
                    textures: gl.info.memory.textures,
                    fps: frameCount
                });
                frameCount = 0;
                lastTime = now;
            }
            requestAnimationFrame(loop);
        };
        const handle = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(handle);
    }, [gl]);

    return (
        <div className="absolute top-0 right-0 p-2 bg-black/80 font-mono text-[10px] text-green-500 z-50 pointer-events-none">
            <div>[DIAGNOSTICS]</div>
            <div>FPS: {metrics.fps}</div>
            <div className="text-cyan">DRAWS: {metrics.drawCalls}</div>
            <div>GEOM: {metrics.geometries}</div>
            <div>TEX: {metrics.textures}</div>
        </div>
    );
}
