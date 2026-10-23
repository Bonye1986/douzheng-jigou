'use client'

import { Fragment, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { PhoneFrame } from '@/components/mini/phone-frame'

export type BoardScreen = {
  id: string
  title: string
  summary: string
  fields: string[]
  flow: string[]
  rules: string[]
  exceptions: string[]
  node: ReactNode
}
export type BoardSection = { key: string; title: string; screens: BoardScreen[] }

export function DesignBoard({ sections, header }: { sections: BoardSection[]; header: ReactNode }) {
  const allScreens = sections.flatMap((section) => section.screens)
  const [activeId, setActiveId] = useState(allScreens[0]?.id)
  const [runKey, setRunKey] = useState(0)
  const activeScreen = allScreens.find((screen) => screen.id === activeId) ?? allScreens[0]
  const activeSection = sections.find((section) => section.screens.includes(activeScreen))

  const select = (id: string) => {
    setActiveId(id)
    setRunKey((key) => key + 1)
  }

  return (
    <>
      <header className="mx-auto max-w-[1600px]">{header}</header>

      <div className="mx-auto mt-8 flex max-w-[1600px] flex-col gap-6 lg:flex-row lg:items-start">
        <nav
          aria-label="页面目录"
          className="w-full rounded-2xl bg-white p-3 shadow-sm ring-1 ring-border lg:sticky lg:top-6 lg:w-[260px] lg:shrink-0"
        >
          <div className="flex flex-col gap-4">
            {sections.map((section) => (
              <section key={section.key} aria-labelledby={`nav-${section.key}`}>
                <h2
                  id={`nav-${section.key}`}
                  className="flex items-center justify-between px-3 pb-1 text-caption font-bold text-muted-foreground"
                >
                  {section.title}
                  <span className="font-medium">{section.screens.length}</span>
                </h2>
                <ul className="flex flex-col">
                  {section.screens.map((screen) => {
                    const active = screen.id === activeScreen.id
                    return (
                      <li key={screen.id}>
                        <button
                          type="button"
                          onClick={() => select(screen.id)}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'flex w-full items-baseline gap-2 rounded-lg px-3 py-2 text-left text-note transition-colors',
                            active ? 'bg-secondary font-medium text-primary' : 'text-foreground hover:bg-muted',
                          )}
                        >
                          <span
                            className={cn(
                              'shrink-0 tabular-nums text-caption',
                              active ? 'text-primary' : 'text-muted-foreground',
                            )}
                          >
                            {screen.id}
                          </span>
                          <span className="text-pretty">{screen.title}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </nav>

        <section aria-label="页面预览" className="flex min-w-0 flex-1 flex-col items-center gap-4">
          <p className="text-body font-medium text-foreground">
            <span className="mr-1.5 font-bold text-primary">{activeScreen.id}</span>
            {activeScreen.title}
          </p>
          <PhoneFrame label={activeScreen.title}>
            <Fragment key={`${activeScreen.id}-${runKey}`}>{activeScreen.node}</Fragment>
          </PhoneFrame>
          <p className="text-caption text-muted-foreground">可在手机内直接点击操作，切换页面后会重置为初始状态</p>
        </section>

        <aside
          aria-label="页面说明"
          className="w-full rounded-2xl bg-white shadow-sm ring-1 ring-border lg:sticky lg:top-6 lg:w-[380px] lg:shrink-0"
        >
          <div className="border-b border-border px-5 py-4">
            <p className="text-note font-bold text-primary">
              页面 {activeScreen.id}
              {activeSection && <span className="font-medium text-muted-foreground"> · {activeSection.title}</span>}
            </p>
            <h2 className="mt-0.5 text-pretty text-heading font-bold text-foreground">{activeScreen.title}</h2>
          </div>
          <div className="flex flex-col gap-6 px-5 py-5">
            <NoteBlock title="功能描述">
              <p className="text-pretty text-body leading-6 text-muted-foreground">{activeScreen.summary}</p>
            </NoteBlock>
            <NoteBlock title="页面字段">
              <NoteList items={activeScreen.fields} />
            </NoteBlock>
            <NoteBlock title="操作流程">
              <NoteList items={activeScreen.flow} numbered />
            </NoteBlock>
            <NoteBlock title="业务规则">
              <NoteList items={activeScreen.rules} />
            </NoteBlock>
            <NoteBlock title="异常处理">
              <NoteList items={activeScreen.exceptions} />
            </NoteBlock>
          </div>
        </aside>
      </div>
    </>
  )
}

function NoteBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2.5 flex items-center gap-2 text-title font-bold text-foreground">
        <span className="h-3.5 w-1 rounded-full bg-primary" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  )
}

function NoteList({ items, numbered = false }: { items: string[]; numbered?: boolean }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={item} className="flex gap-2.5 text-body leading-6 text-foreground">
          {numbered ? (
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-caption font-bold text-primary">
              {index + 1}
            </span>
          ) : (
            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          )}
          <span className="text-pretty">{item}</span>
        </li>
      ))}
    </ul>
  )
}
