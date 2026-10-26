'use client'

import { useState, type ComponentProps } from 'react'
import { InstitutionApp } from './institution-app'
import { LoginScreen } from './login-screen'
import type { InstitutionRole } from './orders-data'

export function InstitutionEntry(props: Omit<ComponentProps<typeof LoginScreen>, 'onLogin'>) {
  const [role, setRole] = useState<InstitutionRole | undefined>()
  const [session, setSession] = useState(0)

  if (role) {
    return (
      <InstitutionApp
        key={role}
        role={role}
        onLogout={() => {
          setRole(undefined)
          setSession((s) => s + 1)
        }}
      />
    )
  }
  return <LoginScreen key={session} {...props} onLogin={setRole} />
}
