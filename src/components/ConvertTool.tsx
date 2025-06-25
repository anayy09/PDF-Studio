import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Download } from 'phosphor-react'
import FileUpload from './FileUpload'
import ProgressBar from './ProgressBar'
import { useAppContext } from '../context/AppContext'
import { downloadBlob, estimateProcessingTime } from '../utils/fileUtils'

const ConvertTool: React.FC = () => {
  const { t } = useTranslation()
  const { createJob, updateJobProgress, completeJob, errorJob } = useAppContext()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
    }
  }, [])

  const convertToWord = async () => {
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
    const newJobId = createJob('convert', [fileItem])

    try {
      // Simulate conversion process
      for (let i = 0; i <= 100; i += 5) {
        setProgress(i)
        updateJobProgress(newJobId, i)
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Create a mock Word document (in reality, this would use a PDF-to-Word conversion library)
      const wordContent = `Converted from ${file.name}\n\nThis is a demo conversion. In a real implementation, this would contain the actual content from the PDF file with preserved formatting.`
      const blob = new Blob([wordContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      })
      
      completeJob(newJobId, blob)
      setProgress(100)
      
      const filename = file.name.replace('.pdf', '.docx')
      downloadBlob(blob, filename)

    } catch (error) {
      console.error('Error converting PDF:', error)
      errorJob(newJobId)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="convert-tool">
      <div className="hero is-light">
        <div className="hero-body">
          <div className="container has-text-centered">
            <div className="icon is-large has-text-primary mb-4">
              <FileText size={64} />
            </div>
            <h1 className="title is-2">{t('tools.convert.title')}</h1>
            <p className="subtitle is-4">{t('tools.convert.description')}</p>
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
                    <div className="notification is-warning mt-4">
                      <p><strong>Note:</strong> Scanned PDFs may not convert accurately. Best results with text-based PDFs.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="column is-4">
              <div className="card">
                <div className="card-header">
                  <p className="card-header-title">Conversion Options</p>
                </div>
                <div className="card-content">
                  <div className="field">
                    <label className="label">Output Format</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select>
                          <option value="docx">Microsoft Word (.docx)</option>
                        </select>
                      </div>
                    </div>
                    <p className="help">
                      More formats coming soon
                    </p>
                  </div>

                  {isProcessing && (
                    <div className="field">
                      <ProgressBar 
                        progress={progress}
                        status="processing"
                        estimatedTime={estimateProcessingTime(file?.size || 0, 'convert')}
                      />
                    </div>
                  )}

                  <div className="field">
                    <div className="control">
                      <button 
                        className={`button is-primary is-fullwidth ${isProcessing ? 'is-loading' : ''}`}
                        disabled={!file || isProcessing}
                        onClick={convertToWord}
                      >
                        <span className="icon">
                          <Download size={20} />
                        </span>
                        <span>Convert & Download</span>
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

export default ConvertTool
