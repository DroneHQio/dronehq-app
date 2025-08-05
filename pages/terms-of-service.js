export default function TermsOfService() {
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
        maxWidth: '800px', 
        margin: '40px auto',
        padding: '40px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        lineHeight: '1.6'
      }}>
        <h1 style={{ 
          color: '#7ED321', 
          fontSize: '36px', 
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          Terms of Service
        </h1>
        
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          <strong>Effective Date:</strong> August 5, 2025<br/>
          <strong>Last Updated:</strong> August 5, 2025
        </p>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          1. Acceptance of Terms
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          By accessing and using DroneHQ.io ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
        </p>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          2. Description of Service
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          DroneHQ.io provides a comprehensive drone program management platform including:
        </p>
        <ul style={{ color: '#B8C5D6', marginBottom: '20px', paddingLeft: '20px' }}>
          <li>Flight logging and record keeping</li>
          <li>Digital safety checklists</li>
          <li>License and certification management</li>
          <li>Equipment tracking and inventory management</li>
          <li>Multi-organization and class management tools</li>
          <li>Compliance reporting and analytics</li>
        </ul>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          3. User Accounts and Responsibilities
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          To use DroneHQ.io, you must:
        </p>
        <ul style={{ color: '#B8C5D6', marginBottom: '20px', paddingLeft: '20px' }}>
          <li>Provide accurate and complete registration information</li>
          <li>Maintain the security of your password and account</li>
          <li>Promptly notify us of any unauthorized use of your account</li>
          <li>Be responsible for all activities that occur under your account</li>
          <li>Comply with all applicable laws and regulations regarding drone operations</li>
        </ul>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          4. Acceptable Use Policy
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          You agree not to use the Service to:
        </p>
        <ul style={{ color: '#B8C5D6', marginBottom: '20px', paddingLeft: '20px' }}>
          <li>Violate any applicable laws or regulations</li>
          <li>Upload false, misleading, or inaccurate flight data</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with the proper functioning of the Service</li>
          <li>Use the Service for any illegal drone operations</li>
          <li>Share your account credentials with unauthorized users</li>
        </ul>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          5. Data Ownership and License
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          You retain ownership of all data you input into DroneHQ.io. By using our Service, you grant us a limited license to:
        </p>
        <ul style={{ color: '#B8C5D6', marginBottom: '20px', paddingLeft: '20px' }}>
          <li>Store and process your data to provide the Service</li>
          <li>Create aggregate, anonymized analytics to improve our platform</li>
          <li>Share data with regulatory authorities when legally required</li>
        </ul>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          6. Payment Terms
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          For paid services:
        </p>
        <ul style={{ color: '#B8C5D6', marginBottom: '20px', paddingLeft: '20px' }}>
          <li>Subscription fees are billed in advance on a monthly or annual basis</li>
          <li>All fees are non-refundable except as required by law</li>
          <li>We may change pricing with 30 days advance notice</li>
          <li>Failure to pay may result in service suspension or termination</li>
        </ul>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          7. Service Availability
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          While we strive for 99.9% uptime, we do not guarantee uninterrupted service. We may perform maintenance, updates, or experience temporary outages. Critical maintenance will be announced in advance when possible.
        </p>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          8. Intellectual Property
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          The DroneHQ.io platform, including its software, design, content, and trademarks, is owned by DroneHQ.io and protected by intellectual property laws. You may not copy, modify, or distribute our platform without written permission.
        </p>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          9. Disclaimer of Warranties
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          DroneHQ.io is provided "as is" without warranties of any kind. We do not guarantee that the Service will meet your specific requirements or that it will be error-free, secure, or continuously available.
        </p>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          10. Limitation of Liability
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          DroneHQ.io shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.
        </p>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          11. Compliance and Regulatory Responsibility
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          While DroneHQ.io helps you maintain compliance records, you remain solely responsible for:
        </p>
        <ul style={{ color: '#B8C5D6', marginBottom: '20px', paddingLeft: '20px' }}>
          <li>Complying with all applicable drone regulations (FAA, local, international)</li>
          <li>Maintaining valid licenses and certifications</li>
          <li>Ensuring safe drone operations</li>
          <li>Obtaining necessary airspace authorizations</li>
        </ul>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          12. Termination
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          Either party may terminate this agreement at any time. Upon termination:
        </p>
        <ul style={{ color: '#B8C5D6', marginBottom: '20px', paddingLeft: '20px' }}>
          <li>Your access to the Service will cease</li>
          <li>You may export your data for 30 days after termination</li>
          <li>We may delete your data after the export period</li>
          <li>Prepaid fees are non-refundable</li>
        </ul>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          13. Governing Law
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          These Terms of Service are governed by the laws of the State of Arkansas, United States, without regard to conflict of law principles.
        </p>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          14. Changes to Terms
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          We reserve the right to modify these terms at any time. We will notify users of material changes via email or through the Service. Continued use after changes constitutes acceptance of the new terms.
        </p>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          15. Contact Information
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          For questions about these Terms of Service, contact us at:
        </p>
        <div style={{ 
          color: '#7ED321', 
          backgroundColor: 'rgba(126, 211, 33, 0.1)', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '40px'
        }}>
          <strong>DroneHQ.io Legal Team</strong><br/>
          Email: legal@dronehq.io<br/>
          Address: [Your Business Address]<br/>
          Phone: [Your Contact Number]
        </div>

        <div style={{ 
          textAlign: 'center', 
          padding: '30px',
          borderTop: '1px solid rgba(126, 211, 33, 0.2)',
          marginTop: '40px'
        }}>
          <p style={{ color: '#B8C5D6', fontSize: '14px' }}>
            © 2025 DroneHQ.io - Professional Drone Program Management<br/>
            Developed by <strong style={{ color: '#7ED321' }}>Metro TXK Media</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
