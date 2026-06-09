import { useRef, useEffect, useState } from 'react'
import { IsometricEngine, loadMapFeatures } from '../lib/isotoon/src'
import Sidebar, { MAPS, PALETTES, SIDEBAR_WIDTH, type MapId, type FilterId } from './Sidebar'
import { OldFilmFilter, AsciiFilter, CRTFilter, CrossHatchFilter, PixelateFilter, DotFilter } from 'pixi-filters'
import type { Filter, Ticker } from 'pixi.js'
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
  const [activeFilters, setActiveFilters] = useState<Set<FilterId>>(new Set())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new IsometricEngine({
      canvas,
      width: window.innerWidth - SIDEBAR_WIDTH,
      height: window.innerHeight,
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
  }, [mapId])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    const palette = PALETTES.find(p => p.name === paletteName)?.colors
    if (!palette) return
    engine.setPalette(palette)
    engine.rerender()
  }, [paletteName])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return

    const filters: Filter[] = []
    const tickerCallbacks: ((ticker: Ticker) => void)[] = []

    if (activeFilters.has('oldFilm')) {
      const film = new OldFilmFilter()
      filters.push(film)
      const cb = () => { film.seed = Math.random() }
      tickerCallbacks.push(cb)
      engine.ticker.add(cb)
    }

    if (activeFilters.has('ascii')) {
      filters.push(new AsciiFilter({ size: 16 }))
    }

    if (activeFilters.has('crt')) {
      filters.push(new CRTFilter())
    }

    if (activeFilters.has('crossHatch')) {
      filters.push(new CrossHatchFilter())
    }

    if (activeFilters.has('pixelate')) {
      filters.push(new PixelateFilter(4))
    }

    if (activeFilters.has('dot')) {
      filters.push(new DotFilter())
    }

    engine.setFilters(filters)

    return () => {
      for (const cb of tickerCallbacks) {
        engine.ticker.remove(cb)
      }
    }
  }, [activeFilters])

  const handleFilterToggle = (id: FilterId) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ width: `calc(100vw - ${SIDEBAR_WIDTH}px)`, height: '100vh', display: 'block' }} />
      <Sidebar
        mapId={mapId}
        onMapChange={setMapId}
        paletteName={paletteName}
        onPaletteChange={setPaletteName}
        activeFilters={activeFilters}
        onFilterToggle={handleFilterToggle}
      />
    </>
  )
}
