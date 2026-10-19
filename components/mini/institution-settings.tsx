'use client'

import { useId, useRef, useState, type ReactNode } from 'react'
import { ChevronRight, CircleAlert, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEMO_PASSWORD } from './login-screen'
import { NavBar, StatusBar } from './phone-frame'
import { institution as defaultProfile, type InstitutionProfile } from './workbench-data'

type View = 'info' | 'password'

const PHONE_PATTERN = /^(1\d{10}|0\d{2,3}-?\s?\d{3,4}\s?\d{4})$/
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*._-]{8,20}$/

export function InstitutionSettingsScreen({
  profile = defaultProfile,
  initialView = 'info',
  onBack,
  onSave,
}: {
  profile?: InstitutionProfile
  initialView?: View
  onBack?: () => void
  onSave?: (profile: InstitutionProfile) => void
}) {
  const [view, setView] = useState<View>(initialView)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)

  const showToast = (message: string) => {
    window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(''), 1600)
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <div className="shrink-0 bg-white">
        <StatusBar />
        <NavBar
          title={view === 'info' ? '机构设置' : '修改登录密码'}
          showBack
          onBack={() => (view === 'password' && initialView === 'info' ? setView('info') : onBack?.())}
        />
      </div>

      {view === 'info' ? (
        <InfoForm
          profile={profile}
          onOpenPassword={() => setView('password')}
          onSave={(next) => {
            onSave?.(next)
            showToast('机构信息已保存')
          }}
        />
      ) : (
        <PasswordForm
          onDone={() => {
            showToast('密码修改成功，请重新登录')
            if (initialView === 'info') setView('info')
          }}
        />
      )}

      {toast && (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-0 top-[44%] z-20 mx-auto w-fit max-w-[260px] rounded-xl bg-[#2a3a52]/80 px-5 py-3 text-center text-body text-white backdrop-blur"
        >
          {toast}
        </div>
      )}
    </div>
  )
}

function InfoForm({
  profile,
  onOpenPassword,
  onSave,
}: {
  profile: InstitutionProfile
  onOpenPassword: () => void
  onSave: (profile: InstitutionProfile) => void
}) {
  const [draft, setDraft] = useState(profile)
  const [saved, setSaved] = useState(profile)
  const [error, setError] = useState('')
  const ids = { name: useId(), open: useId(), close: useId(), phone: useId(), address: useId(), error: useId() }

  const update = <K extends keyof InstitutionProfile>(key: K, value: InstitutionProfile[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setError('')
  }

  const dirty = (Object.keys(draft) as (keyof InstitutionProfile)[]).some((key) => draft[key] !== saved[key])

  const validate = () => {
    if (!draft.name.trim()) return '请输入机构名称'
    if (!draft.openTime || !draft.closeTime) return '请选择完整的工作时间'
    if (draft.openTime >= draft.closeTime) return '结束时间需晚于开始时间'
    if (!PHONE_PATTERN.test(draft.phone.trim())) return '请输入正确的手机号或座机号（如 0731-88626621）'
    if (!draft.address.trim()) return '请输入机构地址'
    return ''
  }

  return (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault()
        const message = validate()
        if (message) {
          setError(message)
          return
        }
        const next = { ...draft, name: draft.name.trim(), phone: draft.phone.trim(), address: draft.address.trim() }
        setDraft(next)
        setSaved(next)
        onSave(next)
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-3 [scrollbar-width:none] *:shrink-0">
        <p className="px-1 text-caption text-muted-foreground">
          {profile.type} · 机构编号 {profile.code}
        </p>

        <section aria-label="机构基本信息" className="divide-y divide-border rounded-2xl bg-white px-4 shadow-sm">
          <Row label="机构名称" htmlFor={ids.name}>
            <input
              id={ids.name}
              value={draft.name}
              maxLength={30}
              placeholder="请输入机构名称"
              onChange={(event) => update('name', event.target.value)}
              className={fieldClass}
            />
          </Row>

          <Row label="工作时间" htmlFor={ids.open}>
            <div className="flex items-center justify-end gap-2">
              <input
                id={ids.open}
                type="time"
                aria-label="开始时间"
                value={draft.openTime}
                onChange={(event) => update('openTime', event.target.value)}
                className={timeClass}
              />
              <span className="text-faint" aria-hidden="true">
                至
              </span>
              <input
                id={ids.close}
                type="time"
                aria-label="结束时间"
                value={draft.closeTime}
                onChange={(event) => update('closeTime', event.target.value)}
                className={timeClass}
              />
            </div>
          </Row>

          <Row label="联系电话" htmlFor={ids.phone}>
            <input
              id={ids.phone}
              type="tel"
              inputMode="tel"
              maxLength={16}
              value={draft.phone}
              placeholder="手机号或座机号"
              onChange={(event) => update('phone', event.target.value)}
              className={fieldClass}
            />
          </Row>

          <Row label="机构地址" htmlFor={ids.address} align="start">
            <textarea
              id={ids.address}
              rows={2}
              maxLength={60}
              value={draft.address}
              placeholder="请输入详细地址"
              onChange={(event) => update('address', event.target.value)}
              className={cn(fieldClass, 'resize-none leading-5')}
            />
          </Row>
        </section>

        <p
          id={ids.error}
          role="alert"
          className={cn('flex min-h-4 items-start gap-1 px-1 text-caption text-destructive', !error && 'hidden')}
        >
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>

        <section aria-label="账号安全" className="rounded-2xl bg-white px-4 shadow-sm">
          <button type="button" onClick={onOpenPassword} className="flex h-14 w-full items-center gap-3 text-left">
            <span className="flex size-8 items-center justify-center rounded-xl bg-secondary text-primary">
              <LockKeyhole className="size-4" aria-hidden="true" />
            </span>
            <span className="flex-1 text-body text-foreground">登录密码</span>
            <span className="text-caption text-muted-foreground">修改</span>
            <ChevronRight className="size-4 text-faint" aria-hidden="true" />
          </button>
        </section>

        <p className="px-1 text-caption leading-5 text-faint">
          机构名称、工作时间、联系电话与地址将同步展示给用户端预约采样的受检人，请确保信息准确。
        </p>
      </div>

      <div className="shrink-0 bg-white px-4 pb-6 pt-3 shadow-[0_-4px_16px_#1f3a6608]">
        <button type="submit" disabled={!dirty} className={primaryButtonClass}>
          保存
        </button>
      </div>
    </form>
  )
}

function PasswordForm({ onDone }: { onDone: () => void }) {
  const [values, setValues] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState('')
  const errorId = useId()

  const set = (key: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [key]: value }))
    setError('')
  }

  const canSubmit = Boolean(values.current && values.next && values.confirm)

  return (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault()
        if (values.current !== DEMO_PASSWORD) return setError('原密码不正确')
        if (!PASSWORD_PATTERN.test(values.next)) return setError('新密码需为 8-20 位，且同时包含字母和数字')
        if (values.next === values.current) return setError('新密码不能与原密码相同')
        if (values.next !== values.confirm) return setError('两次输入的新密码不一致')
        setValues({ current: '', next: '', confirm: '' })
        onDone()
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-3 [scrollbar-width:none] *:shrink-0">
        <section aria-label="修改登录密码" className="divide-y divide-border rounded-2xl bg-white px-4 shadow-sm">
          <PasswordRow
            label="原密码"
            value={values.current}
            autoComplete="current-password"
            placeholder="请输入当前登录密码"
            errorId={error ? errorId : undefined}
            onChange={(value) => set('current', value)}
          />
          <PasswordRow
            label="新密码"
            value={values.next}
            autoComplete="new-password"
            placeholder="8-20 位字母与数字组合"
            errorId={error ? errorId : undefined}
            onChange={(value) => set('next', value)}
          />
          <PasswordRow
            label="确认新密码"
            value={values.confirm}
            autoComplete="new-password"
            placeholder="请再次输入新密码"
            errorId={error ? errorId : undefined}
            onChange={(value) => set('confirm', value)}
          />
        </section>

        <p
          id={errorId}
          role="alert"
          className={cn('flex items-start gap-1 px-1 text-caption text-destructive', !error && 'hidden')}
        >
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>

        <ul className="flex list-disc flex-col gap-1 pl-5 pr-1 text-caption leading-5 text-faint">
          <li>密码长度 8-20 位，须同时包含字母和数字</li>
          <li>修改成功后需使用新密码重新登录，已保存的「记住密码」将失效</li>
          <li>忘记原密码请联系平台管理员重置</li>
        </ul>
      </div>

      <div className="shrink-0 bg-white px-4 pb-6 pt-3 shadow-[0_-4px_16px_#1f3a6608]">
        <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
          确认修改
        </button>
      </div>
    </form>
  )
}

function PasswordRow({
  label,
  value,
  placeholder,
  autoComplete,
  errorId,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  autoComplete: string
  errorId?: string
  onChange: (value: string) => void
}) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  return (
    <Row label={label} htmlFor={id}>
      <div className="flex items-center gap-1">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          maxLength={20}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(errorId)}
          aria-describedby={errorId}
          onChange={(event) => onChange(event.target.value)}
          className={fieldClass}
        />
        <button
          type="button"
          aria-label={visible ? `隐藏${label}` : `显示${label}`}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          className="-mr-1 flex size-8 shrink-0 items-center justify-center text-faint"
        >
          {visible ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
        </button>
      </div>
    </Row>
  )
}

function Row({
  label,
  htmlFor,
  align = 'center',
  children,
}: {
  label: string
  htmlFor: string
  align?: 'center' | 'start'
  children: ReactNode
}) {
  return (
    <div className={cn('flex min-h-14 gap-3 py-3', align === 'center' ? 'items-center' : 'items-start')}>
      <label htmlFor={htmlFor} className={cn('w-[76px] shrink-0 text-body text-foreground', align === 'start' && 'pt-0.5')}>
        {label}
      </label>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

const fieldClass =
  'w-full min-w-0 bg-transparent text-right text-body text-foreground outline-none placeholder:text-faint'

const timeClass =
  'h-8 rounded-lg bg-background px-2 text-center text-body tabular-nums text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40'

const primaryButtonClass =
  'flex h-12 w-full items-center justify-center rounded-full bg-primary text-title font-medium text-primary-foreground shadow-[0_10px_24px_#3a82e438] transition-all active:scale-[0.98] disabled:bg-[#b5d3f6] disabled:shadow-none'
