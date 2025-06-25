import React, { createContext, useContext, useState, useCallback } from 'react'

interface FileItem {
  id: string
  name: string
  size: number
  type: string
  file: File
  progress?: number
  status: 'pending' | 'processing' | 'completed' | 'error'
}

interface JobQueue {
  id: string
  type: string
  files: FileItem[]
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  result?: Blob
}

interface AppContextType {
  files: FileItem[]
  jobs: JobQueue[]
  addFiles: (files: File[]) => void
  removeFile: (id: string) => void
  updateFileProgress: (id: string, progress: number) => void
  createJob: (type: string, files: FileItem[]) => string
  updateJobProgress: (jobId: string, progress: number) => void
  completeJob: (jobId: string, result?: Blob) => void
  errorJob: (jobId: string) => void
  clearCompleted: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [jobs, setJobs] = useState<JobQueue[]>([])

  const addFiles = useCallback((newFiles: File[]) => {
    const fileItems: FileItem[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      status: 'pending'
    }))
    setFiles(prev => [...prev, ...fileItems])
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }, [])

  const updateFileProgress = useCallback((id: string, progress: number) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, progress } : file
    ))
  }, [])

  const createJob = useCallback((type: string, jobFiles: FileItem[]): string => {
    const jobId = Math.random().toString(36).substr(2, 9)
    const job: JobQueue = {
      id: jobId,
      type,
      files: jobFiles,
      status: 'pending',
      progress: 0
    }
    setJobs(prev => [...prev, job])
    return jobId
  }, [])

  const updateJobProgress = useCallback((jobId: string, progress: number) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, progress, status: 'processing' } : job
    ))
  }, [])

  const completeJob = useCallback((jobId: string, result?: Blob) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'completed', progress: 100, result } : job
    ))
  }, [])

  const errorJob = useCallback((jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'error' } : job
    ))
  }, [])

  const clearCompleted = useCallback(() => {
    setJobs(prev => prev.filter(job => job.status !== 'completed'))
    setFiles(prev => prev.filter(file => file.status !== 'completed'))
  }, [])

  return (
    <AppContext.Provider value={{
      files,
      jobs,
      addFiles,
      removeFile,
      updateFileProgress,
      createJob,
      updateJobProgress,
      completeJob,
      errorJob,
      clearCompleted
    }}>
      {children}
    </AppContext.Provider>
  )
}
