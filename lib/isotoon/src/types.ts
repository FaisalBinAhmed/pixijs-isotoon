export interface Point {
  x: number
  y: number
}

export interface GeoPoint {
  lat: number
  lon: number
}

export interface Building {
  polygon: Point[]
  height: number
}

export interface Road {
  path: Point[]
  width: number
}

export interface GreenArea {
  polygon: Point[]
}

export interface WaterBody {
  polygon: Point[]
}

export interface Tree {
  position: Point
}

export interface MapFeatures {
  buildings: Building[]
  roads: Road[]
  greens: GreenArea[]
  waters: WaterBody[]
  trees: Tree[]
}
