import type { CSSProperties } from 'react'

export type MapId = 'maxvorstadt' | 'city-of-london'

export interface MapOption {
  id: MapId
  label: string
  center: { lat: number; lon: number }
}

export const MAPS: MapOption[] = [
  { id: 'maxvorstadt',    label: 'Maxvorstadt',     center: { lat: 48.1475, lon: 11.5650 } },
  { id: 'city-of-london', label: 'City of London',  center: { lat: 51.5135, lon: -0.0890 } },
]

export interface Palette {
  name: string
  colors: number[]
}

export const PALETTES: Palette[] = [
  { name: 'Pastel',     colors: [0xE57373, 0xFFB74D, 0xFFF176, 0x81C784, 0x64B5F6, 0xBA68C8, 0xF06292, 0x4FC3F7] },
  { name: 'Mono Slate', colors: [0x90A4AE, 0xB0BEC5, 0x78909C, 0xCFD8DC, 0x607D8B] },
//   { name: 'Sunset',     colors: [0xFF7043, 0xFFA726, 0xFFCA28, 0xFF8A65, 0xF06292] },
//   { name: 'Forest',     colors: [0x66BB6A, 0x4CAF50, 0x81C784, 0xA5D6A7, 0x2E7D32] },
//   { name: 'Cyberpunk',  colors: [0xF92672, 0xAE81FF, 0x66D9EF, 0xA6E22E, 0xFD971F] },
]

export type FilterId = 'oldFilm' | 'ascii' | 'crt' | 'crossHatch' | 'pixelate' | 'dot' | 'glow'

export interface FilterOption {
  id: FilterId
  label: string
}

export const FILTERS: FilterOption[] = [
  { id: 'oldFilm', label: 'Old Film' },
  { id: 'ascii', label: 'ASCII' },
  { id: 'crt', label: 'CRT' },
  { id: 'crossHatch', label: 'Cross Hatch' },
  { id: 'pixelate', label: 'Pixelate' },
  { id: 'dot', label: 'Dot' },
]

interface Props {
  mapId: MapId
  onMapChange: (id: MapId) => void
  paletteName: string
  onPaletteChange: (name: string) => void
  activeFilters: Set<FilterId>
  onFilterToggle: (id: FilterId) => void
}

export default function Sidebar({ mapId, onMapChange, paletteName, onPaletteChange, activeFilters, onFilterToggle }: Props) {
  return (
    <aside style={styles.panel}>
      <h2 style={styles.title}>Settings</h2>

      <section style={styles.section}>
        <label style={styles.label}>Map</label>
        <select
          value={mapId}
          onChange={e => onMapChange(e.target.value as MapId)}
          style={styles.select}
        >
          {MAPS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </section>

      <section style={styles.section}>
        <label style={styles.label}>Building Palette</label>
        <div style={styles.palettes}>
          {PALETTES.map(p => {
            const active = p.name === paletteName
            return (
              <button
                key={p.name}
                onClick={() => onPaletteChange(p.name)}
                style={{
                  ...styles.paletteBtn,
                  borderColor: active ? '#fff' : '#455A64',
                  background: active ? '#37474F' : '#263238',
                }}
              >
                <span style={styles.paletteName}>{p.name}</span>
                <span style={styles.swatches}>
                  {p.colors.map((c, i) => (
                    <span
                      key={i}
                      style={{
                        ...styles.swatch,
                        background: `#${c.toString(16).padStart(6, '0')}`,
                      }}
                    />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section style={styles.section}>
        <label style={styles.label}>Filters</label>
        <div style={styles.filters}>
          {FILTERS.map(f => (
            <label key={f.id} style={styles.filterRow}>
              <input
                type="checkbox"
                checked={activeFilters.has(f.id)}
                onChange={() => onFilterToggle(f.id)}
                style={styles.checkbox}
              />
              <span>{f.label}</span>
            </label>
          ))}
        </div>
      </section>
    </aside>
  )
}

export const SIDEBAR_WIDTH = 280

const styles: Record<string, CSSProperties> = {
  panel: {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    width: SIDEBAR_WIDTH,
    background: 'rgba(20, 26, 32, 0.92)',
    color: '#eceff1',
    padding: '20px 18px',
    boxSizing: 'border-box',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 14,
    backdropFilter: 'blur(6px)',
    borderLeft: '1px solid #37474F',
    overflowY: 'auto',
    zIndex: 10,
  },
  title: { fontSize: 16, marginBottom: 16, fontWeight: 600 },
  section: { marginBottom: 20 },
  label: {
    display: 'block',
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  select: {
    width: '100%',
    padding: '8px 10px',
    background: '#263238',
    color: '#eceff1',
    border: '1px solid #455A64',
    borderRadius: 4,
    fontSize: 14,
  },
  palettes: { display: 'flex', flexDirection: 'column', gap: 6 },
  paletteBtn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    alignItems: 'flex-start',
    padding: '8px 10px',
    border: '1px solid',
    borderRadius: 4,
    cursor: 'pointer',
    color: '#eceff1',
    textAlign: 'left',
  },
  paletteName: { fontSize: 12 },
  swatches: { display: 'flex', gap: 3 },
  swatch: {
    width: 22,
    height: 14,
    borderRadius: 2,
    border: '1px solid rgba(0,0,0,0.3)',
  },
  filters: { display: 'flex', flexDirection: 'column', gap: 8 },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    fontSize: 13,
  },
  checkbox: { cursor: 'pointer' },
}
