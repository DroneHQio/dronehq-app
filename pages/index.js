export default function Home() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>🚁 DroneHQ.io</h1>
      <h2>Complete Drone Program Management</h2>
      <p>Streamline flight logging, equipment tracking, and compliance for schools, public safety, and solo pilots.</p>
      
      <div style={{ marginTop: '30px' }}>
        <div style={{ marginTop: '30px' }}>
  <button 
    onClick={() => window.location.href = '/signup/organization'}
    style={{ 
      padding: '15px 30px', 
      fontSize: '18px', 
      backgroundColor: '#0070f3', 
      color: 'white', 
      border: 'none', 
      borderRadius: '5px',
      cursor: 'pointer',
      marginRight: '15px'
    }}
  >
    🏫 Start Organization Trial
  </button>
  
  <button 
    onClick={() => window.location.href = '/login'}
    style={{ 
      padding: '15px 30px', 
      fontSize: '18px', 
      backgroundColor: '#28a745', 
      color: 'white', 
      border: 'none', 
      borderRadius: '5px',
      cursor: 'pointer'
    }}
  >
    👤 Individual Login
  </button>
</div>
      </div>
      
      <div style={{ marginTop: '50px' }}>
        <h3>Core Features:</h3>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <li>✈️ Flight Logging</li>
          <li>📋 Digital Checklists</li>
          <li>🆔 License Management</li>
          <li>🏢 Multi-Organization Support</li>
          <li>📧 Automated Reminders</li>
        </ul>
      </div>
    </div>
  )
}
