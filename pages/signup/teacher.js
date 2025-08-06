import { useState, useEffect } from 'react'
import { supabase, signUp } from '../../lib/supabase'
import { useRouter } from 'next/router'

export default function TeacherSignup() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [orgInfo, setOrgInfo] = useState(null)
  const [validatingOrgCode, setValidatingOrgCode] = useState(false)
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
    organizationCode: '',
    
    // Class Setup
    className: '',
    classDescription: '',
    expectedStudents: '25',
    
    // Agreement
    acceptTerms: false
  })

  const gradeLevels = [
    '6th Grade',
    '7th Grade', 
    '8th Grade',
    '9th Grade',
    '10th Grade',
    '11th Grade',
    '12th Grade',
    'College Freshman',
    'College Sophomore',
    'College Junior',
    'College Senior',
    'Graduate Student',
    'Adult Learner'
  ]

  const experienceLevels = [
    'No experience',
    'Some experience (recreational)',
    'Moderate experience (1-2 years)',
    'Advanced (3+ years)',
    'Expert level'
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleOrgCodeChange = async (e) => {
    const code = e.target.value.toUpperCase()
    setFormData({
      ...formData,
      organizationCode: code
    })
    
    // Validate organization code
    if (code.length >= 6) {
      setValidatingOrgCode(true)
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('teacher_code', code)
          .single()

        if (data) {
          setOrgInfo(data)
          setMessage('')
        } else {
          setOrgInfo(null)
          setMessage('Invalid teacher code. Please verify with your organization administrator.')
        }
      } catch (err) {
        setOrgInfo(null)
        setMessage('Invalid teacher code. Please contact support@dronehq.io for assistance.')
      }
      setValidatingOrgCode(false)
    } else {
      setOrgInfo(null)
    }
  }

  const generateClassCode = () => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
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

    if (!orgInfo) {
      setMessage('Error: Please enter a valid teacher code')
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
          organization_id: orgInfo.id,
          role: 'teacher',
          approved: false // Needs org admin approval
        }])

      if (roleError) {
        setMessage(`Error creating teacher role: ${roleError.message}`)
        setLoading(false)
        return
      }

      // 4. Create class code (inactive until approved)
      const classCode = generateClassCode()

      const { error: classError } = await supabase
        .from('class_codes')
        .insert([{
          code: classCode,
          teacher_id: authData.user.id,
          organization_id: orgInfo.id,
          class_name: formData.className,
          description: formData.classDescription,
          max_students: parseInt(formData.expectedStudents),
          active: false // Will be activated when teacher is approved
        }])

      if (classError) {
        setMessage(`Error creating class: ${classError.message}`)
        setLoading(false)
        return
      }

      // Success message
      setMessage(`
        🎉 Teacher account created successfully! 
        
        📋 Your Details:
        • Name: ${formData.firstName} ${formData.lastName}
        • Organization: ${orgInfo.name}
        • Class: ${formData.className}
        • Class Code: ${classCode} (inactive until approved)
        
        ⏳ Next Steps:
        1. Check your email to verify your account
        2. Wait for organization admin approval
        3. Once approved, you can share class code "${classCode}" with students
        
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
        organizationCode: '',
        className: '',
        classDescription: '',
        expectedStudents: '25',
        acceptTerms: false
      })
      setOrgInfo(null)

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
            <img 
              src="/images/logo.png" 
              alt="DroneHQ.io"
              style={{ 
                height: '40px', 
                width: 'auto',
                marginRight: '15px'
              }}
            />
            <h1 style={{ margin: '0', fontSize: '32px' }}>DroneHQ.io</h1>
          </div>
          <h2>Join as Teacher</h2>
          <p>Create your drone class and get a unique class code</p>
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
            {/* Organization Code Section */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ 
                borderBottom: '2px solid #e9ecef', 
                paddingBottom: '10px',
                color: '#495057'
              }}>
                🔑 Organization Access Code
              </h3>
              
              <div style={{ marginTop: '20px' }}>
                <label style={{ fontWeight: 'bold', color: '#495057' }}>Enter Teacher Access Code *</label>
                <input 
                  type="text"
                  name="organizationCode"
                  value={formData.organizationCode}
                  onChange={handleOrgCodeChange}
                  placeholder="e.g. T1234567"
                  maxLength="8"
                  style={{ 
                    width: '100%', 
                    maxWidth: '300px',
                    padding: '15px', 
                    marginTop: '5px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                  }}
                  required
                />
                
                {validatingOrgCode && (
                  <div style={{ 
                    marginTop: '10px', 
                    color: '#28a745',
                    fontSize: '14px'
                  }}>
                    🔍 Validating organization code...
                  </div>
                )}

                {orgInfo && (
                  <div style={{ 
                    marginTop: '15px', 
                    padding: '20px', 
                    backgroundColor: '#d4edda', 
                    borderRadius: '8px',
                    border: '2px solid #c3e6cb'
                  }}>
                    <h4 style={{ color: '#155724', margin: '0 0 10px 0' }}>
                      ✅ Organization Found!
                    </h4>
                    <div style={{ color: '#155724' }}>
                      <strong>Organization:</strong> {orgInfo.name}<br/>
                      <strong>Type:</strong> {orgInfo.settings?.type}<br/>
                      <strong>Code:</strong> {orgInfo.organization_code}
                    </div>
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
                  📝 <strong>Need a Teacher Code?</strong><br/>
                  Contact your organization administrator or email support@dronehq.io for assistance.
                </div>
              </div>
            </div>

            {/* Only show rest of form if organization code is valid */}
            {orgInfo && (
              <>
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
                        {experienceLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
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
                    Already have an account? <a href="/login" style={{ color: '#28a745' }}>Sign in here</a>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
