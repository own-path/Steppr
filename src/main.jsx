import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import App from './App'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL

async function init() {
  let root

  if (CLERK_KEY && CONVEX_URL) {
    const [
      { ClerkProvider, useAuth },
      { ConvexProviderWithClerk },
      { ConvexReactClient },
      { default: AuthWrapper },
    ] = await Promise.all([
      import('@clerk/clerk-react'),
      import('convex/react-clerk'),
      import('convex/react'),
      import('./AuthWrapper'),
    ])

    const convex = new ConvexReactClient(CONVEX_URL)
    root = (
      <ClerkProvider publishableKey={CLERK_KEY}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <AuthWrapper />
        </ConvexProviderWithClerk>
      </ClerkProvider>
    )
  } else {
    root = <App />
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>{root}</React.StrictMode>
  )
}

init()
