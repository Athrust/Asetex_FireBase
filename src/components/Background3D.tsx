import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { Stars, RenderTexture, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ScrollShapes = () => {
  const groupRef = useRef<THREE.Group>(null);
  const scrollY = useRef(0);

  useFrame(() => {
    const targetScrollY = window.scrollY;
    scrollY.current += (targetScrollY - scrollY.current) * 0.05;

    if (groupRef.current) {
      groupRef.current.rotation.y = scrollY.current * 0.001;
      groupRef.current.rotation.x = scrollY.current * 0.0005;
      groupRef.current.position.y = scrollY.current * 0.005; 
    }
  });

  return (
    <group ref={groupRef}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50,
          ]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        >
          <octahedronGeometry args={[Math.random() * 0.5 + 0.1]} />
          <meshStandardMaterial 
            color="#f59e0b"
            transparent 
            opacity={Math.random() * 0.5 + 0.1}
            wireframe={Math.random() > 0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

// --- Custom Water Ripple Shader ---
const RippleMaterial = shaderMaterial(
  {
    tDiffuse: null,
    ripples: new Array(20).fill(new THREE.Vector3(0, 0, 0)), // x, y, age
    aspect: 1.0,
  },
  // Vertex Shader
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform sampler2D tDiffuse;
  uniform vec3 ripples[20];
  uniform float aspect;
  
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv;
    vec2 offset = vec2(0.0);
    
    for(int i = 0; i < 20; i++) {
      if(ripples[i].z > 0.0) {
        vec2 p1 = uv * vec2(aspect, 1.0);
        vec2 p2 = ripples[i].xy * vec2(aspect, 1.0);
        
        float dist = distance(p1, p2);
        float age = ripples[i].z; // 0 to 1
        float radius = age * 0.06; // Max radius (smaller)
        float strength = (1.0 - age) * 0.04; // Fade out strength
        
        // Create a wave crest
        float wave = sin((dist - radius) * 80.0);
        float mask = smoothstep(0.0, 0.03, radius - dist) * smoothstep(0.0, 0.03, dist);
        
        vec2 dir = normalize(uv - ripples[i].xy);
        offset += dir * wave * mask * strength;
      }
    }
    
    gl_FragColor = texture2D(tDiffuse, uv + offset);
  }
  `
);

extend({ RippleMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    rippleMaterial: any;
  }
}

const WaterEffect = () => {
  const materialRef = useRef<any>(null);
  const { viewport, size } = useThree();
  const ripples = useRef(new Array(20).fill(null).map(() => new THREE.Vector3(0, 0, 0)));
  const rippleIndex = useRef(0);
  const lastDrop = useRef(0);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastDrop.current > 20) { // faster spawning for smoother trails
        // Map pointer to UV coordinates (0 to 1)
        const uvX = e.clientX / window.innerWidth;
        const uvY = 1.0 - (e.clientY / window.innerHeight); // WebGL Y is inverted
        
        ripples.current[rippleIndex.current].set(uvX, uvY, 0.01);
        rippleIndex.current = (rippleIndex.current + 1) % 20;
        lastDrop.current = now;
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  useFrame((_, delta) => {
    if (materialRef.current) {
      // Update ripple ages
      for (let i = 0; i < 20; i++) {
        if (ripples.current[i].z > 0) {
          ripples.current[i].z += delta * 2.5; // Faster animation
          if (ripples.current[i].z > 1.0) ripples.current[i].z = 0; // Reset
        }
      }
      materialRef.current.ripples = ripples.current;
      materialRef.current.aspect = size.width / size.height;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <rippleMaterial ref={materialRef}>
        <RenderTexture attach="tDiffuse" frames={Infinity}>
          <color attach="background" args={['#06080a']} />
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#f59e0b" />
          <ScrollShapes />
        </RenderTexture>
      </rippleMaterial>
    </mesh>
  );
};

export const Background3D: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-matte-950">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <WaterEffect />
      </Canvas>
    </div>
  );
};
