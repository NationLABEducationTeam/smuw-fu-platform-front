'use client'

import { Text3D, Center } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useMemo, useState, useEffect } from 'react'
import { useRef } from 'react'
import { Mesh, Color, MeshPhysicalMaterial, Group, Vector3 } from 'three'
import { useFrame, RootState } from '@react-three/fiber'
import { useTheme } from '@/lib/theme-provider'

function Logo3D() {
  const groupRef = useRef<Group>(null)
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'
  
  // 화면 크기에 따른 텍스트 크기 조절
  const textSize = window.innerWidth < 640 ? 1.5 : // mobile
                  window.innerWidth < 768 ? 1.8 : // tablet
                  2.0 // desktop

  // DEEP 위치 조정 - Vector3 사용
  const deepPosition = useMemo(() => 
    new Vector3(
      window.innerWidth < 640 ? -5 : 
      window.innerWidth < 768 ? -5.8 : 
      -6.5,
      0,
      0
    ),
    []
  )

  // BISTRO 위치 조정 - Vector3 사용
  const bistroPosition = useMemo(() => 
    new Vector3(
      window.innerWidth < 640 ? 0.3 : 
      window.innerWidth < 768 ? 0.4 : 
      0.5,
      0,
      0
    ),
    []
  )

  // DEEP 부분의 material
  const deepMaterial = useMemo(() => {
    return new MeshPhysicalMaterial({
      color: isDarkMode ? new Color("#2563") : new Color("#1c07fa"),
      emissive: isDarkMode ? new Color("#7DD3FC") : new Color("#1E40AF"),
      emissiveIntensity: isDarkMode ? 0.8 : 0.3,
      metalness: 0.9,
      roughness: 0.2,
      reflectivity: 0.8,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.95,
    })
  }, [isDarkMode])

  // BISTRO 부분의 material
  const bistroMaterial = useMemo(() => {
    return new MeshPhysicalMaterial({
      color: isDarkMode ? new Color("#FFFFFF") : new Color("#4B5563"),
      emissive: isDarkMode ? new Color("#F8FAFC") : new Color("#1F2937"),
      emissiveIntensity: isDarkMode ? 0.5 : 0.2,
      metalness: 0.9,
      roughness: 0.2,
      reflectivity: 0.8,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.95,
    })
  }, [isDarkMode])

  // 위치 업데이트를 위한 useEffect
  useEffect(() => {
    const handleResize = () => {
      if (groupRef.current) {
        // DEEP 위치 업데이트
        deepPosition.setX(
          window.innerWidth < 640 ? -5 :
          window.innerWidth < 768 ? -5.8 :
          -6.5
        )
        
        // BISTRO 위치 업데이트
        bistroPosition.setX(
          window.innerWidth < 640 ? 0.3 :
          window.innerWidth < 768 ? 0.4 :
          0.5
        )
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [deepPosition, bistroPosition])

  // 부드러운 움직임을 위한 최적화된 애니메이션
  useFrame((state: RootState) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.1
    }
  })

  return (
    <Center>
      <group ref={groupRef}>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={textSize}
          height={0.2}
          curveSegments={32}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelSegments={5}
          position={deepPosition}
          material={deepMaterial}
        >
          DEEP
        </Text3D>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={textSize}
          height={0.2}
          curveSegments={32}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelSegments={5}
          position={bistroPosition}
          material={bistroMaterial}
        >
          BISTRO
        </Text3D>
      </group>
    </Center>
  )
}

export default function Logo3DCanvas() {
  // 화면 크기에 따른 캔버스 높이 조절
  const [canvasHeight, setCanvasHeight] = useState('200px')

  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth < 640) {
        setCanvasHeight('150px') // mobile
      } else if (window.innerWidth < 768) {
        setCanvasHeight('200px') // tablet
      } else if (window.innerWidth < 1024) {
        setCanvasHeight('250px') // small desktop
      } else {
        setCanvasHeight('300px') // large desktop
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  return (
    <div style={{ height: canvasHeight }} className="w-full transition-all duration-300">
      <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse" />}>
        <Canvas 
          camera={{ position: [0, 0, 10], fov: 50 }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <spotLight
            position={[0, 5, 10]}
            angle={0.3}
            penumbra={1}
            intensity={2}
            castShadow
          />
          <Logo3D />
        </Canvas>
      </Suspense>
    </div>
  )
}

