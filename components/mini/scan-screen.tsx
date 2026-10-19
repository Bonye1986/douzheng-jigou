'use client'

import { useEffect, useRef, useState } from 'react'
import { CameraOff, ChevronLeft, Keyboard, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBar } from './phone-frame'

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>
}
type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorLike

type CameraState = 'starting' | 'live' | 'unavailable'

export function ScanScreen({
  title,
  tip,
  context,
  manualLabel,
  manualPlaceholder,
  demoCode,
  validate,
  onBack,
  onResult,
}: {
  title: string
  tip: string
  context?: string
  manualLabel: string
  manualPlaceholder: string
  demoCode: string
  validate?: (code: string) => string | undefined
  onBack: () => void
  onResult: (code: string) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const handledRef = useRef(false)
  const resultRef = useRef(onResult)
  const validateRef = useRef(validate)
  resultRef.current = onResult
  validateRef.current = validate

  const [camera, setCamera] = useState<CameraState>('starting')
  const [manual, setManual] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const submit = (raw: string) => {
    const value = raw.trim().toUpperCase()
    if (!value) {
      setError(`请输入${manualLabel}`)
      return
    }
    const message = validateRef.current?.(value)
    if (message) {
      setError(message)
      return
    }
    handledRef.current = true
    resultRef.current(value)
  }

  useEffect(() => {
    let stream: MediaStream | undefined
    let timer: number | undefined
    let cancelled = false

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamera('unavailable')
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (cancelled) return
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()
        setCamera('live')

        const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector
        if (!Detector) return
        const detector = new Detector({ formats: ['qr_code', 'code_128', 'code_39', 'ean_13'] })
        const tick = async () => {
          if (cancelled || handledRef.current) return
          try {
            const [hit] = await detector.detect(video)
            if (hit?.rawValue) {
              const value = hit.rawValue.trim().toUpperCase()
              const message = validateRef.current?.(value)
              if (message) setError(message)
              else {
                handledRef.current = true
                resultRef.current(value)
                return
              }
            }
          } catch {}
          timer = window.setTimeout(tick, 350)
        }
        tick()
      } catch {
        if (!cancelled) setCamera('unavailable')
      }
    }

    start()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#0d1622] text-white">
      <video
        ref={videoRef}
        muted
        playsInline
        aria-hidden="true"
        className={cn(
          'absolute inset-0 size-full object-cover transition-opacity',
          camera === 'live' ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/70" />

      <div className="relative z-10 shrink-0">
        <StatusBar tone="light" />
        <header className="relative flex h-11 items-center justify-center px-12">
          <button
            type="button"
            onClick={onBack}
            aria-label="返回"
            className="absolute left-2 flex size-9 items-center justify-center rounded-full"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
          <h1 className="text-title font-semibold">{title}</h1>
        </header>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center px-8 pt-6">
        {context && (
          <p className="mb-5 max-w-full truncate rounded-full bg-white/12 px-3.5 py-1 text-caption text-white/85 backdrop-blur">
            {context}
          </p>
        )}

        <div className="relative aspect-square w-full max-w-[240px]">
          {(['left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-xl', 'right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-xl', 'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl', 'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl'] as const).map((pos) => (
            <span key={pos} aria-hidden="true" className={cn('absolute size-7 border-[#5fa2f0]', pos)} />
          ))}
          {camera === 'live' ? (
            <span
              aria-hidden="true"
              className="absolute inset-x-3 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#7cb4f3] to-transparent shadow-[0_0_12px_#5fa2f0] animate-[scan-line_2.2s_ease-in-out_infinite]"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-center">
              {camera === 'starting' ? (
                <>
                  <ScanLine className="size-9 animate-pulse text-white/70" aria-hidden="true" />
                  <p className="text-note text-white/70">正在启动摄像头…</p>
                </>
              ) : (
                <>
                  <CameraOff className="size-9 text-white/60" aria-hidden="true" />
                  <p className="text-note text-white/80">无法访问摄像头</p>
                  <p className="px-4 text-caption text-white/55">请在设置中允许相机权限，或手动输入</p>
                </>
              )}
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-note text-white/80">{tip}</p>
        {error && !manual && (
          <p role="alert" className="mt-2 text-center text-caption text-[#ff9a8a]">
            {error}
          </p>
        )}
      </div>

      <div className="relative z-10 shrink-0 px-5 pb-9">
        {manual ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit(code)
            }}
            className="flex flex-col gap-2 rounded-2xl bg-white p-4 text-foreground"
          >
            <label htmlFor="scan-manual" className="text-body font-medium">
              手动输入{manualLabel}
            </label>
            <div className="flex gap-2">
              <input
                id="scan-manual"
                value={code}
                autoFocus
                autoComplete="off"
                onChange={(e) => {
                  setCode(e.target.value)
                  setError('')
                }}
                placeholder={manualPlaceholder}
                aria-invalid={Boolean(error)}
                className="h-10 min-w-0 flex-1 rounded-xl bg-[#f2f5fa] px-3 text-body tabular-nums uppercase outline-none placeholder:normal-case placeholder:text-faint focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-xl bg-gradient-to-r from-primary to-[#5fa2f0] px-4 text-body font-medium text-white"
              >
                确认
              </button>
            </div>
            {error && (
              <p role="alert" className="text-caption text-destructive">
                {error}
              </p>
            )}
            <div className="flex items-center justify-between pt-1 text-caption">
              <button type="button" onClick={() => setManual(false)} className="text-muted-foreground">
                返回扫码
              </button>
              <button type="button" onClick={() => submit(demoCode)} className="text-primary">
                演示：模拟识别 {demoCode}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex justify-center gap-10">
            <button
              type="button"
              onClick={() => setManual(true)}
              className="flex flex-col items-center gap-1.5 text-caption text-white/85"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                <Keyboard className="size-5" aria-hidden="true" />
              </span>
              手动输入
            </button>
            <button
              type="button"
              onClick={() => submit(demoCode)}
              className="flex flex-col items-center gap-1.5 text-caption text-white/85"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                <ScanLine className="size-5" aria-hidden="true" />
              </span>
              模拟识别
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
