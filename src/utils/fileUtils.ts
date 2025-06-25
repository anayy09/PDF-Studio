export const validateFile = (file: File): string | null => {
  const maxSize = 30 * 1024 * 1024 // 30MB
  
  if (file.size > maxSize) {
    return 'error.filetoobig'
  }
  
  if (file.type !== 'application/pdf') {
    return 'error.invalidtype'
  }
  
  return null
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const estimateProcessingTime = (fileSize: number, operation: string): number => {
  // Basic estimation in seconds based on file size and operation complexity
  const baseTime = fileSize / (1024 * 1024) // MB
  
  const multipliers = {
    merge: 0.5,
    split: 0.3,
    compress: 2.0,
    convert: 3.0,
    edit: 1.0,
    sign: 0.8,
    rotate: 0.2,
    organize: 0.4
  }
  
  return Math.max(1, Math.round(baseTime * (multipliers[operation as keyof typeof multipliers] || 1)))
}

export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (remainingSeconds === 0) {
    return `${minutes}m`
  }
  
  return `${minutes}m ${remainingSeconds}s`
}
