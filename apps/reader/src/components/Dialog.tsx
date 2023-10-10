import clsx from 'clsx'
import React, { createContext, useContext, useEffect, useState } from 'react'

import {
  useBgColors,
  useHighlightTextColors,
  useTextPresentationHighlightRing,
  useTextColors,
} from '../hooks/useColors'
import { useReaderSnapshot } from '../models'
import { defaultSettings } from '../state'

interface DialogContextType {
  isOpen: boolean
  openDialog: () => void
  closeDialog: () => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export const DialogProvider: React.FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true)

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={clsx('w-[650px] rounded-lg p-8 shadow-xl', bgColors)}>
        <h2 className="mb-2 text-2xl font-bold">Adjust font?</h2>
        <p>It looks like you&apos;re having some difficulty reading.</p>
        <p>
          We think{' '}
          <span className={clsx('font-semibold', highlightTextColors)}>
            increasing the font size
          </span>{' '}
          will improve the reading experience.
        </p>
        <div className="mb-4 flex flex-row justify-between">
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-slate-400">Before</p>
            <TextPresentationPreview />
          </div>
          <div className="flex flex-col">
            <p className={clsx(highlightTextColors, 'text-lg font-semibold')}>
              After
            </p>
            <TextPresentationPreview after />
          </div>
        </div>
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

interface TextPresentationPreviewProps {
  after?: boolean
}

const TextPresentationPreview = ({ after }: TextPresentationPreviewProps) => {
  const ringColor = useTextPresentationHighlightRing()
  const textColors = useTextColors()
  const { focusedBookTab } = useReaderSnapshot()
  const settings =
    focusedBookTab?.book.configuration?.typography ?? defaultSettings

  // export interface TypographyConfiguration {
  //   fontSize?: string
  //   fontWeight?: number
  //   fontFamily?: string
  //   lineHeight?: number
  //   spread?: RenditionSpread
  //   zoom?: number
  //   marginSize: 'small' | 'large'
  // }
  const presentationStyle = {
    fontSize: settings.fontSize + 'px',
    fontWeight: settings.fontWeight,
    fontFamily: settings.fontFamily,
  }

  return (
    <div
      className={clsx(
        'h-48 w-64 rounded-sm p-3 ring-2',
        textColors,
        after && ringColor,
        !after && 'ring-slate-400',
      )}
      style={presentationStyle}
    >
      The quick brown fox jumped over the lazy sleeping dog.
    </div>
  )
}

export default Dialog
