import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Licenses() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [licenses, setLicenses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingLicense, setEditingLicense] = useState(null)
  const router = useRouter()

  // Form data
  const [formData, setFormData] = useState({
    pilot_name: '',
    license_type: '',
    license_number: '',
    issue_date: '',
    expiration_date: '',
    issuing_authority: '',
    notes: ''
  })

  const licenseTypes = [
    'Part 107 Remote Pilot Certificate',
    'Private Pilot License',
    'Commercial Pilot License',
    'Flight Instructor Certificate',
    'Student Pilot Certificate',
    'Recreational Pilot Certificate',
    'Other'
  ]

  const issuingAuthorities = [
    'FAA (Federal Aviation Administration)',
    'Transport Canada',
    'EASA (European Aviation Safety Agency)',
    'CASA (Civil Aviation Safety Authority)',
    'Other'
  ]

  useEffect(() => {
    checkUser()
    loadLicenses()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
    } else {
      router.push('/login')
    }
  }

  const loadLicenses = async () => {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .order('expiration_date', { ascending: true })

    if (data) {
      setLicenses(data)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const resetForm = () => {
    setFormData({
      pilot_name: '',
      license_type: '',
      license_number: '',
      issue_date: '',
      expiration_date: '',
      issuing_authority: '',
      notes: ''
    })
    setEditingLicense(null)
    setShowForm(false)
  }

  const handleEdit = (license) => {
    setFormData({
      pilot_name: license.pilot_name,
      license_type: license.license_type,
      license_number: license.license_number,
      issue_date: license.issue_date,
      expiration_date: license.expiration_date,
      issuing_authority: license.issuing_authority,
      notes: license.notes || ''
    })
    setEditingLicense(license)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingLicense) {
        // Update existing license
        const { data, error } = await supabase
          .from('licenses')
          .update(formData)
          .eq('id', editingLicense.id)

        if (error) {
          alert('Error updating license: ' + error.message)
        } else {
          alert('License updated successfully!')
          resetForm()
          loadLicenses()
        }
      } else {
        // Create new license
        const { data, error } = await supabase
          .from('licenses')
          .insert([{
            ...formData,
            user_id: user.id
          }])

        if (error) {
          alert('Error saving license: ' + error.message)
        } else {
          alert('License added successfully!')
          resetForm()
          loadLicenses()
        }
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }

    setLoading(false)
  }

  const handleDelete = async (licenseId) => {
    if (!confirm('Are you sure you want to delete this license?')) {
      return
    }

    const { error } = await supabase
      .from('licenses')
      .delete()
      .eq('id', licenseId)

    if (error) {
      alert('Error deleting license: ' + error.message)
    } else {
      alert('License deleted successfully!')
      loadLicenses()
    }
  }

  const getDaysUntilExpiration = (expirationDate) => {
    const today = new Date()
    const expDate = new Date(expirationDate)
    const diffTime = expDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (expirationDate) => {
    const days = getDaysUntilExpiration(expirationDate)
    if (days < 0) return '#dc3545' // Red - expired
    if (days <= 30) return '#ffc107' // Yellow - expiring soon
    if (days <= 90) return '#fd7e14' // Orange - warning
    return '#28a745' // Green - good
  }

  const getStatusText = (expirationDate) => {
    const days = getDaysUntilExpiration(expirationDate)
    if (days < 0) return 'EXPIRED'
    if (days === 0) return 'EXPIRES TODAY'
    if (days <= 30) return `Expires in ${days} days`
    if (days <= 90) return `Expires in ${days} days`
    return 'Active'
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>🆔 License & Certification Management</h1>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{ 
              padding: '12px 24px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {showForm ? 'Cancel' : '+ Add License'}
          </button>
        </div>
      </div>

      {/* Add/Edit License Form */}
      {showForm && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '30px', 
          borderRadius: '10px',
          marginBottom: '30px',
          border: '2px solid #0070f3'
        }}>
          <h2>{editingLicense ? 'Edit License' : 'Add New License'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
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
                <label>License Type:</label>
                <select 
                  name="license_type"
                  value={formData.license_type}
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
                  <option value="">Select license type</option>
                  {licenseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>License Number:</label>
                <input 
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  placeholder="e.g. 4567890"
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
                <label>Issue Date:</label>
                <input 
                  type="date"
                  name="issue_date"
                  value={formData.issue_date}
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
                <label>Expiration Date:</label>
                <input 
                  type="date"
                  name="expiration_date"
                  value={formData.expiration_date}
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
                <label>Issuing Authority:</label>
                <select 
                  name="issuing_authority"
                  value={formData.issuing_authority}
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
                  <option value="">Select authority</option>
                  {issuingAuthorities.map(authority => (
                    <option key={authority} value={authority}>{authority}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label>Notes:</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes about this license..."
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
            
            <div>
              <button 
                type="submit"
                disabled={loading}
                style={{ 
                  padding: '12px 30px',
                  backgroundColor: loading ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginRight: '10px'
                }}
              >
                {loading ? 'Saving...' : (editingLicense ? 'Update License' : 'Add License')}
              </button>
              <button 
                type="button"
                onClick={resetForm}
                style={{ 
                  padding: '12px 30px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* License List */}
      <div>
        <h2>Current Licenses</h2>
        {licenses.length === 0 ? (
          <div style={{ 
            padding: '40px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <h3>No licenses added yet</h3>
            <p>Add your first pilot license or certification above.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gap: '20px'
          }}>
            {licenses.map((license) => (
              <div key={license.id} style={{ 
                backgroundColor: 'white',
                border: '2px solid #e9ecef',
                borderRadius: '10px',
                padding: '25px',
                position: 'relative'
              }}>
                {/* Status Badge */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  backgroundColor: getStatusColor(license.expiration_date),
                  color: 'white',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {getStatusText(license.expiration_date)}
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <div>
                    <strong>Pilot:</strong> {license.pilot_name}
                  </div>
                  <div>
                    <strong>License Type:</strong> {license.license_type}
                  </div>
                  <div>
                    <strong>License #:</strong> {license.license_number}
                  </div>
                  <div>
                    <strong>Authority:</strong> {license.issuing_authority}
                  </div>
                  <div>
                    <strong>Issue Date:</strong> {license.issue_date}
                  </div>
                  <div>
                    <strong>Expires:</strong> {license.expiration_date}
                  </div>
                </div>

                {license.notes && (
                  <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '10px', 
                    borderRadius: '5px',
                    marginBottom: '15px'
                  }}>
                    <strong>Notes:</strong> {license.notes}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleEdit(license)}
                    style={{ 
                      padding: '8px 16px',
                      backgroundColor: '#0070f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(license.id)}
                    style={{ 
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
