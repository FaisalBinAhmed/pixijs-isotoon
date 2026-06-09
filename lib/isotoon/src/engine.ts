import { Application, Container } from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import type { MapFeatures } from './types'
import { renderGreens, renderWaters, renderRoads, renderBuildings, renderTrees } from './renderers'

export interface EngineOptions {
  canvas: HTMLCanvasElement
  width: number
  height: number
  scale?: number
  palette?: number[]
}

export class IsometricEngine {
  private app: Application
  private viewport!: Viewport
  private scale: number
  private options: EngineOptions
  private palette?: number[]
  private lastFeatures: MapFeatures | null = null
  private pendingFeatures: MapFeatures | null = null
  private initialized = false

  constructor(options: EngineOptions) {
    this.options = options
    this.app = new Application()
    this.scale = options.scale ?? 0.8
    this.palette = options.palette
  }

  setPalette(palette: number[]) {
    this.palette = palette
  }

  rerender() {
    if (this.lastFeatures) this.render(this.lastFeatures)
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

    this.viewport = new Viewport({
      screenWidth: this.options.width,
      screenHeight: this.options.height,
      events: this.app.renderer.events,
    })
    this.app.stage.addChild(this.viewport)
    this.viewport.drag().pinch().wheel().decelerate()
    this.viewport.position.set(this.options.width / 2, this.options.height / 2)
    this.initialized = true

    if (this.pendingFeatures) {
      const f = this.pendingFeatures
      this.pendingFeatures = null
      this.render(f)
    }
  }

  resetCamera() {
    if (!this.initialized) return
    this.viewport.position.set(this.options.width / 2, this.options.height / 2)
    this.viewport.scale.set(1, 1)
  }

  render(features: MapFeatures) {
    if (!this.initialized) {
      // Queue until init completes; the latest features win.
      this.pendingFeatures = features
      this.lastFeatures = features
      return
    }
    this.lastFeatures = features
    this.viewport.removeChildren()

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
    renderBuildings(features.buildings, layers.buildings, this.scale, this.palette)
    renderTrees(features.trees, layers.trees, this.scale)

    this.viewport.addChild(layers.water)
    this.viewport.addChild(layers.green)
    this.viewport.addChild(layers.roads)
    this.viewport.addChild(layers.buildings)
    this.viewport.addChild(layers.trees)
  }

  destroy() {
    if (!this.initialized) return
    this.app.destroy(true)
  }
}
