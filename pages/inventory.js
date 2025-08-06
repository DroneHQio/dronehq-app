import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Inventory() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  // Add/Edit form state
  const [itemData, setItemData] = useState({
    name: '',
    category: '',
    model: '',
    serial_number: '',
    manufacturer: '',
    purchase_date: '',
    purchase_price: '',
    condition_status: 'excellent',
    location: '',
    notes: '',
    registration_number: '',
    expiration_date: '',
    maintenance_due: '',
    insurance_value: ''
  })

  // File upload state
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState('')
  const [previewData, setPreviewData] = useState([])

  const router = useRouter()

  // Equipment categories
  const categories = [
    'Drone/UAS', 'Camera/Gimbal', 'Battery', 'Controller/Remote', 
    'Charging Equipment', 'Storage/Case', 'Propellers', 'Memory Cards',
    'Sensors', 'Software/License', 'Safety Equipment', 'Maintenance Tools', 'Other'
  ]

  const conditionStatuses = [
    { value: 'excellent', label: 'Excellent', color: '#28a745' },
    { value: 'good', label: 'Good', color: '#28a745' },
    { value: 'fair', label: 'Fair', color: '#ffc107' },
    { value: 'poor', label: 'Poor', color: '#dc3545' },
    { value: 'needs_repair', label: 'Needs Repair', color: '#dc3545' },
    { value: 'retired', label: 'Retired', color: '#6c757d' }
  ]

  const checkoutStatuses = [
    { value: 'available', label: 'Available', color: '#28a745' },
    { value: 'checked_out', label: 'Checked Out', color: '#ffc107' },
    { value: 'maintenance', label: 'In Maintenance', color: '#dc3545' },
    { value: 'retired', label: 'Retired', color: '#6c757d' }
  ]

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    filterInventory()
  }, [inventory, searchTerm, filterStatus, activeTab])

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
      const { data: roleData } = await supabase
        .from('user_roles')
        .select(`
          role,
          organization_id,
          organizations (
            name,
            settings
          )
        `)
        .eq('user_id', user.id)
        .eq('approved', true)
        .single()

      if (roleData) {
        setUserRole(roleData.role)
        setOrganization(roleData.organizations)
        await loadInventory(roleData.organization_id)
      } else {
        setUserRole('pilot')
        await loadInventory(null)
      }
    } catch (error) {
      setUserRole('pilot')
      await loadInventory(null)
    }
  }

  const loadInventory = async (orgId) => {
    try {
      let query = supabase.from('inventory').select('*')
      
      if (userRole === 'super_admin') {
        // Super admin sees all inventory
        query = query.order('created_at', { ascending: false })
      } else if (orgId) {
        // Organization users see their org inventory
        query = query.eq('organization_id', orgId).order('created_at', { ascending: false })
      } else {
        // Solo users see their own inventory
        query = query.eq('created_by', user.id).order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error
      setInventory(data || [])
    } catch (error) {
      console.error('Error loading inventory:', error)
      setMessage(`❌ Error loading inventory: ${error.message}`)
    }
  }

  const filterInventory = () => {
    let filtered = inventory

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(term) ||
        item.model?.toLowerCase().includes(term) ||
        item.serial_number?.toLowerCase().includes(term) ||
        item.manufacturer?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'available') {
        filtered = filtered.filter(item => item.checkout_status === 'available')
      } else if (filterStatus === 'checked_out') {
        filtered = filtered.filter(item => item.checkout_status === 'checked_out')
      } else if (filterStatus === 'maintenance') {
        filtered = filtered.filter(item => item.checkout_status === 'maintenance')
      } else if (filterStatus === 'expiring_soon') {
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        filtered = filtered.filter(item => 
          item.expiration_date && new Date(item.expiration_date) <= thirtyDaysFromNow
        )
      }
    }

    // Category filter (activeTab)
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.category === activeTab)
    }

    setFilteredInventory(filtered)
  }

  const handleInputChange = (e) => {
    setItemData({
      ...itemData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newItem = {
        ...itemData,
        organization_id: organization?.id || null,
        created_by: user.id,
        checkout_status: 'available',
        purchase_price: parseFloat(itemData.purchase_price) || null,
        insurance_value: parseFloat(itemData.insurance_value) || null,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('inventory')
        .insert([newItem])

      if (error) throw error

      setMessage('✅ Inventory item added successfully!')
      setShowAddForm(false)
      setItemData({
        name: '', category: '', model: '', serial_number: '', manufacturer: '',
        purchase_date: '', purchase_price: '', condition_status: 'excellent',
        location: '', notes: '', registration_number: '', expiration_date: '',
        maintenance_due: '', insurance_value: ''
      })
      
      await loadInventory(organization?.id)

    } catch (error) {
      setMessage(`❌ Error adding item: ${error.message}`)
    }

    setLoading(false)
  }

  const handleCheckout = async (itemId, action) => {
    try {
      const updates = {
        checkout_status: action,
        checked_out_by: action === 'checked_out' ? user.id : null,
        checked_out_at: action === 'checked_out' ? new Date().toISOString() : null,
        checked_in_at: action === 'available' ? new Date().toISOString() : null
      }

      const { error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', itemId)

      if (error) throw error

      const actionText = action === 'checked_out' ? 'checked out' : 
                       action === 'available' ? 'checked in' : 
                       action === 'maintenance' ? 'marked for maintenance' : 'updated'

      setMessage(`✅ Item ${actionText} successfully!`)
      
      // Send notification to admin
      await sendInventoryNotification(itemId, action)
      await loadInventory(organization?.id)

    } catch (error) {
      setMessage(`❌ Error updating item: ${error.message}`)
    }
  }

  const sendInventoryNotification = async (itemId, action) => {
    try {
      console.log(`Sending inventory notification: Item ${itemId} ${action}`)
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
        setMessage('❌ Please upload a CSV or Excel file')
        return
      }
      setUploadFile(file)
      previewFile(file)
    }
  }

  const previewFile = async (file) => {
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        setMessage('❌ File must have a header row and at least one data row')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })

      setPreviewData(preview)
      setUploadProgress(`Preview: ${preview.length} rows of ${lines.length - 1} total`)

    } catch (error) {
      setMessage(`❌ Error reading file: ${error.message}`)
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFile) return

    setLoading(true)
    setUploadProgress('Processing file...')

    try {
      const text = await uploadFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase())
      
      const items = []
      let processed = 0
      let errors = 0

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          
          const item = {
            organization_id: organization?.id || null,
            created_by: user.id,
            checkout_status: 'available',
            created_at: new Date().toISOString()
          }

          // Map common column names
          headers.forEach((header, index) => {
            const value = values[index] || ''
            if (value) {
              if (header.includes('name') || header.includes('item')) item.name = value
              else if (header.includes('category') || header.includes('type')) item.category = value
              else if (header.includes('model')) item.model = value
              else if (header.includes('serial')) item.serial_number = value
              else if (header.includes('manufacturer') || header.includes('brand')) item.manufacturer = value
              else if (header.includes('purchase_date') || header.includes('date')) item.purchase_date = value
              else if (header.includes('price') || header.includes('cost')) item.purchase_price = parseFloat(value) || null
              else if (header.includes('condition')) item.condition_status = value.toLowerCase()
              else if (header.includes('location')) item.location = value
              else if (header.includes('notes')) item.notes = value
              else if (header.includes('registration')) item.registration_number = value
              else if (header.includes('expiration') || header.includes('expires')) item.expiration_date = value
              else if (header.includes('maintenance')) item.maintenance_due = value
              else if (header.includes('insurance')) item.insurance_value = parseFloat(value) || null
            }
          })

          if (item.name) {
            items.push(item)
            processed++
          }

          setUploadProgress(`Processing: ${processed}/${lines.length - 1} items`)
          
        } catch (error) {
          errors++
          console.error(`Error processing row ${i}:`, error)
        }
      }

      if (items.length === 0) {
        setMessage('❌ No valid items found in file. Make sure you have a "name" or "item" column.')
        setLoading(false)
        return
      }

      // Insert items in batches
      const batchSize = 50
      let inserted = 0
      
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        const { error } = await supabase
          .from('inventory')
          .insert(batch)

        if (error) {
          console.error('Batch insert error:', error)
          errors += batch.length
        } else {
          inserted += batch.length
        }

        setUploadProgress(`Uploading: ${Math.min(i + batchSize, items.length)}/${items.length} items`)
      }

      setMessage(`✅ Upload complete! ${inserted} items added successfully. ${errors > 0 ? `${errors} errors encountered.` : ''}`)
      setShowUploadForm(false)
      setUploadFile(null)
      setPreviewData([])
      setUploadProgress('')

      await loadInventory(organization?.id)

    } catch (error) {
      setMessage(`❌ Upload failed: ${error.message}`)
    }

    setLoading(false)
  }

  const getStatusColor = (status) => {
    const statusObj = checkoutStatuses.find(s => s.value === status)
    return statusObj?.color || '#6c757d'
  }

  const getConditionColor = (condition) => {
    const conditionObj = conditionStatuses.find(c => c.value === condition)
    return conditionObj?.color || '#6c757d'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getUniqueCategories = () => {
    const uniqueCategories = [...new Set(inventory.map(item => item.category).filter(Boolean))]
    return ['all', ...uniqueCategories.sort()]
  }

  const getInventoryStats = () => {
    const total = inventory.length
    const available = inventory.filter(item => item.checkout_status === 'available').length
    const checkedOut = inventory.filter(item => item.checkout_status === 'checked_out').length
    const maintenance = inventory.filter(item => item.checkout_status === 'maintenance').length
    const totalValue = inventory.reduce((sum, item) => sum + (item.purchase_price || 0), 0)

    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    const expiringSoon = inventory.filter(item => 
      item.expiration_date && new Date(item.expiration_date) <= thirtyDaysFromNow
    ).length

    return { total, available, checkedOut, maintenance, totalValue, expiringSoon }
  }

  if (loading && !inventory.length) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
          <h2>Loading Inventory...</h2>
        </div>
      </div>
    )
  }

  const stats = getInventoryStats()

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      {/* Header */}
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
              📦 Inventory Management
            </h1>
            <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
              {organization ? `${organization.name} • ` : ''}
              {stats.total} items • {formatCurrency(stats.totalValue)} total value
            </p>
          </div>
        </div>

        <button 
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          ← Dashboard
        </button>
      </div>

      {message && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: message.includes('❌') ? '#f8d7da' : '#d1ecf1',
          color: message.includes('❌') ? '#721c24' : '#0c5460',
          borderRadius: '8px',
          border: `1px solid ${message.includes('❌') ? '#f5c6cb' : '#bee5eb'}`
        }}>
          {message}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ backgroundColor: '#007bff', color: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Total Items</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.total}</div>
        </div>
        
        <div style={{ backgroundColor: '#28a745', color: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Available</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.available}</div>
        </div>
        
        <div style={{ backgroundColor: '#ffc107', color: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Checked Out</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.checkedOut}</div>
        </div>
        
        <div style={{ backgroundColor: '#dc3545', color: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Maintenance</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.maintenance}</div>
        </div>

        <div style={{ backgroundColor: '#17a2b8', color: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Total Value</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(stats.totalValue)}</div>
        </div>

        {stats.expiringSoon > 0 && (
          <div style={{ backgroundColor: '#fd7e14', color: 'white', padding: '20px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Expiring Soon</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.expiringSoon}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Within 30 days</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1a2332' }}>Inventory Actions</h3>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: '12px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            ➕ Add Item
          </button>

          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            style={{
              padding: '12px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            📤 Upload CSV/Excel
          </button>

          <button
            onClick={() => loadInventory(organization?.id)}
            style={{
              padding: '12px 20px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 25px 0', color: '#1a2332' }}>Add New Inventory Item</h3>
          
          <form onSubmit={handleAddItem}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                  Item Name *
                </label>
                <input 
                  type="text"
                  name="name"
                  value={itemData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., DJI Mavic Air 2"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={itemData.category}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                  Model
                </label>
                <input 
                  type="text"
                  name="model"
                  value={itemData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., Mavic Air 2"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                  Serial Number
                </label>
                <input 
                  type="text"
                  name="serial_number"
                  value={itemData.serial_number}
                  onChange={handleInputChange}
                  placeholder="e.g., ABC123456"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                  Manufacturer
                </label>
                <input 
                  type="text"
                  name="manufacturer"
                  value={itemData.manufacturer}
                  onChange={handleInputChange}
                  placeholder="e.g., DJI"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                  Condition
                </label>
                <select
                  name="condition_status"
                  value={itemData.condition_status}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                >
                  {conditionStatuses.map(condition => (
                    <option key={condition.value} value={condition.value}>{condition.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                  Purchase Date
                </label>
                <input 
                  type="date"
                  name="purchase_date"
                  value={itemData.purchase_date}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                  Purchase Price ($)
                </label>
                <input 
                  type="number"
                  name="purchase_price"
                  value={itemData.purchase_price}
                  onChange={handleInputChange}
                  placeholder="e.g., 799.00"
                  min="0"
                  step="0.01"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                />
              </div>

              <div>
                <input 
                  type="text"
                  name="location"
                  value={itemData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Storage Room A"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                  Registration Number
                </label>
                <input 
                  type="text"
                  name="registration_number"
                  value={itemData.registration_number}
                  onChange={handleInputChange}
                  placeholder="e.g., FA32D7G9K"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                  Expiration Date
                </label>
                <input 
                  type="date"
                  name="expiration_date"
                  value={itemData.expiration_date}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                  Insurance Value ($)
                </label>
                <input 
                  type="number"
                  name="insurance_value"
                  value={itemData.insurance_value}
                  onChange={handleInputChange}
                  placeholder="e.g., 1200.00"
                  min="0"
                  step="0.01"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
                Notes
              </label>
              <textarea 
                name="notes"
                value={itemData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes about this item..."
                rows="3"
                style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: loading ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {loading ? '💾 Saving...' : '💾 Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* File Upload Form */}
      {showUploadForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 25px 0', color: '#1a2332' }}>Upload Inventory from CSV/Excel</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              padding: '15px',
              backgroundColor: '#e7f3ff',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>📋 File Format Guidelines</h4>
              <div style={{ fontSize: '14px', color: '#333' }}>
                <strong>Required columns:</strong> name (or item)<br/>
                <strong>Optional columns:</strong> category, model, serial_number, manufacturer, purchase_date, purchase_price, condition, location, notes, registration_number, expiration_date, insurance_value
              </div>
            </div>

            <input 
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px dashed #ced4da',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer'
              }}
            />
            
            {uploadProgress && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#d1ecf1',
                borderRadius: '6px',
                color: '#0c5460'
              }}>
                {uploadProgress}
              </div>
            )}
          </div>

          {previewData.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Preview (first 5 rows)</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                      {Object.keys(previewData[0] || {}).map(header => (
                        <th key={header} style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left' }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, colIndex) => (
                          <td key={colIndex} style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowUploadForm(false)
                setUploadFile(null)
                setPreviewData([])
                setUploadProgress('')
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleFileUpload}
              disabled={!uploadFile || loading}
              style={{
                padding: '12px 24px',
                backgroundColor: !uploadFile || loading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: !uploadFile || loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? '📤 Uploading...' : '📤 Upload File'}
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', alignItems: 'end' }}>
          <div>
            <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
              Search Items
            </label>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, model, serial number..."
              style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', color: '#495057', display: 'block', marginBottom: '5px' }}>
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px' }}
            >
              <option value="all">All Items</option>
              <option value="available">Available</option>
              <option value="checked_out">Checked Out</option>
              <option value="maintenance">In Maintenance</option>
              <option value="expiring_soon">Expiring Soon</option>
            </select>
          </div>

          <div>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
                setActiveTab('all')
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              🔄 Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e9ecef',
          overflowX: 'auto'
        }}>
          {getUniqueCategories().map(category => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              style={{
                padding: '15px 20px',
                backgroundColor: activeTab === category ? '#007bff' : 'transparent',
                color: activeTab === category ? 'white' : '#495057',
                border: 'none',
                borderBottom: activeTab === category ? '3px solid #0056b3' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: activeTab === category ? 'bold' : 'normal',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content'
              }}
            >
              {category === 'all' ? 'All Categories' : category}
              {category !== 'all' && (
                <span style={{
                  marginLeft: '8px',
                  padding: '2px 6px',
                  backgroundColor: activeTab === category ? 'rgba(255,255,255,0.3)' : '#e9ecef',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {inventory.filter(item => item.category === category).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Inventory Table */}
        <div style={{ padding: '0' }}>
          {filteredInventory.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6c757d' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
              <h4 style={{ margin: '0 0 10px 0' }}>
                {searchTerm || filterStatus !== 'all' ? 'No Items Match Your Filters' : 'No Inventory Items'}
              </h4>
              <p style={{ margin: '0' }}>
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first inventory item to get started!'
                }
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e9ecef', fontWeight: 'bold' }}>
                      Item Details
                    </th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e9ecef', fontWeight: 'bold' }}>
                      Specifications
                    </th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e9ecef', fontWeight: 'bold' }}>
                      Status & Location
                    </th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e9ecef', fontWeight: 'bold' }}>
                      Value & Dates
                    </th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e9ecef', fontWeight: 'bold' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item, index) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 'bold', color: '#1a2332', marginBottom: '5px' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '3px' }}>
                          <strong>Category:</strong> {item.category}
                        </div>
                        {item.serial_number && (
                          <div style={{ fontSize: '12px', color: '#6c757d' }}>
                            <strong>S/N:</strong> {item.serial_number}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '15px' }}>
                        {item.manufacturer && (
                          <div style={{ fontSize: '14px', marginBottom: '3px' }}>
                            <strong>Brand:</strong> {item.manufacturer}
                          </div>
                        )}
                        {item.model && (
                          <div style={{ fontSize: '14px', marginBottom: '3px' }}>
                            <strong>Model:</strong> {item.model}
                          </div>
                        )}
                        {item.registration_number && (
                          <div style={{ fontSize: '14px', marginBottom: '3px' }}>
                            <strong>Reg:</strong> {item.registration_number}
                          </div>
                        )}
                        <div style={{ 
                          fontSize: '12px', 
                          color: getConditionColor(item.condition_status),
                          fontWeight: 'bold',
                          marginTop: '5px'
                        }}>
                          {conditionStatuses.find(c => c.value === item.condition_status)?.label || item.condition_status}
                        </div>
                      </td>

                      <td style={{ padding: '15px' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: getStatusColor(item.checkout_status),
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginBottom: '5px'
                        }}>
                          {checkoutStatuses.find(s => s.value === item.checkout_status)?.label || item.checkout_status}
                        </div>
                        {item.location && (
                          <div style={{ fontSize: '14px', color: '#6c757d' }}>
                            📍 {item.location}
                          </div>
                        )}
                        {item.checked_out_at && (
                          <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '3px' }}>
                            Out: {formatDate(item.checked_out_at)}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '15px' }}>
                        {item.purchase_price && (
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#28a745', marginBottom: '3px' }}>
                            {formatCurrency(item.purchase_price)}
                          </div>
                        )}
                        {item.insurance_value && (
                          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '3px' }}>
                            Insured: {formatCurrency(item.insurance_value)}
                          </div>
                        )}
                        {item.purchase_date && (
                          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '3px' }}>
                            Purchased: {formatDate(item.purchase_date)}
                          </div>
                        )}
                        {item.expiration_date && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: new Date(item.expiration_date) <= new Date(Date.now() + 30*24*60*60*1000) ? '#dc3545' : '#6c757d',
                            fontWeight: new Date(item.expiration_date) <= new Date(Date.now() + 30*24*60*60*1000) ? 'bold' : 'normal'
                          }}>
                            Expires: {formatDate(item.expiration_date)}
                            {new Date(item.expiration_date) <= new Date(Date.now() + 30*24*60*60*1000) && ' ⚠️'}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {item.checkout_status === 'available' ? (
                            <button
                              onClick={() => handleCheckout(item.id, 'checked_out')}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#ffc107',
                                color: '#212529',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              📤 Check Out
                            </button>
                          ) : item.checkout_status === 'checked_out' ? (
                            <button
                              onClick={() => handleCheckout(item.id, 'available')}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              📥 Check In
                            </button>
                          ) : null}
                          
                          <button
                            onClick={() => handleCheckout(item.id, 'maintenance')}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            🔧 Maintenance
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Mobile responsive styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .inventory-table {
            font-size: 12px;
          }
          
          .inventory-table td {
            padding: 8px !important;
          }
          
          .action-buttons {
            flex-direction: column;
            gap: 3px;
          }
          
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
          }
          
          .search-filters {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
        }
        
        .inventory-row:hover {
          background-color: #f8f9fa;
        }
        
        .status-badge {
          transition: all 0.2s ease;
        }
        
        .action-button {
          transition: transform 0.1s ease;
        }
        
        .action-button:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}
