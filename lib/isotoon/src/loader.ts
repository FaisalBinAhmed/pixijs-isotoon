import type { GeoPoint, MapFeatures, Building, Road, GreenArea, Tree, Point } from './types'
import { geoToWorld } from './projection'
import { parseColor, materialColor } from './colors'

interface OsmElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  nodes?: number[]
  tags?: Record<string, string>
}

interface OsmData {
  elements: OsmElement[]
}

export function loadMapFeatures(raw: OsmData, center: GeoPoint): MapFeatures {
  const nodeMap = new Map<number, GeoPoint>()

  for (const el of raw.elements) {
    if (el.type === 'node' && el.lat !== undefined && el.lon !== undefined) {
      nodeMap.set(el.id, { lat: el.lat, lon: el.lon })
    }
  }

  const buildings: Building[] = []
  const roads: Road[] = []
  const greens: GreenArea[] = []
  const trees: Tree[] = []

  for (const el of raw.elements) {
    if (el.type === 'node' && el.tags?.natural === 'tree') {
      trees.push({ position: geoToWorld({ lat: el.lat!, lon: el.lon! }, center) })
      continue
    }

    if (el.type !== 'way' || !el.tags || !el.nodes) continue

    const feature = classifyWay(el.tags)
    if (!feature) continue

    const polygon = resolveNodes(el.nodes, nodeMap, center)
    if (polygon.length < 2) continue

    switch (feature.kind) {
      case 'building':
        buildings.push({
          polygon,
          height: feature.height,
          color: feature.color,
          roofColor: feature.roofColor,
        })
        break
      case 'road':
        roads.push({ path: polygon, width: feature.width })
        break
      case 'green':
        greens.push({ polygon, color: feature.color })
        break
    }
  }

  return { buildings, roads, greens, waters: [], trees }
}

type ClassifiedFeature =
  | { kind: 'building'; height: number; color?: number; roofColor?: number }
  | { kind: 'road'; width: number }
  | { kind: 'green'; color?: number }

function classifyWay(tags: Record<string, string>): ClassifiedFeature | null {
  if (tags.building) {
    return {
      kind: 'building',
      height: parseBuildingHeight(tags),
      color: parseColor(tags['building:colour'] ?? tags['building:color'])
        ?? materialColor(tags['building:material']),
      roofColor: parseColor(tags['roof:colour'] ?? tags['roof:color'])
        ?? materialColor(tags['roof:material']),
    }
  }

  if (tags['building:part']) return null

  if (tags.highway) {
    return { kind: 'road', width: parseRoadWidth(tags.highway) }
  }

  switch (tags.landuse) {
    case 'grass':         return { kind: 'green', color: 0x81C784 }
    case 'meadow':        return { kind: 'green', color: 0xAED581 }
    case 'village_green': return { kind: 'green', color: 0x9CCC65 }
    case 'flowerbed':     return { kind: 'green', color: 0xC5E1A5 }
    case 'forest':        return { kind: 'green', color: 0x2E7D32 }
  }

  if (tags.leisure === 'park') return { kind: 'green', color: 0x66BB6A }

  return null
}

function resolveNodes(nodeIds: number[], nodeMap: Map<number, GeoPoint>, center: GeoPoint): Point[] {
  const points: Point[] = []
  for (const id of nodeIds) {
    const geo = nodeMap.get(id)
    if (geo) points.push(geoToWorld(geo, center))
  }
  return points
}

function parseRoadWidth(highway: string): number {
  switch (highway) {
    case 'motorway':
    case 'trunk': return 12
    case 'primary': return 10
    case 'secondary': return 8
    case 'tertiary': return 6
    case 'residential':
    case 'unclassified': return 5
    case 'service': return 3
    case 'footway':
    case 'cycleway':
    case 'path': return 2
    default: return 4
  }
}

function parseBuildingHeight(tags: Record<string, string>): number {
  const raw = tags['height'] ?? tags['building:height']
  if (raw) {
    const n = parseFloat(raw)
    if (!isNaN(n) && n > 0) return n
  }
  const levels = parseInt(tags['building:levels'] || '3', 10)
  return (isNaN(levels) ? 3 : levels) * 3
}
