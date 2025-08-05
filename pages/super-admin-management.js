import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function SuperAdminManagement() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMasterAdmin, setIsMasterAdmin] = useState(false)
  const [superAdmins, setSuperAdmins] = useState([])
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkMasterAdmin()
    loadSuperAdmins()
  }, [])

  const checkMasterAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/login')
      return
    }

    // Check if user is master admin (mtnr.fb@gmail.com)
    const isMaster = session.user.email === 'mtnr.fb@gmail.com'
    
    if (!isMaster) {
      router.push('/dashboard') // Redirect non-masters
      return
    }

    setUser(session.user)
    setIsMasterAdmin(true)
    setLoading(false)
  }

  const loadSuperAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          auth.users!user_id (email, created_at)
        `)
        .eq('role', 'super_admin')
        .eq('approved', true)
        .order('created_at', { ascending: false })

      if (data) {
        setSuperAdmins(data)
      }
    } catch (error) {
      console.error('Error loading super admins:', error)
    }
  }

  const handleGrantSuperAdmin = async (e) => {
    e.preventDefault()
    if (!newAdminEmail.trim()) return

    setActionLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.rpc('grant_super_admin', {
        target_email: newAdminEmail.trim()
      })

      if (error) {
        throw error
      }

      setMessage(`✅ Successfully granted Super Admin privileges to ${newAdminEmail}`)
      setNewAdminEmail('')
      loadSuperAdmins()
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
    }

    setActionLoading(false)
  }

  const handleRevokeSuperAdmin = async (email) => {
    if (email === 'mtnr.fb@gmail.com') {
      setMessage('❌ Cannot revoke Master Admin privileges')
      return
    }

    const confirmed = confirm(`Are you sure you want to revoke Super Admin privileges from ${email}?`)
    if (!confirmed) return

    setActionLoading(true)

    try {
      const { data, error } = await supabase.rpc('revoke_super_admin', {
        target_email: email
      })

      if (error) {
        throw error
      }

      setMessage(`✅ Successfully revoked Super Admin privileges from ${email}`)
      loadSuperAdmins()
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
    }

    setActionLoading(false)
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a2332 0%, #0f1419 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
          <h2>Verifying Master Admin Access...</h2>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dc3545 0%, #8B0000 100%)',
      padding: '20px'
    }}>
      {/* Header with Logo */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px 0',
        borderBottom: '2px solid #fff',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/images/logo.png" 
            alt="DroneHQ.io"
            style={{ 
              height: '45px', 
              width: 'auto',
              marginRight: '15px'
            }}
          />
          <div>
            <h1 style={{ margin: '0', color: 'white', fontSize: '32px' }}>
              🔒 Master Admin Control
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#ffcccc' }}>
              Super Admin privilege management
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: '#ffcccc' }}>Master Admin: {user.email}</span>
          <button 
            onClick={() => router.push('/super-admin')}
            style={{ 
              padding: '8px 16px',
              backgroundColor: 'white',
              color: '#dc3545',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Super Admin Dashboard
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Security Warning */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid #fff',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#fff', margin: '0 0 10px 0' }}>⚠️ CRITICAL SECURITY ZONE ⚠️</h2>
          <p style={{ color: '#ffcccc', margin: '0' }}>
            Super Admin privileges grant complete control over the entire DroneHQ.io platform. 
            Only grant to absolutely trusted individuals.
          </p>
        </div>

        {message && (
          <div style={{ 
            padding: '15px', 
            marginBottom: '30px',
            backgroundColor: message.includes('✅') ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
            color: message.includes('✅') ? '#90EE90' : '#ffcccc',
            borderRadius: '8px',
            border: `2px solid ${message.includes('✅') ? '#28a745' : '#fff'}`
          }}>
            {message}
          </div>
        )}

        {/* Grant Super Admin */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '40px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ color: 'white', marginBottom: '20px' }}>➕ Grant Super Admin Access</h2>
          
          <form onSubmit={handleGrantSuperAdmin} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Email Address
              </label>
              <input 
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Enter email address to grant Super Admin access"
                style={{ 
                  width: '100%', 
                  padding: '15px', 
                  border: '2px solid white',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
                required
              />
            </div>
            <button 
              type="submit"
              disabled={actionLoading}
              style={{ 
                padding: '15px 30px',
                backgroundColor: actionLoading ? '#6c757d' : 'white',
                color: actionLoading ? 'white' : '#dc3545',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {actionLoading ? '🔄 Granting...' : '🔒 Grant Access'}
            </button>
          </form>
        </div>

        {/* Current Super Admins */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '20px', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{ color: 'white', margin: '0' }}>👑 Current Super Admins</h2>
          </div>
          
          {superAdmins.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#ffcccc' }}>
              <h3>Only Master Admin exists</h3>
              <p>No additional Super Admins have been granted access.</p>
            </div>
          ) : (
            <div style={{ padding: '0' }}>
              {superAdmins.map((admin, index) => {
                const email = admin.auth?.users?.email || 'Unknown'
                const isMaster = email === 'mtnr.fb@gmail.com'
                
                return (
                  <div key={admin.id} style={{
                    padding: '20px',
                    borderBottom: index < superAdmins.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: isMaster ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
                  }}>
                    <div>
                      <h4 style={{ color: 'white', margin: '0 0 5px 0' }}>
                        {isMaster && '👑 '}{email}
                        {isMaster && ' (Master Admin)'}
                      </h4>
                      <p style={{ color: '#ffcccc', margin: '0', fontSize: '14px' }}>
                        Granted: {new Date(admin.approved_at).toLocaleDateString()} at {new Date(admin.approved_at).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div>
                      {isMaster ? (
                        <span style={{
                          padding: '8px 16px',
                          backgroundColor: 'gold',
                          color: '#000',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          PERMANENT
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRevokeSuperAdmin(email)}
                          disabled={actionLoading}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#fff',
                            color: '#dc3545',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                        >
                          🗑️ Revoke Access
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Security Notes */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h3 style={{ color: 'white', marginBottom: '15px' }}>🛡️ Security Notes</h3>
          <ul style={{ color: '#ffcccc', lineHeight: '1.6' }}>
            <li><strong>Master Admin (mtnr.fb@gmail.com)</strong> cannot be revoked and has permanent access</li>
            <li>Super Admins have complete control over all organizations, users, and data</li>
            <li>Only grant Super Admin to individuals you trust completely</li>
            <li>All Super Admin actions are logged for security auditing</li>
            <li>Super Admins can access the platform even if their organization is suspended</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
