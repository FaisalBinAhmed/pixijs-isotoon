import { Graphics, Container } from 'pixi.js'
import type { Tree } from '../types'
import { worldToIso } from '../projection'

export function renderTrees(features: Tree[], container: Container, scale: number) {
  const sorted = [...features].sort((a, b) => {
    const aIso = worldToIso(a.position, scale)
    const bIso = worldToIso(b.position, scale)
    return aIso.y - bIso.y
  })

  for (const tree of sorted) {
    const g = new Graphics()
    const pos = worldToIso(tree.position, scale)
    const trunkH = 4 * scale
    const crownR = 3 * scale

    g.rect(pos.x - scale * 0.3, pos.y - trunkH, scale * 0.6, trunkH)
    g.fill({ color: 0x5D4037 })

    g.circle(pos.x, pos.y - trunkH - crownR * 0.5, crownR)
    g.fill({ color: 0x2E7D32 })

    container.addChild(g)
  }
}
