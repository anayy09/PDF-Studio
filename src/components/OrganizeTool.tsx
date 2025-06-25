import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Rows, Download } from 'phosphor-react'
import FileUpload from './FileUpload'

const OrganizeTool: React.FC = () => {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)

  const handleFileSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
    }
  }, [])

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
          <div className="notification is-info">
            <p><strong>Coming Soon!</strong></p>
            <p>Page organization with drag-and-drop thumbnail interface, page deletion, and duplication features is under development.</p>
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
                  <p className="card-header-title">Organization Options</p>
                </div>
                <div className="card-content">
                  <div className="content">
                    <h6>Features in development:</h6>
                    <ul>
                      <li>Drag-and-drop page reordering</li>
                      <li>Page thumbnail preview</li>
                      <li>Delete unwanted pages</li>
                      <li>Duplicate pages</li>
                      <li>Bulk page operations</li>
                      <li>Real-time page count</li>
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
                        <span>Organize PDF (Coming Soon)</span>
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

export default OrganizeTool
