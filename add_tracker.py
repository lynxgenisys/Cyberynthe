with open("src/components/3d/MobManager.jsx", "r", encoding="utf-8") as f:
    code = f.read()

replacement = """<instancedMesh ref={trackerRef} args={[null, null, 100]} count={0} frustumCulled={false}><boxGeometry args={[0.8, 0.8, 0.8]} /><meshStandardMaterial color="#ff00ff" emissive="#ff0000" emissiveIntensity={2} wireframe /></instancedMesh>
              <instancedMesh ref={trackerScanRef} args={[null, null, 100]} count={0} frustumCulled={false} renderOrder={999}><sphereGeometry args={[0.5, 16, 16]} /><meshBasicMaterial color="#ff0000" wireframe transparent opacity={0.8} depthTest={false} /></instancedMesh>
              <instancedMesh ref={hunterRef}"""

code = code.replace("<instancedMesh ref={hunterRef}", replacement)

with open("src/components/3d/MobManager.jsx", "w", encoding="utf-8") as f:
    f.write(code)
