import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function FloatingOrb({ position = [0, 0, 0], color = '#6c63ff', size = 1, speed = 1 }) {
  const mesh = useRef()
  const mat = useRef()

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const t = clock.getElapsedTime() * speed
    mesh.current.position.y = position[1] + Math.sin(t * 0.7) * 0.4
    mesh.current.position.x = position[0] + Math.cos(t * 0.5) * 0.2
    mesh.current.rotation.x = t * 0.3
    mesh.current.rotation.z = t * 0.2
    if (mat.current) {
      mat.current.emissiveIntensity = 0.4 + Math.sin(t) * 0.2
    }
  })

  return (
    <mesh ref={mesh} position={position}>
      <icosahedronGeometry args={[size, 1]} />
      <meshStandardMaterial
        ref={mat}
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        wireframe
        transparent
        opacity={0.35}
      />
    </mesh>
  )
}
