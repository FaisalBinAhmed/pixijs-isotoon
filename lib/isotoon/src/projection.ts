import type { GeoPoint, Point } from './types'

const DEG_TO_RAD = Math.PI / 180
const METERS_PER_DEG_LAT = 111320

export function geoToWorld(geo: GeoPoint, center: GeoPoint): Point {
  const dx = (geo.lon - center.lon) * METERS_PER_DEG_LAT * Math.cos(center.lat * DEG_TO_RAD)
  const dy = (geo.lat - center.lat) * METERS_PER_DEG_LAT
  return { x: dx, y: -dy }
}

export function worldToIso(world: Point, scale: number): Point {
  return {
    x: (world.x - world.y) * scale,
    y: (world.x + world.y) * scale * 0.5,
  }
}

export function geoToIso(geo: GeoPoint, center: GeoPoint, scale: number): Point {
  return worldToIso(geoToWorld(geo, center), scale)
}
