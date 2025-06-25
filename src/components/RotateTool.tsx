import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PDFDocument, degrees } from 'pdf-lib'
import { ArrowClockwise, Download, ArrowCounterClockwise } from 'phosphor-react'
import FileUpload from './FileUpload'
import ProgressBar from './ProgressBar'
import { useAppContext } from '../context/AppContext'
import { downloadBlob, estimateProcessingTime } from '../utils/fileUtils'

const RotateTool: React.FC = () => {
  const { t } = useTranslation()
  const { createJob, updateJobProgress, completeJob, errorJob } = useAppContext()
  const [file, setFile] = useState<File | null>(null)
  const [rotationAngle, setRotationAngle] = useState(90)
  const [rotateAll, setRotateAll] = useState(true)
  const [pageRange, setPageRange] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const handleFileSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0]
      setFile(selectedFile)
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        setTotalPages(pdf.getPageCount())
      } catch (error) {
        console.error('Error loading PDF:', error)
      }
    }
  }, [])

  const rotatePDF = async () => {
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
    const newJobId = createJob('rotate', [fileItem])

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const pageCount = pdf.getPageCount()

      let pagesToRotate: number[] = []

      if (rotateAll) {
        pagesToRotate = Array.from({ length: pageCount }, (_, i) => i)
      } else {
        // Parse page range (e.g., "1-3,5,7-9")
        const ranges = pageRange.split(',').map(range => range.trim())
        for (const range of ranges) {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(n => parseInt(n.trim()) - 1)
            if (!isNaN(start) && !isNaN(end) && start >= 0 && end < pageCount) {
              for (let i = start; i <= end; i++) {
                pagesToRotate.push(i)
              }
            }
          } else {
            const pageNum = parseInt(range) - 1
            if (!isNaN(pageNum) && pageNum >= 0 && pageNum < pageCount) {
              pagesToRotate.push(pageNum)
            }
          }
        }
      }

      const pages = pdf.getPages()
      
      for (let i = 0; i < pagesToRotate.length; i++) {
        const pageIndex = pagesToRotate[i]
        if (pageIndex < pages.length) {
          pages[pageIndex].setRotation(degrees(rotationAngle))
        }

        const currentProgress = ((i + 1) / pagesToRotate.length) * 100
        setProgress(currentProgress)
        updateJobProgress(newJobId, currentProgress)

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      const pdfBytes = await pdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      
      completeJob(newJobId, blob)
      setProgress(100)
      
      const filename = file.name.replace('.pdf', '_rotated.pdf')
      downloadBlob(blob, filename)

    } catch (error) {
      console.error('Error rotating PDF:', error)
      errorJob(newJobId)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="rotate-tool">
      <div className="hero is-light">
        <div className="hero-body">
          <div className="container has-text-centered">
            <div className="icon is-large has-text-primary mb-4">
              <ArrowClockwise size={64} />
            </div>
            <h1 className="title is-2">{t('tools.rotate.title')}</h1>
            <p className="subtitle is-4">{t('tools.rotate.description')}</p>
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
                  {file && totalPages > 0 && (
                    <div className="notification is-info mt-4">
                      <p><strong>{file.name}</strong></p>
                      <p>Total pages: {totalPages}</p>
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
                    <label className="label">Rotation Angle</label>
                    <div className="control">
                      <div className="buttons has-addons is-centered">
                        <button 
                          className={`button ${rotationAngle === -90 ? 'is-primary' : ''}`}
                          onClick={() => setRotationAngle(-90)}
                        >
                          <span className="icon">
                            <ArrowCounterClockwise size={20} />
                          </span>
                          <span>90° Left</span>
                        </button>
                        <button 
                          className={`button ${rotationAngle === 90 ? 'is-primary' : ''}`}
                          onClick={() => setRotationAngle(90)}
                        >
                          <span className="icon">
                            <ArrowClockwise size={20} />
                          </span>
                          <span>90° Right</span>
                        </button>
                        <button 
                          className={`button ${rotationAngle === 180 ? 'is-primary' : ''}`}
                          onClick={() => setRotationAngle(180)}
                        >
                          <span>180°</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Pages to Rotate</label>
                    <div className="control">
                      <label className="radio">
                        <input 
                          type="radio" 
                          name="pageSelection" 
                          checked={rotateAll}
                          onChange={() => setRotateAll(true)}
                        />
                        All pages
                      </label>
                    </div>
                    <div className="control">
                      <label className="radio">
                        <input 
                          type="radio" 
                          name="pageSelection" 
                          checked={!rotateAll}
                          onChange={() => setRotateAll(false)}
                        />
                        Specific pages
                      </label>
                    </div>
                  </div>

                  {!rotateAll && (
                    <div className="field">
                      <label className="label">Page Range</label>
                      <div className="control">
                        <input 
                          className="input" 
                          type="text" 
                          placeholder="e.g., 1-3, 5, 7-9"
                          value={pageRange}
                          onChange={(e) => setPageRange(e.target.value)}
                        />
                      </div>
                      <p className="help">
                        Enter page numbers separated by commas. Use hyphens for ranges.
                      </p>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="field">
                      <ProgressBar 
                        progress={progress}
                        status="processing"
                        estimatedTime={estimateProcessingTime(file?.size || 0, 'rotate')}
                      />
                    </div>
                  )}

                  <div className="field">
                    <div className="control">
                      <button 
                        className={`button is-primary is-fullwidth ${isProcessing ? 'is-loading' : ''}`}
                        disabled={!file || isProcessing}
                        onClick={rotatePDF}
                      >
                        <span className="icon">
                          <Download size={20} />
                        </span>
                        <span>Rotate & Download</span>
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

export default RotateTool
