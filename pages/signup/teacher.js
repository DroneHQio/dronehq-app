import { useState, useEffect } from 'react'
import { supabase, signUp } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function TeacherSignup() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [organizations, setOrganizations] = useState([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)
  const router = useRouter()

  const [formData, setFormData] = useState({
    // Teacher Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Professional Info
    jobTitle: '',
    department: '',
    yearsTeaching: '',
    droneExperience: '',
    
    // Organization
    organizationId: '',
    organizationCode: '',
    
    // Class Setup
    className: '',
    classDescription: '',
    expectedStudents: '25',
    
    // Agreement
    acceptTerms: false
  })

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, organization_code')
        .order('name')

      if (data) {
        setOrganizations(data)
      }
      if (error) {
        console.error('Error loading organizations:', error)
      }
    } catch (err) {
      console.error('Error:', err)
    }
    setLoadingOrgs(false)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleOrganizationSelect = (e) => {
    const selectedOrgId = e.target.value
    const selectedOrg = organizations.find(org => org.id === selectedOrgId)
    
    setFormData({
      ...formData,
      organizationId: selectedOrgId,
      organizationCode: selectedOrg ? selectedOrg.organization_code : ''
    })
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

    if (!formData.organizationId) {
      setMessage('Error: Please select an organization')
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

      // 3. Create teacher role (pending approval)
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: authData.user.id,
          organization_id: formData.organizationId,
          role: 'teacher',
          approved: false // Needs org admin approval
        }])

      if (roleError) {
        setMessage(`Error creating teacher role: ${roleError.message}`)
        setLoading(false)
        return
      }

      // 4. Create class code (inactive until approved)
      const { data: classCodeData, error: classError } = await supabase
        .rpc('generate_class_code')

      if (classError) {
        setMessage(`Error generating class code: ${classError.message}`)
        setLoading(false)
        return
      }

      const { error: classInsertError } = await supabase
        .from('class_codes')
        .insert([{
          code: classCodeData,
          teacher_id: authData.user.id,
          organization_id: formData.organizationId,
          class_name: formData.className,
          description: formData.classDescription,
          max_students: parseInt(formData.expectedStudents),
          active: false // Will be activated when teacher is approved
        }])

      if (classInsertError) {
        setMessage(`Error creating class: ${classInsertError.message}`)
        setLoading(false)
        return
      }

      // Success message
      const selectedOrg = organizations.find(org => org.id === formData.organizationId)
      setMessage(`
        🎉 Teacher account created successfully! 
        
        📋 Your Details:
        • Name: ${formData.firstName} ${formData.lastName}
        • Organization: ${selectedOrg?.name}
        • Class: ${formData.className}
        • Class Code: ${classCodeData} (inactive until approved)
        
        ⏳ Next Steps:
        1. Check your email to verify your account
        2. Wait for organization admin approval
        3. Once approved, you can share class code "${classCodeData}" with students
        
        You'll receive an email notification when your account is approved!
      `)
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        jobTitle: '',
        department: '',
        yearsTeaching: '',
        droneExperience: '',
        organizationId: '',
        organizationCode: '',
        className: '',
        classDescription: '',
        expectedStudents: '25',
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
        maxWidth: '900px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '30px',
          borderRadius: '10px 10px 0 0',
          textAlign: 'center'
        }}>
          <h1>🎓 Join as Teacher</h1>
          <h2>Create Your Drone Class</h2>
          <p>Set up your classroom and get a unique class code for students</p>
        </div>

        <div style={{ padding: '40px' }}>
          {message && (
            <div style={{ 
              padding: '20px', 
              marginBottom: '30px',
              backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da',
              color: message.includes('successfully') ? '#155724' : '#721c24',
              borderRadius: '8px',
              border: `2px solid ${message.includes('successfully') ? '#c3e6cb' : '#f5c6cb'}`,
              whiteSpace: 'pre-line',
              fontSize: '14px'
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ 
                borderBottom: '2px solid #e9ecef', 
                paddingBottom: '10px',
                color: '#495057'
              }}>
                👤 Personal Information
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
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Phone Number</label>
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
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

            {/* Professional Information */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ 
                borderBottom: '2px solid #e9ecef', 
                paddingBottom: '10px',
                color: '#495057'
              }}>
                💼 Professional Background
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginTop: '20px'
              }}>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Job Title</label>
                  <input 
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g. STEM Teacher, Technology Instructor"
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
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Department</label>
                  <input 
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g. Science, Technology, Engineering"
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
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Years Teaching</label>
                  <select 
                    name="yearsTeaching"
                    value={formData.yearsTeaching}
                    onChange={handleInputChange}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '5px',
                      border: '2px solid #e9ecef',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="">Select experience</option>
                    <option value="First year">First year</option>
                    <option value="2-5 years">2-5 years</option>
                    <option value="6-10 years">6-10 years</option>
                    <option value="11-20 years">11-20 years</option>
                    <option value="20+ years">20+ years</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Drone Experience</label>
                  <select 
                    name="droneExperience"
                    value={formData.droneExperience}
                    onChange={handleInputChange}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '5px',
                      border: '2px solid #e9ecef',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner - New to drones</option>
                    <option value="Some experience">Some experience - Recreational use</option>
                    <option value="Experienced">Experienced - Teaching drones 1-2 years</option>
                    <option value="Advanced">Advanced - Teaching drones 3+ years</option>
                    <option value="Part 107 Certified">Part 107 Certified Pilot</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Organization Selection */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ 
                borderBottom: '2px solid #e9ecef', 
                paddingBottom: '10px',
                color: '#495057'
              }}>
                🏫 Organization
              </h3>
              
              <div style={{ marginTop: '20px' }}>
                <label style={{ fontWeight: 'bold', color: '#495057' }}>Select Your Organization *</label>
                {loadingOrgs ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                    Loading organizations...
                  </div>
                ) : (
                  <select 
                    name="organizationId"
                    value={formData.organizationId}
                    onChange={handleOrganizationSelect}
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
                    <option value="">Choose your school/organization</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.organization_code})
                      </option>
                    ))}
                  </select>
                )}
                
                {formData.organizationCode && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    backgroundColor: '#e8f5e8', 
                    borderRadius: '5px',
                    color: '#2e7d32'
                  }}>
                    ✅ Organization Code: <strong>{formData.organizationCode}</strong>
                  </div>
                )}
                
                <div style={{ 
                  marginTop: '15px', 
                  padding: '15px', 
                  backgroundColor: '#fff3cd', 
                  borderRadius: '5px',
                  fontSize: '14px',
                  color: '#856404'
                }}>
                  📝 <strong>Don't see your organization?</strong><br/>
                  Ask your school administrator to register first at the organization signup page.
                </div>
              </div>
            </div>

            {/* Class Setup */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ 
                borderBottom: '2px solid #e9ecef', 
                paddingBottom: '10px',
                color: '#495057'
              }}>
                📚 Class Setup
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr',
                gap: '20px',
                marginTop: '20px'
              }}>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Class Name *</label>
                  <input 
                    type="text"
                    name="className"
                    value={formData.className}
                    onChange={handleInputChange}
                    placeholder="e.g. Aerospace Engineering, Drone Pilot Training"
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
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Expected Students</label>
                  <select 
                    name="expectedStudents"
                    value={formData.expectedStudents}
                    onChange={handleInputChange}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '5px',
                      border: '2px solid #e9ecef',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="15">15 students</option>
                    <option value="20">20 students</option>
                    <option value="25">25 students</option>
                    <option value="30">30 students</option>
                    <option value="35">35 students</option>
                    <option value="50">50+ students</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <label style={{ fontWeight: 'bold', color: '#495057' }}>Class Description</label>
                <textarea 
                  name="classDescription"
                  value={formData.classDescription}
                  onChange={handleInputChange}
                  placeholder="Brief description of your drone class (optional)"
                  rows="3"
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    marginTop: '5px',
                    border: '2px solid #e9ecef',
                    borderRadius: '5px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
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
                  I agree to the DroneHQ.io Terms of Service and understand that my account 
                  requires organization administrator approval before activation.
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
                  {loading ? '🔄 Creating Teacher Account...' : '🎓 Create Teacher Account'}
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
