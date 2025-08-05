import { useState, useEffect } from 'react'
import { supabase, signUp } from '../../lib/supabase'
import { useRouter } from 'next/router'

export default function StudentSignup() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [classInfo, setClassInfo] = useState(null)
  const [validatingCode, setValidatingCode] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    // Class Code
    classCode: '',
    
    // Student Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Student Details
    studentId: '',
    gradeLevel: '',
    dateOfBirth: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    // Experience
    droneExperience: '',
    programmingExperience: '',
    
    // Agreements
    acceptTerms: false,
    parentalConsent: false
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

  const emergencyRelations = [
    'Parent',
    'Guardian',
    'Grandparent',
    'Aunt/Uncle',
    'Sibling',
    'Family Friend',
    'Other'
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const validateClassCode = async (code) => {
    if (!code || code.length < 6) {
      setClassInfo(null)
      return
    }

    setValidatingCode(true)
    try {
      const { data, error } = await supabase
        .from('class_codes')
        .select(`
          *,
          organizations (name),
          teacher:auth.users!teacher_id (
            email,
            user_profiles (first_name, last_name)
          )
        `)
        .eq('code', code.toUpperCase())
        .eq('active', true)
        .single()

      if (data) {
        setClassInfo(data)
        setMessage('')
      } else {
        setClassInfo(null)
        setMessage('Class code not found or inactive. Please check with your teacher.')
      }
    } catch (err) {
      setClassInfo(null)
      setMessage('Invalid class code. Please verify with your teacher.')
    }
    setValidatingCode(false)
  }

  const handleClassCodeChange = (e) => {
    const code = e.target.value.toUpperCase()
    setFormData({
      ...formData,
      classCode: code
    })
    
    // Validate after user stops typing
    if (code.length >= 6) {
      setTimeout(() => validateClassCode(code), 500)
    } else {
      setClassInfo(null)
    }
  }

  const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Validation
    if (!classInfo) {
      setMessage('Error: Please enter a valid class code')
      setLoading(false)
      return
    }

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

    // Check age for parental consent requirement
    const age = calculateAge(formData.dateOfBirth)
    if (age < 18 && !formData.parentalConsent) {
      setMessage('Error: Parental consent is required for students under 18')
      setLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setMessage('Error: Please accept the terms and conditions')
      setLoading(false)
      return
    }

    // Check if class is at capacity
    if (classInfo.current_students >= classInfo.max_students) {
      setMessage('Error: This class is at maximum capacity. Please contact your teacher.')
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
          phone: formData.phone,
          student_id: formData.studentId,
          grade_level: formData.gradeLevel,
          emergency_contact: formData.emergencyContactName,
          emergency_phone: formData.emergencyContactPhone
        }])

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      // 3. Create student role (pending teacher approval)
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: authData.user.id,
          organization_id: classInfo.organization_id,
          role: 'student',
          class_code_id: classInfo.id,
          approved: false // Needs teacher approval
        }])

      if (roleError) {
        setMessage(`Error creating student role: ${roleError.message}`)
        setLoading(false)
        return
      }

      // 4. Update class student count
      const { error: updateError } = await supabase
        .from('class_codes')
        .update({ 
          current_students: classInfo.current_students + 1 
        })
        .eq('id', classInfo.id)

      if (updateError) {
        console.error('Error updating student count:', updateError)
      }

      // Success message
      setMessage(`
        🎉 Student account created successfully! 
        
        📋 Your Details:
        • Name: ${formData.firstName} ${formData.lastName}
        • Class: ${classInfo.class_name}
        • Teacher: ${classInfo.teacher[0]?.user_profiles[0]?.first_name} ${classInfo.teacher[0]?.user_profiles[0]?.last_name}
        • Organization: ${classInfo.organizations.name}
        
        ⏳ Next Steps:
        1. Check your email to verify your account
        2. Wait for your teacher to approve your enrollment
        3. Once approved, you can start logging flights and completing checklists!
        
        Your teacher will receive a notification about your enrollment request.
      `)
      
      // Clear form
      setFormData({
        classCode: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        studentId: '',
        gradeLevel: '',
        dateOfBirth: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        droneExperience: '',
        programmingExperience: '',
        acceptTerms: false,
        parentalConsent: false
      })
      setClassInfo(null)

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
          backgroundColor: '#17a2b8',
          color: 'white',
          padding: '30px',
          borderRadius: '10px 10px 0 0',
          textAlign: 'center'
        }}>
          <h1>🎓 Join Your Drone Class</h1>
          <h2>Student Registration</h2>
          <p>Enter your class code to get started</p>
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
            {/* Class Code Section */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ 
                borderBottom: '2px solid #e9ecef', 
                paddingBottom: '10px',
                color: '#495057'
              }}>
                🔑 Class Code
              </h3>
              
              <div style={{ marginTop: '20px' }}>
                <label style={{ fontWeight: 'bold', color: '#495057' }}>Enter Your Class Code *</label>
                <input 
                  type="text"
                  name="classCode"
                  value={formData.classCode}
                  onChange={handleClassCodeChange}
                  placeholder="e.g. AERO2025"
                  maxLength="10"
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
                
                {validatingCode && (
                  <div style={{ 
                    marginTop: '10px', 
                    color: '#17a2b8',
                    fontSize: '14px'
                  }}>
                    🔍 Validating class code...
                  </div>
                )}

                {classInfo && (
                  <div style={{ 
                    marginTop: '15px', 
                    padding: '20px', 
                    backgroundColor: '#d4edda', 
                    borderRadius: '8px',
                    border: '2px solid #c3e6cb'
                  }}>
                    <h4 style={{ color: '#155724', margin: '0 0 10px 0' }}>
                      ✅ Class Found!
                    </h4>
                    <div style={{ color: '#155724' }}>
                      <strong>Class:</strong> {classInfo.class_name}<br/>
                      <strong>Organization:</strong> {classInfo.organizations.name}<br/>
                      <strong>Teacher:</strong> {classInfo.teacher[0]?.user_profiles[0]?.first_name} {classInfo.teacher[0]?.user_profiles[0]?.last_name}<br/>
                      <strong>Students:</strong> {classInfo.current_students}/{classInfo.max_students}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Only show rest of form if class code is valid */}
            {classInfo && (
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

                {/* Student Details */}
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ 
                    borderBottom: '2px solid #e9ecef', 
                    paddingBottom: '10px',
                    color: '#495057'
                  }}>
                    📚 Student Details
                  </h3>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginTop: '20px'
                  }}>
                    <div>
                      <label style={{ fontWeight: 'bold', color: '#495057' }}>Student ID</label>
                      <input 
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        placeholder="School ID number"
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
                      <label style={{ fontWeight: 'bold', color: '#495057' }}>Grade Level *</label>
                      <select 
                        name="gradeLevel"
                        value={formData.gradeLevel}
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
                        <option value="">Select grade level</option>
                        {gradeLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ fontWeight: 'bold', color: '#495057' }}>Date of Birth *</label>
                      <input 
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
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

                {/* Emergency Contact */}
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ 
                    borderBottom: '2px solid #e9ecef', 
                    paddingBottom: '10px',
                    color: '#495057'
                  }}>
                    🚨 Emergency Contact
                  </h3>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginTop: '20px'
                  }}>
                    <div>
                      <label style={{ fontWeight: 'bold', color: '#495057' }}>Emergency Contact Name *</label>
                      <input 
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
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
                      <label style={{ fontWeight: 'bold', color: '#495057' }}>Emergency Contact Phone *</label>
                      <input 
                        type="tel"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
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
                        required
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontWeight: 'bold', color: '#495057' }}>Relationship *</label>
                      <select 
                        name="emergencyContactRelation"
                        value={formData.emergencyContactRelation}
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
                        <option value="">Select relationship</option>
                        {emergencyRelations.map(relation => (
                          <option key={relation} value={relation}>{relation}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ 
                    borderBottom: '2px solid #e9ecef', 
                    paddingBottom: '10px',
                    color: '#495057'
                  }}>
                    🎯 Experience Level
                  </h3>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px',
                    marginTop: '20px'
                  }}>
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
                        <option value="">Select experience level</option>
                        {experienceLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ fontWeight: 'bold', color: '#495057' }}>Programming Experience</label>
                      <select 
                        name="programmingExperience"
                        value={formData.programmingExperience}
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
                        <option value="">Select experience level</option>
                        {experienceLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Terms and Submit */}
                <div style={{ 
                  borderTop: '2px solid #e9ecef',
                  paddingTop: '30px'
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      marginBottom: '15px',
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
                        requires teacher approval before activation.
                      </span>
                    </label>

                    {formData.dateOfBirth && calculateAge(formData.dateOfBirth) < 18 && (
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        marginBottom: '15px',
                        cursor: 'pointer'
                      }}>
                        <input 
                          type="checkbox"
                          name="parentalConsent"
                          checked={formData.parentalConsent}
                          onChange={handleInputChange}
                          style={{ 
                            marginRight: '12px', 
                            transform: 'scale(1.2)' 
                          }}
                          required
                        />
                        <span>
                          I have parental/guardian consent to participate in this drone program 
                          (required for students under 18).
                        </span>
                      </label>
                    )}
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <button 
                      type="submit"
                      disabled={loading}
                      style={{ 
                        padding: '15px 40px',
                        backgroundColor: loading ? '#6c757d' : '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 15px rgba(23, 162, 184, 0.3)'
                      }}
                    >
                      {loading ? '🔄 Creating Student Account...' : '🎓 Join Class'}
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
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
