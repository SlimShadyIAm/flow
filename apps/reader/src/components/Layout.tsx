import clsx from 'clsx'
import { ComponentProps, useEffect, useState } from 'react'
import { useMemo } from 'react'
import { IconType } from 'react-icons'
import { RiHome6Line, RiSettings5Line } from 'react-icons/ri'

import {
  Env,
  useAction,
  useColorScheme,
  useMobile,
  useSetAction,
  useTranslation,
} from '../hooks'
import {
  useColorSchemeColors,
  useBgColors,
  useTextColors,
} from '../hooks/useColors'
import { useLogger } from '../hooks/useLogger'
import { reader, useReaderSnapshot } from '../models'
import { useResetTypography } from '../state'
import { activeClass } from '../styles'

import { useSplitViewItem } from './base'
import { Settings } from './pages'
import { TypographyView } from './viewlets/TypographyView'

export const Layout: React.FC = ({ children }) => {
  const [ready, setReady] = useState(false)
  const setAction = useSetAction()
  const mobile = useMobile()
  const r = useReaderSnapshot()
  const readMode = r.focusedTab?.isBook

  useEffect(() => {
    if (mobile === undefined) return
    setAction(mobile ? undefined : 'toc')
    setReady(true)
  }, [mobile, setAction])

  return (
    <div className="flex h-full flex-col transition-colors">
      <TitleBar />
      <div id="layout" className="flex select-none flex-row">
        {ready && readMode && <SideBar />}
        {ready && <Reader>{children}</Reader>}
      </div>
    </div>
  )
}

export default function TitleBar() {
  const r = useReaderSnapshot()
  const readMode = r.focusedTab?.isBook
  const bookTitle = r.focusedBookTab?.book.metadata.title
  const bookAuthor = r.focusedBookTab?.book.metadata.creator
  const textColors = useTextColors()
  const bgColors = useBgColors()
  const { convertToCSV } = useLogger()

  const bgBorder = useColorSchemeColors({
    sepia: 'border-b-black',
    dark: 'border-b-slate-200',
    light: 'border-b-black',
  })

  const hiddenTextColors = useColorSchemeColors({
    sepia: 'text-background-sepia hover:text-text-sepia',
    dark: 'text-background-dark hover:text-text-dark',
    light: 'text-background-light hover:text-text-light',
  })

  if (!readMode) return null
  return (
    <div
      className={clsx(
        'flex w-full items-center justify-between border-b-[1px] p-3 text-center',
        bgBorder,
        bgColors,
      )}
    >
      <p className={clsx('flex-grow text-center', textColors)}>
        {bookTitle} - {bookAuthor}
      </p>
      <button
        className={clsx('shrink-0', hiddenTextColors)}
        onClick={convertToCSV}
      >
        Export CSV
      </button>
    </div>
  )
}

interface IAction {
  name: string
  title: string
  Icon: IconType
  env: number
}

const ActivityBar: React.FC = () => {
  useSplitViewItem(ActivityBar, {
    preferredSize: 48,
    minSize: 48,
    maxSize: 48,
  })
  return (
    <div className="ActivityBar flex flex-col justify-between">
      <PageActionBar env={Env.Desktop} />
    </div>
  )
}

interface EnvActionBarProps extends ComponentProps<'div'> {
  env: Env
}

function PageActionBar({ env }: EnvActionBarProps) {
  const mobile = useMobile()
  const [action, setAction] = useState('Home')
  const t = useTranslation()

  interface IPageAction extends IAction {
    Component?: React.FC
    disabled?: boolean
  }

  const pageActions: IPageAction[] = useMemo(
    () => [
      {
        name: 'home',
        title: 'home',
        Icon: RiHome6Line,
        env: Env.Mobile,
      },
      {
        name: 'settings',
        title: 'settings',
        Icon: RiSettings5Line,
        Component: Settings,
        env: Env.Desktop | Env.Mobile,
      },
    ],
    [],
  )

  return (
    <ActionBar>
      {pageActions
        .filter((a) => a.env & env)
        .map(({ name, title, Icon, Component, disabled }, i) => (
          <Action
            title={t(`${title}.title`)}
            Icon={Icon}
            active={mobile ? action === name : undefined}
            disabled={disabled}
            onClick={() => {
              Component ? reader.addTab(Component) : reader.clear()
              setAction(name)
            }}
            key={i}
          />
        ))}
    </ActionBar>
  )
}

interface ActionBarProps extends ComponentProps<'ul'> {}
function ActionBar({ className, ...props }: ActionBarProps) {
  return (
    <ul className={clsx('ActionBar flex sm:flex-col', className)} {...props} />
  )
}

interface ActionProps extends ComponentProps<'button'> {
  Icon: IconType
  active?: boolean
}
const Action: React.FC<ActionProps> = ({
  className,
  Icon,
  active,
  ...props
}) => {
  const mobile = useMobile()
  return (
    <button
      className={clsx(
        'Action relative flex h-12 w-12 flex-1 items-center justify-center sm:flex-initial',
        active ? 'text-on-surface-variant' : 'text-outline/70',
        props.disabled ? 'text-on-disabled' : 'hover:text-on-surface-variant ',
        className,
      )}
      {...props}
    >
      {active &&
        (mobile || (
          <div
            className={clsx('absolute', 'inset-y-0 left-0 w-0.5', activeClass)}
          />
        ))}
      <Icon size={28} />
    </button>
  )
}

const SideBar: React.FC = () => {
  const [action] = useAction()
  const mobile = useMobile()
  const bgColors = useBgColors()
  const t = useTranslation('settings')
  const resetTypography = useResetTypography()
  const { setScheme } = useColorScheme()

  const { size } = useSplitViewItem(SideBar, {
    preferredSize: 420,
    minSize: 420,
    visible: !!action,
  })

  return (
    <>
      <div
        className={clsx(
          'SideBar face flex flex-col justify-between p-6 pb-6 transition',
          !action && '!hidden',
          mobile ? 'absolute inset-y-0 right-0 z-10' : '',
          bgColors,
        )}
        style={{ width: mobile ? '75%' : size }}
      >
        <TypographyView />
        <div>
          <button
            className="rounded-lg border-4 border-red-400 py-2 px-4 text-xl text-red-400 hover:bg-red-400/20"
            onClick={() => {
              resetTypography()
              setScheme('light')
            }}
          >
            {t('cache.clear')}
          </button>
        </div>
      </div>
    </>
  )
}

interface ReaderProps extends ComponentProps<'div'> {}
const Reader: React.FC = ({ className, ...props }: ReaderProps) => {
  useSplitViewItem(Reader)

  const r = useReaderSnapshot()
  const readMode = r.focusedTab?.isBook

  return (
    <div
      className={clsx(
        'Reader flex-1 overflow-hidden transition',
        readMode || 'mb-12 px-4 sm:mb-0',
      )}
      {...props}
    />
  )
}
