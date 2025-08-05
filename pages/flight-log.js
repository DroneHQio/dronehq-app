import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function FlightLog() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [flights, setFlights] = useState([])
  const router = useRouter()

  // Form data
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    pilot_name: '',
    drone_model: '',
    location: '',
    weather: '',
    flight_duration: '',
    notes: '',
    takeoff_time: '',
    landing_time: ''
  })

  useEffect(() => {
    checkUser()
    loadFlights()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
    } else {
      router.push('/login')
    }
  }

  const loadFlights = async () => {
    const { data, error } = await supabase
      .from('flight_logs')
      .select('*')
      .order('date', { ascending: false })

    if (data) {
      setFlights(data)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('flight_logs')
        .insert([{
          ...formData,
          user_id: user.id,
          created_at: new Date().toISOString()
        }])

      if (error) {
        alert('Error saving flight log: ' + error.message)
      } else {
        alert('Flight log saved successfully!')
        setFormData({
          date: new Date().toISOString().split('T')[0],
          pilot_name: '',
          drone_model: '',
          location: '',
          weather: '',
          flight_duration: '',
          notes: '',
          takeoff_time: '',
          landing_time: ''
        })
        loadFlights()
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={() => router.push('/dashboard')}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Back to Dashboard
        </button>
        <h1>✈️ Flight Logging</h1>
      </div>

      {/* Flight Log Form */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '30px', 
        borderRadius: '10px',
        marginBottom: '40px'
      }}>
        <h2>Log New Flight</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label>Date:</label>
              <input 
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  marginTop: '5px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
                required
              />
            </div>
            
            <div>
              <label>Pilot Name:</label>
              <input 
                type="text"
                name="pilot_name"
                value={formData.pilot_name}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  marginTop: '5px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
                required
              />
            </div>
            
            <div>
              <label>Drone Model:</label>
              <input 
                type="text"
                name="drone_model"
                value={formData.drone_model}
                onChange={handleInputChange}
                placeholder="e.g. DJI Mini 3 Pro"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  marginTop: '5px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
                required
              />
            </div>
            
            <div>
              <label>Location:</label>
              <input 
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. University Campus Field"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  marginTop: '5px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
                required
              />
            </div>
            
            <div>
              <label>Weather Conditions:</label>
              <select 
                name="weather"
                value={formData.weather}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  marginTop: '5px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
                required
              >
                <option value="">Select weather</option>
                <option value="Clear">Clear</option>
                <option value="Partly Cloudy">Partly Cloudy</option>
                <option value="Overcast">Overcast</option>
                <option value="Light Wind">Light Wind</option>
                <option value="Moderate Wind">Moderate Wind</option>
                <option value="Rainy">Rainy</option>
              </select>
            </div>
            
            <div>
              <label>Flight Duration (minutes):</label>
              <input 
                type="number"
                name="flight_duration"
                value={formData.flight_duration}
                onChange={handleInputChange}
                min="1"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  marginTop: '5px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
                required
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label>Flight Notes:</label>
            <textarea 
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Training exercise, equipment test, etc."
              rows="4"
              style={{ 
                width: '100%', 
                padding: '10px', 
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            style={{ 
              padding: '12px 30px',
              backgroundColor: loading ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Saving...' : 'Save Flight Log'}
          </button>
        </form>
      </div>

      {/* Flight History */}
      <div>
        <h2>Recent Flights</h2>
        {flights.length === 0 ? (
          <p style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            No flights logged yet. Create your first flight log above!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              borderRadius: '5px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <thead style={{ backgroundColor: '#0070f3', color: 'white' }}>
                <tr>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Pilot</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Drone</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Location</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Duration</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Weather</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((flight, index) => (
                  <tr key={flight.id} style={{ 
                    borderBottom: '1px solid #eee',
                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                  }}>
                    <td style={{ padding: '15px' }}>{flight.date}</td>
                    <td style={{ padding: '15px' }}>{flight.pilot_name}</td>
                    <td style={{ padding: '15px' }}>{flight.drone_model}</td>
                    <td style={{ padding: '15px' }}>{flight.location}</td>
                    <td style={{ padding: '15px' }}>{flight.flight_duration}min</td>
                    <td style={{ padding: '15px' }}>{flight.weather}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
