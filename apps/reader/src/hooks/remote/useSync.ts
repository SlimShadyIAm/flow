import { useCallback, useEffect } from 'react'
import { useSnapshot } from 'valtio'

import { BookRecord } from '@flow/reader/db'
import { BookTab } from '@flow/reader/models'
import { uploadData } from '@flow/reader/sync'

import { useRemoteBooks } from './useRemote'

export function useSync(tab: BookTab) {
  const { mutate } = useRemoteBooks()
  const { location, book } = useSnapshot(tab)

  const id = tab.book.id

  const sync = useCallback(
    async (changes: Partial<BookRecord>) => {
      // to remove effect dependency `remoteBooks`
      mutate(
        (remoteBooks) => {
          if (remoteBooks) {
            const i = remoteBooks.findIndex((b) => b.id === id)
            if (i < 0) return remoteBooks

            remoteBooks[i] = {
              ...remoteBooks[i]!,
              ...changes,
            }

            uploadData(remoteBooks)

            return [...remoteBooks]
          }
        },
        { revalidate: false },
      )
    },
    [id, mutate],
  )

  // UNCOMMENT if you want to store book progress in browser cache
  // useEffect(() => {
  //   sync({
  //     cfi: location?.start.cfi,
  //     percentage: book.percentage,
  //   })
  // }, [sync, book.percentage, location?.start.cfi])

  useEffect(() => {
    sync({
      definitions: book.definitions as string[],
    })
  }, [book.definitions, sync])


  // useEffect(() => {
  //   sync({
  //     configuration: book.configuration,
  //   })
  // }, [book.configuration, sync])
}
