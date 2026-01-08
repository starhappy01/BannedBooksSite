import { useEffect, useState } from 'react'
import { GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import { BooksByCounty, BannedBook } from '../types'

interface CountyOverlayProps {
  stateCode: string // State abbreviation (e.g., "FL", "TX")
  stateName: string // Full state name
  booksByCounty: BooksByCounty
  overlayEnabled: boolean
  onCountyClick: (countyName: string, books: BannedBook[]) => void
}

// State name to FIPS code mapping for county GeoJSON
const STATE_FIPS_CODES: { [key: string]: string } = {
  'Alabama': '01', 'Alaska': '02', 'Arizona': '04', 'Arkansas': '05', 'California': '06',
  'Colorado': '08', 'Connecticut': '09', 'Delaware': '10', 'Florida': '12', 'Georgia': '13',
  'Hawaii': '15', 'Idaho': '16', 'Illinois': '17', 'Indiana': '18', 'Iowa': '19',
  'Kansas': '20', 'Kentucky': '21', 'Louisiana': '22', 'Maine': '23', 'Maryland': '24',
  'Massachusetts': '25', 'Michigan': '26', 'Minnesota': '27', 'Mississippi': '28', 'Missouri': '29',
  'Montana': '30', 'Nebraska': '31', 'Nevada': '32', 'New Hampshire': '33', 'New Jersey': '34',
  'New Mexico': '35', 'New York': '36', 'North Carolina': '37', 'North Dakota': '38', 'Ohio': '39',
  'Oklahoma': '40', 'Oregon': '41', 'Pennsylvania': '42', 'Rhode Island': '44', 'South Carolina': '45',
  'South Dakota': '46', 'Tennessee': '47', 'Texas': '48', 'Utah': '49', 'Vermont': '50',
  'Virginia': '51', 'Washington': '53', 'West Virginia': '54', 'Wisconsin': '55', 'Wyoming': '56',
  'District of Columbia': '11'
}

// Helper function to normalize county names for matching
function normalizeCountyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*county\s*$/i, '')
    .trim()
}

// Helper function to get heatmap color based on book count
function getHeatmapColor(count: number, maxCount: number): string {
  if (count === 0) return '#e0e0e0' // Gray for no books
  
  // Normalize count to 0-1 range
  const intensity = Math.min(count / Math.max(maxCount, 1), 1)
  
  // Color gradient: light yellow -> orange -> red -> dark red
  if (intensity < 0.25) {
    // Light yellow to orange
    const t = intensity / 0.25
    const r = Math.floor(255)
    const g = Math.floor(255 - (255 - 165) * t)
    const b = Math.floor(255 - 255 * t)
    return `rgb(${r}, ${g}, ${b})`
  } else if (intensity < 0.5) {
    // Orange to red-orange
    const t = (intensity - 0.25) / 0.25
    const r = Math.floor(255)
    const g = Math.floor(165 - 50 * t)
    const b = Math.floor(0)
    return `rgb(${r}, ${g}, ${b})`
  } else if (intensity < 0.75) {
    // Red-orange to red
    const t = (intensity - 0.5) / 0.25
    const r = Math.floor(255)
    const g = Math.floor(115 - 115 * t)
    const b = Math.floor(0)
    return `rgb(${r}, ${g}, ${b})`
  } else {
    // Red to dark red
    const t = (intensity - 0.75) / 0.25
    const r = Math.floor(255 - 55 * t)
    const g = Math.floor(0)
    const b = Math.floor(0)
    return `rgb(${r}, ${g}, ${b})`
  }
}

function CountyOverlay({ stateCode, stateName, booksByCounty, overlayEnabled, onCountyClick }: CountyOverlayProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null)
  const [maxBookCount, setMaxBookCount] = useState(0)

  useEffect(() => {
    // Calculate max book count for heatmap scaling
    const counts = Object.values(booksByCounty).map(books => books.length)
    setMaxBookCount(Math.max(...counts, 1))
  }, [booksByCounty])

  useEffect(() => {
    if (!stateName || !overlayEnabled) return

    const fipsCode = STATE_FIPS_CODES[stateName]
    if (!fipsCode) {
      console.warn(`No FIPS code found for state: ${stateName}`)
      return
    }

    // Fetch county GeoJSON for the specific state using plotly's counties dataset
    fetch(`https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json`)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch counties')
        return response.json()
      })
      .then((allCounties) => {
        // Filter counties for the specific state by FIPS code
        const stateCounties = {
          type: 'FeatureCollection',
          features: allCounties.features.filter((feature: any) => {
            const featureId = feature.id || feature.properties?.COUNTY || feature.properties?.GEO_ID
            if (typeof featureId === 'string') {
              return featureId.startsWith(fipsCode)
            }
            return false
          }).map((feature: any) => {
            // Ensure NAME property exists for county matching
            const fips = feature.id || feature.properties?.COUNTY || ''
            const countyName = feature.properties?.NAME || feature.properties?.NAME_ASCI || ''
            return {
              ...feature,
              properties: {
                ...feature.properties,
                NAME: countyName || `County ${fips.substring(fips.length - 3)}`,
                FIPS: fips
              }
            }
          })
        }
        setGeoJsonData(stateCounties)
      })
      .catch((error) => {
        console.error('Error loading county GeoJSON:', error)
        setGeoJsonData(null)
      })
  }, [stateName, overlayEnabled])

  if (!geoJsonData || !overlayEnabled) return null

  const onEachFeature = (feature: any, layer: L.Layer) => {
    // Try multiple property names that might contain county name
    const countyNameProp = feature.properties.NAME || 
                          feature.properties.NAME_ASCI || 
                          feature.properties.name || 
                          feature.properties.county || ''
    
    // Normalize county names for matching
    const normalizedCountyName = normalizeCountyName(countyNameProp)
    let matchingCounty: string | null = null
    let countyBooks: BannedBook[] = []

    // Try to match county name with books data
    for (const [county, books] of Object.entries(booksByCounty)) {
      const normalizedBookCounty = normalizeCountyName(county)
      if (normalizedCountyName === normalizedBookCounty || 
          normalizedCountyName.includes(normalizedBookCounty) ||
          normalizedBookCounty.includes(normalizedCountyName)) {
        matchingCounty = county
        countyBooks = books
        break
      }
    }

    const bookCount = countyBooks.length
    
    layer.on({
      mouseover: (e) => {
        const layer = e.target
        layer.setStyle({
          fillOpacity: 0.9,
          weight: 2
        })
        layer.bindPopup(
          matchingCounty 
            ? `${countyNameProp}: ${bookCount} banned book${bookCount !== 1 ? 's' : ''}`
            : `${countyNameProp}: No banned books`
        ).openPopup()
      },
      mouseout: (e) => {
        const layer = e.target
        layer.setStyle({
          fillOpacity: 0.7,
          weight: 1
        })
        layer.closePopup()
      },
      click: () => {
        if (matchingCounty && countyBooks.length > 0) {
          onCountyClick(matchingCounty, countyBooks)
        }
      }
    })
  }

  const style = (feature: any) => {
    // Try multiple property names that might contain county name
    const countyNameProp = feature.properties.NAME || 
                          feature.properties.NAME_ASCI || 
                          feature.properties.name || 
                          feature.properties.county || ''
    
    const normalizedCountyName = normalizeCountyName(countyNameProp)
    let bookCount = 0

    // Find matching county in books data
    for (const [county, books] of Object.entries(booksByCounty)) {
      const normalizedBookCounty = normalizeCountyName(county)
      if (normalizedCountyName === normalizedBookCounty || 
          normalizedCountyName.includes(normalizedBookCounty) ||
          normalizedBookCounty.includes(normalizedCountyName)) {
        bookCount = books.length
        break
      }
    }

    const fillColor = getHeatmapColor(bookCount, maxBookCount)
    
    return {
      fillColor: fillColor,
      fillOpacity: 0.7,
      color: '#333',
      weight: 1,
      opacity: 0.8
    }
  }

  return (
    <GeoJSON
      data={geoJsonData}
      style={style}
      onEachFeature={onEachFeature}
    />
  )
}

export default CountyOverlay

