import { ReactElement } from 'react'

interface Wireframe3DProps {
  type?: 'dome' | 'sphere' | 'grid'
  size?: number
  color?: 'primary' | 'secondary'
  animated?: boolean
}

export default function Wireframe3D({ 
  type = 'dome',
  size = 200,
  color = 'secondary',
  animated = true
}: Wireframe3DProps) {
  const colorClass = color === 'primary' ? 'var(--primary)' : 'var(--secondary)'
  
  const renderDome = () => {
    const latitudes = 12
    const longitudes = 24
    const paths: ReactElement[] = []
    
    for (let lat = 0; lat < latitudes / 2; lat++) {
      const y = (lat / (latitudes / 2)) * size
      const radius = Math.sin((lat / (latitudes / 2)) * Math.PI) * (size / 2)
      
      const points: string[] = []
      for (let lon = 0; lon <= longitudes; lon++) {
        const angle = (lon / longitudes) * Math.PI * 2
        const x = size / 2 + radius * Math.cos(angle)
        const z = size / 2 + radius * Math.sin(angle) * 0.5
        points.push(`${x},${size - y}`)
      }
      
      paths.push(
        <path
          key={`lat-${lat}`}
          d={`M ${points.join(' L ')}`}
          fill="none"
          stroke={colorClass}
          strokeWidth="1"
          opacity={0.6}
        />
      )
    }
    
    for (let lon = 0; lon < longitudes; lon += 2) {
      const points: string[] = []
      for (let lat = 0; lat <= latitudes / 2; lat++) {
        const angle = (lon / longitudes) * Math.PI * 2
        const y = (lat / (latitudes / 2)) * size
        const radius = Math.sin((lat / (latitudes / 2)) * Math.PI) * (size / 2)
        const x = size / 2 + radius * Math.cos(angle)
        points.push(`${x},${size - y}`)
      }
      
      paths.push(
        <path
          key={`lon-${lon}`}
          d={`M ${points.join(' L ')}`}
          fill="none"
          stroke={colorClass}
          strokeWidth="1"
          opacity={0.6}
        />
      )
    }
    
    return paths
  }
  
  const renderSphere = () => {
    const latitudes = 16
    const longitudes = 24
    const paths: ReactElement[] = []
    
    for (let lat = 0; lat < latitudes; lat++) {
      const points: string[] = []
      const theta = (lat / latitudes) * Math.PI
      const r = Math.sin(theta) * (size / 2)
      const y = size / 2 - Math.cos(theta) * (size / 2)
      
      for (let lon = 0; lon <= longitudes; lon++) {
        const phi = (lon / longitudes) * Math.PI * 2
        const x = size / 2 + r * Math.cos(phi)
        const z = size / 2 + r * Math.sin(phi) * 0.5
        points.push(`${x},${y}`)
      }
      
      paths.push(
        <path
          key={`lat-${lat}`}
          d={`M ${points.join(' L ')}`}
          fill="none"
          stroke={colorClass}
          strokeWidth="1"
          opacity={0.5}
        />
      )
    }
    
    return paths
  }
  
  const renderGrid = () => {
    const lines = 20
    const paths: ReactElement[] = []
    const perspective = 0.6
    
    for (let i = 0; i <= lines; i++) {
      const y = (i / lines) * size
      const offset = (y / size) * (size * perspective)
      
      paths.push(
        <line
          key={`h-${i}`}
          x1={offset / 2}
          y1={y}
          x2={size - offset / 2}
          y2={y}
          stroke={colorClass}
          strokeWidth="1"
          opacity={0.4 + (i / lines) * 0.4}
        />
      )
    }
    
    for (let i = 0; i <= lines; i++) {
      const x = (i / lines) * size
      const centerX = size / 2
      const offset = Math.abs(x - centerX) / centerX
      
      paths.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={0}
          x2={centerX + (x - centerX) * 0.3}
          y2={size}
          stroke={colorClass}
          strokeWidth="1"
          opacity={0.3 + (1 - offset) * 0.5}
        />
      )
    }
    
    return paths
  }
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`}
      className={animated ? 'wireframe-3d' : ''}
      style={{
        filter: `drop-shadow(0 0 10px ${colorClass})`
      }}
    >
      {type === 'dome' && renderDome()}
      {type === 'sphere' && renderSphere()}
      {type === 'grid' && renderGrid()}
    </svg>
  )
}
