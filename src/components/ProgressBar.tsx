import React from 'react'
import { useTranslation } from 'react-i18next'
import { formatTime } from '../utils/fileUtils'

interface ProgressBarProps {
  progress: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  estimatedTime?: number
  className?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  estimatedTime,
  className = ''
}) => {
  const { t } = useTranslation()

  const getProgressColor = () => {
    switch (status) {
      case 'completed':
        return 'is-success'
      case 'error':
        return 'is-danger'
      case 'processing':
        return 'is-primary'
      default:
        return 'is-light'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return t('progress.preparing')
      case 'processing':
        return t('progress.processing', { percent: Math.round(progress) })
      case 'completed':
        return t('progress.complete')
      case 'error':
        return t('common.error')
      default:
        return ''
    }
  }

  return (
    <div className={`progress-container ${className}`}>
      <progress 
        className={`progress ${getProgressColor()}`} 
        value={progress} 
        max="100"
      >
        {Math.round(progress)}%
      </progress>
      
      <div className="progress-text">
        {getStatusText()}
      </div>
      
      {status === 'processing' && estimatedTime && (
        <p className="help has-text-centered mt-1">
          {t('progress.estimated', { time: formatTime(estimatedTime) })}
        </p>
      )}
    </div>
  )
}

export default ProgressBar
