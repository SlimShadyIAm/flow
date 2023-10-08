import clsx from 'clsx'
import {
  ComponentProps,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useColorScheme, useTranslation } from '@flow/reader/hooks'
import { reader, useReaderSnapshot } from '@flow/reader/models'
import { defaultSettings, TypographyConfiguration } from '@flow/reader/state'

import { useHighlightTextColors } from '../../hooks/useColors'
import { Label } from '../Form'

export const TypographyView = () => {
  const { setScheme } = useColorScheme()
  const t_typography = useTranslation('typography')

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
    <div className="flex flex-col gap-4 p-4">
      <SettingsFieldNumber
        property="fontSize"
        name={t_typography('font_size')}
        iconDown={<div>hey</div>}
        iconUp={<div>up</div>}
        min={14}
        max={28}
        step={4}
        onChange={(v) => {
          setTypography('fontSize', v ? v + 'px' : undefined)
        }}
      />
      <SettingsFieldNumber
        property="fontWeight"
        name={t_typography('font_weight')}
        iconDown={<div>hey</div>}
        iconUp={<div>up</div>}
        min={400}
        max={700}
        step={300}
        onChange={(v) => {
          setTypography('fontWeight', v || undefined)
        }}
      />
      <SettingsFieldSelection
        name={t_typography('margin_size')}
        property="marginSize"
        options={[
          {
            icon: <div>small</div>,
            onClick: () => setTypography('marginSize', 'small'),
            value: 'small',
            property: 'marginSize',
          },
          {
            icon: <div>large</div>,
            onClick: () => setTypography('marginSize', 'large'),
            value: 'large',
            property: 'marginSize',
          },
        ]}
      />
      <div>
        <Label name="Theme"></Label>
        <div className="flex gap-2">
          {/*
          <Background
            className={'bg-white'}
            onClick={() => {
              setScheme('light')
            }}
          />
          */}
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
  min: number
  max: number
  step: number
  onChange: (v?: number) => void
}

const SettingsFieldNumber = ({
  property,
  name,
  step,
  min,
  max,
  iconDown: IconDown,
  iconUp: IconUp,
  onChange,
}: SettingsFieldNumberProps) => {
  const highlightColor = useHighlightTextColors()
  const { focusedBookTab } = useReaderSnapshot()
  const [value, setValue] = useState<number>(
    parseInt(
      (focusedBookTab?.book.configuration?.typography ?? defaultSettings)[
        property
      ] as string,
    ),
  )
  const minDisabled = value - step < min
  const maxDisabled = value + step > max

  const stepUp = () => {
    if (!maxDisabled) {
      setValue((value) => value + step)
    }
  }

  const stepDown = () => {
    if (!minDisabled) {
      setValue((value) => value - step)
    }
  }

  useEffect(() => {
    onChange(value)
  }, [value])

  return (
    <div className="flex">
      <div className="flex-[0.40]">
        <h2 className="text-lg font-semibold">{name}</h2>
        <h3 className={clsx('text-md font-semibold ', highlightColor)}>
          {value}
        </h3>
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
  const [value, setValue] = useState<string>(
    (focusedBookTab?.book.configuration?.typography ?? defaultSettings)[
      property
    ] as string,
  )

  return (
    <div className="flex">
      <div className="flex-[0.40]">
        <h2 className="text-lg font-semibold">{name}</h2>
      </div>
      <div className="flex flex-[0.60] flex-row justify-end gap-8">
        {options.map((option) => (
          <SettingsButtonToggle
            key={option.property}
            icon={option.icon}
            onClick={() => {
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
  return (
    <button
      className={clsx(
        'ring-border-dark flex h-[56px] w-[56px] items-center justify-center rounded-sm ring-4 transition-colors',
        !disabled && 'hover:bg-border-dark/20',
        disabled && 'ring-border-dark/30',
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
  return (
    <button
      className={clsx(
        'ring-border-dark flex h-[56px] w-[56px] items-center justify-center rounded-sm ring-4 transition-colors',
        // !disabled && 'hover:bg-border-dark/20',
        selected && 'bg-border-dark/30',
      )}
      onClick={onClick}
    >
      {icon}
    </button>
  )
}
