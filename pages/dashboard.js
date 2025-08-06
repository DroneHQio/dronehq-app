import { useState, useEffect } from 'react'
import { supabase, signOut } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    flightLogs: 0,
    checklists: 0,
    inventory: 0,
    users: 0,
    organizations: 0,
    pendingApprovals: 0
  })
  const [notifications, setNotifications] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/login')
      return
    }

    setUser(session.user)
    await getUserRole(session.user)
    setLoading(false)
  }

  const getUserRole = async (user) => {
    try {
      // Get user role and organization
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select(`
          role,
          approved,
          organization_id,
          organizations (
            name,
            organization_code,
            settings
          )
        `)
        .eq('user_id', user.id)
        .eq('approved', true)
        .single()

      if (roleData) {
        setUserRole(roleData.role)
        setOrganization(roleData.organizations)
        loadDashboardData(roleData.role, roleData.organization_id, user)
      } else {
        // Handle users without roles
        setUserRole('pilot')
        loadDashboardData('pilot', null, user)
      }
    } catch (error) {
      console.error('Error getting user role:', error)
      setUserRole('pilot')
      loadDashboardData('pilot', null, user)
    }
  }

  const loadDashboardData = async (role, orgId, user) => {
    try {
      let newStats = { ...stats }

      if (role === 'super_admin') {
        // Super Admin sees everything
        const [flightLogs, checklists, inventory, users, organizations, approvals] = await Promise.all([
          supabase.from('flight_logs').select('id', { count: 'exact' }),
          supabase.from('checklists').select('id', { count: 'exact' }),
          supabase.from('inventory').select('id', { count: 'exact' }),
          supabase.from('user_roles').select('id', { count: 'exact' }),
          supabase.from('organizations').select('id', { count: 'exact' }),
          supabase.from('user_roles').select('id', { count: 'exact' }).eq('approved', false)
        ])

        newStats = {
          flightLogs: flightLogs.count || 0,
          checklists: checklists.count || 0,
          inventory: inventory.count || 0,
          users: users.count || 0,
          organizations: organizations.count || 0,
          pendingApprovals: approvals.count || 0
        }

        // Load super admin notifications
        setNotifications([
          { type: 'info', message: `${newStats.organizations} organizations registered` },
          { type: 'warning', message: `${newStats.pendingApprovals} pending approvals` },
          { type: 'success', message: `${newStats.flightLogs} total flights logged` }
        ])

      } else if (role === 'org_admin' && orgId) {
        // Org Admin sees their organization data
        const [flightLogs, checklists, inventory, users, approvals] = await Promise.all([
          supabase.from('flight_logs').select('id', { count: 'exact' }).eq('organization_id', orgId),
          supabase.from('checklists').select('id', { count: 'exact' }).eq('organization_id', orgId),
          supabase.from('inventory').select('id', { count: 'exact' }).eq('organization_id', orgId),
          supabase.from('user_roles').select('id', { count: 'exact' }).eq('organization_id', orgId),
          supabase.from('user_roles').select('id', { count: 'exact' }).eq('organization_id', orgId).eq('approved', false)
        ])

        newStats = {
          flightLogs: flightLogs.count || 0,
          checklists: checklists.count || 0,
          inventory: inventory.count || 0,
          users: users.count || 0,
          pendingApprovals: approvals.count || 0
        }

        setNotifications([
          { type: 'info', message: `${newStats.users} users in your organization` },
          { type: 'warning', message: `${newStats.pendingApprovals} users awaiting approval` },
          { type: 'success', message: `${newStats.flightLogs} flights completed` }
        ])

      } else if (role === 'teacher' && orgId) {
        // Teacher sees their class data
        const [flightLogs, checklists, students] = await Promise.all([
          supabase.from('flight_logs').select('id', { count: 'exact' }).eq('created_by', user.id),
          supabase.from('checklists').select('id', { count: 'exact' }).eq('created_by', user.id),
          supabase.from('user_roles').select('id', { count: 'exact' }).eq('approved_by', user.id)
        ])

        newStats = {
          flightLogs: flightLogs.count || 0,
          checklists: checklists.count || 0,
          students: students.count || 0
        }

        setNotifications([
          { type: 'info', message: `${newStats.students} students in your classes` },
          { type: 'success', message: `${newStats.flightLogs} flight logs completed` }
        ])

      } else {
        // Pilot/Student sees personal data
        const [flightLogs, checklists] = await Promise.all([
          supabase.from('flight_logs').select('id', { count: 'exact' }).eq('created_by', user.id),
          supabase.from('checklists').select('id', { count: 'exact' }).eq('created_by', user.id)
        ])

        newStats = {
          flightLogs: flightLogs.count || 0,
          checklists: checklists.count || 0
        }

        // Check if pilot is on basic plan and approaching limit
        if (role === 'solo_pilot') {
          const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
          const { count: monthlyLogs } = await supabase
            .from('flight_logs')
            .select('id', { count: 'exact' })
            .eq('created_by', user.id)
            .gte('created_at', `${currentMonth}-01`)

          if (monthlyLogs >= 12) {
            setNotifications([
              { type: 'warning', message: `${monthlyLogs}/15 monthly flights used. Consider upgrading!` }
            ])
          }
        }
      }

      setStats(newStats)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  // Role-based button configurations
  const getRoleButtons = () => {
    const buttons = []

    // Common buttons for all users
    buttons.push(
      { label: '✈️ Flight Log', path: '/flight-log', color: '#007bff' },
      { label: '✅ Checklist', path: '/checklist', color: '#28a745' },
      { label: '📋 Licenses', path: '/licenses', color: '#6f42c1' },
      { label: '👤 Profile', path: '/profile', color: '#6c757d' }
    )

    if (userRole === 'super_admin') {
      buttons.unshift(
        { label: '👑 Super Admin Dashboard', path: '/super-admin', color: '#dc3545' },
        { label: '🔒 Manage Super Admins', path: '/super-admin-management', color: '#fd7e14' },
        { label: '🏢 Add Organization', path: '/super-admin#add-org', color: '#007bff' },
        { label: '👥 Approve Users', path: '/super-admin#approvals', color: '#28a745' },
        { label: '🛠️ Support Dashboard', path: '/support', color: '#20c997' },
        { label: '📊 Platform Analytics', path: '/super-admin#analytics', color: '#6f42c1' }
      )
    }

    if (userRole === 'org_admin') {
      buttons.unshift(
        { label: '🏢 Organization', path: '/organization-admin', color: '#007bff' },
        { label: '👥 Manage Users', path: '/user-management', color: '#17a2b8' }
      )
    }

    if (userRole === 'teacher') {
      buttons.unshift(
        { label: '🎓 My Classes', path: '/teacher-dashboard', color: '#28a745' },
        { label: '👨‍🎓 Students', path: '/student-management', color: '#20c997' }
      )
    }

    if (userRole === 'solo_pilot' || userRole === 'pilot') {
      buttons.push(
        { label: '📦 Inventory', path: '/inventory', color: '#ffc107' },
        { label: '💰 Invoicing', path: '/invoicing', color: '#28a745' }
      )
    }

    return buttons
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a2332 0%, #0f1419 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚁</div>
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      {/* Header with Logo */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '15px 25px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/images/logo.png" 
            alt="DroneHQ.io"
            onClick={() => router.push('/')}
            style={{ 
              height: '40px', 
              width: 'auto',
              marginRight: '15px',
              cursor: 'pointer'
            }}
          />
          <div>
            <h1 style={{ margin: '0', color: '#1a2332', fontSize: '24px' }}>
              Dashboard
            </h1>
            <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
              Welcome back, {user.email}
              {organization && ` • ${organization.name}`}
              {userRole && ` • ${userRole.replace('_', ' ').toUpperCase()}`}
            </p>
          </div>
        </div>

        <button 
          onClick={handleSignOut}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {userRole === 'super_admin' && (
          <>
            <div style={{ backgroundColor: '#dc3545', color: 'white', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Organizations</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.organizations}</div>
              <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.9 }}>Platform-wide</div>
            </div>
            <div style={{ backgroundColor: '#28a745', color: 'white', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Total Users</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.users}</div>
              <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.9 }}>All roles</div>
            </div>
            <div style={{ backgroundColor: '#fd7e14', color: 'white', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Pending Approvals</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.pendingApprovals}</div>
              <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.9 }}>Need attention</div>
            </div>
            <div style={{ backgroundColor: '#6f42c1', color: 'white', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Platform Revenue</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>$12,450</div>
              <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.9 }}>This month</div>
            </div>
          </>
        )}

        <div style={{ backgroundColor: '#17a2b8', color: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Flight Logs</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.flightLogs}</div>
        </div>

        <div style={{ backgroundColor: '#28a745', color: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Checklists</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.checklists}</div>
        </div>

        {stats.inventory !== undefined && (
          <div style={{ backgroundColor: '#ffc107', color: 'white', padding: '20px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Inventory Items</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.inventory}</div>
          </div>
        )}
      </div>

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1a2332' }}>📢 Notifications</h3>
          {notifications.map((notification, index) => (
            <div key={index} style={{
              padding: '10px 15px',
              marginBottom: '10px',
              borderRadius: '6px',
              backgroundColor: notification.type === 'warning' ? '#fff3cd' : 
                              notification.type === 'success' ? '#d1edff' : '#e2e3e5',
              borderLeft: `4px solid ${notification.type === 'warning' ? '#ffc107' : 
                                    notification.type === 'success' ? '#28a745' : '#6c757d'}`
            }}>
              {notification.message}
            </div>
          ))}
        </div>
      )}

      {/* Super Admin Quick Actions */}
      {userRole === 'super_admin' && (
        <div style={{
          backgroundColor: '#fff5f5',
          border: '2px solid #dc3545',
          padding: '25px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#dc3545' }}>👑 Super Admin Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <button
              onClick={() => router.push('/super-admin')}
              style={{
                padding: '15px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              🏢 Manage All Organizations
            </button>
            <button
              onClick={() => router.push('/super-admin-management')}
              style={{
                padding: '15px',
                backgroundColor: '#fd7e14',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              🔒 Grant Super Admin Access
            </button>
            <button
              onClick={() => router.push('/support')}
              style={{
                padding: '15px',
                backgroundColor: '#20c997',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              🛠️ Customer Support Dashboard
            </button>
          </div>
          
          {stats.pendingApprovals > 0 && (
            <div style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              border: '1px solid #ffc107'
            }}>
              <strong style={{ color: '#856404' }}>
                ⚠️ {stats.pendingApprovals} users waiting for approval across all organizations
              </strong>
            </div>
          )}
        </div>
      )}

      {/* Role-based Action Buttons */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1a2332' }}>Quick Actions</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          {getRoleButtons().map((button, index) => (
            <button
              key={index}
              onClick={() => router.push(button.path)}
              style={{
                padding: '15px 20px',
                backgroundColor: button.color,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'transform 0.2s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0px)'}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pilot Plan Soft-Lock Warning */}
      {userRole === 'solo_pilot' && stats.flightLogs >= 15 && (
        <div style={{
          marginTop: '20px',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#856404', margin: '0 0 10px 0' }}>⚠️ Flight Limit Reached</h3>
          <p style={{ color: '#856404', margin: '0 0 15px 0' }}>
            You've reached your Basic plan limit of 15 flights per month. Upgrade to continue logging flights!
          </p>
          <button
            onClick={() => router.push('/upgrade')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            🚀 Upgrade to Unlimited
          </button>
        </div>
      )}
    </div>
  )
}
