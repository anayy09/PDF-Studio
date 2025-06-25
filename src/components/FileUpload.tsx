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
        className={`file-dropzone has-text-centered cursor-pointer ${isDragActive ? 'is-dragover' : ''}`}
        style={{
          padding: '2.5rem',
          borderRadius: '18px',
          transition: 'all 0.2s ease',
          background: 'rgba(66, 133, 244, 0.04)'
        }}
      >
        <input {...getInputProps()} />
        <div 
          style={{ 
            margin: '0 auto 1.5rem',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(66, 133, 244, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CloudArrowUp size={40} weight="duotone" color="#4285f4" />
        </div>
        
        {isDragActive ? (
          <p className="has-text-primary" style={{ fontSize: '1.25rem', fontWeight: '500' }}>
            {t('upload.dragdrop')}
          </p>
        ) : (
          <div>
            <p className="title is-4" style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
              {t('upload.dragdrop')}
            </p>
            <button 
              className="button is-primary is-rounded mt-3"
              style={{ 
                padding: '0.75rem 2rem', 
                fontWeight: '500',
                boxShadow: '0 2px 6px rgba(66, 133, 244, 0.4)'
              }}
              type="button"
            >
              {t('upload.selectfiles')}
            </button>
            <p className="help mt-3" style={{ color: 'var(--text-color)', opacity: '0.7' }}>
              {t('upload.maxsize')} • {t('upload.supportedtypes')}
            </p>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div 
          className="notification is-danger mt-4"
          style={{ 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(234, 67, 53, 0.2)'
          }}
        >
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-5">
          <h4 
            className="title is-6" 
            style={{ 
              fontWeight: '500', 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '1rem' 
            }}
          >
            <span>{t('upload.selectedfiles')}</span>
            <span 
              className="ml-2" 
              style={{ 
                background: '#4285f4', 
                color: 'white', 
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem'
              }}
            >
              {uploadedFiles.length}
            </span>
          </h4>
          
          <div 
            style={{ 
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}
          >
            {uploadedFiles.map((file, index) => (
              <div 
                key={index} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderBottom: index < uploadedFiles.length - 1 ? '1px solid var(--border-color)' : 'none',
                  background: 'var(--surface-color)'
                }}
              >
                <div style={{ marginRight: '1rem', color: '#4285f4' }}>
                  <File size={24} weight="duotone" />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>{file.name}</p>
                  <p style={{ fontSize: '0.75rem', opacity: '0.7' }}>{formatFileSize(file.size)}</p>
                </div>
                <button 
                  className="button is-small is-rounded" 
                  style={{ 
                    width: '32px', 
                    height: '32px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: 'var(--border-color)'
                  }}
                  onClick={() => removeFile(index)}
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload
