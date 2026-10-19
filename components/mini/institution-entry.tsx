'use client'

import { useState, type ComponentProps } from 'react'
import { InstitutionApp } from './institution-app'
import { LoginScreen } from './login-screen'

export function InstitutionEntry(props: Omit<ComponentProps<typeof LoginScreen>, 'onLogin'>) {
  const [loggedIn, setLoggedIn] = useState(false)
  const [session, setSession] = useState(0)

  if (loggedIn) {
    return (
      <InstitutionApp
        onLogout={() => {
          setLoggedIn(false)
          setSession((s) => s + 1)
        }}
      />
    )
  }
  return <LoginScreen key={session} {...props} onLogin={() => setLoggedIn(true)} />
}
