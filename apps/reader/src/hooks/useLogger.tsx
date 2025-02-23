import axios from 'axios'
import { ReactNode, createContext, useContext, useMemo, useState } from 'react'

import { MarginSize } from '../state'

import { ColorScheme } from './theme'

axios.defaults.baseURL = process.env.NEXT_PUBLIC_LOG_API_URL

interface Log {
  timestamp: number
  event: string
  agent: 'SYSTEM' | 'USER'
  participantId?: number
  oldValue?: string
  newValue?: string
}

interface UserLog {
  event: string
  oldValue?: string
  newValue?: string
}

interface SystemLog {
  event: string
  oldValue?: string
  newValue?: string
}

export interface Treatment {
  name: string
  options: {
    fontSize: string
    fontWeight: number
    marginSize: MarginSize
    colorScheme: ColorScheme
  }
}

type LoggerContextProps = {
  participantId: number
  setParticipantId: (id: number) => void
  experimentStarted: boolean
  setExperimentStarted: (started: boolean) => void
  selectedTreatment: Treatment | null
  setSelectedTreatment: (treatment: Treatment) => void
  addUserLog: (log: UserLog) => void
  addSystemLog: (log: SystemLog) => void
}

const initialContext: LoggerContextProps = {
  participantId: 0,
  selectedTreatment: null,
  experimentStarted: false,
  setExperimentStarted: () => {},
  setSelectedTreatment: () => {},
  setParticipantId: () => {},
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
  const [participantId, setParticipantId] = useState<number>(-1)
  const [experimentStarted, setExperimentStarted] = useState<boolean>(false)
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(
    null,
  )

  const addLog = async (log: Log) => {
    try {
      await axios.post('/capture-screenshot/', log)
    } catch (error) {
      console.log(error)
    }
  }

  const loggerContextValue: LoggerContextProps = useMemo(
    () => ({
      participantId,
      setParticipantId: (id: number) => {
        setParticipantId(id)
      },
      experimentStarted,
      setExperimentStarted: (started: boolean) => {
        setExperimentStarted(started)
      },
      addUserLog: (log: UserLog) => {
        addLog({
          ...log,
          agent: 'USER',
          timestamp: Date.now(),
          participantId,
        })
      },
      addSystemLog: (log: SystemLog) => {
        addLog({
          ...log,
          agent: 'SYSTEM',
          timestamp: Date.now(),
          participantId,
        })
      },
      selectedTreatment,
      setSelectedTreatment: (treatment: Treatment) => {
        setSelectedTreatment(treatment)
      },
    }),
    [addLog, participantId, selectedTreatment, experimentStarted],
  )

  return (
    <LoggerContext.Provider value={loggerContextValue}>
      {children}
    </LoggerContext.Provider>
  )
}

export default LoggerProvider
