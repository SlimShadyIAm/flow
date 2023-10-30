import clsx from 'clsx'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

import { ColorScheme, useColorScheme, useTranslation } from '@flow/reader/hooks'
import { useLogger } from '@flow/reader/hooks/useLogger'
import { useReaderSnapshot } from '@flow/reader/models'
import {
  defaultSettings,
  TypographyConfiguration,
  useSetTypography,
} from '@flow/reader/state'

import {
  useBgColors,
  useFontSelectedColors,
  useHighlightTextColors,
  useIconColors,
  useSettingsButtonColors,
  useSettingsButtonDisabledColors,
} from '../../hooks/useColors'
import {
  FontSizeDecrease,
  FontSizeIncrease,
  FontWeightDecrease,
  FontWeightIncrease,
  GenericDecrease,
  GenericIncrease,
  MarginDecrease,
  MarginIncrease,
} from '../Icons'
import { cn } from '../lib/utils'

export const TypographyView = () => {
  const t_typography = useTranslation('typography')
  const iconColors = useIconColors()
  const setTypography = useSetTypography()
  const [fontMenuOpen, setFontMenuOpen] = useState(false)
  const { scheme } = useColorScheme()

  return (
    <div className="flex flex-col gap-8">
      <div
        className={clsx(
          'absolute h-full w-full transition-colors',
          fontMenuOpen && scheme === 'dark' && 'bg-black/50',
          fontMenuOpen && scheme !== 'dark' && 'bg-black/40',
          !fontMenuOpen && 'bg-black/0',
        )}
        hidden={!fontMenuOpen}
      />
      {/* 
      <FontSelection setFontMenuOpen={setFontMenuOpen} />
      */}
      <SettingsFieldNumber
        property="fontSize"
        name={t_typography('font_size')}
        iconDown={<FontSizeDecrease className={iconColors} />}
        iconUp={<FontSizeIncrease className={iconColors} />}
        options={[14, 18, 24]}
        onChange={(v) => {
          setTypography('fontSize', v ? v + 'px' : undefined)
        }}
      />
      <SettingsFieldNumber
        property="fontWeight"
        name={t_typography('font_weight')}
        iconDown={<FontWeightDecrease className={iconColors} />}
        iconUp={<FontWeightIncrease className={iconColors} />}
        options={[100, 400, 800]}
        onChange={(v) => {
          setTypography('fontWeight', v || undefined)
        }}
      />
      {/*
      <SettingsFieldNumber
        property="letterSpacing"
        name={t_typography("letter_spacing")}
        iconDown={<GenericDecrease className={iconColors} />}
        iconUp={<GenericIncrease className={iconColors} />}
        options={[0, 1, 2, 3, 4]}
        onChange={(v) => {
          setTypography('letterSpacing', v ? v + 'px' : undefined)
        }}
      />
      <SettingsFieldNumber
        property="lineHeight"
        name={t_typography("line_height")}
        iconDown={<GenericDecrease className={iconColors} />}
        iconUp={<GenericIncrease className={iconColors} />}
        options={[1.2, 1.5, 1.8, 2.0]}
        onChange={(v) => {
          setTypography('lineHeight', v || undefined)
        }}
      />
      */}
      <SettingsFieldSelection
        name={t_typography('margin_size')}
        property="marginSize"
        options={[
          {
            icon: <MarginDecrease />,
            onClick: () => setTypography('marginSize', 'small'),
            value: 'small',
            property: 'marginSize',
          },
          {
            icon: <MarginIncrease />,
            onClick: () => setTypography('marginSize', 'large'),
            value: 'large',
            property: 'marginSize',
          },
        ]}
      />
      <div>
        <div className="flex gap-2">
          <ThemeButtons />
        </div>
      </div>
    </div>
  )
}

interface SettingsFieldNumberProps {
  property: keyof TypographyConfiguration
  name: string
  iconDown: ReactNode
  iconUp: ReactNode
  options: number[]
  onChange: (v?: number) => void
}

const SettingsFieldNumber = ({
  property,
  name,
  options,
  iconDown: IconDown,
  iconUp: IconUp,
  onChange,
}: SettingsFieldNumberProps) => {
  const { focusedBookTab } = useReaderSnapshot()
  const { addUserLog } = useLogger()
  const [value, setValue] = useState<number>(
    parseInt(
      (focusedBookTab?.book.configuration?.typography ?? defaultSettings)[
        property
      ] as string,
    ),
  )
  // disable if value is the first item in options array
  const minDisabled = options.indexOf(value) === 0
  const maxDisabled = options.indexOf(value) === options.length - 1

  const handleLog = (newValue: number) => {
    addUserLog({
      event: 'SET_TYPOGRAPHY_' + property.toUpperCase(),
      oldValue: value.toString(),
      newValue: newValue.toString(),
    })
  }

  const stepUp = () => {
    const nextValue = options[options.indexOf(value) + 1]
    if (!maxDisabled && nextValue) {
      handleLog(nextValue)
      setValue(nextValue)
      onChange(nextValue)
    }
  }

  const stepDown = () => {
    const prevValue = options[options.indexOf(value) - 1]
    if (!minDisabled && prevValue !== undefined) {
      handleLog(prevValue)
      setValue(prevValue)
      onChange(prevValue)
    }
  }

  useEffect(() => {
    if (
      !focusedBookTab?.book.configuration?.typography ||
      !focusedBookTab?.book.configuration?.typography[property]
    )
      return
    if (focusedBookTab?.book.configuration?.typography[property] !== value) {
      setValue(
        parseInt(
          focusedBookTab?.book.configuration?.typography[property] as string,
        ),
      )
    }
  }, [value, property, focusedBookTab?.book.configuration?.typography])

  return (
    <div className="flex">
      <div className="flex-[0.40]">
        <SettingsFieldInfo name={name} value={value} />
      </div>
      <div className="flex flex-[0.60] flex-row justify-end gap-8">
        <SettingsButton
          disabled={minDisabled}
          icon={IconDown}
          onClick={stepDown}
        />
        <SettingsButton disabled={maxDisabled} icon={IconUp} onClick={stepUp} />
      </div>
    </div>
  )
}

const SettingsFieldInfo = ({
  name,
  value,
}: {
  value: string | number | undefined
  name: string
}) => {
  const highlightColor = useHighlightTextColors()
  const string = value?.toString() ?? ''

  return (
    <>
      <h2 className="text-lg font-semibold">{name}</h2>
      <h3 className={clsx('text-md font-semibold ', highlightColor)}>
        {string.charAt(0).toUpperCase() + string.slice(1)}
      </h3>
    </>
  )
}

interface SettingsFieldSelectionProps {
  name: string
  options: {
    icon: ReactNode
    onClick: () => void
    value: string
    property: string
  }[]
  property: keyof TypographyConfiguration
}

const SettingsFieldSelection = ({
  name,
  options,
  property,
}: SettingsFieldSelectionProps) => {
  const { focusedBookTab } = useReaderSnapshot()
  const { addUserLog } = useLogger()
  const [value, setValue] = useState<string>(
    (focusedBookTab?.book.configuration?.typography ?? defaultSettings)[
      property
    ] as string,
  )

  const handleLog = (newValue: string) => {
    addUserLog({
      event: 'SET_TYPOGRAPHY_' + property.toUpperCase(),
      oldValue: value,
      newValue: newValue,
    })
  }

  useEffect(() => {
    if (
      !focusedBookTab?.book.configuration?.typography ||
      !focusedBookTab?.book.configuration?.typography[property]
    )
      return
    if (focusedBookTab?.book.configuration?.typography[property] !== value) {
      setValue(
        focusedBookTab?.book.configuration?.typography[property] as string,
      )
    }
  }, [value, property, focusedBookTab?.book.configuration?.typography])

  return (
    <div className="flex">
      <div className="flex-[0.40]">
        <SettingsFieldInfo name={name} value={value} />
      </div>
      <div className="flex flex-[0.60] flex-row justify-end gap-8">
        {options.map((option) => (
          <SettingsButtonToggle
            key={option.property}
            icon={option.icon}
            onClick={() => {
              handleLog(option.value)
              setValue(option.value)
              option.onClick()
            }}
            selected={value === option.value}
          />
        ))}
      </div>
    </div>
  )
}

interface SettingsButtonProps {
  icon: ReactNode
  onClick: () => void
  disabled: boolean
}

const SettingsButton = ({ icon, onClick, disabled }: SettingsButtonProps) => {
  const settingsButtonColors = useSettingsButtonColors()
  const settingsButtonDisabledColors = useSettingsButtonDisabledColors()

  return (
    <button
      className={clsx(
        'flex h-[56px] w-[56px] items-center justify-center rounded-sm ring-4 transition-colors',
        !disabled && settingsButtonColors,
        disabled && settingsButtonDisabledColors,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
    </button>
  )
}

interface SettingsButtonToggleProps {
  icon: ReactNode
  onClick: () => void
  selected: boolean
}

const SettingsButtonToggle = ({
  icon,
  onClick,
  selected,
}: SettingsButtonToggleProps) => {
  const { scheme } = useColorScheme()
  return (
    <button
      className={clsx(
        'ring-border-' +
          scheme +
          ' flex h-[56px] w-[56px] items-center justify-center rounded-sm ring-4 transition-colors',
        // !disabled && 'hover:bg-border-dark/20',
        // selected && 'bg-border-dark/30',
        selected && scheme === 'dark' && 'bg-border-dark/30',
        selected && scheme === 'light' && 'bg-border-light/30',
        selected && scheme === 'sepia' && 'bg-border-sepia/30',
      )}
      onClick={onClick}
    >
      {icon}
    </button>
  )
}

const ThemeButtons = () => {
  const { addUserLog } = useLogger()
  const { setScheme, scheme } = useColorScheme()

  const handleLog = (newValue: ColorScheme) => {
    addUserLog({
      event: 'SET_THEME',
      oldValue: scheme,
      newValue: newValue,
    })
  }

  useEffect(() => {
    if (scheme !== 'light' && scheme !== 'sepia' && scheme !== 'dark') {
      setScheme('light')
    }
  }, [scheme, setScheme])

  return (
    <>
      <div className="flex-[0.40]">
        {/* // TODO: fix capitalization */}
        <SettingsFieldInfo name="Theme" value={scheme} />
      </div>
      <div className="flex flex-[0.60] flex-row justify-end gap-8">
        {['light', 'sepia', 'dark'].map((value) => (
          <button
            key={value}
            className={clsx(
              'ring-border-' +
                value +
                ' bg-background-' +
                value +
                ' text-text-' +
                value +
                ' h-[56px] w-[56px] rounded-sm text-[28px] ring-4',
              scheme === value && 'bg-border-' + value + '/30',
            )}
            onClick={() => {
              handleLog(value as ColorScheme)
              setScheme(value as ColorScheme)
            }}
          >
            A
          </button>
        ))}
      </div>
    </>
  )
}

interface FontSelectionProps {
  setOverlayOpen: (value: boolean) => void
}

const FontSelection = ({ setOverlayOpen: setOverlayOpen }: FontSelectionProps) => {
  const settingsButtonColors = useSettingsButtonColors()
  const highlightColors = useHighlightTextColors()
  const bgColors = useBgColors()

  const { focusedBookTab } = useReaderSnapshot()
  const setTypography = useSetTypography()
  const { addUserLog } = useLogger()
  const [value, setValue] = useState<string>(
    (focusedBookTab?.book.configuration?.typography?.fontFamily ??
      defaultSettings.fontFamily) as string,
  )

  const handleLog = (newValue: string) => {
    addUserLog({
      event: 'SET_TYPOGRAPHY_FONTFAMILY',
      oldValue: value,
      newValue: newValue,
    })
  }

  const onChange = (value: string) => {
    setTypography('fontFamily', value)
    setValue(value)
    handleLog(value)
  }


  return (
    <div className="flex flex-row">
      <div className="flex-[0.40]">
        <SettingsFieldInfo name="Font" value={''} />
      </div>
      <div className="flex flex-[0.60] flex-row justify-end gap-8">
        <Select
          value={value}
          onValueChange={(e) => onChange(e)}
          onOpenChange={setOverlayOpen}
        >
          <SelectTrigger
            style={{ fontFamily: value }}
            className={cn(
              'z-50 h-12 w-full rounded-lg border-4 text-lg font-medium',
              settingsButtonColors,
              highlightColors,
            )}
          >
            <SelectValue placeholder="Font Family" />
          </SelectTrigger>
          <SelectContent className={cn('rounded-xl border-0', bgColors)}>
            <FontSelectionOption value="Noto Serif" />
            <FontSelectionOption value="Times New Roman" />
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

interface FontSelectionOptionProps {
  value: string
}

const FontSelectionOption = ({ value }: FontSelectionOptionProps) => {
  const selectedFontColors = useFontSelectedColors()

  return (
    <SelectItem
      className={cn(
        'text-lg focus:rounded-md focus:bg-red-900 focus:font-medium focus:ring-4 ',
        selectedFontColors,
      )}
      style={{ fontFamily: value }}
      value={value}
    >
      {value}
    </SelectItem>
  )
}
