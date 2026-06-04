import { Graphics, Container } from 'pixi.js'
import type { WaterBody, Point } from '../types'
import { worldToIso } from '../projection'

export function renderWaters(features: WaterBody[], container: Container, scale: number) {
  for (const body of features) {
    const g = new Graphics()
    const iso = body.polygon.map(p => worldToIso(p, scale))
    drawPolygon(g, iso, 0x2196F3)
    container.addChild(g)
  }
}

function drawPolygon(g: Graphics, points: Point[], color: number) {
  if (points.length < 3) return
  g.poly(points.flatMap(p => [p.x, p.y]))
  g.fill({ color, alpha: 0.8 })
}
