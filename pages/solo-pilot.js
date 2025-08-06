import { useState } from 'react'
import { supabase, signUp } from '../../lib/supabase'
import { useRouter } from 'next/router'

export default function SoloPilotSignup() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('')
  const [billingCycle, setBillingCycle] = useState('monthly')
  const router = useRouter()

  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Professional Info
    businessName: '',
    businessType: '',
    website: '',
    
    // Address
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Pilot Details
    part107Number: '',
    yearsFlying: '',
    droneTypes: '',
    
    // Business
    serviceTypes: [],
    clientTypes: [],
    
    // Plan Selection
    plan: '',
    
    // Agreement
    acceptTerms: false
  })

  const plans = {
    basic: {
      name: 'Solo Basic',
      monthly: 6.99,
      yearly: 69.99, // ~17% discount (2 months free)
      flights: 15,
      features: [
        '15 flights per month',
        'Basic flight logging',
        'Digital checklists',
        'License management',
        'Basic invoicing (1% platform fee)',
        'Email support'
      ]
    },
    unlimited: {
      name: 'Solo Unlimited',
      monthly: 18.99,
      yearly: 189.99, // ~17% discount (2 months free)
      flights: 'Unlimited',
      features: [
        'Unlimited flights',
        'Advanced flight logging with GPS',
        'Digital checklists',
        'License management',
        'Professional invoicing (0.5% platform fee)',
        'Equipment tracking',
        'Client management',
        'Priority support'
      ]
    }
  }

  const serviceTypes = [
    'Real Estate Photography',
    'Wedding & Event Photography',
    'Construction Inspection',
    'Agriculture Monitoring',
    'Search & Rescue',
    'Insurance Claims',
    'Film & Video Production',
    'Infrastructure Inspection',
    'Surveying & Mapping',
    'Other'
  ]

  const clientTypes = [
    'Real Estate Agents',
    'Construction Companies',
    'Insurance Companies',
    'Event Planners',
    'Agriculture',
    'Government Agencies',
    'Media Companies',
    'Private Individuals',
    'Other'
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleServiceTypeChange = (service) => {
    const updatedServices = formData.serviceTypes.includes(service)
      ? formData.serviceTypes.filter(s => s !== service)
      : [...formData.serviceTypes, service]
    
    setFormData({
      ...formData,
      serviceTypes: updatedServices
    })
  }

  const handleClientTypeChange = (client) => {
    const updatedClients = formData.clientTypes.includes(client)
      ? formData.clientTypes.filter(c => c !== client)
      : [...formData.clientTypes, client]
    
    setFormData({
      ...formData,
      clientTypes: updatedClients
    })
  }

  const generatePilotId = () => {
    return 'P' + Math.random().toString(36).substring(2, 10).toUpperCase()
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

    if (!selectedPlan) {
      setMessage('Error: Please select a plan')
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

      const pilotId = generatePilotId()

      // 2. Create organization for solo pilot
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          name: formData.businessName || `${formData.firstName} ${formData.lastName}`,
          organization_code: pilotId,
          subscription_plan: selectedPlan,
          billing_status: 'trial',
          settings: {
            type: 'solo_pilot',
            business_type: formData.businessType,
            website: formData.website,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            service_types: formData.serviceTypes,
            client_types: formData.clientTypes,
            plan_details: {
              plan: selectedPlan,
              billing_cycle: billingCycle,
              monthly_price: plans[selectedPlan].monthly,
              yearly_price: plans[selectedPlan].yearly,
              flight_limit: plans[selectedPlan].flights
            }
          },
          created_by: authData.user.id
        }])
        .select()

      if (orgError) {
        setMessage(`Error creating pilot account: ${orgError.message}`)
        setLoading(false)
        return
      }

      // 3. Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: authData.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          pilot_id: pilotId,
          part_107_number: formData.part107Number,
          years_flying: formData.yearsFlying,
          drone_types: formData.droneTypes
        }])

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      // 4. Create solo pilot role (automatically approved)
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: authData.user.id,
          organization_id: orgData[0].id,
          role: 'solo_pilot',
          approved: true,
          approved_at: new Date().toISOString()
        }])

      if (roleError) {
        setMessage(`Error assigning pilot role: ${roleError.message}`)
        setLoading(false)
        return
      }

      // Success message
      const planDetails = plans[selectedPlan]
      const price = billingCycle === 'monthly' ? planDetails.monthly : planDetails.yearly
      
      setMessage(`
        🎉 Solo Pilot account created successfully! 
        
        📋 Your Details:
        • Name: ${formData.firstName} ${formData.lastName}
        • Pilot ID: ${pilotId}
        • Plan: ${planDetails.name} (${planDetails.flights} flights)
        • Price: $${price}/${billingCycle === 'monthly' ? 'month' : 'year'}
        • 30-Day Free Trial Active
        
        ⏳ Next Steps:
        1. Check your email to verify your account
        2. Login to start logging flights and managing clients
        3. Set up your invoicing preferences
        
        Your free trial includes all features. Billing starts after 30 days.
      `)
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        businessName: '',
        businessType: '',
        website: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        part107Number: '',
        yearsFlying: '',
        droneTypes: '',
        serviceTypes: [],
        clientTypes: [],
        acceptTerms: false
      })
      setSelectedPlan('')

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
        maxWidth: '1000px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7ED321 0%, #5CB020 100%)',
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
          <h2>Solo Pilot Registration</h2>
          <p>Professional drone services made simple</p>
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
            {/* Plan Selection */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ 
                borderBottom: '2px solid #e9ecef', 
                paddingBottom: '10px',
                color: '#495057',
                textAlign: 'center'
              }}>
                💳 Choose Your Plan
              </h3>
              
              {/* Billing Toggle */}
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'inline-flex', backgroundColor: '#f8f9fa', borderRadius: '25px', padding: '5px' }}>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: billingCycle === 'monthly' ? '#7ED321' : 'transparent',
                      color: billingCycle === 'monthly' ? 'white' : '#6c757d',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('yearly')}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: billingCycle === 'yearly' ? '#7ED321' : 'transparent',
                      color: billingCycle === 'yearly' ? 'white' : '#6c757d',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Yearly (Save 17%)
                  </button>
                </div>
              </div>

              {/* Plan Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '30px',
                marginTop: '20px'
              }}>
                {Object.entries(plans).map(([key, plan]) => {
                  const price = billingCycle === 'monthly' ? plan.monthly : plan.yearly
                  const isSelected = selectedPlan === key
                  
                  return (
                    <div key={key} style={{
                      border: `3px solid ${isSelected ? '#7ED321' : '#e9ecef'}`,
                      borderRadius: '12px',
                      padding: '25px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#f8fff8' : 'white',
                      transition: 'all 0.3s ease'
                    }} onClick={() => setSelectedPlan(key)}>
                      {key === 'unlimited' && (
                        <div style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          padding: '5px 15px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginBottom: '15px',
                          display: 'inline-block'
                        }}>
                          POPULAR
                        </div>
                      )}
                      
                      <h3 style={{ color: '#495057', marginBottom: '10px' }}>{plan.name}</h3>
                      <div style={{ marginBottom: '15px' }}>
                        <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#7ED321' }}>${price}</span>
                        <span style={{ color: '#6c757d' }}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        color: '#495057',
                        marginBottom: '20px'
                      }}>
                        {plan.flights} flights
                      </div>
                      
                      <ul style={{ textAlign: 'left', paddingLeft: '0', listStyle: 'none' }}>
                        {plan.features.map((feature, index) => (
                          <li key={index} style={{ 
                            padding: '5px 0', 
                            color: '#6c757d',
                            fontSize: '14px'
                          }}>
                            ✅ {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <input
                        type="radio"
                        name="plan"
                        value={key}
                        checked={selectedPlan === key}
                        onChange={() => setSelectedPlan(key)}
                        style={{ marginTop: '15px', transform: 'scale(1.2)' }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

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

            {/* Business Information */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ 
                borderBottom: '2px solid #e9ecef', 
                paddingBottom: '10px',
                color: '#495057'
              }}>
                🏢 Business Information
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginTop: '20px'
              }}>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Business Name</label>
                  <input 
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="e.g. Skyline Drone Services (optional)"
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
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Business Type</label>
                  <select 
                    name="businessType"
                    value={formData.businessType}
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
                    <option value="">Select business type</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="LLC">LLC</option>
                    <option value="Corporation">Corporation</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Freelancer">Freelancer</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ fontWeight: 'bold', color: '#495057' }}>Website</label>
                  <input 
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com (optional)"
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
            </div>

            {/* Service Types */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ 
                borderBottom: '2px solid #e9ecef', 
                paddingBottom: '10px',
                color: '#495057'
              }}>
                🎯 Services You Offer
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '10px',
                marginTop: '20px'
              }}>
                {serviceTypes.map(service => (
                  <label key={service} style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    padding: '10px',
                    border: '1px solid #e9ecef',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    backgroundColor: formData.serviceTypes.includes(service) ? '#e8f5e8' : 'white'
                  }}>
                    <input 
                      type="checkbox"
                      checked={formData.serviceTypes.includes(service)}
                      onChange={() => handleServiceTypeChange(service)}
                      style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                    />
                    {service}
                  </label>
                ))}
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
                  I agree to the DroneHQ.io Terms of Service and Privacy Policy. 
                  I understand billing begins after my 30-day free trial.
                </span>
              </label>
              
              <div style={{ textAlign: 'center' }}>
                <button 
                  type="submit"
                  disabled={loading}
                  style={{ 
                    padding: '15px 40px',
                    backgroundColor: loading ? '#6c757d' : '#7ED321',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(126, 211, 33, 0.3)'
                  }}
                >
                  {loading ? '🔄 Creating Account...' : '🚀 Start Free Trial'}
                </button>
              </div>

              <div style={{ 
                textAlign: 'center', 
                marginTop: '20px',
                color: '#6c757d'
              }}>
                Already have an account? <a href="/login" style={{ color: '#7ED321' }}>Sign in here</a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
