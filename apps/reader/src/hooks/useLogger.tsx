import { ReactNode, createContext, useContext, useMemo, useState } from 'react'

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
  logs: Log[]
  addUserLog: (log: UserLog) => void
  addSystemLog: (log: SystemLog) => void
  convertToCSV: () => void
}

const initialContext: LoggerContextProps = {
  logs: [],
  addUserLog: () => {},
  addSystemLog: () => {},
  convertToCSV: () => {},
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
  const [logs, setLogs] = useState<Log[]>([])

  const addLog = (log: Log) => {
    setLogs((prevLogs) => [...prevLogs, log])
  }

  const convertToCSV = () => {
    const header = [
      'Time',
      'Agent',
      'Event',
      'Participant ID',
      'Old Value',
      'New Value',
    ]
    const rows = logs.map((log) => [
      log.timestamp,
      log.agent,
      log.event,
      log.participantId,
      log.oldValue,
      log.newValue,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      header.join(',') +
      '\n' +
      rows.map((row) => row.join(',')).join('\n')

    // Create a download link for the CSV file
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'click_logs.csv')
    document.body.appendChild(link)
    link.click()
  }

  const loggerContextValue: LoggerContextProps = useMemo(
    () => ({
      logs,
      addUserLog: (log: UserLog) => {
        addLog({
          ...log,
          agent: 'USER',
          timestamp: new Date(),
        })
      },
      convertToCSV,
      addSystemLog: (log: SystemLog) => {
        addLog({
          ...log,
          agent: 'SYSTEM',
          timestamp: new Date(),
        })
      },
    }),
    [logs, addLog, convertToCSV],
  )

  return (
    <LoggerContext.Provider value={loggerContextValue}>
      {children}
    </LoggerContext.Provider>
  )
}

export default LoggerProvider
