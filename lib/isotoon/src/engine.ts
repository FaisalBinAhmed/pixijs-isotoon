import { Application, Container, Graphics } from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import type { Filter } from 'pixi.js'
import type { MapFeatures } from './types'
import { renderGreens, renderWaters, renderRoads, renderBuildings, renderTrees } from './renderers'

export interface EngineOptions {
  canvas: HTMLCanvasElement
  width: number
  height: number
  scale?: number
  palette?: number[]
  rendererType?: 'webgl' | 'canvas'
}

export class IsometricEngine {
  private app: Application
  private viewport!: Viewport
  private options: EngineOptions
  private palette?: number[]
  private lastFeatures: MapFeatures | null = null
  private pendingFeatures: MapFeatures | null = null
  private initialized = false

  constructor(options: EngineOptions) {
    this.options = options
    this.app = new Application()
    this.palette = options.palette
  }

  setPalette(palette: number[]) {
    this.palette = palette
  }

  setFilters(filters: Filter[]) {
    this.app.stage.filters = filters.length > 0 ? filters : []
  }

  rerender() {
    if (this.lastFeatures) this.render(this.lastFeatures)
  }

  async init() {
    await this.app.init({
      canvas: this.options.canvas,
      width: this.options.width,
      height: this.options.height,
      antialias: true,
      resolution: window.devicePixelRatio,
      autoDensity: true,
      preference: this.options.rendererType ?? 'webgl',
    })

    const bg = new Graphics()
    bg.rect(0, 0, this.options.width, this.options.height)
    bg.fill({ color: 0x263238 })
    this.app.stage.addChild(bg)

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

  render(features: MapFeatures) {
    if (!this.initialized) {
      // Queue until init completes; the latest features win.
      this.pendingFeatures = features
      this.lastFeatures = features
      return
    }
    this.lastFeatures = features
    const old = this.viewport.removeChildren()
    for (const child of old) child.destroy({ children: true })

    const layers = {
      water: new Container(),
      green: new Container(),
      roads: new Container(),
      buildings: new Container(),
      trees: new Container(),
    }

    renderWaters(features.waters, layers.water, 1)
    renderGreens(features.greens, layers.green, 1)
    renderRoads(features.roads, layers.roads, 1)
    renderBuildings(features.buildings, layers.buildings, 1, this.palette)
    renderTrees(features.trees, layers.trees, 1)

    this.viewport.addChild(layers.water)
    this.viewport.addChild(layers.green)
    this.viewport.addChild(layers.roads)
    this.viewport.addChild(layers.buildings)
    this.viewport.addChild(layers.trees)
  }

  get ticker() {
    return this.app.ticker
  }

  destroy() {
    if (!this.initialized) return
    this.app.destroy(true)
  }
}
