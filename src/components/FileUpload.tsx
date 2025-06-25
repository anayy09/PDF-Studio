import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { CloudArrowUp, File, X } from 'phosphor-react'
import { validateFile, formatFileSize } from '../utils/fileUtils'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  className?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 10,
  className = ''
}) => {
  const { t } = useTranslation()
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles: File[] = []
    const newErrors: string[] = []

    acceptedFiles.forEach(file => {
      const error = validateFile(file)
      if (error) {
        newErrors.push(`${file.name}: ${t(error)}`)
      } else {
        validFiles.push(file)
      }
    })

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles])
      onFilesSelected(validFiles)
    }

    setErrors(newErrors)
  }, [onFilesSelected, t])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles,
    multiple: maxFiles > 1
  })

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={`file-upload ${className}`}>
      <div 
        {...getRootProps()}
        className={`file-dropzone p-6 has-text-centered cursor-pointer ${isDragActive ? 'is-dragover' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="icon is-large has-text-primary mb-4">
          <CloudArrowUp size={48} />
        </div>
        
        {isDragActive ? (
          <p className="has-text-primary">{t('upload.dragdrop')}</p>
        ) : (
          <div>
            <p className="title is-5">{t('upload.dragdrop')}</p>
            <button className="button is-primary is-outlined mt-2" type="button">
              {t('upload.selectfiles')}
            </button>
            <p className="help mt-2">
              {t('upload.maxsize')} • {t('upload.supportedtypes')}
            </p>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="notification is-danger mt-4">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="title is-6">{t('upload.selectedfiles')}</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="box">
              <div className="level">
                <div className="level-left">
                  <div className="level-item">
                    <span className="icon">
                      <File size={20} />
                    </span>
                  </div>
                  <div className="level-item">
                    <div>
                      <p className="title is-6">{file.name}</p>
                      <p className="subtitle is-7">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                    <button 
                      className="button is-small is-danger is-outlined"
                      onClick={() => removeFile(index)}
                    >
                      <span className="icon">
                        <X size={16} />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload
