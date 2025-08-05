// ============================================
// UPDATE 1: Homepage (pages/index.js)
// Replace the existing homepage content with this:
// ============================================

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a2332 0%, #0f1419 100%)',
      color: 'white',
      padding: '20px'
    }}>
      {/* Navigation Header */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Logo would go here - for now using text */}
          <h2 style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#7ED321' }}>
            🚁 DroneHQ.io
          </h2>
        </div>
        <button 
          onClick={() => window.location.href = '/login'}
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
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        maxWidth: '900px', 
        margin: '80px auto',
        padding: '0 20px'
      }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #7ED321, #5CB020)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Complete Drone Program Management
        </h1>
        
        <p style={{ 
          fontSize: '22px', 
          marginBottom: '40px', 
          color: '#B8C5D6',
          lineHeight: '1.6'
        }}>
          Streamline flight logging, safety checklists, and compliance management for schools, 
          public safety agencies, and drone programs of all sizes.
        </p>

        {/* Call-to-Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '60px'
        }}>
          <button 
            onClick={() => window.location.href = '/signup/organization'}
            style={{ 
              padding: '18px 36px', 
              fontSize: '18px', 
              backgroundColor: '#7ED321', 
              color: '#1a2332', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(126, 211, 33, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            🏫 Start Organization Trial
          </button>
          
          <button 
            onClick={() => window.location.href = '/signup/teacher'}
            style={{ 
              padding: '18px 36px', 
              fontSize: '18px', 
              backgroundColor: 'transparent', 
              color: '#7ED321', 
              border: '2px solid #7ED321', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🎓 Join as Teacher
          </button>
        </div>

        {/* Features Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          marginTop: '80px'
        }}>
          <div style={{ 
            padding: '30px', 
            backgroundColor: 'rgba(126, 211, 33, 0.1)', 
            borderRadius: '12px',
            border: '1px solid rgba(126, 211, 33, 0.2)'
          }}>
            <h3 style={{ color: '#7ED321', fontSize: '20px', marginBottom: '15px' }}>
              ✈️ Flight Logging
            </h3>
            <p style={{ color: '#B8C5D6', lineHeight: '1.5' }}>
              Complete flight records with GPS, weather, and duration tracking. 
              Perfect for compliance and safety documentation.
            </p>
          </div>

          <div style={{ 
            padding: '30px', 
            backgroundColor: 'rgba(126, 211, 33, 0.1)', 
            borderRadius: '12px',
            border: '1px solid rgba(126, 211, 33, 0.2)'
          }}>
            <h3 style={{ color: '#7ED321', fontSize: '20px', marginBottom: '15px' }}>
              📋 Digital Checklists
            </h3>
            <p style={{ color: '#B8C5D6', lineHeight: '1.5' }}>
              Standardized pre-flight and post-flight safety checklists. 
              Ensure consistent procedures across your entire program.
            </p>
          </div>

          <div style={{ 
            padding: '30px', 
            backgroundColor: 'rgba(126, 211, 33, 0.1)', 
            borderRadius: '12px',
            border: '1px solid rgba(126, 211, 33, 0.2)'
          }}>
            <h3 style={{ color: '#7ED321', fontSize: '20px', marginBottom: '15px' }}>
              🆔 License Management
            </h3>
            <p style={{ color: '#B8C5D6', lineHeight: '1.5' }}>
              Track pilot certifications and get automatic expiration alerts. 
              Never let important licenses expire again.
            </p>
          </div>

          <div style={{ 
            padding: '30px', 
            backgroundColor: 'rgba(126, 211, 33, 0.1)', 
            borderRadius: '12px',
            border: '1px solid rgba(126, 211, 33, 0.2)'
          }}>
            <h3 style={{ color: '#7ED321', fontSize: '20px', marginBottom: '15px' }}>
              🏢 Multi-Organization
            </h3>
            <p style={{ color: '#B8C5D6', lineHeight: '1.5' }}>
              Perfect for school districts, training programs, and agencies. 
              Manage multiple locations from one platform.
            </p>
          </div>

          <div style={{ 
            padding: '30px', 
            backgroundColor: 'rgba(126, 211, 33, 0.1)', 
            borderRadius: '12px',
            border: '1px solid rgba(126, 211, 33, 0.2)'
          }}>
            <h3 style={{ color: '#7ED321', fontSize: '20px', marginBottom: '15px' }}>
              📊 Class Management
            </h3>
            <p style={{ color: '#B8C5D6', lineHeight: '1.5' }}>
              Teachers get unique class codes for student enrollment. 
              Track progress across entire drone education programs.
            </p>
          </div>

          <div style={{ 
            padding: '30px', 
            backgroundColor: 'rgba(126, 211, 33, 0.1)', 
            borderRadius: '12px',
            border: '1px solid rgba(126, 211, 33, 0.2)'
          }}>
            <h3 style={{ color: '#7ED321', fontSize: '20px', marginBottom: '15px' }}>
              📧 Smart Alerts
            </h3>
            <p style={{ color: '#B8C5D6', lineHeight: '1.5' }}>
              Automated notifications for license renewals, maintenance schedules, 
              and compliance deadlines.
            </p>
          </div>
        </div>

        {/* Social Proof Section */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '100px',
          padding: '40px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: '#7ED321', marginBottom: '20px' }}>
            Trusted by Drone Programs Worldwide
          </h3>
          <p style={{ color: '#B8C5D6', fontSize: '18px' }}>
            Join thousands of educators, safety professionals, and pilots who trust DroneHQ.io 
            for their drone program management needs.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '40px 20px',
        borderTop: '1px solid rgba(126, 211, 33, 0.2)',
        marginTop: '60px',
        color: '#B8C5D6'
      }}>
        <p>© 2025 DroneHQ.io - Professional Drone Program Management</p>
        <div style={{ marginTop: '10px' }}>
          <a href="#" style={{ color: '#7ED321', textDecoration: 'none', margin: '0 15px' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#7ED321', textDecoration: 'none', margin: '0 15px' }}>Terms of Service</a>
          <a href="#" style={{ color: '#7ED321', textDecoration: 'none', margin: '0 15px' }}>Support</a>
        </div>
      </footer>
    </div>
  )
}

// ============================================
// UPDATE 2: Dashboard Header (pages/dashboard.js)
// Find the header section and update to match branding:
// ============================================

// In dashboard.js, update the header section to:
<div style={{ 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
  background: 'linear-gradient(135deg, #1a2332 0%, #0f1419 100%)',
  color: 'white',
  padding: '20px 30px',
  borderRadius: '10px',
  marginBottom: '30px'
}}>
  <h1 style={{ margin: '0', color: '#7ED321' }}>🚁 DroneHQ.io Dashboard</h1>
  <div>
    <span style={{ marginRight: '20px', color: '#B8C5D6' }}>Welcome, {user.email}!</span>
    <button 
      onClick={handleSignOut}
      style={{ 
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      Sign Out
    </button>
  </div>
</div>

// ============================================
// UPDATE 3: Login Page Branding (pages/login.js)
// Update the login header to match:
// ============================================

// In login.js, update the header to:
<div style={{ 
  maxWidth: '400px', 
  margin: '100px auto', 
  padding: '0',
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
}}>
  <div style={{
    backgroundColor: '#1a2332',
    color: 'white',
    padding: '30px',
    textAlign: 'center'
  }}>
    <h2 style={{ margin: '0', color: '#7ED321', fontSize: '24px' }}>
      🚁 DroneHQ.io
    </h2>
    <p style={{ margin: '10px 0 0 0', color: '#B8C5D6' }}>
      Professional Drone Management
    </p>
  </div>
  
  <div style={{ padding: '30px', backgroundColor: 'white' }}>
    {/* Rest of login form stays the same */}
  </div>
</div>
