import { IS_SERVER } from '@literal-ui/hooks'
import { atom, AtomEffect, useRecoilState } from 'recoil'

import { RenditionSpread } from '@flow/epubjs/types/rendition'

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
  fontSize?: string
  fontWeight?: number
  fontFamily?: string
  lineHeight?: number
  spread?: RenditionSpread
  zoom?: number
  marginSize?: 'small' | 'large'
}

interface ThemeConfiguration {
  source?: string
  background?: number
}

export const defaultSettings: Settings = {
  spread: RenditionSpread.None,
  fontFamily: 'Garamond',
  marginSize: 'small',
  fontSize: '14',
  fontWeight: 400,
}

const settingsState = atom<Settings>({
  key: 'settings',
  default: defaultSettings,
  effects: [localStorageEffect('settings', defaultSettings)],
})

export function useSettings() {
  return useRecoilState(settingsState)
}
