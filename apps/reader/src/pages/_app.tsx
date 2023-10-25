import './styles.css'
import 'react-photo-view/dist/react-photo-view.css'

import { LiteralProvider } from '@literal-ui/core'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { RecoilRoot } from 'recoil'

import { Layout, Theme } from '../components'
import { DialogProvider } from '../components/Dialog'
import Dialog from '../components/Dialog'
import LoggerProvider from '../hooks/useLogger'

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  if (router.pathname === '/success') return <Component {...pageProps} />

  return (
    <LiteralProvider>
      <RecoilRoot>
        <Theme />
        <DialogProvider>
          <LoggerProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
            <Dialog />
          </LoggerProvider>
        </DialogProvider>
      </RecoilRoot>
    </LiteralProvider>
  )
}
