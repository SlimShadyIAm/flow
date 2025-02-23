import clsx from 'clsx'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from '../hooks'

import {
  useBgColors,
  useHighlightTextColors,
  useTextPresentationHighlightRing,
  useTextColors,
  useSettingsButtonDisabledColors,
  useHighlightTextMuted,
} from '../hooks/useColors'
import { reader, useReaderSnapshot } from '../models'
import {
  defaultSettings,
  TypographyConfiguration,
  useSetTypography,
} from '../state'

interface DialogContextType {
  isOpen: boolean
  openDialog: () => void
  closeDialog: () => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export const DialogProvider: React.FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openDialog = () => {
    setIsOpen(true)
  }

  const closeDialog = () => {
    setIsOpen(false)
  }

  return (
    <DialogContext.Provider value={{ isOpen, openDialog, closeDialog }}>
      {children}
    </DialogContext.Provider>
  )
}

export const useDialog = () => {
  const dialogContext = useContext(DialogContext)

  if (!dialogContext) {
    throw new Error('useDialog must be used within a DialogProvider')
  }

  return dialogContext
}

const FontAdjustmentSuggestionDialog: React.FC = () => {
  const { isOpen, closeDialog } = useDialog()
  const bgColors = useBgColors()
  const highlightTextColors = useHighlightTextColors()
  const t = useTranslation()
  const setTypography = useSetTypography()
  const { focusedBookTab } = useReaderSnapshot()

  useEffect(() => {
    const rootElement = document.getElementById('root')
    rootElement?.classList.toggle('dialog-open', isOpen)

    return () => {
      rootElement?.classList.remove('dialog-open')
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const adjustments: TextAdjustment[] = [
    // {
    //   property: 'fontSize',
    //   change: 'increase',
    //   offset: 4,
    // },
    {
      property: 'fontWeight',
      change: 'increase',
      offset: 300,
    },
    {
      property: 'marginSize',
      change: 'increase',
      offset: 0,
    },
  ]

  const handleAdjustments = (adjustments: TextAdjustment[]) => {
    for (const adjustment of adjustments) {
      const offset =
        adjustment.change === 'increase'
          ? adjustment.offset
          : -1 * adjustment.offset
      if (adjustment.property === 'marginSize') {
        setTypography(
          adjustment.property,
          adjustment.change === 'increase' ? 'large' : 'small',
        )
      } else if (adjustment.property === 'fontWeight') {
        setTypography(
          adjustment.property,
          ((focusedBookTab?.book.configuration?.typography?.[adjustment.property] || 0) as number) +
          offset,
        )
      } else {
        setTypography(
          adjustment.property,
          ((focusedBookTab?.book.configuration?.typography?.[adjustment.property] || 0) as number) + offset +
             + 'px',
        )
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={clsx('w-[650px] rounded-lg p-8 shadow-xl', bgColors)}>
        <h2 className="mb-2 text-2xl font-bold">Adjust font?</h2>
        <p>It looks like you&apos;re having some difficulty reading.</p>
        <p>
          We think{' '}
          {adjustments.map((adjustment, index) => {
            let separator: string
            if (index + 2 === adjustments.length) {
              separator = ' and '
            } else if (index + 1 < adjustments.length) {
              separator = ', '
            } else {
              separator = ''
            }

            let property: string
            switch (adjustment.property) {
              case 'fontSize':
                property = 'font size'
                break
              case 'fontWeight':
                property = 'boldness'
                break
              case 'marginSize':
                property = 'margin size'
                break
              default:
                property = adjustment.property
            }

            return (
              <>
                <span
                  key={index}
                  className={clsx('font-bold', highlightTextColors)}
                >
                  {adjustment.change === 'increase'
                    ? 'increasing'
                    : 'decreasing'}{' '}
                  the {property}
                </span>
                {separator}
              </>
            )
          })}{' '}
          will improve the reading experience.
        </p>
        <PresentationChanges changes={adjustments} />
        <div className="flex justify-between">
          <button
            className="rounded-lg border-4 border-red-400 py-1 px-4 text-xl text-red-400 hover:bg-red-400/20"
            onClick={() => {
              closeDialog()
            }}
          >
            {t('action.dismiss')}
          </button>
          <button
            className="rounded-lg border-4 border-green-500 py-1 px-4 text-xl text-green-500 hover:bg-green-500/20"
            onClick={() => {
              handleAdjustments(adjustments)
              closeDialog()
            }}
          >
            {t('action.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}

interface PresentationChangesProps {
  changes: TextAdjustment[]
}

const PresentationChanges = ({ changes }: PresentationChangesProps) => {
  const highlightTextColors = useHighlightTextColors()
  const { focusedBookTab } = useReaderSnapshot()
  const settings =
    focusedBookTab?.book.configuration?.typography ?? defaultSettings

  const smallMargin = '16px'
  const largeMargin = '48px'

  const presentationStyleBefore = {
    fontSize: settings.fontSize + 'px',
    fontWeight: settings.fontWeight,
    fontFamily: settings.fontFamily,
    paddingLeft: settings.marginSize === 'small' ? smallMargin : largeMargin,
    paddingRight: settings.marginSize === 'small' ? smallMargin : largeMargin,
  }

  const presentationStyleAfter = { ...presentationStyleBefore }

  for (const change of changes) {
    const offset =
      change.change === 'increase' ? change.offset : -1 * change.offset
    if (change.property === 'fontSize') {
      presentationStyleAfter.fontSize =
        parseInt(settings.fontSize as string) + offset + 'px'
    } else if (change.property === 'fontWeight') {
      presentationStyleAfter.fontWeight =
        (settings.fontWeight as number) + offset
    } else if (change.property === 'marginSize') {
      presentationStyleAfter.paddingLeft =
        change.change === 'decrease' ? smallMargin : largeMargin
      presentationStyleAfter.paddingRight =
        change.change === 'decrease' ? smallMargin : largeMargin
    }
  }
  const highlightTextMuted = useHighlightTextMuted()

  return (
    <div className="mb-4 flex flex-row justify-between">
      <div className="flex flex-col">
        <p
          className={clsx(
            'text-lg font-semibold text-slate-400',
            highlightTextMuted,
          )}
        >
          Before
        </p>
        <TextPresentationPreview className={presentationStyleBefore} />
      </div>
      <div className="flex flex-col">
        <p className={clsx(highlightTextColors, 'text-lg font-semibold')}>
          After
        </p>
        <TextPresentationPreview after className={presentationStyleAfter} />
      </div>
    </div>
  )
}

interface TextAdjustment {
  property: keyof TypographyConfiguration
  change: 'increase' | 'decrease'
  offset: number
}

interface TextPresentationPreviewProps {
  after?: boolean
  className: React.CSSProperties
}

const TextPresentationPreview = ({
  after,
  className,
}: TextPresentationPreviewProps) => {
  const ringColorAfter = useTextPresentationHighlightRing()
  const ringColorBefore = useSettingsButtonDisabledColors()

  const textColors = useTextColors()

  return (
    <div
      className={clsx(
        'h-48 w-64 rounded-sm p-3 ring-2',
        textColors,
        after && ringColorAfter,
        !after && 'ring-slate-400',
        !after && ringColorBefore,
      )}
      style={className}
    >
      The quick brown fox jumped over the lazy sleeping dog.
    </div>
  )
}

export default FontAdjustmentSuggestionDialog
