import axios from 'axios'
import { ReactNode, createContext, useContext, useMemo } from 'react'

axios.defaults.baseURL = process.env.NEXT_PUBLIC_LOG_API_URL

interface Log {
  timestamp: Date
  event: string
  agent: 'SYSTEM' | 'USER'
  participantId?: number
  oldValue?: string
  newValue?: string
}

interface UserLog {
  event: string
  participantId: number
  oldValue?: string
  newValue?: string
}

interface SystemLog {
  event: string
  participantId: number
  oldValue?: string
  newValue?: string
}

type LoggerContextProps = {
  addUserLog: (log: UserLog) => void
  addSystemLog: (log: SystemLog) => void
}

const initialContext: LoggerContextProps = {
  addUserLog: () => {},
  addSystemLog: () => {},
}

export const LoggerContext = createContext(initialContext)
LoggerContext.displayName = 'LoggerContext'

interface Props {
  children: ReactNode
}

export const useLogger = () => {
  const context = useContext(LoggerContext)
  return context
}

const LoggerProvider = ({ children }: Props) => {
  const addLog = async (log: Log) => {
    try {
      await axios.post('/capture-screenshot/', log)
    } catch (error) {
      console.log(error)
    }
  }

  const loggerContextValue: LoggerContextProps = useMemo(
    () => ({
      addUserLog: (log: UserLog) => {
        addLog({
          ...log,
          agent: 'USER',
          timestamp: new Date(),
        })
      },
      addSystemLog: (log: SystemLog) => {
        addLog({
          ...log,
          agent: 'SYSTEM',
          timestamp: new Date(),
        })
      },
    }),
    [addLog],
  )

  return (
    <LoggerContext.Provider value={loggerContextValue}>
      {children}
    </LoggerContext.Provider>
  )
}

export default LoggerProvider
