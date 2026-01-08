import { useEffect, useState, useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import { BooksByState, BannedBook } from '../types'

interface StateOverlayProps {
  booksByState: BooksByState
  onStateClick: (stateName: string, books: BannedBook[]) => void
}

// normalize state names for matching
function normalizeStateName(name: string): string {
  return name.trim()
}

// get heatmap color based on book count
function getHeatmapColor(count: number, maxCount: number): string {
  if (count === 0) return '#e0e0e0' // Gray for no books
  
  const intensity = Math.min(count / Math.max(maxCount, 1), 1)
  
  // Color gradient: light red -> medium red -> dark red
  // Light red: rgb(255, 200, 200)
  // Medium red: rgb(255, 100, 100)
  // Dark red: rgb(180, 0, 0)
  
  if (intensity < 0.33) {
    const t = intensity / 0.33
    const r = Math.floor(255)
    const g = Math.floor(200 - 50 * t)
    const b = Math.floor(200 - 50 * t)
    return `rgb(${r}, ${g}, ${b})`
  } else if (intensity < 0.66) {
    const t = (intensity - 0.33) / 0.33
    const r = Math.floor(255)
    const g = Math.floor(150 - 50 * t)
    const b = Math.floor(150 - 50 * t)
    return `rgb(${r}, ${g}, ${b})`
  } else {
    const t = (intensity - 0.66) / 0.34
    const r = Math.floor(255 - 75 * t)
    const g = Math.floor(100 - 100 * t)
    const b = Math.floor(100 - 100 * t)
    return `rgb(${r}, ${g}, ${b})`
  }
}

function StateOverlay({ booksByState, onStateClick }: StateOverlayProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null)

  useEffect(() => {
    // Fetch US states GeoJSON
    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
      .then((response) => response.json())
      .then((data) => setGeoJsonData(data))
      .catch((error) => console.error('Error loading GeoJSON:', error))
  }, [])

  const maxBookCount = useMemo(() => {
    const counts = Object.values(booksByState).map(books => books.length)
    return Math.max(...counts, 1)
  }, [booksByState])

  const overlayKey = useMemo(() => {
    return JSON.stringify(Object.keys(booksByState).sort()) + '_' + 
           Object.values(booksByState).reduce((sum, books) => sum + books.length, 0)
  }, [booksByState])

  if (!geoJsonData) return null

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const stateName = normalizeStateName(feature.properties.name)
    const getStateBooks = () => booksByState[stateName] || []
    
    const getStyle = () => {
      const stateBooks = getStateBooks()
      const bookCount = stateBooks.length
      const fillColor = bookCount > 0 
        ? getHeatmapColor(bookCount, maxBookCount)
        : '#e0e0e0'
      return {
        fillColor: fillColor,
        fillOpacity: 0.6,
        color: '#333',
        weight: 1,
        opacity: 0.8
      }
    }
    
    layer.on({
      mouseover: (e) => {
        const stateBooks = getStateBooks()
        const hasBooks = stateBooks.length > 0
        const currentStyle = getStyle()
        const layer = e.target
        layer.setStyle({
          fillColor: currentStyle.fillColor,
          fillOpacity: 0.8,
          color: currentStyle.color,
          weight: 2,
          opacity: currentStyle.opacity
        })
        layer.bindPopup(
          hasBooks 
            ? `${stateName}: ${stateBooks.length} banned book${stateBooks.length !== 1 ? 's' : ''}`
            : `${stateName}: No banned books`
        ).openPopup()
      },
      mouseout: (e) => {
        const layer = e.target
        layer.setStyle(getStyle())
        layer.closePopup()
      },
      click: () => {
        const stateBooks = getStateBooks()
        if (stateBooks.length > 0) {
          onStateClick(stateName, stateBooks)
        }
      }
    })
  }

  const style = (feature: any) => {
    const stateName = normalizeStateName(feature.properties.name)
    const stateBooks = booksByState[stateName] || []
    const bookCount = stateBooks.length
    const fillColor = bookCount > 0 
      ? getHeatmapColor(bookCount, maxBookCount)
      : '#e0e0e0'
    
    return {
      fillColor: fillColor,
      fillOpacity: 0.6,
      color: '#333',
      weight: 1,
      opacity: 0.8
    }
  }

  return (
    <GeoJSON
      key={overlayKey}
      data={geoJsonData}
      style={style}
      onEachFeature={onEachFeature}
    />
  )
}

export default StateOverlay

