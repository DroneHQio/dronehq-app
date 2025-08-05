import { useState } from 'react'

export default function Support() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    category: '',
    priority: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const categories = [
    'Technical Issue',
    'Account & Billing',
    'Feature Request',
    'Training & Onboarding',
    'Compliance Questions',
    'Data Export/Import',
    'Integration Support',
    'General Question'
  ]

  const priorities = [
    'Low - General inquiry',
    'Medium - Non-urgent issue',
    'High - Affects daily operations',
    'Urgent - Service disruption'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission
    setTimeout(() => {
      setSuccess(true)
      setLoading(false)
      setFormData({
        name: '',
        email: '',
        organization: '',
        category: '',
        priority: '',
        subject: '',
        message: ''
      })
    }, 1500)
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a2332 0%, #0f1419 100%)',
      color: 'white',
      padding: '20px'
    }}>
      {/* Header */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#7ED321' }}>
            🚁 DroneHQ.io
          </h2>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          style={{ 
            padding: '12px 24px',
            backgroundColor: 'transparent',
            color: '#7ED321',
            border: '2px solid #7ED321',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Back to Home
        </button>
      </nav>

      {/* Content */}
      <div style={{ 
        maxWidth: '1000px', 
        margin: '40px auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px'
      }}>
        {/* Support Form */}
        <div style={{
          padding: '40px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px'
        }}>
          <h1 style={{ 
            color: '#7ED321', 
            fontSize: '36px', 
            marginBottom: '20px'
          }}>
            Get Support
          </h1>
          
          <p style={{ color: '#B8C5D6', marginBottom: '30px', lineHeight: '1.6' }}>
            Need help with DroneHQ.io? Our support team is here to assist you with technical issues, 
            account questions, and training resources.
          </p>

          {success && (
            <div style={{
              padding: '20px',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '8px',
              marginBottom: '30px',
              border: '2px solid #c3e6cb'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>✅ Support Request Submitted!</h3>
              <p style={{ margin: '0' }}>
                Thank you! We've received your support request and will respond within 24 hours. 
                You'll receive a confirmation email shortly.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ fontWeight: 'bold', color: '#7ED321', display: 'block', marginBottom: '5px' }}>
                  Name *
                </label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '2px solid #7ED321',
                    borderRadius: '5px',
                    fontSize: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                  required
                />
              </div>
              
              <div>
                <label style={{ fontWeight: 'bold', color: '#7ED321', display: 'block', marginBottom: '5px' }}>
                  Email *
                </label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '2px solid #7ED321',
                    borderRadius: '5px',
                    fontSize: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', color: '#7ED321', display: 'block', marginBottom: '5px' }}>
                Organization
              </label>
              <input 
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                placeholder="School, Agency, or Company Name"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '2px solid #7ED321',
                  borderRadius: '5px',
                  fontSize: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ fontWeight: 'bold', color: '#7ED321', display: 'block', marginBottom: '5px' }}>
                  Category *
                </label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '2px solid #7ED321',
                    borderRadius: '5px',
                    fontSize: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} style={{ backgroundColor: '#1a2332' }}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ fontWeight: 'bold', color: '#7ED321', display: 'block', marginBottom: '5px' }}>
                  Priority *
                </label>
                <select 
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '2px solid #7ED321',
                    borderRadius: '5px',
                    fontSize: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                  required
                >
                  <option value="">Select priority</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority} style={{ backgroundColor: '#1a2332' }}>{priority}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', color: '#7ED321', display: 'block', marginBottom: '5px' }}>
                Subject *
              </label>
              <input 
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Brief description of your issue"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '2px solid #7ED321',
                  borderRadius: '5px',
                  fontSize: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ fontWeight: 'bold', color: '#7ED321', display: 'block', marginBottom: '5px' }}>
                Message *
              </label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                rows="6"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '2px solid #7ED321',
                  borderRadius: '5px',
                  fontSize: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  resize: 'vertical'
                }}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              style={{ 
                width: '100%',
                padding: '15px',
                backgroundColor: loading ? '#6c757d' : '#7ED321',
                color: '#1a2332',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '🔄 Submitting...' : '📧 Submit Support Request'}
            </button>
          </form>
        </div>

        {/* Support Information */}
        <div style={{
          padding: '40px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px'
        }}>
          <h2 style={{ 
            color: '#7ED321', 
            fontSize: '28px', 
            marginBottom: '30px'
          }}>
            Support Resources
          </h2>

          {/* Contact Methods */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ color: '#7ED321', fontSize: '20px', marginBottom: '15px' }}>
              📞 Contact Methods
            </h3>
            <div style={{ color: '#B8C5D6', lineHeight: '1.6' }}>
              <p><strong>Email:</strong> support@dronehq.io</p>
              <p><strong>Phone:</strong> [Your Support Number]</p>
              <p><strong>Business Hours:</strong> Monday-Friday, 8 AM - 6 PM CST</p>
              <p><strong>Emergency Support:</strong> Available 24/7 for critical issues</p>
            </div>
          </div>

          {/* Response Times */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ color: '#7ED321', fontSize: '20px', marginBottom: '15px' }}>
              ⏱️ Response Times
            </h3>
            <div style={{ color: '#B8C5D6', lineHeight: '1.8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>🔴 Urgent:</span>
                <span>Within 2 hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>🟡 High:</span>
                <span>Within 8 hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>🟢 Medium:</span>
                <span>Within 24 hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🔵 Low:</span>
                <span>Within 48 hours</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ color: '#7ED321', fontSize: '20px', marginBottom: '15px' }}>
              🔗 Quick Links
            </h3>
            <div style={{ color: '#B8C5D6' }}>
              <a href="#" style={{ color: '#7ED321', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
                📚 Knowledge Base
              </a>
              <a href="#" style={{ color: '#7ED321', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
                🎥 Video Tutorials
              </a>
              <a href="#" style={{ color: '#7ED321', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
                📖 User Manual
              </a>
              <a href="#" style={{ color: '#7ED321', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
                🚀 Getting Started Guide
              </a>
              <a href="#" style={{ color: '#7ED321', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
                📊 System Status
              </a>
            </div>
          </div>

          {/* FAQ */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ color: '#7ED321', fontSize: '20px', marginBottom: '15px' }}>
              ❓ Common Questions
            </h3>
            <div style={{ color: '#B8C5D6', fontSize: '14px', lineHeight: '1.6' }}>
              <details style={{ marginBottom: '15px', cursor: 'pointer' }}>
                <summary style={{ color: '#7ED321', fontWeight: 'bold' }}>How do I add students to my class?</summary>
                <p style={{ paddingLeft: '20px', marginTop: '10px' }}>
                  Generate a class code in your teacher dashboard, then share it with students. 
                  They'll sign up using the code and you'll approve their enrollment.
                </p>
              </details>
              
              <details style={{ marginBottom: '15px', cursor: 'pointer' }}>
                <summary style={{ color: '#7ED321', fontWeight: 'bold' }}>Can I export flight log data?</summary>
                <p style={{ paddingLeft: '20px', marginTop: '10px' }}>
                  Yes! Go to Flight Logs → Export to download your data in CSV or PDF format 
                  for compliance reporting.
                </p>
              </details>
              
              <details style={{ marginBottom: '15px', cursor: 'pointer' }}>
                <summary style={{ color: '#7ED321', fontWeight: 'bold' }}>How do license expiration alerts work?</summary>
                <p style={{ paddingLeft: '20px', marginTop: '10px' }}>
                  DroneHQ.io automatically sends email alerts 90, 60, and 30 days before 
                  any license or certification expires.
                </p>
              </details>
              
              <details style={{ marginBottom: '15px', cursor: 'pointer' }}>
                <summary style={{ color: '#7ED321', fontWeight: 'bold' }}>Is my data secure?</summary>
                <p style={{ paddingLeft: '20px', marginTop: '10px' }}>
                  Absolutely! We use enterprise-grade encryption, secure servers, and strict 
                  access controls to protect your drone program data.
                </p>
              </details>
            </div>
          </div>

          {/* Training */}
          <div>
            <h3 style={{ color: '#7ED321', fontSize: '20px', marginBottom: '15px' }}>
              🎓 Training & Onboarding
            </h3>
            <p style={{ color: '#B8C5D6', lineHeight: '1.6', marginBottom: '15px' }}>
              New to DroneHQ.io? We offer comprehensive training sessions:
            </p>
            <ul style={{ color: '#B8C5D6', paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Live onboarding sessions for organizations</li>
              <li>Teacher training workshops</li>
              <li>Student orientation guides</li>
              <li>Custom training for large deployments</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        borderTop: '1px solid rgba(126, 211, 33, 0.2)',
        marginTop: '60px'
      }}>
        <p style={{ color: '#B8C5D6', fontSize: '14px' }}>
          © 2025 DroneHQ.io - Professional Drone Program Management<br/>
          Developed by <strong style={{ color: '#7ED321' }}>Metro TXK Media</strong>
        </p>
      </div>
    </div>
  )
}
