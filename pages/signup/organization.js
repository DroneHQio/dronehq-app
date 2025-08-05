import { useState } from 'react'
import { supabase, signUp } from '../../lib/supabase'
import { useRouter } from 'next/router'

export default function OrganizationSignup() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    // Organization Info
    organizationName: '',
    organizationType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    
    // Admin User Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    jobTitle: '',
    
    // Agreement
    acceptTerms: false
  })

  const organizationTypes = [
    'K-12 School District',
    'Individual School',
    'Community College',
    'University',
    'Public Safety Agency',
    'Fire Department',
    'Police Department',
    'Emergency Services',
    'Private Training Company',
    'Other'
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const generateOrgCode = (orgName) => {
    // Generate a unique organization code from name
    const cleaned = orgName.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    const code = cleaned.slice(0, 6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return code
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage('Error: Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setMessage('Error: Password must be at least 8 characters')
      setLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setMessage('Error: Please accept the terms and conditions')
      setLoading(false)
      return
    }

    try {
      // 1. Create the user account
      const { data: authData, error: authError } = await signUp(formData.email, formData.password)
      
      if (authError) {
        setMessage(`Error creating account: ${authError.message}`)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setMessage('Account created! Please check your email to verify your account before continuing.')
        setLoading(false)
        return
      }

      // 2. Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: authData.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone
        }])

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      // 3. Create organization
      const orgCode = generateOrgCode(formData.organizationName)
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          name: formData.organizationName,
          organization_code: orgCode,
          settings: {
            type: formData.organizationType,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            phone: formData.phone
          },
          created_by: authData.user.id
        }])
        .select()

      if (orgError) {
        setMessage(`Error creating organization: ${orgError.message}`)
        setLoading(false)
        return
      }

      // 4. Create org admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: authData.user.id,
          organization_id: orgData[0].id,
          role: 'org_admin',
          approved: true,
          approved_at: new Date().toISOString()
        }])

      if (roleError) {
        setMessage(`Error assigning admin role: ${roleError.message}`)
        setLoading(false)
        return
      }

      setMessage(`Success! Organization "${formData.organizationName}" created with code: ${orgCode}. Please check your email to verify your account, then you can login.`)
      
      // Clear form
      setFormData({
        organizationName: '',
        organizationType: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        jobTitle: '',
        acceptTerms: false
      })

    } catch (err) {
      setMessage(`Unexpected error: ${err.message}`)
    }

    setLoading(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#0070f3',
          color: 'white',
          padding: '30px',
          borderRadius: '10px 10px 0 0',
          textAlign: 'center'
        }}>
          <h1>🚁 Join DroneHQ.io</h1>
          <h2>Organization Registration</h2>
          <p>Set up your drone program management platform</p>
        </div>

        <div style={{ padding: '40px' }}>
          {message && (
            <div style={{ 
              padding: '15px', 
              marginBottom: '30px',
              backgroundColor: message.includes('Success') ? '#d4edda' : '#f8d7da',
              color: message.includes('Success') ? '#155724' : '#721c24',
              borderRadius: '5px',
              border: `1px solid ${message.includes('Success') ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Organization Information */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ 
                borderBottom: '2px solid #e9ecef', 
                paddingBottom: '10px',
                color: '#495057'
              }}>
                📋 Organization Information
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginTop: '20px'
              }}>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Organization Name *</label>
                  <input 
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    placeholder="e.g. Lincoln High School"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '5px',
                      border: '2px solid #e9ecef',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Organization Type *</label>
                  <select 
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleInputChange}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '5px',
                      border: '2px solid #e9ecef',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                    required
                  >
                    <option value="">Select organization type</option>
                    {organizationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: '20px',
                marginTop: '20px'
              }}>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Address</label>
                  <input 
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '5px',
                      border: '2px solid #e9ecef',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>City</label>
                  <input 
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Springfield"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '5px',
                      border: '2px solid #e9ecef',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>State</label>
                  <input 
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="TX"
                    maxLength="2"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '5px',
                      border: '2px solid #e9ecef',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Zip Code</label>
                  <input 
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="75501"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '5px',
                      border: '2px solid #e9ecef',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={{ fontWeight: 'bold', color: '#495057' }}>Organization Phone</label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  style={{ 
                    width: '100%', 
                    maxWidth: '300px',
                    padding: '12px', 
                    marginTop: '5px',
                    border: '2px solid #e9ecef',
                    borderRadius: '5px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>

            {/* Administrator Information */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ 
                borderBottom: '2px solid #e9ecef', 
                paddingBottom: '10px',
                color: '#495057'
              }}>
                👤 Administrator Account
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginTop: '20px'
              }}>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>First Name *</label>
                  <input 
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '5px',
                      border: '2px solid #e9ecef',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Last Name *</label>
                  <input 
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '5px',
                      border: '2px solid #e9ecef',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Job Title</label>
                  <input 
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g. STEM Coordinator"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '5px',
                      border: '2px solid #e9ecef',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '20px',
                marginTop: '20px'
              }}>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Email Address *</label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '5px',
                      border: '2px solid #e9ecef',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Password *</label>
                  <input 
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 8 characters"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '5px',
                      border: '2px solid #e9ecef',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Confirm Password *</label>
                  <input 
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '5px',
                      border: '2px solid #e9ecef',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Terms and Submit */}
            <div style={{ 
              borderTop: '2px solid #e9ecef',
              paddingTop: '30px'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '30px',
                cursor: 'pointer'
              }}>
                <input 
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  style={{ 
                    marginRight: '12px', 
                    transform: 'scale(1.2)' 
                  }}
                  required
                />
                <span>
                  I agree to the DroneHQ.io Terms of Service and Privacy Policy, and I have 
                  the authority to register this organization.
                </span>
              </label>
              
              <div style={{ textAlign: 'center' }}>
                <button 
                  type="submit"
                  disabled={loading}
                  style={{ 
                    padding: '15px 40px',
                    backgroundColor: loading ? '#6c757d' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                  }}
                >
                  {loading ? '🔄 Creating Organization...' : '🚀 Create Organization'}
                </button>
              </div>

              <div style={{ 
                textAlign: 'center', 
                marginTop: '20px',
                color: '#6c757d'
              }}>
                Already have an account? <a href="/login" style={{ color: '#0070f3' }}>Sign in here</a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
