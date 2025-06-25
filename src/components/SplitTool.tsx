import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PDFDocument } from 'pdf-lib'
import { Scissors, Download } from 'phosphor-react'
import FileUpload from './FileUpload'
import ProgressBar from './ProgressBar'
import { useAppContext } from '../context/AppContext'
import { downloadBlob, estimateProcessingTime } from '../utils/fileUtils'

const SplitTool: React.FC = () => {
  const { t } = useTranslation()
  const { createJob, updateJobProgress, completeJob, errorJob } = useAppContext()
  const [file, setFile] = useState<File | null>(null)
  const [splitMode, setSplitMode] = useState<'pages' | 'ranges'>('pages')
  const [pageInterval, setPageInterval] = useState(1)
  const [pageRanges, setPageRanges] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const handleFileSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0]
      setFile(selectedFile)
      
      // Get page count
      try {
        const arrayBuffer = await selectedFile.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        setTotalPages(pdf.getPageCount())
      } catch (error) {
        console.error('Error loading PDF:', error)
      }
    }
  }, [])

  const splitPDF = async () => {
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
    const newJobId = createJob('split', [fileItem])
    // const estimatedTime = estimateProcessingTime(file.size, 'split')

    try {
      const arrayBuffer = await file.arrayBuffer()
      const sourcePdf = await PDFDocument.load(arrayBuffer)
      const pageCount = sourcePdf.getPageCount()

      let splitRanges: number[][] = []

      if (splitMode === 'pages') {
        // Split every N pages
        for (let i = 0; i < pageCount; i += pageInterval) {
          const endPage = Math.min(i + pageInterval - 1, pageCount - 1)
          splitRanges.push([i, endPage])
        }
      } else {
        // Parse custom ranges (e.g., "1-3,5,7-9")
        const ranges = pageRanges.split(',').map(range => range.trim())
        for (const range of ranges) {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(n => parseInt(n.trim()) - 1)
            if (!isNaN(start) && !isNaN(end) && start >= 0 && end < pageCount) {
              splitRanges.push([start, end])
            }
          } else {
            const pageNum = parseInt(range) - 1
            if (!isNaN(pageNum) && pageNum >= 0 && pageNum < pageCount) {
              splitRanges.push([pageNum, pageNum])
            }
          }
        }
      }

      // Create split PDFs
      for (let i = 0; i < splitRanges.length; i++) {
        const [startPage, endPage] = splitRanges[i]
        const newPdf = await PDFDocument.create()
        
        const pageIndices = []
        for (let j = startPage; j <= endPage; j++) {
          pageIndices.push(j)
        }
        
        const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices)
        copiedPages.forEach(page => newPdf.addPage(page))
        
        const pdfBytes = await newPdf.save()
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        
        const filename = `${file.name.replace('.pdf', '')}_part_${i + 1}.pdf`
        downloadBlob(blob, filename)

        const currentProgress = ((i + 1) / splitRanges.length) * 100
        setProgress(currentProgress)
        updateJobProgress(newJobId, currentProgress)

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      completeJob(newJobId)
      setProgress(100)

    } catch (error) {
      console.error('Error splitting PDF:', error)
      errorJob(newJobId)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="split-tool">
      <div className="hero is-light">
        <div className="hero-body">
          <div className="container has-text-centered">
            <div className="icon is-large has-text-primary mb-4">
              <Scissors size={64} />
            </div>
            <h1 className="title is-2">{t('tools.split.title')}</h1>
            <p className="subtitle is-4">{t('tools.split.description')}</p>
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
                    <label className="label">Split Mode</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select 
                          value={splitMode} 
                          onChange={(e) => setSplitMode(e.target.value as 'pages' | 'ranges')}
                        >
                          <option value="pages">Split every N pages</option>
                          <option value="ranges">Custom page ranges</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {splitMode === 'pages' ? (
                    <div className="field">
                      <label className="label">Pages per file</label>
                      <div className="control">
                        <input 
                          className="input" 
                          type="number" 
                          min="1"
                          max={totalPages || 1}
                          value={pageInterval}
                          onChange={(e) => setPageInterval(parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <p className="help">
                        Each file will contain {pageInterval} page{pageInterval !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ) : (
                    <div className="field">
                      <label className="label">Page ranges</label>
                      <div className="control">
                        <input 
                          className="input" 
                          type="text" 
                          placeholder="e.g., 1-3, 5, 7-9"
                          value={pageRanges}
                          onChange={(e) => setPageRanges(e.target.value)}
                        />
                      </div>
                      <p className="help">
                        Enter page ranges separated by commas. Use hyphens for ranges.
                      </p>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="field">
                      <ProgressBar 
                        progress={progress}
                        status="processing"
                        estimatedTime={estimateProcessingTime(file?.size || 0, 'split')}
                      />
                    </div>
                  )}

                  <div className="field">
                    <div className="control">
                      <button 
                        className={`button is-primary is-fullwidth ${isProcessing ? 'is-loading' : ''}`}
                        disabled={!file || isProcessing}
                        onClick={splitPDF}
                      >
                        <span className="icon">
                          <Download size={20} />
                        </span>
                        <span>Split & Download</span>
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

export default SplitTool
