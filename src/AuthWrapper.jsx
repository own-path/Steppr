import React from 'react'
import { useClerk } from '@clerk/clerk-react'
import App from './App'
import { useCurrentUser } from './hooks/useCurrentUser'

export default function AuthWrapper() {
  const { isLoading, isAuthenticated, user } = useCurrentUser()
  const { openSignIn, openSignUp } = useClerk()

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #C8D5EE', borderTopColor: '#003594', animation: 'spin 0.7s linear infinite' }}/>
    </div>
  )

  return <App onSignIn={openSignIn} onSignUp={openSignUp} isAuthenticated={isAuthenticated} currentUser={user}/>
}
