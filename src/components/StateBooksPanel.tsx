import { BannedBook } from '../types'

interface StateBooksPanelProps {
  state: string | null
  books: BannedBook[]
}

function StateBooksPanel({ state, books }: StateBooksPanelProps) {
  if (!state) {
    return (
      <div style={panelStyle}>
        <h2 style={{ margin: 0, padding: '1rem', textAlign: 'center' }}>
          Select a state to view banned books
        </h2>
      </div>
    )
  }

  const headerText = state
  const subtitle = `${books.length} book${books.length !== 1 ? 's' : ''}`

  return (
    <div style={panelStyle}>
      <div style={{ padding: '1rem', borderBottom: '2px solid #ccc' }}>
        <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem' }}>
          {headerText}
        </h2>
        <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>
          {subtitle}
        </p>
      </div>
      <div style={booksListStyle}>
        {books.length === 0 ? (
          <p style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
            No books found
          </p>
        ) : (
          books.map((book, index) => (
            <div key={index} style={bookItemStyle}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                {book.Title}
              </h3>
              <p style={{ margin: '0 0 0.25rem 0', color: '#666', fontSize: '0.95rem' }}>
                <strong>Author:</strong> {book.Author}
              </p>
              {book.District && (
                <p style={{ margin: '0 0 0.25rem 0', color: '#666', fontSize: '0.85rem' }}>
                  <strong>District:</strong> {book.District}
                </p>
              )}
              {book['Ban Status'] && (
                <p style={{ margin: '0 0 0.25rem 0', color: '#666', fontSize: '0.85rem' }}>
                  <strong>Status:</strong> {book['Ban Status']}
                </p>
              )}
              <hr style={{ margin: '0.75rem 0', border: 'none', borderTop: '1px solid #eee' }} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const panelStyle: React.CSSProperties = {
  width: '400px',
  height: '100%',
  backgroundColor: '#fff',
  borderLeft: '2px solid #ccc',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}

const booksListStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '0.5rem'
}

const bookItemStyle: React.CSSProperties = {
  padding: '1rem',
  marginBottom: '0.5rem',
  backgroundColor: '#f9f9f9',
  borderRadius: '4px'
}

export default StateBooksPanel

