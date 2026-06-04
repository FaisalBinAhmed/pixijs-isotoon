import { Graphics, Container } from 'pixi.js'
import type { Road } from '../types'
import { worldToIso } from '../projection'

export function renderRoads(features: Road[], container: Container, scale: number) {
  for (const road of features) {
    const g = new Graphics()
    const iso = road.path.map(p => worldToIso(p, scale))
    // must have 2 points
    if (iso.length < 2) continue

    g.moveTo(iso[0].x, iso[0].y)
    for (let i = 1; i < iso.length; i++) {
      g.lineTo(iso[i].x, iso[i].y)
    }
    g.stroke({ width: road.width * scale * 0.7, color: 0x616161, alpha: 0.9 })

    container.addChild(g)
  }
}
