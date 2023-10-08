import { useColorScheme } from "."

export const useColorSchemeColors = ({
  sepia,
  dark,
  light,
}: {
  sepia: string
  dark: string
  light: string
}) => {
  const { scheme } = useColorScheme()
  return scheme === 'dark' ? dark : scheme === 'sepia' ? sepia : light
}


export const useTextColors = () => {
  return useColorSchemeColors({
    sepia: 'text-text-sepia',
    dark: 'text-text-dark',
    light: 'text-text-light',
  })
}

export const useBgColors = () => {
  return useColorSchemeColors({
    sepia: 'bg-background-sepia',
    dark: 'bg-background-dark',
    light: 'bg-background-light',
  })
}
