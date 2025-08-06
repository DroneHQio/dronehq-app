// Add this component to your Super Admin Dashboard

const [showAddOrgForm, setShowAddOrgForm] = useState(false)
const [newOrgData, setNewOrgData] = useState({
  name: '',
  type: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  adminEmail: '',
  adminFirstName: '',
  adminLastName: ''
})

const organizationTypes = [
  'K-12 School District',
  'Individual School',
  'Community College',
  'University',
  'Public Safety Agency',
  'Fire Department',
  'Police Department',
  'Emergency Services',
  'Private Training Company',
  'Other'
]

const handleAddOrganization = async (e) => {
  e.preventDefault()
  setActionLoading(true)
  
  try {
    // 1. Check if admin user exists
    const { data: existingUser } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', newOrgData.adminEmail)
      .single()
    
    let adminUserId = existingUser?.id
    
    // 2. If admin doesn't exist, create invitation
    if (!adminUserId) {
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        newOrgData.adminEmail,
        {
          data: {
            first_name: newOrgData.adminFirstName,
            last_name: newOrgData.adminLastName,
            invited_by_super_admin: true
          }
        }
      )
      
      if (inviteError) throw inviteError
      adminUserId = inviteData.user.id
    }
    
    // 3. Create organization
    const orgCode = newOrgData.name.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6) + 
                   Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert([{
        name: newOrgData.name,
        organization_code: orgCode,
        settings: {
          type: newOrgData.type,
          address: newOrgData.address,
          city: newOrgData.city,
          state: newOrgData.state,
          zip_code: newOrgData.zipCode,
          phone: newOrgData.phone,
          created_by_super_admin: true
        },
        billing_status: 'trial',
        subscription_plan: 'starter',
        created_by: adminUserId
      }])
      .select()
    
    if (orgError) throw orgError
    
    // 4. Create admin profile if new user
    if (!existingUser) {
      await supabase
        .from('user_profiles')
        .insert([{
          user_id: adminUserId,
          first_name: newOrgData.adminFirstName,
          last_name: newOrgData.adminLastName
        }])
    }
    
    // 5. Create org admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([{
        user_id: adminUserId,
        organization_id: orgData[0].id,
        role: 'org_admin',
        approved: true,
        approved_by: user.id,
        approved_at: new Date().toISOString()
      }])
    
    if (roleError) throw roleError
    
    setMessage(`✅ Organization "${newOrgData.name}" created successfully!
    
Org Code: ${orgCode}
Teacher Code: ${orgData[0].teacher_code}
Admin invited: ${newOrgData.adminEmail}`)
    
    setShowAddOrgForm(false)
    setNewOrgData({
      name: '', type: '', address: '', city: '', state: '', zipCode: '', 
      phone: '', adminEmail: '', adminFirstName: '', adminLastName: ''
    })
    loadDashboardData()
    
  } catch (error) {
    setMessage(`❌ Error creating organization: ${error.message}`)
  }
  
  setActionLoading(false)
}

// Add this to your Super Admin Dashboard JSX:
<div style={{ marginBottom: '30px' }}>
  <button
    onClick={() => setShowAddOrgForm(!showAddOrgForm)}
    style={{
      padding: '15px 30px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '16px'
    }}
  >
    {showAddOrgForm ? 'Cancel' : '🏢 Add New Organization'}
  </button>
</div>

{showAddOrgForm && (
  <div style={{
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '30px',
    border: '2px solid #28a745'
  }}>
    <h3 style={{ color: '#28a745', marginBottom: '20px' }}>Add New Organization</h3>
    
    <form onSubmit={handleAddOrganization}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div>
          <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
            Organization Name *
          </label>
          <input
            type="text"
            value={newOrgData.name}
            onChange={(e) => setNewOrgData({...newOrgData, name: e.target.value})}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e9ecef',
              borderRadius: '5px',
              fontSize: '16px'
            }}
            required
          />
        </div>
        
        <div>
          <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
            Organization Type *
          </label>
          <select
            value={newOrgData.type}
            onChange={(e) => setNewOrgData({...newOrgData, type: e.target.value})}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e9ecef',
              borderRadius: '5px',
              fontSize: '16px'
            }}
            required
          >
            <option value="">Select type</option>
            {organizationTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div>
          <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
            Admin First Name *
          </label>
          <input
            type="text"
            value={newOrgData.adminFirstName}
            onChange={(e) => setNewOrgData({...newOrgData, adminFirstName: e.target.value})}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e9ecef',
              borderRadius: '5px',
              fontSize: '16px'
            }}
            required
          />
        </div>
        
        <div>
          <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
            Admin Last Name *
          </label>
          <input
            type="text"
            value={newOrgData.adminLastName}
            onChange={(e) => setNewOrgData({...newOrgData, adminLastName: e.target.value})}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e9ecef',
              borderRadius: '5px',
              fontSize: '16px'
            }}
            required
          />
        </div>
        
        <div>
          <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
            Admin Email *
          </label>
          <input
            type="email"
            value={newOrgData.adminEmail}
            onChange={(e) => setNewOrgData({...newOrgData, adminEmail: e.target.value})}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e9ecef',
              borderRadius: '5px',
              fontSize: '16px'
            }}
            required
          />
        </div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <button
          type="submit"
          disabled={actionLoading}
          style={{
            padding: '12px 30px',
            backgroundColor: actionLoading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: actionLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            marginRight: '10px'
          }}
        >
          {actionLoading ? 'Creating...' : 'Create Organization'}
        </button>
        
        <button
          type="button"
          onClick={() => setShowAddOrgForm(false)}
          style={{
            padding: '12px 30px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}
