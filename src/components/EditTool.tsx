import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PencilSimple, Download } from 'phosphor-react'
import FileUpload from './FileUpload'

const EditTool: React.FC = () => {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)

  const handleFileSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
    }
  }, [])

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
          <div className="notification is-info">
            <p><strong>Coming Soon!</strong></p>
            <p>The PDF editor with canvas-based editing, text addition, image insertion, and annotation tools is under development.</p>
          </div>
          
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
            </div>

            <div className="column is-4">
              <div className="card">
                <div className="card-header">
                  <p className="card-header-title">Edit Options</p>
                </div>
                <div className="card-content">
                  <div className="content">
                    <h6>Features in development:</h6>
                    <ul>
                      <li>Add text annotations</li>
                      <li>Insert images</li>
                      <li>Draw shapes</li>
                      <li>Freehand drawing</li>
                      <li>Highlight text</li>
                      <li>Undo/Redo support</li>
                    </ul>
                  </div>

                  <div className="field">
                    <div className="control">
                      <button 
                        className="button is-primary is-fullwidth"
                        disabled={true}
                      >
                        <span className="icon">
                          <Download size={20} />
                        </span>
                        <span>Edit PDF (Coming Soon)</span>
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

export default EditTool
