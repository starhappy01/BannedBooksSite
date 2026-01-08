import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { parseBannedBooksCSV, extractYear } from './utils/csvParser'
import { BooksByState, BannedBook } from './types'
import StateOverlay from './components/StateOverlay'
import StateBooksPanel from './components/StateBooksPanel'
import YearSlider from './components/YearSlider'

function App() {
  const [booksByState, setBooksByState] = useState<BooksByState>({})
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedBooks, setSelectedBooks] = useState<BannedBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    parseBannedBooksCSV()
      .then((data) => {
        setBooksByState(data.booksByState)
        setAvailableYears(data.availableYears)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading books data:', error)
        setLoading(false)
      })
  }, [])

  // Filter books by selected year
  const filteredBooksByState = useMemo(() => {
    if (selectedYear === null) {
      return booksByState
    }

    const filtered: BooksByState = {}
    Object.keys(booksByState).forEach((state) => {
      const stateBooks = booksByState[state].filter((book) => {
        const dateString = book['Challenge/Removal'] || book['Date of Challenge/Removal'] || ''
        const bookYear = extractYear(dateString)
        return bookYear === selectedYear
      })
      if (stateBooks.length > 0) {
        filtered[state] = stateBooks
      }
    })
    return filtered
  }, [booksByState, selectedYear])

  // Update selected books when year or state changes to keep them filtered
  useEffect(() => {
    if (selectedState) {
      const filteredBooks = filteredBooksByState[selectedState] || []
      setSelectedBooks(filteredBooks)
    } else {
      setSelectedBooks([])
    }
  }, [selectedState, filteredBooksByState])

  const handleStateClick = (stateName: string, books: BannedBook[]) => {
    setSelectedState(stateName)
    // books passed here are already filtered, but useEffect will ensure consistency
    setSelectedBooks(books)
  }

  const handleYearChange = (year: number | null) => {
    setSelectedYear(year)
    // useEffect will handle updating selectedBooks if a state is selected
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ padding: '1rem', textAlign: 'center', margin: 0 }}>
        United States Banned Book Map
      </h1>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <MapContainer
            center={[39.8283, -98.5795]}
            zoom={4}
            minZoom={3}
            maxZoom={18}
            style={{ flex: 1, width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {!loading && (
              <StateOverlay
                booksByState={filteredBooksByState}
                onStateClick={handleStateClick}
              />
            )}
          </MapContainer>
          <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#f5f5f5', borderTop: '2px solid #ccc' }}>
            {loading && <p style={{ margin: '0', color: '#666' }}>Loading book data...</p>}
            {!loading && availableYears.length > 0 && (
              <YearSlider
                years={availableYears}
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
              />
            )}
          </div>
        </div>
        <StateBooksPanel
          state={selectedState}
          books={selectedBooks}
        />
      </div>
      <div style={{ padding: '0.5rem 1rem', textAlign: 'center', fontSize: '0.7rem', color: '#666', borderTop: '1px solid #e0e0e0', backgroundColor: '#f9f9f9' }}>
        <p style={{ margin: 0 }}>
          Citations: Map powered by{' '}
          <a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#2196F3', textDecoration: 'none' }}>
            Leaflet
          </a>
          {' '}• Book ban data from{' '}
          <a href="https://pen.org/book-bans/" target="_blank" rel="noopener noreferrer" style={{ color: '#2196F3', textDecoration: 'none' }}>
            PEN America
          </a>
        </p>
      </div>
    </div>
  )
}

export default App

