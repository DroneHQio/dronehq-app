import { useState, useEffect } from 'react'
import { supabase, signOut } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
    } else {
      router.push('/login')
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>
  }

  if (!user) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Redirecting to login...</div>
  }

  return (
    <div style={{ padding: '30px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '2px solid #eee',
        paddingBottom: '20px',
        marginBottom: '30px'
      }}>
        <h1>🚁 DroneHQ.io Dashboard</h1>
        <div>
          <span style={{ marginRight: '20px' }}>Welcome, {user.email}!</span>
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

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3>✈️ Total Flights</h3>
          <p style={{ fontSize: '24px', margin: '10px 0', color: '#0070f3' }}>0</p>
          <small>This month</small>
        </div>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3>📋 Checklists</h3>
          <p style={{ fontSize: '24px', margin: '10px 0', color: '#28a745' }}>0</p>
          <small>Completed today</small>
        </div>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3>🆔 Licenses</h3>
          <p style={{ fontSize: '24px', margin: '10px 0', color: '#ffc107' }}>0</p>
          <small>Expiring soon</small>
        </div>
      </div>

      {/* Main Actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        <div style={{ 
          padding: '30px', 
          border: '2px solid #0070f3', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3>✈️ Log New Flight</h3>
          <p>Record a new drone flight with location, duration, and notes.</p>
          <button 
  onClick={() => router.push('/flight-log')}
  style={{ 
    padding: '12px 24px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px'
  }}
>
  Start Flight Log
</button>
        </div>

        <div style={{ 
          padding: '30px', 
          border: '2px solid #28a745', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3>📋 Safety Checklist</h3>
          <p>Complete pre-flight and post-flight safety checklists.</p>
          <button style={{ 
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}>
            Start Checklist
          </button>
        </div>

        <div style={{ 
          padding: '30px', 
          border: '2px solid #ffc107', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3>🆔 Manage Licenses</h3>
          <p>Track pilot certifications and expiration dates.</p>
          <button style={{ 
            padding: '12px 24px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}>
            View Licenses
          </button>
        </div>
      </div>
    </div>
  )
}
