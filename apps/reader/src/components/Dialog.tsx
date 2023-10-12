import clsx from 'clsx'
import React, { createContext, useContext, useEffect, useState } from 'react'

import {
  useBgColors,
  useHighlightTextColors,
  useTextPresentationHighlightRing,
  useTextColors,
} from '../hooks/useColors'
import { useReaderSnapshot } from '../models'
import { defaultSettings, TypographyConfiguration } from '../state'

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

const useDialog = () => {
  const dialogContext = useContext(DialogContext)

  if (!dialogContext) {
    throw new Error('useDialog must be used within a DialogProvider')
  }

  return dialogContext
}

const Dialog: React.FC = () => {
  const { isOpen, closeDialog } = useDialog()
  const bgColors = useBgColors()
  const highlightTextColors = useHighlightTextColors()

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
      offset: 200,
    },
    {
      property: 'marginSize',
      change: 'increase',
      offset: 0,
    },
  ]

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
        <button
          className="rounded-lg bg-blue-500 px-4 py-2 text-white"
          onClick={closeDialog}
        >
          Close
        </button>
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

  const presentationStyleBefore = {
    fontSize: settings.fontSize + 'px',
    fontWeight: settings.fontWeight,
    fontFamily: settings.fontFamily,
    paddingLeft: settings.marginSize === 'small' ? '16px' : '48px',
    paddingRight: settings.marginSize === 'small' ? '16px' : '48px'
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
      presentationStyleAfter.paddingLeft = change.change === 'decrease' ? '16px' : '48px'
      presentationStyleAfter.paddingRight = change.change === 'decrease' ? '16px' : '48px'
    }
  }

  return (
    <div className="mb-4 flex flex-row justify-between">
      <div className="flex flex-col">
        <p className="text-lg font-semibold text-slate-400">Before</p>
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
  const ringColor = useTextPresentationHighlightRing()
  const textColors = useTextColors()

  return (
    <div
      className={clsx(
        'h-48 w-64 rounded-sm p-3 ring-2',
        textColors,
        after && ringColor,
        !after && 'ring-slate-400',
      )}
      style={className}
    >
      The quick brown fox jumped over the lazy sleeping dog.
    </div>
  )
}

export default Dialog
