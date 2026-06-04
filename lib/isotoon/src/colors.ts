// OSM color parsing: hex (#RRGGBB / #RGB), named CSS colors, and a small set of
// common material names → plausible default tints.

const NAMED: Record<string, number> = {
  // Achromatic
  black: 0x000000, white: 0xFFFFFF,
  grey: 0x808080, gray: 0x808080,
  lightgrey: 0xD3D3D3, lightgray: 0xD3D3D3,
  darkgrey: 0xA9A9A9, darkgray: 0xA9A9A9,
  silver: 0xC0C0C0,
  // Reds / browns / earth
  red: 0xFF0000, darkred: 0x8B0000, maroon: 0x800000,
  brown: 0xA52A2A, darkbrown: 0x654321, lightbrown: 0xB5651D,
  beige: 0xF5F5DC, tan: 0xD2B48C, khaki: 0xF0E68C,
  salmon: 0xFA8072, darksalmon: 0xE9967A,
  orange: 0xFFA500, darkorange: 0xFF8C00,
  // Yellows
  yellow: 0xFFFF00, gold: 0xFFD700, cream: 0xFFFDD0,
  // Greens
  green: 0x008000, darkgreen: 0x006400, lightgreen: 0x90EE90,
  olive: 0x808000,
  // Blues / cyans
  blue: 0x0000FF, darkblue: 0x00008B, lightblue: 0xADD8E6,
  cyan: 0x00FFFF, navy: 0x000080,
  // Compound OSM-isms
  'yellow-brown': 0xB8860B,
  light_brown: 0xB5651D,
  light_grey: 0xD3D3D3,
  dark_grey: 0xA9A9A9,
  light_green: 0x90EE90,
  dark_green: 0x006400,
}

const MATERIAL: Record<string, number> = {
  glass: 0xA8C8E0,
  brick: 0xA0524D,
  stone: 0xC8C0B0,
  limestone: 0xC8C0B0,
  sandstone: 0xD8C9A0,
  marble: 0xE8E4DC,
  concrete: 0x9E9E9E,
  plaster: 0xE8DCC4,
  metal: 0x7D8D9E,
  wood: 0x8B6B47,
  tiles: 0xC97A52,
  slate: 0x4A5560,
}

export function parseColor(value: string | undefined): number | undefined {
  if (!value) return undefined
  const v = value.trim().toLowerCase()
  if (v.startsWith('#')) {
    const hex = v.slice(1)
    if (hex.length === 6) {
      const n = parseInt(hex, 16)
      return isNaN(n) ? undefined : n
    }
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16)
      const g = parseInt(hex[1] + hex[1], 16)
      const b = parseInt(hex[2] + hex[2], 16)
      if (isNaN(r) || isNaN(g) || isNaN(b)) return undefined
      return (r << 16) | (g << 8) | b
    }
    return undefined
  }
  return NAMED[v]
}

export function materialColor(value: string | undefined): number | undefined {
  if (!value) return undefined
  return MATERIAL[value.trim().toLowerCase()]
}
