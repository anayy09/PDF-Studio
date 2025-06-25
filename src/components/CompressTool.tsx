import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Archive, Download } from 'phosphor-react'
import FileUpload from './FileUpload'
import ProgressBar from './ProgressBar'
import { useAppContext } from '../context/AppContext'
import { downloadBlob, estimateProcessingTime, formatFileSize } from '../utils/fileUtils'

const CompressTool: React.FC = () => {
  const { t } = useTranslation()
  const { createJob, updateJobProgress, completeJob, errorJob } = useAppContext()
  const [file, setFile] = useState<File | null>(null)
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
    }
  }, [])

  const compressPDF = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)

    const fileItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      status: 'pending' as const
    }
    const newJobId = createJob('compress', [fileItem])

    try {
      // Simulate compression API call
      const formData = new FormData()
      formData.append('file', file)
      formData.append('level', compressionLevel)

      // For demo purposes, we'll simulate compression
      // In a real app, this would call your backend API
      
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        updateJobProgress(newJobId, i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Simulate compressed file (in reality, this would come from the server)
      const blob = new Blob([await file.arrayBuffer()], { type: 'application/pdf' })
      
      completeJob(newJobId, blob)
      setProgress(100)
      
      const filename = file.name.replace('.pdf', '_compressed.pdf')
      downloadBlob(blob, filename)

    } catch (error) {
      console.error('Error compressing PDF:', error)
      errorJob(newJobId)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="compress-tool">
      <div className="hero is-light">
        <div className="hero-body">
          <div className="container has-text-centered">
            <div className="icon is-large has-text-primary mb-4">
              <Archive size={64} />
            </div>
            <h1 className="title is-2">{t('tools.compress.title')}</h1>
            <p className="subtitle is-4">{t('tools.compress.description')}</p>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="columns">
            <div className="column is-8">
              <div className="card">
                <div className="card-header">
                  <p className="card-header-title">
                    {t('common.upload')} PDF File
                  </p>
                </div>
                <div className="card-content">
                  <FileUpload 
                    onFilesSelected={handleFileSelected}
                    maxFiles={1}
                  />
                  {file && (
                    <div className="notification is-info mt-4">
                      <p><strong>{file.name}</strong></p>
                      <p>Current size: {formatFileSize(file.size)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="column is-4">
              <div className="card">
                <div className="card-header">
                  <p className="card-header-title">{t('common.configure')}</p>
                </div>
                <div className="card-content">
                  <div className="field">
                    <label className="label">Compression Level</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select 
                          value={compressionLevel} 
                          onChange={(e) => setCompressionLevel(e.target.value as 'low' | 'medium' | 'high')}
                        >
                          <option value="low">Low (Better quality)</option>
                          <option value="medium">Medium (Balanced)</option>
                          <option value="high">High (Smaller file)</option>
                        </select>
                      </div>
                    </div>
                    <p className="help">
                      Higher compression reduces file size but may affect quality
                    </p>
                  </div>

                  {isProcessing && (
                    <div className="field">
                      <ProgressBar 
                        progress={progress}
                        status="processing"
                        estimatedTime={estimateProcessingTime(file?.size || 0, 'compress')}
                      />
                    </div>
                  )}

                  <div className="field">
                    <div className="control">
                      <button 
                        className={`button is-primary is-fullwidth ${isProcessing ? 'is-loading' : ''}`}
                        disabled={!file || isProcessing}
                        onClick={compressPDF}
                      >
                        <span className="icon">
                          <Download size={20} />
                        </span>
                        <span>Compress & Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompressTool
