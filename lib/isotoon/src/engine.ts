import { Application, Container } from 'pixi.js'
import type { MapFeatures } from './types'
import { renderGreens, renderWaters, renderRoads, renderBuildings, renderTrees } from './renderers'

export interface EngineOptions {
  canvas: HTMLCanvasElement
  width: number
  height: number
  scale?: number
}

export class IsometricEngine {
  private app: Application
  private world: Container
  private scale: number
  private options: EngineOptions
  private dragging = false
  private lastPos = { x: 0, y: 0 }
  private initialized = false

  constructor(options: EngineOptions) {
    this.options = options
    this.app = new Application()
    this.world = new Container()
    this.scale = options.scale ?? 0.8
  }

  async init() {
    await this.app.init({
      canvas: this.options.canvas,
      width: this.options.width,
      height: this.options.height,
      background: 0x263238,
      antialias: true,
      resolution: window.devicePixelRatio,
      autoDensity: true,
    })

    this.app.stage.addChild(this.world)
    this.world.position.set(this.options.width / 2, this.options.height / 2)
    this.setupInteraction()
    this.initialized = true
  }

  render(features: MapFeatures) {
    this.world.removeChildren()

    const layers = {
      water: new Container(),
      green: new Container(),
      roads: new Container(),
      buildings: new Container(),
      trees: new Container(),
    }

    renderWaters(features.waters, layers.water, this.scale)
    renderGreens(features.greens, layers.green, this.scale)
    renderRoads(features.roads, layers.roads, this.scale)
    renderBuildings(features.buildings, layers.buildings, this.scale)
    renderTrees(features.trees, layers.trees, this.scale)

    this.world.addChild(layers.water)
    this.world.addChild(layers.green)
    this.world.addChild(layers.roads)
    this.world.addChild(layers.buildings)
    this.world.addChild(layers.trees)
  }

  destroy() {
    if (!this.initialized) return
    this.app.destroy(true)
  }

  private setupInteraction() {
    const canvas = this.options.canvas

    canvas.addEventListener('pointerdown', (e) => {
      this.dragging = true
      this.lastPos = { x: e.clientX, y: e.clientY }
    })

    canvas.addEventListener('pointermove', (e) => {
      if (!this.dragging) return
      const dx = e.clientX - this.lastPos.x
      const dy = e.clientY - this.lastPos.y
      this.world.position.x += dx
      this.world.position.y += dy
      this.lastPos = { x: e.clientX, y: e.clientY }
    })

    canvas.addEventListener('pointerup', () => { this.dragging = false })
    canvas.addEventListener('pointerleave', () => { this.dragging = false })

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault()
      const factor = e.deltaY > 0 ? 0.9 : 1.1
      this.world.scale.x *= factor
      this.world.scale.y *= factor
    }, { passive: false })
  }
}
