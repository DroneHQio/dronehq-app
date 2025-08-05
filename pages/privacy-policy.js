export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          <strong>Effective Date:</strong> August 5, 2025<br/>
          <strong>Last Updated:</strong> August 5, 2025
        </p>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          1. Information We Collect
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          DroneHQ.io collects information you provide directly to us, including:
        </p>
        <ul style={{ color: '#B8C5D6', marginBottom: '20px', paddingLeft: '20px' }}>
          <li>Account information (name, email, organization details)</li>
          <li>Flight logs and operational data</li>
          <li>License and certification information</li>
          <li>Equipment and inventory records</li>
          <li>Communication preferences and support requests</li>
        </ul>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          2. How We Use Your Information
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          We use the information we collect to:
        </p>
        <ul style={{ color: '#B8C5D6', marginBottom: '20px', paddingLeft: '20px' }}>
          <li>Provide and maintain our drone management services</li>
          <li>Process transactions and send related information</li>
          <li>Send technical notices, updates, and support messages</li>
          <li>Generate compliance reports and analytics</li>
          <li>Improve our services and develop new features</li>
        </ul>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          3. Information Sharing
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          We do not sell, trade, or rent your personal information to third parties. We may share information in these situations:
        </p>
        <ul style={{ color: '#B8C5D6', marginBottom: '20px', paddingLeft: '20px' }}>
          <li>With your consent or at your direction</li>
          <li>To comply with legal obligations or government requests</li>
          <li>To protect the rights and safety of DroneHQ.io and our users</li>
          <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
        </ul>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          4. Data Security
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.
        </p>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          5. Data Retention
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          We retain your information for as long as your account is active or as needed to provide services. We may retain certain information for longer periods as required by law or for legitimate business purposes.
        </p>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          6. Your Rights
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          You have the right to:
        </p>
        <ul style={{ color: '#B8C5D6', marginBottom: '20px', paddingLeft: '20px' }}>
          <li>Access, update, or delete your personal information</li>
          <li>Export your data in a portable format</li>
          <li>Opt out of marketing communications</li>
          <li>Request information about how we process your data</li>
        </ul>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          7. Cookies and Tracking
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.
        </p>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          8. Third-Party Services
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          Our platform may integrate with third-party services (such as weather APIs, mapping services, or payment processors). These services have their own privacy policies, and we encourage you to review them.
        </p>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          9. International Users
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          DroneHQ.io is based in the United States. If you access our services from outside the US, your information may be transferred to, stored, and processed in the US in accordance with this Privacy Policy and applicable law.
        </p>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          10. Changes to This Policy
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.
        </p>

        <h2 style={{ color: '#7ED321', fontSize: '24px', marginTop: '40px', marginBottom: '15px' }}>
          11. Contact Us
        </h2>
        <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
          If you have questions or concerns about this Privacy Policy, please contact us at:
        </p>
        <div style={{ 
          color: '#7ED321', 
          backgroundColor: 'rgba(126, 211, 33, 0.1)', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '40px'
        }}>
          <strong>DroneHQ.io Privacy Team</strong><br/>
          Email: privacy@dronehq.io<br/>
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
