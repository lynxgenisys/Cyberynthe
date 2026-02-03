# CODE REVIEW & OPTIMIZATION REPORT

**Date**: 2026-02-02  
**Scope**: Full codebase analysis  
**Focus**: Bugs, conflicts, performance, cleanup

---

## 🐛 CRITICAL ISSUES FOUND

### 1. **RunTracker.jsx - Broken Damage Tracking**
**Severity**: 🔴 **CRITICAL** (Feature won't work)

**Location**: `src/components/systems/RunTracker.jsx:29`

**Issue**:
```javascript
if (playerState.prevHp !== undefined && playerState.kernel < playerState.prevHp) {
    const damage = playerState.prevHp - playerState.kernel;
```

**Problem**: `playerState.prevHp` **does NOT exist** in PlayerContext. The damage tracking will never trigger.

**Impact**: 
- Stability Score will always be perfect (no damage tracked)
- Leaderboards will be inaccurate

**Fix Required**: Track previous HP value using useRef or implement in PlayerContext

---

### 2. **useEffect Dependency Warnings**
**Severity**: 🟡 **MEDIUM** (React warnings, potential bugs)

**Locations**:
- `RunTracker.jsx:25` - Missing `setGameState` dependency
- `RunTracker.jsx:71` - Missing `handleFloorComplete` dependency
- `RunTracker.jsx:78` - Missing dependencies

**Issue**: useEffect hooks missing dependencies from exhaustive-deps rule

**Impact**: Potential stale closures, unexpected behavior

---

## ⚡ PERFORMANCE OPTIMIZATIONS

### 3. **MobManager.jsx - Excessive forEach Loops**
**Severity**: 🟡 **MEDIUM** (Performance impact with many mobs)

**Location**: Lines 349, 488, 545, 595

**Issue**: Multiple nested forEach loops in useFrame (runs 60fps):
```javascript
currentMobs.forEach(mob => {
    // ...
    currentMobs.forEach((target, j) => {  // Nested O(n²)
```

**Recommendation**:
- Use spatial partitioning for collision/proximity checks
- Cache distance calculations
- Early exit where possible

---

### 4. **Scene.jsx - Binary Texture Recreation**
**Severity**: 🟢 **LOW** (Already using useMemo)

**Location**: `src/components/3d/Scene.jsx:21-48`

**Current**: Binary texture created with useMemo ✅ **GOOD**

**Potential Enhancement**: 
- Pre-generate texture at build time
- Use WebP asset instead of canvas generation

---

### 5. **Unused useEffect Dependencies**
**Severity**: 🟢 **LOW** (Code smell, not breaking)

**Locations**: Multiple files

**Issue**: Empty dependency arrays for effects that reference external values

**Recommendation**: 
- Add exhaustive-deps to eslint
- Review all useEffect calls for proper dependencies

---

## 🧹 CODE CLEANUP OPPORTUNITIES

### 6. **TODO Comments**
**Location**: `GameContext.jsx` (4 TODOs)

**Items**:
- Line 285: "TODO: Trigger Class Selection UI"
- Line 584: "TODO: Implement invisibility effect"
- Line 593: "TODO: Mark next mob for instant kill"
- Line 600: "TODO: Reroll resonance"

**Status**: Tracked, feature work for future

---

### 7. **Console.error Usage**
**Location**: 
- `main.jsx:19` - Mount error logging
- `ErrorBoundary.jsx:15` - Error boundary logging

**Status**: **ACCEPTABLE** - Proper error logging, keep as-is

---

### 8. **Duplicate Code in Maze Generation**
**Location**: `NeonCity.jsx` 

**Issue**:
```javascript
const maze = Array(h).fill().map(() => Array(w).fill(1)); // Line 14
const maze = Array(h).fill().map(() => Array(w).fill(0)); // Line 89
```

**Recommendation**: Extract to helper function

---

## 📊 OPTIMIZATION RECOMMENDATIONS

### **Priority 1: Fix Critical Bug**
✅ **MUST FIX**: RunTracker damage tracking

### **Priority 2: Performance**
1. **Mob AI Optimization**:
   - Implement spatial hashing for proximity checks
   - Reduce O(n²) loops to O(n log n) or O(n)
   
2. **Memory Management**:
   - Review texture disposal in MobManager
   - Ensure proper cleanup on unmount

3. **useFrame Optimization**:
   - Batch state updates where possible
   - Use Three.js object pooling for temp objects

### **Priority 3: Code Quality**
1. Fix all useEffect dependency warnings
2. Extract repeated maze generation logic
3. Add JSDoc comments to complex functions

---

## 🔍 DETAILED ANALYSIS

### **Loop Complexity Audit**

| File | Location | Type | Complexity | Issue |
|---|---|---|---|---|
| MobManager | Line 488-600 | Mob update | O(n²) | Nested loops for infection spread |
| MobManager | Line 431-446 | Spawn logic | O(n×m) | Grid scan for dead ends |
| InstancedWalls | Line 212-257 | Render | O(n) | **GOOD** - Single pass |
| NeonCity | Line 127-172 | Instance build | O(n) | **GOOD** - Optimized |

### **State Management Review**

| Component | useState Count | Performance Impact |
|---|---|---|
| MobManager | 7 textures + mobs | 🟡 Medium (texture loading) |
| MazeRenderer | 2 states | 🟢 Low |
| LootManager | 1 state | 🟢 Low |
| DataNode | 4 states | 🟢 Low (per node) |

---

## ✅ WHAT'S ALREADY OPTIMIZED

✅ **InstancedMesh Usage**: Excellent use throughout (walls, floors, mobs)  
✅ **Memoization**: useMemo for expensive calculations  
✅ **Refs for Fast State**: fastStateRef pattern for 60fps data  
✅ **Texture Caching**: Proper texture reuse  
✅ **Frustum Culling**: Enabled where appropriate  

---

## 🎯 RECOMMENDED FIXES

### **Immediate (Before Deployment)**

1. **Fix RunTracker Damage Tracking**
```javascript
// Add to RunTracker
const prevHpRef = useRef(playerState.kernel);

useEffect(() => {
    const currentHp = playerState.kernel;
    const prevHp = prevHpRef.current;
    
    if (currentHp < prevHp) {
        const damage = prevHp - currentHp;
        setGameState(prev => ({
            ...prev,
            totalDamageTaken: prev.totalDamageTaken + damage
        }));
    }
    
    prevHpRef.current = currentHp;
}, [playerState.kernel, setGameState]);
```

2. **Fix useEffect Dependencies**
   - Add exhaustive-deps rule
   - Fix all warnings

### **Short Term (Post-Launch)**

1. **Optimize Mob AI Loops**
   - Implement spatial grid for proximity checks
   - Cache frequently accessed values

2. **Code Cleanup**
   - Extract maze generation helpers
   - Document complex algorithms

### **Long Term**

1. **Performance Monitoring**
   - Add FPS counter (dev mode)
   - Profile mob AI performance with 50+ mobs

2. **Advanced Optimizations**
   - Consider web workers for maze generation
   - Implement LOD for distant mobs

---

## 📋 SUMMARY

### **Issues Found**: 8 total
- 🔴 Critical: 1 (RunTracker damage tracking)
- 🟡 Medium: 3 (useEffect deps, nested loops, cleanup)
- 🟢 Low: 4 (code smells, TODOs)

### **Overall Code Quality**: ⭐⭐⭐⭐☆ (4/5)

**Strengths**:
- Excellent use of Three.js instancing
- Good performance patterns (refs, memoization)
- Clean component structure

**Weaknesses**:
- Missing damage tracking implementation
- Some O(n²) loops in hot paths
- React Hook dependency issues

### **Deployment Recommendation**: 
✅ **PROCEED** after fixing RunTracker bug  
⚠️ Monitor performance with 30+ mobs on screen

---

**Generated**: 2026-02-02 12:58 MST  
**Reviewer**: Antigravity Code Analysis
