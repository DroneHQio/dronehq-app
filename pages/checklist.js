import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Checklist() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checklistType, setChecklistType] = useState('pre-flight')
  const [checklists, setChecklists] = useState([])
  const router = useRouter()

  // Form data
  const [formData, setFormData] = useState({
    pilot_name: '',
    drone_model: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  // Pre-flight checklist items
  const preFlightItems = [
    'Weather conditions checked and acceptable',
    'Airspace authorization obtained (if required)',
    'Drone battery fully charged',
    'Controller battery fully charged',
    'Propellers securely attached and undamaged',
    'Camera/gimbal functioning properly',
    'GPS signal acquired',
    'Return-to-home altitude set',
    'Emergency procedures reviewed',
    'Observer/spotter assigned (if required)'
  ]

  // Post-flight checklist items
  const postFlightItems = [
    'Drone landed safely',
    'Battery temperature normal',
    'Propellers inspected for damage',
    'Memory card/footage retrieved',
    'Flight log updated',
    'Equipment cleaned and stored',
    'Any incidents or issues documented',
    'Battery properly stored',
    'Next maintenance due date noted'
  ]

  const [checkedItems, setCheckedItems] = useState({})

  useEffect(() => {
    checkUser()
    loadChecklists()
    // Initialize checked items
    const items = checklistType === 'pre-flight' ? preFlightItems : postFlightItems
    const initialChecked = {}
    items.forEach((_, index) => {
      initialChecked[index] = false
    })
    setCheckedItems(initialChecked)
  }, [checklistType])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
    } else {
      router.push('/login')
    }
  }

  const loadChecklists = async () => {
    const { data, error } = await supabase
      .from('checklists')
      .select('*')
      .order('completed_at', { ascending: false })
      .limit(10)

    if (data) {
      setChecklists(data)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleItemCheck = (index) => {
    setCheckedItems({
      ...checkedItems,
      [index]: !checkedItems[index]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const items = checklistType === 'pre-flight' ? preFlightItems : postFlightItems
    const completedItems = items.map((item, index) => ({
      item: item,
      completed: checkedItems[index] || false
    }))

    const allCompleted = Object.values(checkedItems).every(checked => checked === true)
    
    if (!allCompleted) {
      alert('Please complete all checklist items before submitting.')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('checklists')
        .insert([{
          user_id: user.id,
          checklist_type: checklistType,
          pilot_name: formData.pilot_name,
          drone_model: formData.drone_model,
          location: formData.location,
          date: formData.date,
          items: completedItems,
          notes: formData.notes
        }])

      if (error) {
        alert('Error saving checklist: ' + error.message)
      } else {
        alert(`${checklistType} checklist completed successfully!`)
        // Reset form
        setFormData({
          pilot_name: '',
          drone_model: '',
          location: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        })
        // Reset checked items
        const resetChecked = {}
        items.forEach((_, index) => {
          resetChecked[index] = false
        })
        setCheckedItems(resetChecked)
        loadChecklists()
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }

    setLoading(false)
  }

  const currentItems = checklistType === 'pre-flight' ? preFlightItems : postFlightItems

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
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
        <h1>📋 Digital Safety Checklists</h1>
      </div>

      {/* Checklist Type Selector */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '30px'
      }}>
        <h3>Select Checklist Type:</h3>
        <div style={{ marginTop: '15px' }}>
          <label style={{ marginRight: '30px', cursor: 'pointer' }}>
            <input 
              type="radio"
              name="checklistType"
              value="pre-flight"
              checked={checklistType === 'pre-flight'}
              onChange={(e) => setChecklistType(e.target.value)}
              style={{ marginRight: '8px' }}
            />
            🛫 Pre-Flight Checklist
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input 
              type="radio"
              name="checklistType"
              value="post-flight"
              checked={checklistType === 'post-flight'}
              onChange={(e) => setChecklistType(e.target.value)}
              style={{ marginRight: '8px' }}
            />
            🛬 Post-Flight Checklist
          </label>
        </div>
      </div>

      {/* Checklist Form */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '10px',
        border: '2px solid #e9ecef',
        marginBottom: '40px'
      }}>
        <h2>{checklistType === 'pre-flight' ? '🛫 Pre-Flight' : '🛬 Post-Flight'} Safety Checklist</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
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
                  padding: '8px', 
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
                  padding: '8px', 
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
                style={{ 
                  width: '100%', 
                  padding: '8px', 
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
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  marginTop: '5px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
                required
              />
            </div>
          </div>

          {/* Checklist Items */}
          <h3 style={{ marginBottom: '20px' }}>Safety Items:</h3>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {currentItems.map((item, index) => (
              <div key={index} style={{ 
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: checkedItems[index] ? '#d4edda' : 'white',
                borderRadius: '5px',
                border: `2px solid ${checkedItems[index] ? '#28a745' : '#dee2e6'}`,
                cursor: 'pointer'
              }} onClick={() => handleItemCheck(index)}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontWeight: checkedItems[index] ? 'bold' : 'normal'
                }}>
                  <input 
                    type="checkbox"
                    checked={checkedItems[index] || false}
                    onChange={() => handleItemCheck(index)}
                    style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                  />
                  {item}
                  {checkedItems[index] && <span style={{ marginLeft: 'auto', color: '#28a745' }}>✓</span>}
                </label>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '20px' }}>
            <label>Additional Notes:</label>
            <textarea 
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional observations or notes..."
              rows="3"
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
              padding: '15px 30px',
              backgroundColor: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Saving...' : `Complete ${checklistType} Checklist`}
          </button>
        </form>
      </div>

      {/* Recent Checklists */}
      <div>
        <h2>Recent Checklists</h2>
        {checklists.length === 0 ? (
          <p style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            No checklists completed yet.
          </p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gap: '15px'
          }}>
            {checklists.map((checklist) => (
              <div key={checklist.id} style={{ 
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <h4>{checklist.checklist_type === 'pre-flight' ? '🛫' : '🛬'} {checklist.checklist_type} - {checklist.pilot_name}</h4>
                  <span style={{ color: '#6c757d' }}>{checklist.date}</span>
                </div>
                <p><strong>Drone:</strong> {checklist.drone_model} | <strong>Location:</strong> {checklist.location}</p>
                {checklist.notes && <p><strong>Notes:</strong> {checklist.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
