import { Graphics, Container } from 'pixi.js'
import type { GreenArea, Point } from '../types'
import { worldToIso } from '../projection'

export function renderGreens(features: GreenArea[], container: Container, scale: number) {
  for (const area of features) {
    const g = new Graphics()
    const iso = area.polygon.map(p => worldToIso(p, scale))
    drawPolygon(g, iso, 0x4CAF50)
    container.addChild(g)
  }
}

function drawPolygon(g: Graphics, points: Point[], color: number) {
  if (points.length < 3) return
  g.poly(points.flatMap(p => [p.x, p.y]))
  g.fill({ color, alpha: 0.9 })
}
