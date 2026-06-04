import { useRef, useEffect, useState } from 'react'
import { IsometricEngine, loadMapFeatures } from '../lib/isotoon/src'
import Sidebar, { MAPS, PALETTES, SIDEBAR_WIDTH, type MapId } from './Sidebar'
import maxvorstadt from '../assets/maxvorstadt.json'
import cityOfLondon from '../assets/city-of-london.json'
import './App.css'

const MAP_DATA: Record<MapId, unknown> = {
  'maxvorstadt': maxvorstadt,
  'city-of-london': cityOfLondon,
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<IsometricEngine | null>(null)
  const [mapId, setMapId] = useState<MapId>('maxvorstadt')
  const [paletteName, setPaletteName] = useState<string>(PALETTES[0].name)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new IsometricEngine({
      canvas,
      width: window.innerWidth - SIDEBAR_WIDTH,
      height: window.innerHeight,
      scale: 0.8,
      palette: PALETTES[0].colors,
    })

    engineRef.current = engine

    engine.init()

    return () => {
      engine.destroy()
      engineRef.current = null
    }

  }, [])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    const map = MAPS.find(m => m.id === mapId)
    if (!map) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine.render(loadMapFeatures(MAP_DATA[mapId] as any, map.center))
    engine.resetCamera()
  }, [mapId])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    const palette = PALETTES.find(p => p.name === paletteName)?.colors
    if (!palette) return
    engine.setPalette(palette)
    engine.rerender()
  }, [paletteName])

  return (
    <>
      <canvas ref={canvasRef} style={{ width: `calc(100vw - ${SIDEBAR_WIDTH}px)`, height: '100vh', display: 'block' }} />
      <Sidebar
        mapId={mapId}
        onMapChange={setMapId}
        paletteName={paletteName}
        onPaletteChange={setPaletteName}
      />
    </>
  )
}
