import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      // Header
      'app.title': 'AuroraPDF',
      'app.subtitle': 'Premium PDF Toolkit',
      
      // Navigation
      'nav.home': 'Home',
      'nav.tools': 'Tools',
      
      // Common
      'common.upload': 'Upload',
      'common.download': 'Download',
      'common.processing': 'Processing...',
      'common.configure': 'Configure',
      'common.preview': 'Preview',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.close': 'Close',
      'common.error': 'Error',
      'common.success': 'Success',
      
      // Tools
      'tools.merge.title': 'Merge PDF',
      'tools.merge.description': 'Combine multiple PDFs into one document',
      'tools.split.title': 'Split PDF',
      'tools.split.description': 'Split a PDF into multiple documents',
      'tools.compress.title': 'Compress PDF',
      'tools.compress.description': 'Reduce PDF file size while maintaining quality',
      'tools.convert.title': 'PDF to Word',
      'tools.convert.description': 'Convert PDF to editable Word document',
      'tools.edit.title': 'Edit PDF',
      'tools.edit.description': 'Add text, images, and annotations to PDF',
      'tools.sign.title': 'Sign PDF',
      'tools.sign.description': 'Add digital signatures to PDF documents',
      'tools.rotate.title': 'Rotate PDF',
      'tools.rotate.description': 'Rotate PDF pages in 90° increments',
      'tools.organize.title': 'Organize PDF',
      'tools.organize.description': 'Rearrange, delete, or duplicate PDF pages',
      
      // File upload
      'upload.dragdrop': 'Drag and drop files here, or click to select',
      'upload.selectfiles': 'Select Files',
      'upload.selectedfiles': 'Selected Files',
      'upload.maxsize': 'Maximum file size: 30MB',
      'upload.supportedtypes': 'Supported types: PDF',
      
      // Progress
      'progress.preparing': 'Preparing...',
      'progress.processing': 'Processing {{percent}}%',
      'progress.complete': 'Complete!',
      'progress.estimated': 'Estimated time: {{time}}',
      
      // Errors
      'error.filetoobig': 'File size exceeds 30MB limit',
      'error.invalidtype': 'Invalid file type. Only PDF files are supported.',
      'error.processing': 'Error processing file. Please try again.',
      'error.network': 'Network error. Please check your connection.',
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
