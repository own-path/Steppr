import { useConvexAuth } from 'convex/react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'

export function useCurrentUser() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth()
  const { user: clerkUser } = useUser()
  const convexUser = useQuery(api.users.getCurrentUser)
  const upsertUser = useMutation(api.users.upsertUser)

  useEffect(() => {
    if (!isAuthenticated || !clerkUser) return
    upsertUser({
      name: clerkUser.fullName || clerkUser.firstName || 'User',
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      avatarUrl: clerkUser.imageUrl,
    })
  }, [isAuthenticated, clerkUser?.id])

  return {
    isLoading: authLoading || (isAuthenticated && convexUser === undefined),
    isAuthenticated,
    user: convexUser,
    clerkUser,
  }
}
