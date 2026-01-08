import Papa from 'papaparse'
import { BannedBook, BooksByState } from '../types'

// Handles formats like: "August 2023", "Fall 2023", "Oct-22", "Feb-23", "AY 2022-2023"
export function extractYear(dateString: string): number | null {
  if (!dateString) return null

  // Try to match 4-digit year first (e.g., "2023", "2022")
  const fourDigitYearMatch = dateString.match(/\b(19|20)\d{2}\b/)
  if (fourDigitYearMatch) {
    return parseInt(fourDigitYearMatch[0], 10)
  }

  // Try to match 2-digit year (e.g., "Oct-22", "Feb-23", "Apr-22")
  // Assume years 00-50 are 2000-2050, and 51-99 are 1951-1999
  const twoDigitYearMatch = dateString.match(/\b(\d{2})\b/)
  if (twoDigitYearMatch) {
    const twoDigit = parseInt(twoDigitYearMatch[0], 10)
    if (twoDigit >= 0 && twoDigit <= 99) {
      // Years 0-50 are 2000-2050, years 51-99 are 1951-1999
      return twoDigit <= 50 ? 2000 + twoDigit : 1900 + twoDigit
    }
  }

  return null
}

// Helper function to parse a single CSV file
function parseCSVFile(text: string): Promise<BannedBook[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<BannedBook>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const books: BannedBook[] = []
        results.data.forEach((book) => {
          if (book.State && book.Title && book.Author) {
            books.push(book)
          }
        })
        resolve(books)
      },
      error: (error: any) => {
        reject(error)
      }
    })
  })
}

export async function parseBannedBooksCSV(): Promise<{
  booksByState: BooksByState
  allBooks: BannedBook[]
  availableYears: number[]
}> {
  try {
    // Get base URL from Vite (handles GitHub Pages subdirectory)
    const baseUrl = import.meta.env.BASE_URL || '/'
    
    // List of CSV files to load
    const csvFiles = [
      `${baseUrl}BannedBookList.csv`,
      `${baseUrl}Grid view (1).csv`,
      `${baseUrl}Grid view (2).csv`
    ]

    // Load all CSV files in parallel
    const responses = await Promise.all(
      csvFiles.map(file => fetch(file).then(r => r.text()).catch(err => {
        console.warn(`Failed to load ${file}:`, err)
        return null
      }))
    )

    // Parse all CSV files
    const allBooksArrays = await Promise.all(
      responses
        .filter(text => text !== null)
        .map(text => parseCSVFile(text!))
    )

    // Combine all books from all files
    const allBooks = allBooksArrays.flat()

    // Group books by state
    const booksByState: BooksByState = {}
    // Track unique years
    const yearSet = new Set<number>()

    allBooks.forEach((book) => {
      const state = book.State.trim()

      // Extract year - handle different column names
      const dateString = book['Challenge/Removal'] || book['Date of Challenge/Removal'] || ''
      const year = extractYear(dateString)
      if (year) {
        yearSet.add(year)
      }

      // Group by state
      if (!booksByState[state]) {
        booksByState[state] = []
      }
      booksByState[state].push(book)
    })

    // Convert year set to sorted array
    const availableYears = Array.from(yearSet).sort((a, b) => a - b)

    return { booksByState, allBooks, availableYears }
  } catch (error) {
    console.error('Error parsing CSV:', error)
    throw error
  }
}

