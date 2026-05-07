import React from 'react'
import { useConvexAuth } from 'convex/react'
import { useClerk } from '@clerk/clerk-react'
import App from './App'

export default function AuthWrapper() {
  const { isLoading } = useConvexAuth()
  const { openSignIn, openSignUp } = useClerk()

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #C8D5EE', borderTopColor: '#003594', animation: 'spin 0.7s linear infinite' }}/>
    </div>
  )

  return <App onSignIn={openSignIn} onSignUp={openSignUp}/>
}
