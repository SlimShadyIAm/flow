import './styles.css'
import 'react-photo-view/dist/react-photo-view.css'

import { LiteralProvider } from '@literal-ui/core'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { RecoilRoot } from 'recoil'

import { Layout, Theme } from '../components'
import ConfirmationDialog, { ConfirmationDialogProvider } from '../components/ConfirmationDialog'
import { DialogProvider } from '../components/FontAdjustmentSuggestionDialog'
import FontAdjustmentSuggestionDialog from '../components/FontAdjustmentSuggestionDialog'
import LoggerProvider from '../hooks/useLogger'

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  if (router.pathname === '/success') return <Component {...pageProps} />

  return (
    <LiteralProvider>
      <RecoilRoot>
        <Theme />
        <LoggerProvider>
          <DialogProvider>
            <ConfirmationDialogProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
              <FontAdjustmentSuggestionDialog />
              <ConfirmationDialog />
            </ConfirmationDialogProvider>
          </DialogProvider>
        </LoggerProvider>
      </RecoilRoot>
    </LiteralProvider>
  )
}
