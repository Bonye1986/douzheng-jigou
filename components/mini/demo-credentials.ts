import type { InstitutionRole } from './orders-data'

export const DEMO_ACCOUNT = 'jg_changsha01'
export const DEMO_PASSWORD = 'Dz123456'
export const LAB_ACCOUNT = 'lab_dz01'
export const LAB_PASSWORD = 'Dz123456'

export const demoAccounts: { account: string; password: string; role: InstitutionRole }[] = [
  { account: DEMO_ACCOUNT, password: DEMO_PASSWORD, role: 'partner' },
  { account: LAB_ACCOUNT, password: LAB_PASSWORD, role: 'lab' },
]
