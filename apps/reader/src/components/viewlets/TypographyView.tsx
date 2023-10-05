import clsx from 'clsx'
import { ComponentProps, useCallback, useRef } from 'react'
import { MdAdd, MdRemove } from 'react-icons/md'

import { range } from '@flow/internal'
import {
  useBackground,
  useColorScheme,
  useTranslation,
} from '@flow/reader/hooks'
import { reader, useReaderSnapshot } from '@flow/reader/models'
import { defaultSettings, TypographyConfiguration } from '@flow/reader/state'

import { Label, TextField, TextFieldProps } from '../Form'
import { PaneViewProps } from '../base'

export const TypographyView: React.FC<PaneViewProps> = () => {
  const { focusedBookTab } = useReaderSnapshot()
  const { setScheme } = useColorScheme()
  const [, setBackground] = useBackground()
  const t_theme = useTranslation('theme')
  const t_typography = useTranslation('typography')

  const { fontSize, fontWeight } =
    focusedBookTab?.book.configuration?.typography ?? defaultSettings

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
    <div className="flex flex-col gap-2 p-4">
      <button onClick={() => setTypography('marginSize', 'small')}>small</button>
      <button onClick={() => setTypography('marginSize', 'large')}>large</button>
      <NumberField
        name={t_typography('font_size')}
        min={14}
        max={28}
        step={4}
        defaultValue={fontSize && parseInt(fontSize)}
        onChange={(v) => {
          setTypography('fontSize', v ? v + 'px' : undefined)
        }}
      />
      <NumberField
        name={t_typography('font_weight')}
        min={400}
        max={700}
        step={300}
        defaultValue={fontWeight}
        onChange={(v) => {
          setTypography('fontWeight', v || undefined)
        }}
      />
      <div>
        <Label name={t_theme('background_color')}></Label>
        <div className="flex gap-2">
          {range(7)
            .filter((i) => !(i % 2))
            .map((i) => i - 1)
            .map((i) => (
              <Background
                key={i}
                className={i > 0 ? `bg-surface${i}` : 'bg-white'}
                onClick={() => {
                  setScheme('light')
                  setBackground(i)
                }}
              />
            ))}
          <Background
            className="bg-black"
            onClick={() => {
              setScheme('dark')
            }}
          />
        </div>
      </div>
    </div>
  )
}

interface NumberFieldProps extends Omit<TextFieldProps<'input'>, 'onChange'> {
  onChange: (v?: number) => void
}
const NumberField: React.FC<NumberFieldProps> = ({ onChange, ...props }) => {
  const ref = useRef<HTMLInputElement>(null)
  const t = useTranslation('action')

  return (
    <TextField
      as="input"
      type="number"
      placeholder="default"
      actions={[
        {
          title: t('step_down'),
          Icon: MdRemove,
          onClick: () => {
            if (!ref.current) return
            ref.current.stepDown()
            onChange(Number(ref.current.value))
          },
        },
        {
          title: t('step_up'),
          Icon: MdAdd,
          onClick: () => {
            if (!ref.current) return
            ref.current.stepUp()
            onChange(Number(ref.current.value))
          },
        },
      ]}
      mRef={ref}
      // lazy render
      onBlur={(e) => {
        onChange(Number(e.target.value))
      }}
      onClear={() => {
        if (ref.current) ref.current.value = ''
        onChange(undefined)
      }}
      {...props}
    />
  )
}

interface BackgroundProps extends ComponentProps<'div'> {}
const Background: React.FC<BackgroundProps> = ({ className, ...props }) => {
  return (
    <div
      className={clsx('border-outline-variant light h-6 w-6 border', className)}
      {...props}
    ></div>
  )
}
