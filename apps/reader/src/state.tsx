import { useCallback } from 'react'
import { atom, useRecoilState } from 'recoil'

import { RenditionSpread } from '@flow/epubjs/types/rendition'

import { useLogger } from './hooks/useLogger'
import { reader } from './models'
import { useColorScheme } from './hooks'

export const navbarState = atom<boolean>({
  key: 'navbar',
  default: false,
})

export interface Settings extends TypographyConfiguration {
  theme?: ThemeConfiguration
}

export type MarginSize = 'small' | 'large'

export interface TypographyConfiguration {
  fontSize?: string // string because it needs the 'px' at the end
  fontWeight?: number
  fontFamily?: string
  lineHeight?: number
  spread?: RenditionSpread
  zoom?: number
  marginSize?: MarginSize
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
  const [, setSettings] = useSettings()
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
      setSettings((prev) => ({
        ...prev,
        [k]: v,
      }))
    },
    [setSettings],
  )
  return setTypography
}

export const useResetTypography = () => {
  const { selectedTreatment } = useLogger()
  const { setScheme } = useColorScheme()
  const [, setSettings] = useSettings()

  const resetTypography = useCallback(() => {
    reader.focusedBookTab?.updateBook({
      configuration: {
        ...reader.focusedBookTab.book.configuration,
        typography: {
          ...selectedTreatment?.options,
        },
      },
    })
    setSettings(() => ({
      ...defaultSettings,
      ...selectedTreatment?.options,
    }))
    console.log("?")
    setScheme(selectedTreatment?.options.colorScheme || 'dark')
  }, [selectedTreatment, setScheme, setSettings])

  return resetTypography
}

export const useResetTypographyBeforeBook = () => {
  const [settings] = useSettings()

  const resetTypography = useCallback(() => {
    reader.focusedBookTab?.updateBook({
      configuration: {
        ...reader.focusedBookTab.book.configuration,
        typography: {
          ...settings
        },
      },
    })
  }, [settings])

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
