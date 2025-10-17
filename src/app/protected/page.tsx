import { redirect } from 'next/navigation'

import { LogoutButton } from '@/components/logout-button'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createClient()

  // const { data, error } = await supabase.auth.getClaims()
  // if (error || !data?.claims) {
  //   redirect('/auth/login')
  // }
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // If there's no user, redirect to the landing page
  if (error || !user) {
    redirect('/')
  }

  return (
    <div className="flex h-svh w-full items-center justify-center gap-2">
      <p>
        Hello <span>{user.email}</span>
      </p>
      <LogoutButton />
    </div>
  )
}
