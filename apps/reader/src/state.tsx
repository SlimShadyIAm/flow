import { IS_SERVER } from '@literal-ui/hooks'
import { useCallback } from 'react'
import { atom, AtomEffect, useRecoilState } from 'recoil'

import { RenditionSpread } from '@flow/epubjs/types/rendition'

import { reader } from './models'

function localStorageEffect<T>(key: string, defaultValue: T): AtomEffect<T> {
  return ({ setSelf, onSet }) => {
    if (IS_SERVER) return

    const savedValue = localStorage.getItem(key)
    if (savedValue === null) {
      localStorage.setItem(key, JSON.stringify(defaultValue))
    } else {
      setSelf(JSON.parse(savedValue))
    }

    onSet((newValue, _, isReset) => {
      isReset
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, JSON.stringify(newValue))
    })
  }
}

export const navbarState = atom<boolean>({
  key: 'navbar',
  default: false,
})

export interface Settings extends TypographyConfiguration {
  theme?: ThemeConfiguration
}

export interface TypographyConfiguration {
  fontSize?: string // string because it needs the 'px' at the end
  fontWeight?: number
  fontFamily?: string
  lineHeight?: number
  spread?: RenditionSpread
  zoom?: number
  marginSize?: 'small' | 'large'
  letterSpacing?: string // string because it needs the 'px' at the end
}

interface ThemeConfiguration {
  source?: string
  background?: number
}

export const defaultSettings: Settings = {
  spread: RenditionSpread.None,
  fontFamily: 'Noto Serif',
  marginSize: 'small',
  fontSize: '18',
  fontWeight: 400,
  letterSpacing: '0',
  lineHeight: 1.5,
}

export const useSetTypography = () => {
  const setTypography = useCallback(
    <K extends keyof TypographyConfiguration>(
      k: K,
      v: TypographyConfiguration[K],
    ) => {
      reader.focusedBookTab?.updateBook({
        configuration: {
          ...reader.focusedBookTab.book.configuration,
          typography: {
            ...reader.focusedBookTab.book.configuration?.typography,
            [k]: v,
          },
        },
      })
    },
    [],
  )
  return setTypography
}

export const useResetTypography = () => {
  const resetTypography = useCallback(() => {
    reader.focusedBookTab?.updateBook({
      configuration: {
        ...reader.focusedBookTab.book.configuration,
        typography: {
          ...defaultSettings,
        },
      },
    })
  }, [])

  return resetTypography
}

const settingsState = atom<Settings>({
  key: 'settings',
  default: defaultSettings,
  // effects: [localStorageEffect('settings', defaultSettings)],
})

export function useSettings() {
  return useRecoilState(settingsState)
}
