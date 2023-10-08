import { useEventListener } from '@literal-ui/hooks'
import clsx from 'clsx'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { PhotoSlider } from 'react-photo-view'
import useTilg from 'tilg'
import { useSnapshot } from 'valtio'

import { RenditionSpread } from '@flow/epubjs/types/rendition'

import { db } from '../db'
import { handleFiles } from '../file'
import {
  useBackground,
  useColorScheme,
  useDisablePinchZooming,
  useMobile,
  useSync,
  useTypography,
} from '../hooks'
import { useColorSchemeColors } from '../hooks/useColors'
import { BookTab, reader, useReaderSnapshot } from '../models'
import { isTouchScreen } from '../platform'
import { defaultSettings } from '../state'
import { updateCustomStyle } from '../styles'

import { LeftArrow, RightArrow } from './Icons'
import { DropZone, SplitView } from './base'
import * as pages from './pages'

function handleKeyDown(tab?: BookTab) {
  return (e: KeyboardEvent) => {
    try {
      switch (e.code) {
        case 'ArrowLeft':
        case 'ArrowUp':
          tab?.prev()
          break
        case 'ArrowRight':
        case 'ArrowDown':
          tab?.next()
          break
        case 'Space':
          e.shiftKey ? tab?.prev() : tab?.next()
      }
    } catch (error) {
      // ignore `rendition is undefined` error
    }
  }
}

interface NaviagtionButtonProps {
  direction: 'next' | 'prev'
  onClick: () => void
}

export function NavigationButton(props: NaviagtionButtonProps) {
  const { direction, onClick } = props
  const { focusedBookTab } = useReaderSnapshot()
  const { marginSize } =
    focusedBookTab?.book.configuration?.typography ?? defaultSettings

  const pageTurnClasses = useColorSchemeColors({
    sepia: 'bg-pageTurning-sepia',
    dark: 'bg-pageTurning-dark',
    light: 'bg-pageTurning-light',
  })

  const arrowColors = useColorSchemeColors({
    sepia: 'fill-border-sepia',
    dark: 'fill-border-dark',
    light: 'fill-border-light',
  })

  return (
    <div
      onClick={onClick}
      className={clsx(
        'flex h-full items-center justify-center transition-all',
        marginSize === 'small' ? 'w-32' : 'w-52',
        pageTurnClasses,
      )}
      role="button"
    >
      {direction === 'next' ? (
        <RightArrow className={arrowColors} />
      ) : (
        <LeftArrow className={arrowColors} />
      )}
    </div>
  )
}

export function ReaderGridView() {
  const { groups } = useReaderSnapshot()
  useEventListener('keydown', handleKeyDown(reader.focusedBookTab))

  if (!groups.length) return null
  return (
    <SplitView className={clsx('ReaderGridView')}>
      <NavigationButton
        direction="prev"
        onClick={() => reader.focusedBookTab?.prev()}
      />
      {groups.map(({ id }, i) => (
        <ReaderGroup key={id} index={i} />
      ))}
      <NavigationButton
        direction="next"
        onClick={() => reader.focusedBookTab?.next()}
      />
    </SplitView>
  )
}

interface ReaderGroupProps {
  index: number
}
function ReaderGroup({ index }: ReaderGroupProps) {
  const group = reader.groups[index]!
  const { selectedIndex } = useSnapshot(group)

  const handleMouseDown = useCallback(() => {
    reader.selectGroup(index)
  }, [index])

  const bgClasses = useColorSchemeColors({
    sepia: 'bg-background-sepia',
    dark: 'bg-background-dark',
    light: 'bg-background-light',
  })

  return (
    <div
      className={clsx(
        'ReaderGroup flex flex-1 flex-col overflow-hidden focus:outline-none',
        bgClasses,
      )}
      onMouseDown={handleMouseDown}
    >
      <DropZone
        className={clsx('flex-1', isTouchScreen || 'h-0')}
        split
        onDrop={async (e, position) => {
          // read `e.dataTransfer` first to avoid get empty value after `await`
          const files = e.dataTransfer.files
          let tabs = []

          if (files.length) {
            tabs = await handleFiles(files)
          } else {
            const text = e.dataTransfer.getData('text/plain')
            const fromTab = text.includes(',')

            if (fromTab) {
              const indexes = text.split(',')
              const groupIdx = Number(indexes[0])

              if (index === groupIdx) {
                if (group.tabs.length === 1) return
                if (position === 'universe') return
              }

              const tabIdx = Number(indexes[1])
              const tab = reader.removeTab(tabIdx, groupIdx)
              if (tab) tabs.push(tab)
            } else {
              const id = text
              const tabParam =
                Object.values(pages).find((p) => p.displayName === id) ??
                (await db?.books.get(id))
              if (tabParam) tabs.push(tabParam)
            }
          }

          if (tabs.length) {
            switch (position) {
              case 'left':
                reader.addGroup(tabs, index)
                break
              case 'right':
                reader.addGroup(tabs, index + 1)
                break
              default:
                tabs.forEach((t) => reader.addTab(t, index))
            }
          }
        }}
      >
        {group.tabs.map((tab, i) => (
          <PaneContainer active={i === selectedIndex} key={tab.id}>
            {tab instanceof BookTab ? (
              <BookPane tab={tab} onMouseDown={handleMouseDown} />
            ) : (
              <tab.Component />
            )}
          </PaneContainer>
        ))}
      </DropZone>
    </div>
  )
}

interface PaneContainerProps {
  active: boolean
}
const PaneContainer: React.FC<PaneContainerProps> = ({ active, children }) => {
  return <div className={clsx('h-full', active || 'hidden')}>{children}</div>
}

interface BookPaneProps {
  tab: BookTab
  onMouseDown: () => void
}

function BookPane({ tab }: BookPaneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prevSize = useRef(0)
  const typography = useTypography(tab)
  const { dark } = useColorScheme()
  const [background] = useBackground()

  const { iframe, rendition, rendered } = useSnapshot(tab)

  useTilg()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver(([e]) => {
      const size = e?.contentRect.width ?? 0
      // `display: hidden` will lead `rect` to 0
      if (size !== 0 && prevSize.current !== 0) {
        reader.resize()
      }
      prevSize.current = size
    })

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [])

  useSync(tab)

  const mobile = useMobile()

  const applyCustomStyle = useCallback(() => {
    const contents = rendition?.getContents()[0]
    updateCustomStyle(contents, typography)
  }, [rendition, typography])

  useEffect(() => {
    tab.onRender = applyCustomStyle
  }, [applyCustomStyle, tab])

  useEffect(() => {
    if (ref.current) tab.render(ref.current)
  }, [tab])

  useEffect(() => {
    /**
     * when `spread` changes, we should call `spread()` to re-layout,
     * then call {@link updateCustomStyle} to update custom style
     * according to the latest layout
     */
    rendition?.spread(typography.spread ?? RenditionSpread.Auto)
  }, [typography.spread, rendition])

  useEffect(() => applyCustomStyle(), [applyCustomStyle])

  useEffect(() => {
    if (dark === undefined) return
    // set `!important` when in dark mode
    rendition?.themes.override('color', dark ? '#FFFFFF' : '#000000', dark)
  }, [rendition, dark])

  const [src, setSrc] = useState<string>()

  useEffect(() => {
    if (src) {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement?.blur()
    }
  }, [src])

  useEventListener(iframe, 'keydown', handleKeyDown(tab))

  useDisablePinchZooming(iframe)

  return (
    <div className={clsx('flex h-full flex-col', mobile && 'py-[3vw]')}>
      <PhotoSlider
        images={[{ src, key: 0 }]}
        visible={!!src}
        onClose={() => setSrc(undefined)}
        maskOpacity={0.6}
        bannerVisible={false}
      />
      <div
        ref={ref}
        className={clsx('relative flex-1', isTouchScreen || 'h-0')}
        // `color-scheme: dark` will make iframe background white
        style={{ colorScheme: 'auto' }}
      >
        <div
          className={clsx(
            'absolute inset-0',
            // do not cover `sash`
            'z-20',
            rendered && 'hidden',
            background,
          )}
        />
      </div>
    </div>
  )
}
