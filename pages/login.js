import { useState } from 'react'
import { signUp, signIn } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { data, error } = await signUp(email, password)
        if (error) {
          setMessage(`Error: ${error.message}`)
        } else {
          setMessage('Success! Check your email to confirm your account.')
        }
      } else {
        const { data, error } = await signIn(email, password)
        if (error) {
          setMessage(`Error: ${error.message}`)
        } else {
          setMessage('Login successful!')
          // Redirect to dashboard (we'll build this next)
          router.push('/dashboard')
        }
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.')
    }
    
    setLoading(false)
  }

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '100px auto', 
      padding: '30px',
      border: '1px solid #ddd',
      borderRadius: '10px'
    }}>
      <h2>🚁 {isSignUp ? 'Create Account' : 'Login to'} DroneHQ.io</h2>
      
      {message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px',
          backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e8',
          color: message.includes('Error') ? '#c62828' : '#2e7d32',
          borderRadius: '5px'
        }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label>Email:</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '5px'
            }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label>Password:</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '5px'
            }}
            required
          />
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%',
            padding: '12px', 
            backgroundColor: loading ? '#ccc' : '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Login')}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#0070f3', 
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {isSignUp ? 'Login' : 'Sign Up'}
        </button>
      </p>
    </div>
  )
}
