'use client'

import Image from 'next/image'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { Building2, Check, CircleAlert, CircleCheck, Eye, EyeOff, LoaderCircle, LockKeyhole, UserRound, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandLogo } from './brand'
import { NavBar, StatusBar } from './phone-frame'

import { DEMO_ACCOUNT, DEMO_PASSWORD } from './demo-credentials'

type Status = 'idle' | 'loading' | 'success'

export function LoginScreen({
  initialAccount = '',
  initialPassword = '',
  initialRemember = false,
  initialError = '',
}: {
  initialAccount?: string
  initialPassword?: string
  initialRemember?: boolean
  initialError?: string
}) {
  const accountId = useId()
  const passwordId = useId()
  const errorId = useId()
  const [account, setAccount] = useState(initialAccount)
  const [password, setPassword] = useState(initialPassword)
  const [remember, setRemember] = useState(initialRemember)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(initialError)
  const [status, setStatus] = useState<Status>('idle')

  const canSubmit = account.trim().length > 0 && password.length > 0 && status === 'idle'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    setError('')
    setStatus('loading')
    window.setTimeout(() => {
      if (account.trim() === DEMO_ACCOUNT && password === DEMO_PASSWORD) {
        setStatus('success')
        window.setTimeout(() => setStatus('idle'), 1800)
        return
      }
      setStatus('idle')
      setError('账号或密码错误，请重新输入（连续错误 5 次将锁定 30 分钟）')
    }, 800)
  }

  return (
    <div className="relative flex h-full flex-col bg-navy text-foreground">
      <Image
        src="/images/login-hero-light.png"
        alt=""
        fill
        priority
        sizes="375px"
        className="object-cover object-top"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f4f8fe00_0%,#f4f8fe00_24%,#f4f8fee6_44%,#f4f8fe_62%)]" />

      <div className="relative z-10 flex h-full flex-col">
        <StatusBar />
        <NavBar />

        <div className="flex flex-1 flex-col px-7 pb-8 pt-[118px]">
          <BrandLogo />
          <div className="mt-6 flex items-center gap-2">
            <h1 className="text-display font-bold leading-[1.3]">机构端登录</h1>
            <span className="flex items-center gap-1 rounded-full border border-primary/10 bg-white/80 px-2.5 py-1 text-caption text-secondary-foreground backdrop-blur">
              <Building2 className="size-3.5 text-accent" aria-hidden="true" />
              合作机构专用
            </span>
          </div>
          <p className="mt-2 text-body leading-6 text-muted-foreground">请使用平台分配的机构账号登录</p>

          <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col">
            <div className="flex flex-col gap-3">
              <label htmlFor={accountId} className="sr-only">
                登录账号
              </label>
              <FieldRow icon={<UserRound className="size-[18px]" aria-hidden="true" />} error={Boolean(error)}>
                <input
                  id={accountId}
                  name="account"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={32}
                  placeholder="请输入登录账号"
                  value={account}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  onChange={(event) => {
                    setAccount(event.target.value)
                    setError('')
                  }}
                  className={inputClass}
                />
                {account && (
                  <IconButton label="清空账号" onClick={() => setAccount('')}>
                    <span className="flex size-4 items-center justify-center rounded-full bg-[#c9d2e0] text-white">
                      <X className="size-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                  </IconButton>
                )}
              </FieldRow>

              <label htmlFor={passwordId} className="sr-only">
                登录密码
              </label>
              <FieldRow icon={<LockKeyhole className="size-[18px]" aria-hidden="true" />} error={Boolean(error)}>
                <input
                  id={passwordId}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  maxLength={20}
                  placeholder="请输入登录密码"
                  value={password}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setError('')
                  }}
                  className={inputClass}
                />
                <IconButton
                  label={showPassword ? '隐藏密码' : '显示密码'}
                  pressed={showPassword}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <Eye className="size-[18px]" aria-hidden="true" />
                  ) : (
                    <EyeOff className="size-[18px]" aria-hidden="true" />
                  )}
                </IconButton>
              </FieldRow>
            </div>

            <p
              id={errorId}
              role="alert"
              className={cn(
                'mt-2 flex h-10 items-start gap-1 overflow-hidden pl-1 text-caption leading-5 text-destructive',
                !error && 'invisible',
              )}
            >
              {error && <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />}
              {error}
            </p>

  <div className="flex items-center justify-between">
  <button
  type="button"
  role="checkbox"
                aria-checked={remember}
                onClick={() => setRemember((value) => !value)}
                className="flex items-center gap-2 py-1 text-note text-muted-foreground"
              >
                <span
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                    remember ? 'border-primary bg-primary text-white' : 'border-[#b8c2d6] bg-white',
                  )}
                >
                  {remember && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
                </span>
                记住密码
              </button>
              <span className="text-caption text-faint">忘记密码请联系平台管理员</span>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-title font-medium text-primary-foreground shadow-[0_10px_24px_#3a82e438] transition-all active:scale-[0.98] disabled:bg-[#b5d3f6] disabled:shadow-none"
            >
              {status === 'loading' && <LoaderCircle className="size-4.5 animate-spin" aria-hidden="true" />}
              {status === 'loading' ? '登录中…' : '登录'}
            </button>
          </form>

          <p className="mt-auto text-center text-caption text-faint">都正生物 · 药问基因机构服务平台</p>
        </div>
      </div>

      {status === 'success' && (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-0 top-[42%] z-20 mx-auto flex w-fit max-w-[260px] flex-col items-center gap-2 rounded-xl bg-[#2a3a52]/80 px-6 py-4 text-center backdrop-blur"
        >
          <CircleCheck className="size-7 text-white" aria-hidden="true" />
          <p className="text-body leading-5 text-white">
            登录成功
            {remember && <span className="block text-caption text-white/70">已记住密码，下次自动填充</span>}
          </p>
        </div>
      )}
    </div>
  )
}

const inputClass =
  'h-full w-full min-w-0 bg-transparent text-title text-foreground outline-none placeholder:text-faint'

function FieldRow({ icon, children, error }: { icon: ReactNode; children: ReactNode; error?: boolean }) {
  return (
    <div
      className={cn(
        'flex h-[52px] items-center gap-3 rounded-2xl border bg-white px-4 transition-colors focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10',
        error ? 'border-destructive' : 'border-border',
      )}
    >
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </div>
  )
}

function IconButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string
  pressed?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="-mr-2 flex size-9 shrink-0 items-center justify-center rounded-full text-faint transition-colors hover:text-muted-foreground"
    >
      {children}
    </button>
  )
}
