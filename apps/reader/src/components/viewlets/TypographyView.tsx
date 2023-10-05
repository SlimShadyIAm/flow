import clsx from 'clsx'
import { ComponentProps, useCallback, useRef, useState } from 'react'
import { MdAdd, MdRemove } from 'react-icons/md'

import { range } from '@flow/internal'
import {
  useBackground,
  useColorScheme,
  useSourceColor,
  useTranslation,
} from '@flow/reader/hooks'
import { reader, useReaderSnapshot } from '@flow/reader/models'
import {
  defaultSettings,
  TypographyConfiguration,
  useSettings,
} from '@flow/reader/state'
import { keys } from '@flow/reader/utils'

import { ColorPicker, Label, Select, TextField, TextFieldProps } from '../Form'
import { PaneViewProps, PaneView } from '../base'

enum TypographyScope {
  Book,
  Global,
}

const typefaces = ['default', 'sans-serif', 'serif', 'Georgia']

export const TypographyView: React.FC<PaneViewProps> = (props) => {
  const { focusedBookTab } = useReaderSnapshot()
  const { setScheme } = useColorScheme()
  const [, setBackground] = useBackground()
  const t_theme = useTranslation('theme')
  const t_typography = useTranslation('typography')

  const { fontFamily, fontSize, fontWeight, lineHeight } =
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
      <Select
        name={t_typography('font_family')}
        value={fontFamily}
        onChange={(e) => {
          setTypography('fontFamily', e.target.value)
        }}
      >
        {typefaces.map((t) => (
          <option key={t} value={t} style={{ fontFamily: t }}>
            {t}
          </option>
        ))}
      </Select>
      <NumberField
        name={t_typography('font_size')}
        min={14}
        max={28}
        defaultValue={fontSize && parseInt(fontSize)}
        onChange={(v) => {
          setTypography('fontSize', v ? v + 'px' : undefined)
        }}
      />
      <NumberField
        name={t_typography('font_weight')}
        min={100}
        max={900}
        step={100}
        defaultValue={fontWeight}
        onChange={(v) => {
          setTypography('fontWeight', v || undefined)
        }}
      />
      <NumberField
        name={t_typography('line_height')}
        min={1}
        step={0.1}
        defaultValue={lineHeight}
        onChange={(v) => {
          setTypography('lineHeight', v || undefined)
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
