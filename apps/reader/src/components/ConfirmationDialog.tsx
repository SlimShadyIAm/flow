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
import { reader } from '../models'

interface ConfirmationDialogContextType {
  isOpen: boolean
  openDialog: () => void
  closeDialog: () => void
}

const ConfirmationDialogContext = createContext<
  ConfirmationDialogContextType | undefined
>(undefined)

export const ConfirmationDialogProvider: React.FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  console.log(isOpen)

  const openDialog = () => {
    setIsOpen(true)
  }

  const closeDialog = () => {
    setIsOpen(false)
  }

  return (
    <ConfirmationDialogContext.Provider
      value={{ isOpen, openDialog, closeDialog }}
    >
      {children}
    </ConfirmationDialogContext.Provider>
  )
}

export const useConfirmationDialog = () => {
  const dialogContext = useContext(ConfirmationDialogContext)

  if (!dialogContext) {
    throw new Error(
      'useDialog must be used within a ConfirmationDialogProvider',
    )
  }

  return dialogContext
}

const ConfirmationDialog: React.FC = () => {
  const { isOpen, closeDialog } = useConfirmationDialog()
  const bgColors = useBgColors()
  const t = useTranslation()

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

  const closeDialogAndEnd = () => {
    reader.removeGroup(0)
    closeDialog()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={clsx('w-[650px] rounded-lg p-8 shadow-xl', bgColors)}>
        <h2 className="mb-2 text-2xl font-bold">End experiment?</h2>
        <p className="mb-4 text-lg">
          Are you sure you want to end the experiment? You will not be able to
          continue reading this book.
        </p>
        <div className="flex justify-between">
          <button
            className="rounded-lg border-4 dark:border-slate-400 border-slate-600 py-1 px-4 text-xl dark:text-slate-300 text-slate-700 hover:bg-slate-600/20 dark:hover:bg-slate-400/20"
            onClick={() => {
              closeDialog()
            }}
          >
            {t('action.cancel')}
          </button>
          <button
            className="rounded-lg border-4 border-red-500 py-1 px-4 text-xl text-red-500 hover:bg-red-500/20"
            onClick={() => {
              closeDialogAndEnd()
            }}
          >
            {t('action.end')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog
