import { Graphics, Container } from 'pixi.js'
import type { Building, Point } from '../types'
import { worldToIso } from '../projection'

const DEFAULT_PALETTE = [0xE57373, 0xFFB74D, 0xFFF176, 0x81C784, 0x64B5F6, 0xBA68C8, 0xF06292, 0x4FC3F7]

export function renderBuildings(
  features: Building[],
  container: Container,
  scale: number,
  palette: number[] = DEFAULT_PALETTE,
) {
  const colors = palette.length > 0 ? palette : DEFAULT_PALETTE
  const sorted = [...features].sort((a, b) => {
    const aY = avgIsoY(a.polygon, scale)
    const bY = avgIsoY(b.polygon, scale)
    return aY - bY
  })

  for (let i = 0; i < sorted.length; i++) {
    const building = sorted[i]
    const g = new Graphics()
    const fallback = colors[i % colors.length]
    const wallColor = building.color ?? fallback
    const roofColor = building.roofColor ?? wallColor
    drawBuilding(g, building, scale, wallColor, roofColor)
    container.addChild(g)
  }
}

type Wall = {
  quad: Point[]
  depth: number
  color: number
}

function drawBuilding(g: Graphics, building: Building, scale: number, wallColor: number, roofColor: number) {
  const base = building.polygon.map(p => worldToIso(p, scale))
  const heightOffset = building.height * scale * 0.5

  const top = base.map(p => ({ x: p.x, y: p.y - heightOffset }))

  const walls: Wall[] = []

  for (let i = 0; i < base.length - 1; i++) {
    const a = base[i]
    const b = base[i + 1]
    const quad = [a, b, top[i + 1], top[i]]
    const depth = Math.max(a.y, b.y)
    walls.push({ quad, depth, color: sideShade(wallColor, a, b) })
  }

  // Painter's algo: draw fartheest to closest
  walls.sort((w1, w2) => w1.depth - w2.depth)
  for (const w of walls) drawFace(g, w.quad, w.color)

  drawFace(g, top, roofColor)
}

// left and front facing wall colors
function sideShade(color: number, a: Point, b: Point): number {
  const dx = b.x - a.x
  return dx >= 0 ? darken(color, 0.85) : darken(color, 0.7)
}

function drawFace(g: Graphics, points: Point[], color: number) {
// must have at least 3 points to form a face
  if (points.length < 3) return
  g.poly(points.flatMap(p => [p.x, p.y]))
  g.fill({ color })
  g.stroke({ width: 0.5, color: 0x333333, alpha: 0.3 })
}

function darken(color: number, factor: number): number {
  const r = Math.floor(((color >> 16) & 0xFF) * factor)
  const g = Math.floor(((color >> 8) & 0xFF) * factor)
  const b = Math.floor((color & 0xFF) * factor)
  return (r << 16) | (g << 8) | b
}

function avgIsoY(polygon: Point[], scale: number): number {
  let sum = 0
  for (const p of polygon) {
    const iso = worldToIso(p, scale)
    sum += iso.y
  }
  return sum / polygon.length
}
