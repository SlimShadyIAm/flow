import clsx from 'clsx'
import { ReactNode, useCallback, useEffect, useState } from 'react'

import { ColorScheme, useColorScheme, useTranslation } from '@flow/reader/hooks'
import { useLogger } from '@flow/reader/hooks/useLogger'
import { reader, useReaderSnapshot } from '@flow/reader/models'
import { defaultSettings, TypographyConfiguration } from '@flow/reader/state'

import {
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
  MarginDecrease,
  MarginIncrease,
} from '../Icons'

export const TypographyView = () => {
  const t_typography = useTranslation('typography')
  const iconColors = useIconColors()

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

  return (
    <div className="flex flex-col gap-8 p-4">
      <SettingsFieldNumber
        property="fontSize"
        name={t_typography('font_size')}
        iconDown={<FontSizeDecrease className={iconColors} />}
        iconUp={<FontSizeIncrease className={iconColors} />}
        options={[12, 14, 18]}
        onChange={(v) => {
          setTypography('fontSize', v ? v + 'px' : undefined)
        }}
      />
      <SettingsFieldNumber
        property="fontWeight"
        name={t_typography('font_weight')}
        iconDown={<FontWeightDecrease className={iconColors} />}
        iconUp={<FontWeightIncrease className={iconColors} />}
        options={[400, 600, 700]}
        onChange={(v) => {
          setTypography('fontWeight', v || undefined)
        }}
      />
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
      participantId: 1,
    })
  }

  const stepUp = () => {
    const nextValue = options[options.indexOf(value) + 1]
    if (!maxDisabled && nextValue) {
      handleLog(nextValue)
      setValue(nextValue)
    }
  }

  const stepDown = () => {
    const prevValue = options[options.indexOf(value) - 1]
    if (!minDisabled && prevValue) {
      handleLog(prevValue)
      setValue(prevValue)
    }
  }

  useEffect(() => {
    onChange(value)
  }, [value])

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
  value: string | number
  name: string
}) => {
  const highlightColor = useHighlightTextColors()
  const string = value.toString()

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
      participantId: 1,
    })
  }

  return (
    <div className="flex">
      <div className="flex-[0.40]">
        {/* // TODO: fix capitalization */}
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
      participantId: 1,
    })
  }

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
