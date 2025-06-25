import React, { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PencilSimple, TextT, Palette, Eraser, FloppyDisk } from 'phosphor-react'
import FileUpload from './FileUpload'
import ProgressBar from './ProgressBar'
import { useAppContext } from '../context/AppContext'
import { downloadBlob, estimateProcessingTime } from '../utils/fileUtils'

const EditTool: React.FC = () => {
  const { t } = useTranslation()
  const { createJob, updateJobProgress, completeJob, errorJob } = useAppContext()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedTool, setSelectedTool] = useState<'text' | 'draw' | 'highlight'>('text')
  const [isEditing, setIsEditing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      loadPDFToCanvas(files[0])
    }
  }, [])

  const loadPDFToCanvas = async (pdfFile: File) => {
    setIsEditing(true)
    // In a real implementation, you'd render the PDF pages to canvas
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Simulate PDF page rendering
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#000000'
        ctx.font = '16px Arial'
        ctx.fillText(`PDF Content: ${pdfFile.name}`, 50, 50)
        ctx.fillText('Click to add text, draw, or highlight', 50, 100)
        ctx.fillText('(Demo - Real implementation would render PDF pages)', 50, 150)
      }
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ctx = canvas.getContext('2d')

    if (ctx) {
      switch (selectedTool) {
        case 'text':
          ctx.fillStyle = '#000000'
          ctx.font = '14px Arial'
          ctx.fillText('New Text', x, y)
          break
        case 'draw':
          ctx.strokeStyle = '#ff0000'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(x, y, 10, 0, 2 * Math.PI)
          ctx.stroke()
          break
        case 'highlight':
          ctx.fillStyle = 'rgba(255, 255, 0, 0.3)'
          ctx.fillRect(x - 25, y - 10, 50, 20)
          break
      }
    }
  }

  const saveEditedPDF = async () => {
    if (!file || !canvasRef.current) return

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
    const newJobId = createJob('edit', [fileItem])

    try {
      // Simulate saving process
      for (let i = 0; i <= 90; i += 15) {
        setProgress(i)
        updateJobProgress(newJobId, i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Convert canvas to blob and combine with original PDF
      const canvas = canvasRef.current
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      console.log('Canvas edits captured:', imageData.length, 'bytes')
      
      // In reality, you'd overlay the canvas changes onto the original PDF
      const originalArrayBuffer = await file.arrayBuffer()
      const blob = new Blob([originalArrayBuffer], { type: 'application/pdf' })
      
      setProgress(100)
      updateJobProgress(newJobId, 100)
      completeJob(newJobId, blob)
      
      const filename = file.name.replace('.pdf', '_edited.pdf')
      downloadBlob(blob, filename)

    } catch (error) {
      console.error('Error editing PDF:', error)
      errorJob(newJobId)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="edit-tool">
      <div className="hero is-light">
        <div className="hero-body">
          <div className="container has-text-centered">
            <div className="icon is-large has-text-primary mb-4">
              <PencilSimple size={64} />
            </div>
            <h1 className="title is-2">{t('tools.edit.title')}</h1>
            <p className="subtitle is-4">{t('tools.edit.description')}</p>
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
                  
                  {file && isEditing && (
                    <div className="mt-4">
                      <div className="field is-grouped mb-4">
                        <div className="control">
                          <button 
                            className={`button ${selectedTool === 'text' ? 'is-primary' : 'is-light'}`}
                            onClick={() => setSelectedTool('text')}
                          >
                            <span className="icon"><TextT size={16} /></span>
                            <span>Text</span>
                          </button>
                        </div>
                        <div className="control">
                          <button 
                            className={`button ${selectedTool === 'draw' ? 'is-primary' : 'is-light'}`}
                            onClick={() => setSelectedTool('draw')}
                          >
                            <span className="icon"><Palette size={16} /></span>
                            <span>Draw</span>
                          </button>
                        </div>
                        <div className="control">
                          <button 
                            className={`button ${selectedTool === 'highlight' ? 'is-primary' : 'is-light'}`}
                            onClick={() => setSelectedTool('highlight')}
                          >
                            <span className="icon"><Eraser size={16} /></span>
                            <span>Highlight</span>
                          </button>
                        </div>
                      </div>
                      
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={800}
                        className="box"
                        style={{ border: '1px solid #ddd', cursor: 'crosshair' }}
                        onClick={handleCanvasClick}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="column is-4">
              <div className="card">
                <div className="card-header">
                  <p className="card-header-title">Edit Options</p>
                </div>
                <div className="card-content">
                  {!file ? (
                    <div className="content">
                      <h6>Features available:</h6>
                      <ul>
                        <li>Add text annotations</li>
                        <li>Draw on PDF pages</li>
                        <li>Highlight content</li>
                        <li>Interactive canvas editor</li>
                      </ul>
                    </div>
                  ) : (
                    <>
                      {isProcessing && (
                        <div className="field">
                          <ProgressBar 
                            progress={progress}
                            status="processing"
                            estimatedTime={estimateProcessingTime(file?.size || 0, 'edit')}
                          />
                        </div>
                      )}

                      <div className="field">
                        <div className="control">
                          <button 
                            className={`button is-primary is-fullwidth ${isProcessing ? 'is-loading' : ''}`}
                            disabled={!file || isProcessing || !isEditing}
                            onClick={saveEditedPDF}
                          >
                            <span className="icon">
                              <FloppyDisk size={20} />
                            </span>
                            <span>Save Edited PDF</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditTool
