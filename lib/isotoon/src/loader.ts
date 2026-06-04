import type { GeoPoint, MapFeatures, Building, Road, GreenArea, Tree, Point } from './types'
import { geoToWorld } from './projection'

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

    const polygon = resolveNodes(el.nodes, nodeMap, center)
    if (polygon.length < 2) continue

    if (el.tags.building) {
      const levels = parseInt(el.tags['building:levels'] || '3', 10)
      buildings.push({ polygon, height: levels * 3 })
    } else if (el.tags.highway) {
      const width = parseRoadWidth(el.tags.highway)
      roads.push({ path: polygon, width })
    } else if (el.tags.landuse === 'grass' || el.tags.leisure === 'park') {
      greens.push({ polygon })
    }
  }

  return { buildings, roads, greens, waters: [], trees }
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
