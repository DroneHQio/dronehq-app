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
          marginBottom: '20px', 
          color: '#B8C5D6',
          lineHeight: '1.6',
          fontWeight: '500'
        }}>
          Manage Your Drone Program with Confidence
        </p>
        
        <p style={{ 
          fontSize: '18px', 
          marginBottom: '30px', 
          color: '#B8C5D6',
          lineHeight: '1.6',
          maxWidth: '800px',
          margin: '0 auto 30px auto'
        }}>
          DroneHQ.io is an all-in-one platform designed for schools, public safety agencies, and independent pilots. 
          From flight logging and equipment tracking to license management and LAANC-ready airspace checks, 
          DroneHQ.io brings every part of your drone program into one streamlined dashboard.
        </p>

        {/* Feature Checkmarks */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '12px',
          maxWidth: '800px',
          margin: '0 auto 40px auto',
          textAlign: 'left'
        }}>
          <div style={{ color: '#7ED321', fontSize: '16px' }}>
            ✅ Real-time flight logs with GPS and time-stamped records
          </div>
          <div style={{ color: '#7ED321', fontSize: '16px' }}>
            ✅ Equipment check-in/out and lifecycle tracking
          </div>
          <div style={{ color: '#7ED321', fontSize: '16px' }}>
            ✅ Certification monitoring with automated renewal alerts
          </div>
          <div style={{ color: '#7ED321', fontSize: '16px' }}>
            ✅ Digital pre-flight checklists and compliance tools
          </div>
          <div style={{ color: '#7ED321', fontSize: '16px' }}>
            ✅ Organization management with role-based permissions
          </div>
          <div style={{ color: '#7ED321', fontSize: '16px' }}>
            ✅ Built-in invoicing and reporting for agencies and solo pilots
          </div>
        </div>

        <p style={{ 
          fontSize: '16px', 
          marginBottom: '40px', 
          color: '#B8C5D6',
          lineHeight: '1.6',
          fontStyle: 'italic'
        }}>
          Whether you're running a classroom drone fleet, managing a public safety program, or operating as a solo pilot, 
          DroneHQ.io helps you stay compliant, organized, and mission-ready.
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

          <button 
            onClick={() => window.location.href = '/signup/student'}
            style={{ 
              padding: '18px 36px', 
              fontSize: '18px', 
              backgroundColor: '#17a2b8', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🎓 Student Signup
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
