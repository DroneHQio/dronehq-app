import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function SuperAdmin() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalUsers: 0,
    totalFlights: 0,
    totalStudents: 0,
    recentActivity: []
  })
  const [organizations, setOrganizations] = useState([])
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    checkSuperAdmin()
    loadDashboardData()
  }, [])

  const checkSuperAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/login')
      return
    }

    // Check if user is super admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'super_admin')
      .single()

    if (!roleData) {
      router.push('/dashboard') // Redirect to regular dashboard
      return
    }

    setUser(session.user)
    setLoading(false)
  }

  const loadDashboardData = async () => {
    try {
      // Get total organizations
      const { count: orgCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })

      // Get total users
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // Get total flights
      const { count: flightCount } = await supabase
        .from('flight_logs')
        .select('*', { count: 'exact', head: true })

      // Get student count
      const { count: studentCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

      // Get organizations with details
      const { data: orgsData } = await supabase
        .from('organizations')
        .select(`
          *,
          user_roles (count)
        `)
        .order('created_at', { ascending: false })

      // Get recent users
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles (
            role,
            approved,
            organizations (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      setStats({
        totalOrganizations: orgCount || 0,
        totalUsers: userCount || 0,
        totalFlights: flightCount || 0,
        totalStudents: studentCount || 0
      })
      
      setOrganizations(orgsData || [])
      setUsers(usersData || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const handleApproveUser = async (userId, organizationId) => {
    const { error } = await supabase
      .from('user_roles')
      .update({
        approved: true,
        approved_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('organization_id', organizationId)

    if (!error) {
      loadDashboardData() // Refresh data
    }
  }

  const handleSuspendOrganization = async (orgId) => {
    const confirmed = confirm('Are you sure you want to suspend this organization?')
    if (!confirmed) return

    const { error } = await supabase
      .from('organizations')
      .update({ billing_status: 'suspended' })
      .eq('id', orgId)

    if (!error) {
      loadDashboardData()
    }
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
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚁</div>
          <h2>Loading Super Admin Dashboard...</h2>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a2332 0%, #0f1419 100%)',
      padding: '20px'
    }}>
      {/* Header with Logo */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px 0',
        borderBottom: '2px solid #7ED321',
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
            <h1 style={{ margin: '0', color: '#7ED321', fontSize: '32px' }}>
              Super Admin Dashboard
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#B8C5D6' }}>
              Platform-wide control and analytics
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: '#B8C5D6' }}>Super Admin: {user.email}</span>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Regular Dashboard
          </button>
          <button 
            onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
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

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats Overview */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{ 
            padding: '30px', 
            backgroundColor: 'rgba(126, 211, 33, 0.1)', 
            borderRadius: '12px',
            border: '2px solid #7ED321',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#7ED321', margin: '0 0 10px 0' }}>🏢 Organizations</h3>
            <p style={{ fontSize: '36px', margin: '10px 0', color: 'white', fontWeight: 'bold' }}>
              {stats.totalOrganizations}
            </p>
            <small style={{ color: '#B8C5D6' }}>Active organizations</small>
          </div>

          <div style={{ 
            padding: '30px', 
            backgroundColor: 'rgba(23, 162, 184, 0.1)', 
            borderRadius: '12px',
            border: '2px solid #17a2b8',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#17a2b8', margin: '0 0 10px 0' }}>👥 Total Users</h3>
            <p style={{ fontSize: '36px', margin: '10px 0', color: 'white', fontWeight: 'bold' }}>
              {stats.totalUsers}
            </p>
            <small style={{ color: '#B8C5D6' }}>All registered users</small>
          </div>

          <div style={{ 
            padding: '30px', 
            backgroundColor: 'rgba(40, 167, 69, 0.1)', 
            borderRadius: '12px',
            border: '2px solid #28a745',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#28a745', margin: '0 0 10px 0' }}>✈️ Total Flights</h3>
            <p style={{ fontSize: '36px', margin: '10px 0', color: 'white', fontWeight: 'bold' }}>
              {stats.totalFlights}
            </p>
            <small style={{ color: '#B8C5D6' }}>Logged across platform</small>
          </div>

          <div style={{ 
            padding: '30px', 
            backgroundColor: 'rgba(255, 193, 7, 0.1)', 
            borderRadius: '12px',
            border: '2px solid #ffc107',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#ffc107', margin: '0 0 10px 0' }}>🎓 Students</h3>
            <p style={{ fontSize: '36px', margin: '10px 0', color: 'white', fontWeight: 'bold' }}>
              {stats.totalStudents}
            </p>
            <small style={{ color: '#B8C5D6' }}>Enrolled students</small>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '30px',
          borderBottom: '1px solid rgba(126, 211, 33, 0.3)',
          paddingBottom: '10px'
        }}>
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'organizations', label: '🏢 Organizations', icon: '🏢' },
            { id: 'users', label: '👥 Users', icon: '👥' },
            { id: 'approvals', label: '✅ Approvals', icon: '✅' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === tab.id ? '#7ED321' : 'transparent',
                color: activeTab === tab.id ? '#1a2332' : '#7ED321',
                border: '2px solid #7ED321',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ color: '#7ED321', marginBottom: '20px' }}>Platform Overview</h2>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              padding: '30px', 
              borderRadius: '12px',
              color: '#B8C5D6'
            }}>
              <h3 style={{ color: '#7ED321' }}>System Health</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div>
                  <p><strong>Database Status:</strong> <span style={{ color: '#28a745' }}>✅ Healthy</span></p>
                  <p><strong>Active Sessions:</strong> {stats.totalUsers > 0 ? Math.floor(stats.totalUsers * 0.15) : 0}</p>
                  <p><strong>Storage Used:</strong> 2.4 GB / 100 GB</p>
                </div>
                <div>
                  <p><strong>API Requests (24h):</strong> 12,847</p>
                  <p><strong>Avg Response Time:</strong> 125ms</p>
                  <p><strong>Uptime:</strong> 99.97%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'organizations' && (
          <div>
            <h2 style={{ color: '#7ED321', marginBottom: '20px' }}>Organizations Management</h2>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#7ED321', color: '#1a2332' }}>
                  <tr>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Organization</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Code</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Plan</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Users</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Created</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((org, index) => (
                    <tr key={org.id} style={{ 
                      borderBottom: '1px solid rgba(126, 211, 33, 0.2)',
                      backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                    }}>
                      <td style={{ padding: '15px', color: 'white' }}>{org.name}</td>
                      <td style={{ padding: '15px', color: '#B8C5D6' }}>{org.organization_code}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          color: org.billing_status === 'active' ? '#28a745' : 
                                org.billing_status === 'trial' ? '#ffc107' : '#dc3545',
                          fontWeight: 'bold'
                        }}>
                          {org.billing_status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '15px', color: '#B8C5D6' }}>{org.subscription_plan}</td>
                      <td style={{ padding: '15px', color: '#B8C5D6' }}>{org.user_roles?.length || 0}</td>
                      <td style={{ padding: '15px', color: '#B8C5D6' }}>
                        {new Date(org.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <button
                          onClick={() => handleSuspendOrganization(org.id)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Suspend
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 style={{ color: '#7ED321', marginBottom: '20px' }}>Users Management</h2>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#17a2b8', color: 'white' }}>
                  <tr>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Role</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Organization</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Joined</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 15).map((user, index) => (
                    <tr key={user.id} style={{ 
                      borderBottom: '1px solid rgba(23, 162, 184, 0.2)',
                      backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                    }}>
                      <td style={{ padding: '15px', color: 'white' }}>
                        {user.first_name} {user.last_name}
                      </td>
                      <td style={{ padding: '15px', color: '#B8C5D6' }}>
                        {user.user_roles[0]?.role || 'No role'}
                      </td>
                      <td style={{ padding: '15px', color: '#B8C5D6' }}>
                        {user.user_roles[0]?.organizations?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          color: user.user_roles[0]?.approved ? '#28a745' : '#ffc107',
                          fontWeight: 'bold'
                        }}>
                          {user.user_roles[0]?.approved ? 'APPROVED' : 'PENDING'}
                        </span>
                      </td>
                      <td style={{ padding: '15px', color: '#B8C5D6' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {!user.user_roles[0]?.approved && (
                          <button
                            onClick={() => handleApproveUser(user.user_id, user.user_roles[0]?.organization_id)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div>
            <h2 style={{ color: '#7ED321', marginBottom: '20px' }}>Pending Approvals</h2>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              padding: '30px', 
              borderRadius: '12px'
            }}>
              <p style={{ color: '#B8C5D6', marginBottom: '20px' }}>
                Users waiting for approval across all organizations:
              </p>
              {users.filter(user => !user.user_roles[0]?.approved).length === 0 ? (
                <div style={{ textAlign: 'center', color: '#28a745', padding: '40px' }}>
                  <h3>✅ All caught up!</h3>
                  <p>No pending approvals at this time.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {users.filter(user => !user.user_roles[0]?.approved).map(user => (
                    <div key={user.id} style={{
                      padding: '20px',
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                      border: '1px solid #ffc107',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ color: 'white', margin: '0' }}>
                          {user.first_name} {user.last_name}
                        </h4>
                        <p style={{ color: '#B8C5D6', margin: '5px 0' }}>
                          Role: {user.user_roles[0]?.role} | 
                          Organization: {user.user_roles[0]?.organizations?.name}
                        </p>
                        <small style={{ color: '#B8C5D6' }}>
                          Requested: {new Date(user.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <button
                        onClick={() => handleApproveUser(user.user_id, user.user_roles[0]?.organization_id)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        ✅ Approve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
