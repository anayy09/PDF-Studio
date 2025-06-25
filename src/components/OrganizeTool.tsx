import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Rows, Download, Trash, CopySimple } from 'phosphor-react'
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
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import FileUpload from './FileUpload'
import ProgressBar from './ProgressBar'
import { useAppContext } from '../context/AppContext'
import { downloadBlob, estimateProcessingTime } from '../utils/fileUtils'
import { PDFDocument } from 'pdf-lib'

interface PageItem {
  id: string
  pageNumber: number
  thumbnail: string
  selected: boolean
}

const SortablePageItem: React.FC<{ 
  page: PageItem
  onToggleSelect: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}> = ({ page, onToggleSelect, onDelete, onDuplicate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="column is-3">
      <div className={`card ${page.selected ? 'has-background-light' : ''}`}>
        <div className="card-image">
          <figure className="image is-3by4">
            <div 
              style={{ 
                backgroundColor: '#f5f5f5', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '200px',
                border: '1px solid #ddd'
              }}
            >
              Page {page.pageNumber}
            </div>
          </figure>
        </div>
        <div className="card-content p-2">
          <div className="field is-grouped is-grouped-multiline">
            <div className="control">
              <label className="checkbox">
                <input 
                  type="checkbox" 
                  checked={page.selected}
                  onChange={() => onToggleSelect(page.id)}
                />
                <span className="ml-1">Select</span>
              </label>
            </div>
            <div className="control">
              <button 
                className="button is-small is-info"
                onClick={() => onDuplicate(page.id)}
              >
                <CopySimple size={12} />
              </button>
            </div>
            <div className="control">
              <button 
                className="button is-small is-danger"
                onClick={() => onDelete(page.id)}
              >
                <Trash size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const OrganizeTool: React.FC = () => {
  const { t } = useTranslation()
  const { createJob, updateJobProgress, completeJob, errorJob } = useAppContext()
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleFileSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0]
      setFile(selectedFile)

      try {
        const arrayBuffer = await selectedFile.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const pageCount = pdf.getPageCount()
        const loadedPages: PageItem[] = Array.from({ length: pageCount }, (_, i) => ({
          id: `page-${i + 1}-${Date.now()}`,
          pageNumber: i,
          thumbnail: '',
          selected: false
        }))
        setPages(loadedPages)
      } catch (err) {
        console.error('Failed to load PDF:', err)
        setPages([])
      }
    }
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const togglePageSelect = (id: string) => {
    setPages(prev => prev.map(page => 
      page.id === id ? { ...page, selected: !page.selected } : page
    ))
  }

  const deletePage = (id: string) => {
    setPages(prev => prev.filter(page => page.id !== id))
  }

  const duplicatePage = (id: string) => {
    const pageToClone = pages.find(page => page.id === id)
    if (pageToClone) {
      const newPage: PageItem = {
        ...pageToClone,
        id: `${pageToClone.id}-copy-${Date.now()}`,
        selected: false
      }
      setPages(prev => {
        const index = prev.findIndex(page => page.id === id)
        return [...prev.slice(0, index + 1), newPage, ...prev.slice(index + 1)]
      })
    }
  }

  const organizeAndDownload = async () => {
    if (!file || pages.length === 0) return

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
    const newJobId = createJob('organize', [fileItem])

    try {
      for (let i = 0; i <= 90; i += 15) {
        setProgress(i)
        updateJobProgress(newJobId, i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      const originalArrayBuffer = await file.arrayBuffer()
      const srcPdf = await PDFDocument.load(originalArrayBuffer)
      const newPdf = await PDFDocument.create()

      for (const p of pages) {
        const [copied] = await newPdf.copyPages(srcPdf, [p.pageNumber])
        newPdf.addPage(copied)
      }

      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      
      setProgress(100)
      updateJobProgress(newJobId, 100)
      completeJob(newJobId, blob)
      
      const filename = file.name.replace('.pdf', '_organized.pdf')
      downloadBlob(blob, filename)

    } catch (error) {
      console.error('Error organizing PDF:', error)
      errorJob(newJobId)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="organize-tool">
      <div className="hero is-light">
        <div className="hero-body">
          <div className="container has-text-centered">
            <div className="icon is-large has-text-primary mb-4">
              <Rows size={64} />
            </div>
            <h1 className="title is-2">{t('tools.organize.title')}</h1>
            <p className="subtitle is-4">{t('tools.organize.description')}</p>
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

              {pages.length > 0 && (
                <div className="card mt-4">
                  <div className="card-header">
                    <p className="card-header-title">
                      Page Organization ({pages.length} pages)
                    </p>
                  </div>
                  <div className="card-content">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={pages.map(page => page.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="columns is-multiline">
                          {pages.map((page) => (
                            <SortablePageItem
                              key={page.id}
                              page={page}
                              onToggleSelect={togglePageSelect}
                              onDelete={deletePage}
                              onDuplicate={duplicatePage}
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
                  <p className="card-header-title">Organization Options</p>
                </div>
                <div className="card-content">
                  {!file ? (
                    <div className="content">
                      <h6>Features available:</h6>
                      <ul>
                        <li>Drag-and-drop page reordering</li>
                        <li>Page thumbnail preview</li>
                        <li>Delete unwanted pages</li>
                        <li>Duplicate pages</li>
                        <li>Bulk page operations</li>
                        <li>Real-time page count</li>
                      </ul>
                    </div>
                  ) : (
                    <>
                      <div className="field">
                        <p className="help">
                          <strong>Instructions:</strong><br/>
                          • Drag pages to reorder<br/>
                          • Use checkboxes to select multiple pages<br/>
                          • Click duplicate/delete buttons for individual pages
                        </p>
                      </div>

                      {isProcessing && (
                        <div className="field">
                          <ProgressBar 
                            progress={progress}
                            status="processing"
                            estimatedTime={estimateProcessingTime(file?.size || 0, 'organize')}
                          />
                        </div>
                      )}

                      <div className="field">
                        <div className="control">
                          <button 
                            className={`button is-primary is-fullwidth ${isProcessing ? 'is-loading' : ''}`}
                            disabled={!file || isProcessing || pages.length === 0}
                            onClick={organizeAndDownload}
                          >
                            <span className="icon">
                              <Download size={20} />
                            </span>
                            <span>Organize & Download PDF</span>
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

export default OrganizeTool
