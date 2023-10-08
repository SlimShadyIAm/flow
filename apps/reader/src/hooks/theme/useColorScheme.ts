import { useMediaQuery } from '@literal-ui/hooks'
import { useEffect } from 'react'
import useLocalStorageState from 'use-local-storage-state'

export type ColorScheme = 'light' | 'dark' | 'sepia'

export function useColorScheme() {
  const [scheme, setScheme] = useLocalStorageState<ColorScheme>(
    'literal-color-scheme',
    { defaultValue: 'dark' },
  )

  const dark = scheme === 'dark' 

  useEffect(() => {
    if (dark !== undefined) {
      document.documentElement.classList.toggle('dark', dark)
    }
  }, [dark])

  return { scheme, dark, setScheme }
}
