import { useRef, useEffect } from 'react'
import { IsometricEngine, loadMapFeatures } from '../lib/isotoon/src'
import mapData from '../lib/isotoon/assets/maxvorstadt.json'
import './App.css'

const CENTER = { lat: 48.1475, lon: 11.565 }

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<IsometricEngine | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let destroyed = false

    const engine = new IsometricEngine({
      canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      scale: 0.8,
    })

    engineRef.current = engine

    engine.init().then(() => {
      if (destroyed) return
      const features = loadMapFeatures(mapData, CENTER)
      engine.render(features)
    })

    return () => {
      destroyed = true
      engine.destroy()
    }
  }, [])

  return <canvas ref={canvasRef} />
}
