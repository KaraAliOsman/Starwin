import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Edges, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { ModuleScene, Scene3D, Solid3D } from "./Product3DScene";
import { solidToGeometry } from "./scene3dGeometry";
import {
  disposeFinishMaterials,
  finishGeometryMaterials,
  prepareFinishTextures,
} from "./finishMaterials3d";
import { solidMaterial, type MaterialMode } from "./materials3d";
import {
  explodeDistance,
  explodeLayer,
  moduleLeafPoses,
  MOTION_SECONDS,
  solidCenter,
  type LeafPoseState,
} from "./poses3d";
import {
  cameraShot,
  consumerCameraShot,
  poseMatrix,
  STUDIO_BACKGROUND,
  STUDIO_GROUND,
  STUDIO_LIGHTS,
  STUDIO_WALL,
  STUDIO_GUIDE,
  studioColor,
  studioEnvironment,
  wallBoxes,
  type CameraPreset,
} from "./studioRig3d";

function tokenColor(token: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || fallback;
}
function SolidMesh({
  solid,
  selected,
  theme,
  mode,
  clipPlane,
  consumer,
  onPick,
}: {
  solid: Solid3D;
  selected: boolean;
  /** Re-resolves token colors when the app theme switches — theme changes
   * flip CSS variables without otherwise re-rendering this subtree. */
  theme: string;
  mode: MaterialMode;
  clipPlane: THREE.Plane | null;
  consumer: boolean;
  onPick(owner: string): void;
}): JSX.Element {
  const geometry = useMemo(
    () => (solid.kind === "box"
      ? consumer && solid.surface !== "glass"
        ? new RoundedBoxGeometry(...solid.size, 3, Math.min(3, ...solid.size.map(v => v / 4)))
        : new THREE.BoxGeometry(...solid.size)
      : solidToGeometry(solid)),
    [solid, consumer],
  );
  const [textureEpoch, setTextureEpoch] = useState(0);
  useEffect(() => {
    let alive = true;
    if (solid.finish)
      void prepareFinishTextures(solid.finish).then(() => {
        if (alive) setTextureEpoch((value) => value + 1);
      });
    return () => {
      alive = false;
    };
  }, [solid.finish]);
  const faceMaterials = useMemo(
    () => {
      const materials = geometry && solid.finish && mode === "commercial"
        ? finishGeometryMaterials(geometry, solid.finish) : null;
      // A restrained satin response reveals the profile depth at mobile
      // scale, without changing the selected finish's linear colour.
      if (consumer) for (const material of materials ?? []) {
        material.roughness = Math.min(.56, Math.max(.4, material.roughness));
        material.envMapIntensity = .75;
      }
      return materials;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loaded texture becomes available
    [geometry, solid.finish, mode, textureEpoch, consumer],
  );
  useEffect(
    () => () => {
      if (faceMaterials) disposeFinishMaterials(faceMaterials);
    },
    [faceMaterials],
  );
  useEffect(() => {
    for (const item of faceMaterials ?? []) {
      item.clippingPlanes = clipPlane ? [clipPlane] : [];
      item.needsUpdate = true;
    }
  }, [faceMaterials, clipPlane]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- theme re-resolves
  // the same tokens against the new CSS variable values.
  const material = useMemo(() => solidMaterial(solid, mode), [solid, mode]);
  const color = useMemo(
    () =>
      solid.hardwareColor && mode === "commercial"
        ? new THREE.Color().setRGB(
            ...(solid.hardwareColor.linear_rgb.map(Number) as [number, number, number]),
            THREE.LinearSRGBColorSpace,
          )
        : tokenColor(material.colorToken, material.colorFallback),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [solid.hardwareColor, mode, material, theme],
  );
  // BufferGeometry passed to <mesh geometry> is not auto-disposed by r3f —
  // every edit regenerates solids, so the replaced geometry must be freed
  // or GPU memory grows monotonically through a session.
  useEffect(() => {
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);
  return (
    <mesh
      castShadow={consumer && !material.glass}
      receiveShadow={consumer && !material.glass}
      geometry={geometry ?? undefined}
      position={solid.kind === "box" ? solid.center : undefined}
      onClick={(event) => {
        event.stopPropagation();
        onPick(solid.owner);
      }}
    >
      {faceMaterials ? (
        <primitive attach="material" object={faceMaterials} dispose={null} />
      ) : consumer && material.glass ? (
        <meshPhysicalMaterial color="#9bb9c9" transparent opacity={.46}
          roughness={.16} metalness={0} clearcoat={.35} clearcoatRoughness={.12}
          envMapIntensity={.65} depthWrite={false} clippingPlanes={clipPlane ? [clipPlane] : []}/>
      ) : (
        <meshStandardMaterial
          color={color}
          transparent={material.transparent}
          opacity={material.opacity}
          depthWrite={!material.glass}
          roughness={consumer && solid.surface === "handle" ? .42 : material.roughness}
          metalness={consumer && solid.surface === "handle" ? .3 : material.metalness}
          // An empty array — never undefined: r3f applies this prop onto
          // material.clippingPlanes and three's WebGLClipping crashes on a
          // missing .length, leaving the whole canvas blank once Corte was
          // toggled off.
          clippingPlanes={clipPlane ? [clipPlane] : []}
        />
      )}
      {/* The office/technical view marks approximate members with edges.
       * The consumer preview uses the same undeclared neutral geometry
       * with satin surfaces; finish colour never changes dimensions. */}
      {(selected || (!consumer && solid.approximate === true) || mode === "technical") &&
        (solid.kind === "box" || solid.kind === "profile") && (
          <Edges
            scale={1.002}
            color={
              selected ? tokenColor("--theme-accent", "teal") : tokenColor("--model3d-edge", "gray")
            }
          />
        )}
    </mesh>
  );
}

function ModuleContent({
  module,
  states,
  explode,
  renderSolid,
}: {
  module: ModuleScene;
  states: Record<string, LeafPoseState>;
  explode: boolean;
  renderSolid(solid: Solid3D, key: string): JSX.Element;
}): JSX.Element {
  const groups = useRef(new Map<string, THREE.Group>());
  const layerGroups = useRef(new Map<string, THREE.Group>());
  const progress = useRef<Record<string, LeafPoseState>>({});
  const previous = useRef<Record<string, LeafPoseState>>({});
  const elapsed = useRef(MOTION_SECONDS);
  const exploded = useRef(0),
    explodeFrom = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  const reduced = useRef(false);
  const guideGeometry = useMemo(() => {
    const representatives = new Map<string, Solid3D>();
    for (const solid of module.solids) {
      const layer = explodeLayer(solid);
      if (layer) representatives.set(`${solid.leafId ?? "fixed"}/${layer}`, solid);
    }
    const origins = [...representatives.values()].map((solid) => ({
      center: solidCenter(solid),
      layer: explodeLayer(solid),
    }));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        origins.flatMap((o) => [...o.center, ...o.center]),
        3,
      ),
    );
    return { geometry, origins };
  }, [module]);
  useEffect(() => () => guideGeometry.geometry.dispose(), [guideGeometry]);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = query.matches;
    const changed = () => {
      reduced.current = query.matches;
      invalidate();
    };
    query.addEventListener("change", changed);
    return () => query.removeEventListener("change", changed);
  }, [invalidate]);
  useEffect(() => {
    previous.current = { ...progress.current };
    explodeFrom.current = exploded.current;
    elapsed.current = 0;
    invalidate();
  }, [states, explode, module, invalidate]);
  useFrame((_, delta) => {
    if (elapsed.current >= MOTION_SECONDS) return;
    elapsed.current = reduced.current
      ? MOTION_SECONDS
      : Math.min(MOTION_SECONDS, elapsed.current + delta);
    const t = elapsed.current / MOTION_SECONDS;
    const ease = (v: number) => 1 - (1 - v) ** 3;
    for (const leaf of module.leaves) {
      const from = previous.current[leaf.leafId] ?? { amount: 0, mode: "open" };
      const to = states[leaf.leafId] ?? { amount: 0, mode: "open" };
      const switchPivot = from.mode !== to.mode && from.amount > 0 && to.amount > 0;
      progress.current[leaf.leafId] = switchPivot
        ? t < 0.5
          ? { amount: from.amount * (1 - ease(t * 2)), mode: from.mode }
          : { amount: to.amount * ease((t - 0.5) * 2), mode: to.mode }
        : { amount: from.amount + (to.amount - from.amount) * ease(t), mode: to.mode };
    }
    const poses = moduleLeafPoses(module, explode ? {} : progress.current);
    for (const [id, group] of groups.current) {
      const pose = poses[id];
      group.matrix.copy(pose ? poseMatrix(pose) : new THREE.Matrix4());
      group.matrixWorldNeedsUpdate = true;
    }
    exploded.current = explodeFrom.current + ((explode ? 1 : 0) - explodeFrom.current) * ease(t);
    const distance = explodeDistance(module.depth) * exploded.current;
    for (const [key, group] of layerGroups.current)
      group.position.z = Number(key.slice(key.lastIndexOf("/") + 1)) * distance;
    const positions = guideGeometry.geometry.getAttribute("position");
    guideGeometry.origins.forEach((origin, index) =>
      positions.setXYZ(
        index * 2 + 1,
        origin.center[0],
        origin.center[1],
        origin.center[2] + origin.layer * distance,
      ),
    );
    positions.needsUpdate = true;
    guideGeometry.geometry.computeBoundingSphere();
    if (t < 1) invalidate();
  });
  const layers = (leafId?: string): JSX.Element[] =>
    [0, 1, 2, 3].map((layer) => {
      const key = `${leafId ?? "fixed"}/${layer}`;
      return (
        <group
          key={key}
          ref={(group) => {
            if (group) layerGroups.current.set(key, group);
            else layerGroups.current.delete(key);
          }}
        >
          {module.solids
            .filter((s) => s.leafId === leafId && explodeLayer(s) === layer)
            .map((s, i) => renderSolid(s, `${key}/${i}`))}
        </group>
      );
    });
  return (
    <group position={module.position} rotation={[0, module.rotationY, 0]}>
      {module.leaves.map((leaf) => (
        <group
          key={leaf.leafId}
          matrixAutoUpdate={false}
          ref={(group) => {
            if (group) groups.current.set(leaf.leafId, group);
            else groups.current.delete(leaf.leafId);
          }}
        >
          {layers(leaf.leafId)}
        </group>
      ))}
      {layers()}
      {explode && (
        <lineSegments geometry={guideGeometry.geometry}>
          <lineBasicMaterial color={studioColor(STUDIO_GUIDE)} />
        </lineSegments>
      )}
    </group>
  );
}

function CameraRig({
  scene,
  preset,
  explode,
  states,
  onExport,
  onError,
  consumer,
}: {
  scene: Scene3D;
  preset: CameraPreset;
  explode: boolean;
  states: Record<string, Record<string, LeafPoseState>>;
  onExport(capture: () => string): void;
  onError(): void;
  consumer: boolean;
}): null {
  const camera = useThree((s) => s.camera),
    controls = useThree((s) => s.controls) as unknown as {
      target: THREE.Vector3;
      update(): void;
    } | null;
  const size = useThree((s) => s.size),
    gl = useThree((s) => s.gl),
    world = useThree((s) => s.scene),
    invalidate = useThree((s) => s.invalidate);
  const latestStates = useRef(states);
  latestStates.current = states;
  useEffect(() => {
    // Keep the lower interaction hint clear of the frame and handle.
    const usableHeight = Math.max(size.height - 42, size.height * .7);
    const shot = consumer ? consumerCameraShot(scene, preset, size.width / Math.max(usableHeight, 1), latestStates.current) : cameraShot(
      scene,
      preset,
      size.width / Math.max(size.height, 1),
      explode,
      latestStates.current,
    );
    camera.position.set(...shot.position);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = shot.fov;
      if (consumer) {
        const target = new THREE.Vector3(...shot.target);
        camera.position.sub(target).multiplyScalar(size.height / usableHeight).add(target);
        camera.setViewOffset(size.width, size.height, 0, (size.height - usableHeight) / 2, size.width, size.height);
      } else camera.clearViewOffset();
    }
    camera.lookAt(...shot.target);
    camera.near = 1;
    camera.far = scene.radius * 30;
    camera.updateProjectionMatrix();
    controls?.target.set(...shot.target);
    controls?.update();
    invalidate();
  }, [scene, preset, explode, size.width, size.height, camera, controls, invalidate, consumer, consumer ? states : null]);
  useEffect(() => {
    onExport(() => {
      gl.render(world, camera);
      return gl.domElement.toDataURL("image/png");
    });
    const lost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    gl.domElement.addEventListener("webglcontextlost", lost);
    gl.domElement.tabIndex = 0;
    gl.domElement.setAttribute(
      "aria-label",
      "Vista 3D. Use flechas para desplazar y más o menos para ampliar.",
    );
    const key = (event: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "=", "-"].includes(event.key))
        return;
      event.preventDefault();
      const target = controls?.target ?? new THREE.Vector3();
      if (["+", "=", "-"].includes(event.key))
        camera.position
          .sub(target)
          .multiplyScalar(event.key === "-" ? 1.2 : 0.8)
          .add(target);
      else {
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
        const direction =
          event.key === "ArrowLeft"
            ? right.multiplyScalar(-1)
            : event.key === "ArrowRight"
              ? right
              : event.key === "ArrowDown"
                ? up.multiplyScalar(-1)
                : up;
        direction.multiplyScalar(camera.position.distanceTo(target) * 0.025);
        camera.position.add(direction);
        controls?.target.add(direction);
      }
      controls?.update();
      invalidate();
    };
    gl.domElement.addEventListener("keydown", key);
    return () => {
      gl.domElement.removeEventListener("webglcontextlost", lost);
      gl.domElement.removeEventListener("keydown", key);
    };
  }, [gl, world, camera, controls, invalidate, onExport, onError]);
  return null;
}

function Environment({ mode }: { mode: MaterialMode }): null {
  const gl = useThree((s) => s.gl),
    scene = useThree((s) => s.scene);
  useEffect(() => studioEnvironment(gl, scene, mode === "commercial"), [gl, scene, mode]);
  useEffect(() => {
    gl.localClippingEnabled = true;
    return () => {
      gl.localClippingEnabled = false;
    };
  }, [gl]);
  return null;
}

export function Model3DStage({
  scene,
  states,
  selection,
  theme,
  mode,
  preset,
  clip,
  explode,
  wall,
  onPick,
  onExport,
  onError,
  consumer = false,
  interactive = true,
}: {
  scene: Scene3D;
  states: Record<string, Record<string, LeafPoseState>>;
  selection: string | null;
  theme: string;
  mode: MaterialMode;
  preset: CameraPreset;
  clip: boolean;
  explode: boolean;
  wall: boolean;
  onPick(owner: string): void;
  onExport(capture: () => string): void;
  onError(): void;
  consumer?: boolean;
  interactive?: boolean;
}): JSX.Element {
  const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);
  const renderSolid = (solid: Solid3D, key: string) => (
    <SolidMesh
      key={key}
      solid={solid}
      selected={selection === solid.owner}
      theme={theme}
      mode={mode}
      clipPlane={clip ? clipPlane : null}
      consumer={consumer}
      onPick={onPick}
    />
  );
  return (
    <>
      <color attach="background" args={[consumer ? "#e5ebef" : studioColor(STUDIO_BACKGROUND)]} />
      <Environment mode={mode} />
      <ambientLight intensity={consumer ? .45 : mode === "commercial" ? 0.55 : 0.85} />
      {STUDIO_LIGHTS.map((light, index) => (
        <directionalLight
          key={index}
          castShadow={consumer && index === 0}
          shadow-mapSize={[1024,1024]}
          shadow-camera-left={-scene.radius * 1.6}
          shadow-camera-right={scene.radius * 1.6}
          shadow-camera-top={scene.radius * 1.6}
          shadow-camera-bottom={-scene.radius * 1.6}
          shadow-camera-near={1}
          shadow-camera-far={scene.radius * 30}
          shadow-bias={-.0002}
          shadow-normalBias={1}
          position={light.position}
          intensity={mode === "commercial" ? light.intensity : light.intensity * 0.7}
        />
      ))}
      <mesh
        receiveShadow={consumer}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, scene.bounds.min[1] - scene.center[1] - 2, 0]}
      >
        <planeGeometry args={[scene.radius * 5, scene.radius * 4]} />
        {consumer ? <shadowMaterial transparent opacity={.14}/> : <meshStandardMaterial color={studioColor(STUDIO_GROUND)} roughness={0.95} />}
      </mesh>
      <group position={scene.center.map((v) => -v) as [number, number, number]}>
        {scene.modules.map((module) => (
          <ModuleContent
            key={module.moduleId}
            module={module}
            states={states[module.moduleId] ?? EMPTY_STATES}
            explode={explode}
            renderSolid={renderSolid}
          />
        ))}
        {scene.couplers.map((solid, i) => renderSolid(solid, `coupler-${i}`))}
        {wall &&
          wallBoxes(scene).map((box, index) => (
            <mesh key={index} position={box.center}>
              <boxGeometry args={box.size} />
              <meshStandardMaterial color={studioColor(STUDIO_WALL)} roughness={0.92} />
            </mesh>
          ))}
      </group>
      <OrbitControls
        makeDefault
        enabled={interactive}
        enablePan={!consumer}
        enableDamping={false}
        minPolarAngle={consumer ? Math.PI * .2 : 0}
        maxPolarAngle={consumer ? Math.PI * .8 : Math.PI}
        minDistance={scene.radius * (consumer ? 1.25 : .12)}
        maxDistance={scene.radius * (consumer ? 7 : 12)}
      />
      <CameraRig
        scene={scene}
        preset={preset}
        explode={explode}
        states={states}
        onExport={onExport}
        onError={onError}
        consumer={consumer}
      />
    </>
  );
}
const EMPTY_STATES: Record<string, LeafPoseState> = {};
