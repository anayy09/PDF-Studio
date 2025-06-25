import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PenNib, Download } from 'phosphor-react'
import FileUpload from './FileUpload'

const SignTool: React.FC = () => {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)

  const handleFileSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
    }
  }, [])

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
          <div className="notification is-info">
            <p><strong>Coming Soon!</strong></p>
            <p>Digital signature functionality with support for drawing, typing, and uploading signature images is under development.</p>
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
                  <p className="card-header-title">Signature Options</p>
                </div>
                <div className="card-content">
                  <div className="content">
                    <h6>Features in development:</h6>
                    <ul>
                      <li>Draw signature</li>
                      <li>Type signature</li>
                      <li>Upload signature image</li>
                      <li>Multiple signers support</li>
                      <li>Timestamp signatures</li>
                      <li>Email signature requests</li>
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
                        <span>Sign PDF (Coming Soon)</span>
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

export default SignTool
