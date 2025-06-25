import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PDFDocument } from 'pdf-lib'
import { CopySimple, Download, ArrowsDownUp } from 'phosphor-react'
import FileUpload from './FileUpload'
import ProgressBar from './ProgressBar'
import { useAppContext } from '../context/AppContext'
import { downloadBlob, estimateProcessingTime } from '../utils/fileUtils'

interface FileWithOrder extends File {
  id: string
  order: number
}

// SortableItem component for drag and drop
const SortableItem: React.FC<{ file: FileWithOrder; onRemove: (id: string) => void }> = ({ file, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: file.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="box mb-3" {...attributes} {...listeners}>
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <span className="icon">
              <ArrowsDownUp size={16} className="has-text-grey" />
            </span>
          </div>
          <div className="level-item">
            <div>
              <p className="title is-6">{file.name}</p>
              <p className="subtitle is-7 has-text-grey">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <button
              className="button is-small is-danger is-outlined"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(file.id)
              }}
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const MergeTool: React.FC = () => {
  const { t } = useTranslation()
  const { createJob, updateJobProgress, completeJob, errorJob } = useAppContext()
  const [files, setFiles] = useState<FileWithOrder[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const filesWithOrder: FileWithOrder[] = newFiles.map((file, index) => {
      // Create a proper FileWithOrder that maintains File prototype
      const fileWithOrder = Object.assign(file, {
        id: Math.random().toString(36).substr(2, 9),
        order: files.length + index
      }) as FileWithOrder
      return fileWithOrder
    })
    setFiles(prev => [...prev, ...filesWithOrder])
  }, [files.length])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)

        const reorderedFiles = arrayMove(items, oldIndex, newIndex)
        return reorderedFiles.map((file, index) => {
          // Preserve File prototype when updating order
          const updatedFile = Object.assign(file, { order: index })
          return updatedFile
        })
      })
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const mergePDFs = async () => {
    if (files.length < 2) return

    setIsProcessing(true)
    setProgress(0)

    const fileItems = files.map(f => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.type,
      file: f,
      status: 'pending' as const
    }))
    const newJobId = createJob('merge', fileItems)

    try {
      const mergedPdf = await PDFDocument.create()
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Convert File to ArrayBuffer with proper error handling
        let arrayBuffer: ArrayBuffer
        try {
          // Since we preserved the File prototype, arrayBuffer() should work
          if (file instanceof File && file.arrayBuffer) {
            arrayBuffer = await file.arrayBuffer()
          } else {
            // Fallback for edge cases
            arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as ArrayBuffer)
              reader.onerror = () => reject(new Error('Failed to read file'))
              reader.readAsArrayBuffer(file)
            })
          }
        } catch (error) {
          throw new Error(`Failed to read file ${file.name}: ${error}`)
        }
        
        const pdf = await PDFDocument.load(arrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page)
        })

        const currentProgress = ((i + 1) / files.length) * 100
        setProgress(currentProgress)
        updateJobProgress(newJobId, currentProgress)

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      
      completeJob(newJobId, blob)
      setProgress(100)
      
      // Auto-download
      downloadBlob(blob, 'merged-document.pdf')
      
    } catch (error) {
      console.error('Error merging PDFs:', error)
      errorJob(newJobId)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="merge-tool">
      <div className="hero is-light">
        <div className="hero-body">
          <div className="container has-text-centered">
            <div className="icon is-large has-text-primary mb-4">
              <CopySimple size={64} />
            </div>
            <h1 className="title is-2">{t('tools.merge.title')}</h1>
            <p className="subtitle is-4">{t('tools.merge.description')}</p>
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
                    {t('common.upload')} PDF Files
                  </p>
                </div>
                <div className="card-content">
                  <FileUpload 
                    onFilesSelected={handleFilesSelected}
                    maxFiles={20}
                  />
                </div>
              </div>

              {files.length > 0 && (
                <div className="card mt-5">
                  <div className="card-header">
                    <p className="card-header-title">
                      <span className="icon">
                        <ArrowsDownUp size={20} />
                      </span>
                      File Order (Drag to reorder)
                    </p>
                  </div>
                  <div className="card-content">
                    <DndContext
                      sensors={sensors}
                      onDragEnd={handleDragEnd}
                      collisionDetection={closestCenter}
                    >
                      <SortableContext
                        items={files.map(file => file.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div>
                          {files
                            .sort((a, b) => a.order - b.order)
                            .map((file) => (
                              <SortableItem 
                                key={file.id} 
                                file={file} 
                                onRemove={removeFile} 
                              />
                            ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
              )}
            </div>

            <div className="column is-4">
              <div className="card">
                <div className="card-header">
                  <p className="card-header-title">{t('common.configure')}</p>
                </div>
                <div className="card-content">
                  <div className="field">
                    <label className="label">Files to merge</label>
                    <div className="control">
                      <input 
                        className="input" 
                        type="text" 
                        value={`${files.length} files selected`}
                        readOnly 
                      />
                    </div>
                    <p className="help">
                      {files.length < 2 
                        ? 'Please select at least 2 PDF files to merge'
                        : 'Files will be merged in the order shown'
                      }
                    </p>
                  </div>

                  {isProcessing && (
                    <div className="field">
                      <ProgressBar 
                        progress={progress}
                        status="processing"
                        estimatedTime={estimateProcessingTime(
                          files.reduce((acc, file) => acc + file.size, 0), 
                          'merge'
                        )}
                      />
                    </div>
                  )}

                  <div className="field">
                    <div className="control">
                      <button 
                        className={`button is-primary is-fullwidth ${isProcessing ? 'is-loading' : ''}`}
                        disabled={files.length < 2 || isProcessing}
                        onClick={mergePDFs}
                      >
                        <span className="icon">
                          <Download size={20} />
                        </span>
                        <span>Merge & Download</span>
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

export default MergeTool
