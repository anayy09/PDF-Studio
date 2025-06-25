import React, { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PenNib, FloppyDisk, Eraser } from 'phosphor-react'
import FileUpload from './FileUpload'
import ProgressBar from './ProgressBar'
import { useAppContext } from '../context/AppContext'
import { downloadBlob, estimateProcessingTime } from '../utils/fileUtils'
import { PDFDocument } from 'pdf-lib'

const SignTool: React.FC = () => {
  const { t } = useTranslation()
  const { createJob, updateJobProgress, completeJob, errorJob } = useAppContext()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw')
  const [typedSignature, setTypedSignature] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
    }
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = signatureCanvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
      }
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = signatureCanvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.stroke()
      }
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const renderTypedSignature = () => {
    const canvas = signatureCanvasRef.current
    if (canvas && typedSignature) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.font = '32px cursive'
        ctx.fillStyle = '#000000'
        ctx.textAlign = 'center'
        ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2)
      }
    }
  }

  const signPDF = async () => {
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
    const newJobId = createJob('sign', [fileItem])

    try {
      // Simulate signing process
      for (let i = 0; i <= 90; i += 15) {
        setProgress(i)
        updateJobProgress(newJobId, i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      const signatureCanvas = signatureCanvasRef.current
      if (!signatureCanvas) throw new Error('Signature not found')

      const signatureData = signatureCanvas.toDataURL('image/png')

      const originalArrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(originalArrayBuffer)
      const pngBytes = await fetch(signatureData).then(res => res.arrayBuffer())
      const pngImage = await pdfDoc.embedPng(pngBytes)
      const page = pdfDoc.getPage(0)
      const { width } = page.getSize()
      const sigWidth = 150
      const sigHeight = (pngImage.height / pngImage.width) * sigWidth
      page.drawImage(pngImage, { x: width - sigWidth - 50, y: 50, width: sigWidth, height: sigHeight })
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      
      setProgress(100)
      updateJobProgress(newJobId, 100)
      completeJob(newJobId, blob)
      
      const filename = file.name.replace('.pdf', '_signed.pdf')
      downloadBlob(blob, filename)

    } catch (error) {
      console.error('Error signing PDF:', error)
      errorJob(newJobId)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="sign-tool">
      <div className="hero is-light">
        <div className="hero-body">
          <div className="container has-text-centered">
            <div className="icon is-large has-text-primary mb-4">
              <PenNib size={64} />
            </div>
            <h1 className="title is-2">{t('tools.sign.title')}</h1>
            <p className="subtitle is-4">{t('tools.sign.description')}</p>
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
                </div>
              </div>

              {file && (
                <div className="card mt-4">
                  <div className="card-header">
                    <p className="card-header-title">Create Your Signature</p>
                  </div>
                  <div className="card-content">
                    <div className="tabs">
                      <ul>
                        <li className={signatureMode === 'draw' ? 'is-active' : ''}>
                          <a onClick={() => setSignatureMode('draw')}>Draw</a>
                        </li>
                        <li className={signatureMode === 'type' ? 'is-active' : ''}>
                          <a onClick={() => setSignatureMode('type')}>Type</a>
                        </li>
                      </ul>
                    </div>

                    {signatureMode === 'draw' ? (
                      <div>
                        <canvas
                          ref={signatureCanvasRef}
                          width={400}
                          height={150}
                          className="box"
                          style={{ border: '1px solid #ddd', cursor: 'crosshair' }}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                        />
                        <div className="field is-grouped mt-2">
                          <div className="control">
                            <button className="button is-light" onClick={clearSignature}>
                              <span className="icon"><Eraser size={16} /></span>
                              <span>Clear</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="field">
                          <div className="control">
                            <input 
                              className="input"
                              type="text"
                              placeholder="Type your signature"
                              value={typedSignature}
                              onChange={(e) => {
                                setTypedSignature(e.target.value)
                                setTimeout(renderTypedSignature, 10)
                              }}
                            />
                          </div>
                        </div>
                        <canvas
                          ref={signatureCanvasRef}
                          width={400}
                          height={150}
                          className="box"
                          style={{ border: '1px solid #ddd' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="column is-4">
              <div className="card">
                <div className="card-header">
                  <p className="card-header-title">Signature Options</p>
                </div>
                <div className="card-content">
                  {!file ? (
                    <div className="content">
                      <h6>Features available:</h6>
                      <ul>
                        <li>Draw signature with mouse</li>
                        <li>Type signature text</li>
                        <li>Multiple signature styles</li>
                        <li>Secure signing process</li>
                      </ul>
                    </div>
                  ) : (
                    <>
                      {isProcessing && (
                        <div className="field">
                          <ProgressBar 
                            progress={progress}
                            status="processing"
                            estimatedTime={estimateProcessingTime(file?.size || 0, 'sign')}
                          />
                        </div>
                      )}

                      <div className="field">
                        <div className="control">
                          <button 
                            className={`button is-primary is-fullwidth ${isProcessing ? 'is-loading' : ''}`}
                            disabled={!file || isProcessing}
                            onClick={signPDF}
                          >
                            <span className="icon">
                              <FloppyDisk size={20} />
                            </span>
                            <span>Sign & Download PDF</span>
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

export default SignTool
