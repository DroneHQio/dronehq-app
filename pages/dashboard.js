import { useState, useEffect } from 'react'
import { supabase, signOut } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [managedUsers, setManagedUsers] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
      await loadUserRole(session.user.id, session.user.email)
    } else {
      router.push('/login')
    }
    setLoading(false)
  }

  const loadUserRole = async (userId, email) => {
    try {
      // Check for super admin first
      if (email === 'mtnr.fb@gmail.com') {
        setUserRole({ role: 'super_admin', isMasterAdmin: true })
        await loadSuperAdminData()
        return
      }

      // Check regular roles
      const { data: roleData } = await supabase
        .from('user_roles')
        .select(`
          *,
          organizations (*)
        `)
        .eq('user_id', userId)
        .eq('approved', true)
        .single()

      if (roleData) {
        setUserRole(roleData)
        setOrganization(roleData.organizations)
        await loadRoleBasedData(roleData)
      }
    } catch (error) {
      console.error('Error loading user role:', error)
    }
  }

  const loadSuperAdminData = async () => {
    // Load all organizations and users for super admin
    const [orgsResult, usersResult, flightsResult] = await Promise.all([
      supabase.from('organizations').select('*').order('created_at', { ascending: false }),
      supabase.from('user_profiles').select(`
        *,
        user_roles (
          role,
          approved,
          organizations (name)
        )
      `).order('created_at', { ascending: false }),
      supabase.from('flight_logs').select('*', { count: 'exact', head: true })
    ])

    setStats({
      totalOrganizations: orgsResult.data?.length || 0,
      totalUsers: usersResult.data?.length || 0,
      totalFlights: flightsResult.count || 0
    })
    setManagedUsers(usersResult.data || [])
  }

  const loadRoleBasedData = async (roleData) => {
    if (roleData.role === 'org_admin') {
      // Load organization users and stats
      const [usersResult, flightsResult] = await Promise.all([
        supabase.from('user_roles').select(`
          *,
          auth.users!user_id (email),
          user_profiles!user_id (*)
        `).eq('organization_id', roleData.organization_id),
        supabase.from('flight_logs').select('*', { count: 'exact', head: true })
          .eq('organization_id', roleData.organization_id)
      ])

      setStats({
        organizationUsers: usersResult.data?.length || 0,
        organizationFlights: flightsResult.count || 0
      })
      setManagedUsers(usersResult.data || [])
    } else if (roleData.role === 'teacher') {
      // Load class students
      const { data: studentsData } = await supabase
        .from('user_roles')
        .select(`
          *,
          auth.users!user_id (email),
          user_profiles!user_id (*),
          class_codes!class_code_id (*)
        `)
        .eq('class_code_id', roleData.class_code_id)
        .eq('role', 'student')

      setStats({
        classStudents: studentsData?.length || 0
      })
      setManagedUsers(studentsData || [])
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const handleApproveUser = async (userId, organizationId) => {
    const { error } = await supabase
      .from('user_roles')
      .update({
        approved: true,
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('organization_id', organizationId)

    if (!error) {
      loadUserRole(user.id, user.email) // Refresh data
    }
  }

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'super_admin': 'Super Administrator',
      'org_admin': 'Organization Administrator', 
      'teacher': 'Teacher/Moderator',
      'student': 'Pilot/Student'
    }
    return roleMap[role] || role
  }

  const getNavigation = () => {
    const baseNav = [
      { id: 'overview', label: '📊 Overview', color: '#0070f3' }
    ]

    if (userRole?.role === 'super_admin') {
      return [
        ...baseNav,
        { id: 'organizations', label: '🏢 All Organizations', color: '#7ED321' },
        { id: 'users', label: '👥 All Users', color: '#17a2b8' },
        { id: 'system', label: '⚙️ System Control', color: '#6f42c1' }
      ]
    } else if (userRole?.role === 'org_admin') {
      return [
        ...baseNav,
        { id: 'users', label: '👥 Organization Users', color: '#17a2b8' },
        { id: 'approvals', label: '✅ Pending Approvals', color: '#ffc107' },
        { id: 'settings', label: '⚙️ Organization Settings', color: '#6c757d' }
      ]
    } else if (userRole?.role === 'teacher') {
      return [
        ...baseNav,
        { id: 'students', label: '🎓 My Students', color: '#17a2b8' },
        { id: 'class', label: '📚 Class Management', color: '#28a745' },
        { id: 'reports', label: '📊 Class Reports', color: '#fd7e14' }
      ]
    } else {
      return [
        ...baseNav,
        { id: 'flights', label: '✈️ My Flights', color: '#28a745' },
        { id: 'checklists', label: '📋 My Checklists', color: '#17a2b8' },
        { id: 'profile', label: '👤 My Profile', color: '#6c757d' }
      ]
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
        background: 'linear-gradient(135deg, #1a2332 0%, #0f1419 100%)',
        color: 'white',
        padding: '20px 30px',
        borderRadius: '10px',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/images/logo.png" 
            alt="DroneHQ.io"
            style={{ 
              height: '40px', 
              width: 'auto',
              marginRight: '15px',
              cursor: 'pointer'
            }}
            onClick={() => router.push('/')}
          />
          <div>
            <h1 style={{ margin: '0', color: '#7ED321' }}>
              {userRole?.role === 'super_admin' ? 'Super Admin Dashboard' : 'DroneHQ.io Dashboard'}
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#B8C5D6', fontSize: '14px' }}>
              {getRoleDisplayName(userRole?.role)} {organization && `• ${organization.name}`}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#B8C5D6' }}>Welcome, {user.email}</span>
          {userRole?.role === 'super_admin' && (
            <button 
              onClick={() => router.push('/super-admin-management')}
              style={{ 
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔒 Admin Control
            </button>
          )}
          <button 
            onClick={handleSignOut}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#6c757d',
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
        {/* Navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          {getNavigation().map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === tab.id ? tab.color : 'white',
                color: activeTab === tab.id ? 'white' : tab.color,
                border: `2px solid ${tab.color}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'white', 
            borderRadius: '10px',
            border: '2px solid #0070f3',
            textAlign: 'center',
            cursor: 'pointer'
          }} onClick={() => router.push('/flight-log')}>
            <h3 style={{ color: '#0070f3', margin: '0 0 10px 0' }}>✈️ Log Flight</h3>
            <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>Record new flight</p>
          </div>

          <div style={{ 
            padding: '20px', 
            backgroundColor: 'white', 
            borderRadius: '10px',
            border: '2px solid #28a745',
            textAlign: 'center',
            cursor: 'pointer'
          }} onClick={() => router.push('/checklist')}>
            <h3 style={{ color: '#28a745', margin: '0 0 10px 0' }}>📋 Checklist</h3>
            <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>Safety checks</p>
          </div>

          <div style={{ 
            padding: '20px', 
            backgroundColor: 'white', 
            borderRadius: '10px',
            border: '2px solid #ffc107',
            textAlign: 'center',
            cursor: 'pointer'
          }} onClick={() => router.push('/licenses')}>
            <h3 style={{ color: '#ffc107', margin: '0 0 10px 0' }}>🆔 Licenses</h3>
            <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>Manage certifications</p>
          </div>

          {(userRole?.role === 'super_admin' || userRole?.role === 'org_admin') && (
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'white', 
              borderRadius: '10px',
              border: '2px solid #dc3545',
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <h3 style={{ color: '#dc3545', margin: '0 0 10px 0' }}>⚙️ Admin Tools</h3>
              <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>User management</p>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#495057', marginBottom: '20px' }}>Dashboard Overview</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {userRole?.role === 'super_admin' && (
                <>
                  <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ color: '#7ED321' }}>🏢 Organizations</h3>
                    <p style={{ fontSize: '32px', margin: '10px 0', color: '#495057' }}>{stats.totalOrganizations}</p>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ color: '#17a2b8' }}>👥 Total Users</h3>
                    <p style={{ fontSize: '32px', margin: '10px 0', color: '#495057' }}>{stats.totalUsers}</p>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ color: '#28a745' }}>✈️ Total Flights</h3>
                    <p style={{ fontSize: '32px', margin: '10px 0', color: '#495057' }}>{stats.totalFlights}</p>
                  </div>
                </>
              )}
              
              {userRole?.role === 'org_admin' && (
                <>
                  <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ color: '#17a2b8' }}>👥 Organization Users</h3>
                    <p style={{ fontSize: '32px', margin: '10px 0', color: '#495057' }}>{stats.organizationUsers}</p>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ color: '#28a745' }}>✈️ Organization Flights</h3>
                    <p style={{ fontSize: '32px', margin: '10px 0', color: '#495057' }}>{stats.organizationFlights}</p>
                  </div>
                </>
              )}
              
              {userRole?.role === 'teacher' && (
                <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                  <h3 style={{ color: '#17a2b8' }}>🎓 My Students</h3>
                  <p style={{ fontSize: '32px', margin: '10px 0', color: '#495057' }}>{stats.classStudents}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'users' || activeTab === 'students') && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#495057', marginBottom: '20px' }}>
              {userRole?.role === 'super_admin' ? 'All Platform Users' : 
               userRole?.role === 'org_admin' ? 'Organization Users' : 'My Students'}
            </h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Role</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {managedUsers.slice(0, 10).map((userData, index) => {
                    const profile = userData.user_profiles || userData
                    const role = userData.user_roles?.[0] || userData
                    const email = userData.auth?.users?.email || userData.email || 'N/A'
                    
                    return (
                      <tr key={userData.id || index} style={{ 
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                      }}>
                        <td style={{ padding: '12px' }}>
                          {profile.first_name} {profile.last_name}
                        </td>
                        <td style={{ padding: '12px', color: '#6c757d' }}>{email}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '4px 8px',
                            backgroundColor: role.role === 'org_admin' ? '#007bff' :
                                           role.role === 'teacher' ? '#28a745' :
                                           role.role === 'student' ? '#17a2b8' : '#6c757d',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}>
                            {getRoleDisplayName(role.role)}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            color: role.approved ? '#28a745' : '#ffc107',
                            fontWeight: 'bold'
                          }}>
                            {role.approved ? '✅ Approved' : '⏳ Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {!role.approved && (userRole?.role === 'super_admin' || userRole?.role === 'org_admin' || userRole?.role === 'teacher') && (
                            <button
                              onClick={() => handleApproveUser(userData.user_id || userData.id, role.organization_id)}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'organizations' && userRole?.role === 'super_admin' && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#495057', marginBottom: '20px' }}>All Organizations</h2>
            <p style={{ color: '#6c757d', marginBottom: '20px' }}>
              Manage all organizations across the platform
            </p>
            <button
              onClick={() => router.push('/super-admin')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#7ED321',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🏢 Open Advanced Organization Management
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
