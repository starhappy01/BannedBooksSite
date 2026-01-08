interface YearSliderProps {
  years: number[]
  selectedYear: number | null
  onYearChange: (year: number | null) => void
}

function YearSlider({ years, selectedYear, onYearChange }: YearSliderProps) {
  if (years.length === 0) return null

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value, 10)
    const year = years[index]
    onYearChange(year)
  }

  const currentIndex = selectedYear !== null ? years.indexOf(selectedYear) : -1
  const sliderValue = currentIndex >= 0 ? currentIndex : years.length - 1

  return (
    <>
      <style>{sliderThumbStyle}</style>
      <div style={sliderContainerStyle}>
        <label style={labelStyle}>
          Filter by Year: {selectedYear !== null ? selectedYear : 'All Years'}
        </label>
        <div style={sliderWrapperStyle}>
          <div style={{ position: 'relative', width: '100%', marginBottom: '0.5rem' }}>
            <input
              type="range"
              min="0"
              max={years.length - 1}
              value={sliderValue}
              onChange={handleSliderChange}
              style={sliderStyle}
              step="1"
            />
            {/* Tick marks */}
            <div style={{ position: 'absolute', top: '0', left: '0', right: '0', height: '8px', pointerEvents: 'none' }}>
              {years.map((year, index) => {
                const percentage = (index / (years.length - 1)) * 100
                return (
                  <div
                    key={year}
                    style={{
                      position: 'absolute',
                      left: `${percentage}%`,
                      transform: 'translateX(-50%)',
                      width: '2px',
                      height: '8px',
                      backgroundColor: selectedYear === year ? '#2196F3' : '#999',
                      borderRadius: '1px'
                    }}
                  />
                )
              })}
            </div>
          </div>
          <div style={yearLabelsContainerStyle}>
            {years.map((year, index) => {
              const percentage = (index / (years.length - 1)) * 100
              return (
                <span
                  key={year}
                  style={{
                    position: 'absolute',
                    left: `${percentage}%`,
                    transform: 'translateX(-50%)',
                    fontWeight: selectedYear === year ? 'bold' : 'normal',
                    color: selectedYear === year ? '#2196F3' : '#666',
                    fontSize: selectedYear === year ? '0.85rem' : '0.75rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {year}
                </span>
              )
            })}
          </div>
        </div>
        <button
          onClick={() => onYearChange(null)}
          style={clearButtonStyle}
        >
          Show All Years
        </button>
      </div>
    </>
  )
}

const sliderContainerStyle: React.CSSProperties = {
  padding: '1rem',
  backgroundColor: '#fff',
  borderTop: '2px solid #ccc'
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.5rem',
  fontSize: '0.9rem',
  fontWeight: '500',
  color: '#333'
}

const sliderWrapperStyle: React.CSSProperties = {
  position: 'relative',
  marginBottom: '0.5rem'
}

const sliderStyle: React.CSSProperties = {
  width: '100%',
  height: '8px',
  borderRadius: '4px',
  outline: 'none',
  background: 'linear-gradient(to right, #e0e0e0 0%, #e0e0e0 100%)',
  WebkitAppearance: 'none',
  appearance: 'none',
  cursor: 'pointer'
}

const sliderThumbStyle = `
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #2196F3;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #2196F3;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  input[type="range"]::-ms-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #2196F3;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`

const yearLabelsContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  marginTop: '0.5rem',
  height: '1.2rem'
}

const clearButtonStyle: React.CSSProperties = {
  padding: '0.4rem 0.8rem',
  backgroundColor: '#f5f5f5',
  color: '#333',
  border: '1px solid #ccc',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  marginTop: '0.5rem'
}

export default YearSlider

