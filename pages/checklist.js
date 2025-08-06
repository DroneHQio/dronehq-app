import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Checklist() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checklists, setChecklists] = useState([])
  const [message, setMessage] = useState('')
  const [activeTemplate, setActiveTemplate] = useState('standard')
  const [showForm, setShowForm] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  
  // Form state
  const [checklistData, setChecklistData] = useState({
    aircraft_model: '',
    aircraft_registration: '',
    pilot_name: '',
    flight_purpose: '',
    location: '',
    weather_conditions: '',
    wind_speed: '',
    visibility: '',
    notes: '',
    checklist_items: {}
  })

  // Checklist templates
  const checklistTemplates = {
    standard: {
      name: 'Standard Pre-Flight',
      items: [
        { id: 'visual_inspection', text: 'Visual inspection of aircraft for damage', critical: true },
        { id: 'propellers', text: 'Propellers secured and undamaged', critical: true },
        { id: 'battery_level', text: 'Battery fully charged and secured', critical: true },
        { id: 'memory_card', text: 'Memory card inserted and has space', critical: false },
        { id: 'controller_charged', text: 'Controller/remote fully charged', critical: true },
        { id: 'gps_signal', text: 'GPS signal acquired (minimum 6 satellites)', critical: true },
        { id: 'compass_calibrated', text: 'Compass calibrated if required', critical: true },
        { id: 'flight_area_clear', text: 'Flight area clear of obstacles and people', critical: true },
        { id: 'weather_suitable', text: 'Weather conditions suitable for flight', critical: true },
        { id: 'airspace_cleared', text: 'Airspace cleared for operation', critical: true },
        { id: 'emergency_procedures', text: 'Emergency procedures reviewed', critical: false },
        { id: 'insurance_valid', text: 'Insurance coverage verified', critical: false }
      ]
    },
    commercial: {
      name: 'Commercial Operation',
      items: [
        { id: 'part107_cert', text: 'Part 107 certificate valid and accessible', critical: true },
        { id: 'client_briefing', text: 'Client briefed on safety procedures', critical: true },
        { id: 'flight_plan', text: 'Flight plan documented and approved', critical: true },
        { id: 'visual_inspection', text: 'Thorough visual inspection completed', critical: true },
        { id: 'battery_level', text: 'Battery at 100% charge', critical: true },
        { id: 'backup_battery', text: 'Backup battery charged and ready', critical: true },
        { id: 'memory_cards', text: 'Multiple memory cards available', critical: true },
        { id: 'controller_charged', text: 'Controller at full charge', critical: true },
        { id: 'gps_signal', text: 'Strong GPS signal (8+ satellites)', critical: true },
        { id: 'compass_calibrated', text: 'Compass calibration verified', critical: true },
        { id: 'camera_settings', text: 'Camera settings configured', critical: false },
        { id: 'flight_area_secured', text: 'Flight area secured and marked', critical: true },
        { id: 'weather_logged', text: 'Weather conditions documented', critical: true },
        { id: 'laanc_approval', text: 'LAANC approval obtained if required', critical: true },
        { id: 'insurance_confirmed', text: 'Commercial insurance confirmed', critical: true },
        { id: 'emergency_plan', text: 'Emergency response plan in place', critical: true }
      ]
    },
    training: {
      name: 'Training Flight',
      items: [
        { id: 'instructor_present', text: 'Certified instructor present', critical: true },
        { id: 'student_briefed', text: 'Student briefed on lesson objectives', critical: true },
        { id: 'training_area', text: 'Training area designated and clear', critical: true },
        { id: 'visual_inspection', text: 'Aircraft visual inspection completed', critical: true },
        { id: 'battery_level', text: 'Battery fully charged', critical: true },
        { id: 'controller_paired', text: 'Controller properly paired', critical: true },
        { id: 'beginner_mode', text: 'Beginner mode activated if applicable', critical: false },
        { id: 'return_home', text: 'Return-to-home function tested', critical: true },
        { id: 'emergency_procedures', text: 'Emergency procedures explained', critical: true },
        { id: 'weather_suitable', text: 'Weather suitable for training', critical: true },
        { id: 'safety_equipment', text: 'Safety equipment available', critical: false }
      ]
    },
    inspection: {
      name: 'Inspection/Survey',
      items: [
        { id: 'inspection_plan', text: 'Inspection plan documented', critical: true },
        { id: 'site_survey', text: 'Site survey completed', critical: true },
        { id: 'hazard_assessment', text: 'Hazard assessment performed', critical: true },
        { id: 'visual_inspection', text: 'Aircraft inspection completed', critical: true },
        { id: 'battery_level', text: 'Battery at maximum charge', critical: true },
        { id: 'backup_equipment', text: 'Backup equipment ready', critical: true },
        { id: 'payload_secured', text: 'Inspection payload secured', critical: true },
        { id: 'data_storage', text: 'Adequate data storage available', critical: true },
        { id: 'gps_accuracy', text: 'GPS accuracy verified', critical: true },
        { id: 'communication', text: 'Communication with ground team established', critical: true },
        { id: 'restricted_airspace', text: 'Restricted airspace clearance obtained', critical: true },
        { id: 'safety_perimeter', text: 'Safety perimeter established', critical: true }
      ]
    }
  }

  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/login')
      return
    }

    setUser(session.user)
    await getUserRole(session.user)
    await loadChecklists(session.user.id)
    getCurrentLocation()
    setLoading(false)
  }

  const getUserRole = async (user) => {
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select(`
          role,
          organization_id,
          organizations (
            name,
            settings
          )
        `)
        .eq('user_id', user.id)
        .eq('approved', true)
        .single()

      if (roleData) {
        setUserRole(roleData.role)
        setOrganization(roleData.organizations)
      } else {
        setUserRole('pilot')
      }
    } catch (error) {
      setUserRole('pilot')
    }
  }

  const loadChecklists = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })

      if (data) {
        setChecklists(data)
      }
    } catch (error) {
      console.error('Error loading checklists:', error)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setCurrentLocation(location)
        setChecklistData(prev => ({
          ...prev,
          location: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
        }))
      },
      error => console.error('GPS Error:', error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const useCurrentLocationForChecklist = () => {
    getCurrentLocation()
    setMessage('✅ GPS location updated')
  }

  const handleInputChange = (e) => {
    setChecklistData({
      ...checklistData,
      [e.target.name]: e.target.value
    })
  }

  const handleChecklistItemChange = (itemId, value, notes = '') => {
    setChecklistData(prev => ({
      ...prev,
      checklist_items: {
        ...prev.checklist_items,
        [itemId]: { 
          checked: value, 
          notes: notes,
          timestamp: new Date().toISOString()
        }
      }
    }))
  }

  const handleTemplateChange = (templateKey) => {
    setActiveTemplate(templateKey)
    // Reset checklist items when changing templates
    setChecklistData(prev => ({
      ...prev,
      checklist_items: {}
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate critical items are checked
      const template = checklistTemplates[activeTemplate]
      const criticalItems = template.items.filter(item => item.critical)
      const uncheckedCritical = criticalItems.filter(item => 
        !checklistData.checklist_items[item.id]?.checked
      )

      if (uncheckedCritical.length > 0) {
        setMessage(`❌ Critical items must be completed: ${uncheckedCritical.map(item => item.text).join(', ')}`)
        setLoading(false)
        return
      }

      const checklistSubmission = {
        ...checklistData,
        user_id: user.id,
        organization_id: organization?.id || null,
        pilot_id: user.id,
        created_by: user.id,
        template_used: activeTemplate,
        template_name: template.name,
        location_lat: currentLocation?.lat || null,
        location_lng: currentLocation?.lng || null,
        gps_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        checklist_items: JSON.stringify(checklistData.checklist_items)
      }

      const { error } = await supabase
        .from('checklists')
        .insert([checklistSubmission])

      if (error) throw error

      // Send notification to org admin
      if (organization) {
        await sendChecklistNotification(checklistSubmission)
      }

      setMessage('✅ Checklist completed and saved successfully!')
      setShowForm(false)
      
      // Reset form
      setChecklistData({
        aircraft_model: '', aircraft_registration: '', pilot_name: '',
        flight_purpose: '', location: '', weather_conditions: '',
        wind_speed: '', visibility: '', notes: '', checklist_items: {}
      })
      
      await loadChecklists(user.id)

    } catch (error) {
      setMessage(`❌ Error saving checklist: ${error.message}`)
    }

    setLoading(false)
  }

  const sendChecklistNotification = async (checklistData) => {
    try {
      // This would integrate with email service
      console.log('Sending checklist notification to org admin:', checklistData)
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateCompletionRate = (checklistItems, template) => {
    if (!checklistItems) return 0
    const items = JSON.parse(checklistItems)
    const totalItems = template.items.length
    const completedItems = Object.values(items).filter(item => item.checked).length
    return Math.round((completedItems / totalItems) * 100)
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
          <h2>Loading Checklists...</h2>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '15px 25px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/images/logo.png" 
            alt="DroneHQ.io"
            onClick={() => router.push('/')}
            style={{ 
              height: '40px', 
              width: 'auto',
              marginRight: '15px',
              cursor: 'pointer'
            }}
          />
          <div>
            <h1 style={{ margin: '0', color: '#1a2332', fontSize: '24px' }}>
              📋 Pre-Flight Checklists
            </h1>
            <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
              {organization ? `${organization.name} • ` : ''}
              {checklists.length} checklists completed
            </p>
          </div>
        </div>

        <button 
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          ← Dashboard
        </button>
      </div>

      {message && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: message.includes('❌') ? '#f8d7da' : '#d1ecf1',
          color: message.includes('❌') ? '#721c24' : '#0c5460',
          borderRadius: '8px',
          border: `1px solid ${message.includes('❌') ? '#f5c6cb' : '#bee5eb'}`
        }}>
          {message}
        </div>
      )}

      {/* Checklist Templates */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1a2332' }}>Select Checklist Type</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          {Object.entries(checklistTemplates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => handleTemplateChange(key)}
              style={{
                padding: '15px 20px',
                backgroundColor: activeTemplate === key ? '#28a745' : '#f8f9fa',
                color: activeTemplate === key ? 'white' : '#495057',
                border: `2px solid ${activeTemplate === key ? '#28a745' : '#e9ecef'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '16px', marginBottom: '5px' }}>{template.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {template.items.length} items • {template.items.filter(item => item.critical).length} critical
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '15px 30px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
          }}
        >
          {showForm ? '❌ Cancel Checklist' : '📋 Start New Checklist'}
        </button>
      </div>

      {/* Checklist Form */}
      {showForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 25px 0', color: '#1a2332' }}>
            {checklistTemplates[activeTemplate].name} Checklist
          </h3>
          
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ color: '#495057', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #e9ecef' }}>
                Flight Information
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                    Aircraft Model *
                  </label>
                  <input 
                    type="text"
                    name="aircraft_model"
                    value={checklistData.aircraft_model}
                    onChange={handleInputChange}
                    placeholder="e.g., DJI Mavic Air 2"
                    style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                    Registration Number
                  </label>
                  <input 
                    type="text"
                    name="aircraft_registration"
                    value={checklistData.aircraft_registration}
                    onChange={handleInputChange}
                    placeholder="e.g., FA32D7G9K"
                    style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                    Flight Purpose *
                  </label>
                  <select
                    name="flight_purpose"
                    value={checklistData.flight_purpose}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                    required
                  >
                    <option value="">Select purpose</option>
                    <option value="Training">Training</option>
                    <option value="Commercial Photography">Commercial Photography</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Survey/Mapping">Survey/Mapping</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Recreation">Recreation</option>
                    <option value="Research">Research</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                    Location
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text"
                      name="location"
                      value={checklistData.location}
                      onChange={handleInputChange}
                      placeholder="Flight location"
                      style={{ flex: 1, padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                    />
                    <button
                      type="button"
                      onClick={useCurrentLocationForChecklist}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      📍 GPS
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                    Weather Conditions *
                  </label>
                  <select
                    name="weather_conditions"
                    value={checklistData.weather_conditions}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                    required
                  >
                    <option value="">Select weather</option>
                    <option value="Clear">Clear</option>
                    <option value="Partly Cloudy">Partly Cloudy</option>
                    <option value="Cloudy">Cloudy</option>
                    <option value="Overcast">Overcast</option>
                    <option value="Light Rain">Light Rain</option>
                    <option value="Windy">Windy</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                    Wind Speed (mph)
                  </label>
                  <input 
                    type="number"
                    name="wind_speed"
                    value={checklistData.wind_speed}
                    onChange={handleInputChange}
                    placeholder="e.g., 15"
                    min="0"
                    style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    value={checklistData.visibility}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                  >
                    <option value="">Select visibility</option>
                    <option value="Excellent">Excellent (10+ miles)</option>
                    <option value="Good">Good (5-10 miles)</option>
                    <option value="Fair">Fair (3-5 miles)</option>
                    <option value="Poor">Poor (under 3 miles)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Checklist Items */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ color: '#495057', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #e9ecef' }}>
                Pre-Flight Checklist Items
              </h4>
              
              {checklistTemplates[activeTemplate].items.map((item, index) => (
                <div key={item.id} style={{
                  padding: '15px',
                  marginBottom: '10px',
                  backgroundColor: item.critical ? '#fff5f5' : '#f8f9fa',
                  border: `2px solid ${item.critical ? '#dc3545' : '#e9ecef'}`,
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                    <input 
                      type="checkbox"
                      id={item.id}
                      checked={checklistData.checklist_items[item.id]?.checked || false}
                      onChange={(e) => handleChecklistItemChange(item.id, e.target.checked)}
                      style={{ 
                        width: '18px', 
                        height: '18px', 
                        marginTop: '2px',
                        cursor: 'pointer'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <label 
                        htmlFor={item.id}
                        style={{ 
                          fontWeight: item.critical ? 'bold' : 'normal',
                          color: item.critical ? '#dc3545' : '#495057',
                          cursor: 'pointer',
                          display: 'block',
                          marginBottom: '5px'
                        }}
                      >
                        {item.text}
                        {item.critical && <span style={{ color: '#dc3545', marginLeft: '5px' }}>*</span>}
                      </label>
                      
                      {checklistData.checklist_items[item.id]?.checked && (
                        <textarea 
                          placeholder="Notes (optional)..."
                          value={checklistData.checklist_items[item.id]?.notes || ''}
                          onChange={(e) => handleChecklistItemChange(
                            item.id, 
                            true, 
                            e.target.value
                          )}
                          rows="2"
                          style={{ 
                            width: '100%', 
                            padding: '8px', 
                            border: '1px solid #ced4da', 
                            borderRadius: '4px',
                            fontSize: '14px',
                            marginTop: '8px'
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Notes */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                Additional Notes
              </label>
              <textarea 
                name="notes"
                value={checklistData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes or observations..."
                rows="4"
                style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
              />
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: loading ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {loading ? '💾 Saving...' : '✅ Complete Checklist'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Checklist History */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 25px',
          backgroundColor: '#28a745',
          color: 'white'
        }}>
          <h3 style={{ margin: '0', fontSize: '18px' }}>Checklist History ({checklists.length})</h3>
        </div>

        <div style={{ padding: '0' }}>
          {checklists.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6c757d' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
              <h4 style={{ margin: '0 0 10px 0' }}>No Checklists Yet</h4>
              <p style={{ margin: '0' }}>Complete your first pre-flight checklist to ensure safe operations!</p>
            </div>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {checklists.map((checklist, index) => {
                const template = checklistTemplates[checklist.template_used] || checklistTemplates.standard
                const completionRate = calculateCompletionRate(checklist.checklist_items, template)
                
                return (
                  <div key={checklist.id} style={{
                    padding: '20px 25px',
                    borderBottom: index < checklists.length - 1 ? '1px solid #e9ecef' : 'none',
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr 1fr',
                    gap: '20px',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#1a2332', marginBottom: '5px' }}>
                        {checklist.aircraft_model}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        {formatDate(checklist.created_at)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '3px' }}>
                        📍 {checklist.location || 'Location not recorded'}
                      </div>
                    </div>

                    <div>
                      <div style={{ marginBottom: '5px' }}>
                        <strong>Template:</strong> {checklist.template_name}
                      </div>
                      <div style={{ marginBottom: '5px' }}>
                        <strong>Purpose:</strong> {checklist.flight_purpose}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        <strong>Weather:</strong> {checklist.weather_conditions}
                        {checklist.wind_speed && ` • ${checklist.wind_speed} mph wind`}
                        {checklist.visibility && ` • ${checklist.visibility} visibility`}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: completionRate === 100 ? '#28a745' : completionRate >= 80 ? '#ffc107' : '#dc3545',
                        marginBottom: '5px',
                        fontSize: '18px'
                      }}>
                        {completionRate}%
                      </div>
                      <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px' }}>
                        Completion Rate
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${completionRate}%`,
                          height: '100%',
                          backgroundColor: completionRate === 100 ? '#28a745' : completionRate >= 80 ? '#ffc107' : '#dc3545',
                          borderRadius: '4px'
                        }}></div>
                      </div>
                      {checklist.gps_timestamp && (
                        <div style={{ fontSize: '12px', color: '#17a2b8', marginTop: '5px' }}>
                          📍 GPS Verified
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile-specific styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .checklist-grid {
            grid-template-columns: 1fr !important;
          }
          
          .checklist-history-item {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
          
          .checklist-item {
            padding: 12px !important;
          }
          
          .location-input {
            flex-direction: column;
          }
          
          .location-input button {
            margin-top: 10px;
            width: 100%;
          }
        }
        
        .checklist-item input[type="checkbox"] {
          transform: scale(1.2);
        }
        
        .critical-item {
          background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
        }
        
        .completed-item {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
        }
      `}</style>
    </div>
  )
}
