import express from 'express'
import multer from 'multer'
import { PDFDocument, degrees } from 'pdf-lib'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB limit
    files: 20 // Max 20 files per request
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  }
})

// Merge PDFs endpoint
router.post('/merge', upload.array('files', 20), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[]
    
    if (!files || files.length < 2) {
      return res.status(400).json({ error: 'At least 2 PDF files are required' })
    }

    const mergedPdf = await PDFDocument.create()
    
    for (const file of files) {
      const pdf = await PDFDocument.load(file.buffer)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page)
      })
    }

    const pdfBytes = await mergedPdf.save()
    
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="merged-document.pdf"')
    res.send(Buffer.from(pdfBytes))
    
  } catch (error) {
    console.error('Error merging PDFs:', error)
    res.status(500).json({ error: 'Failed to merge PDFs' })
  }
})

// Compress PDF endpoint (placeholder - would need actual compression library)
router.post('/compress', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    const { level } = req.body
    
    if (!file) {
      return res.status(400).json({ error: 'PDF file is required' })
    }

    // For demo purposes, just return the original file
    // In a real implementation, you would use a PDF compression library
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="compressed.pdf"')
    res.send(file.buffer)
    
  } catch (error) {
    console.error('Error compressing PDF:', error)
    res.status(500).json({ error: 'Failed to compress PDF' })
  }
})

// Convert PDF to Word endpoint (placeholder)
router.post('/convert', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    
    if (!file) {
      return res.status(400).json({ error: 'PDF file is required' })
    }

    // Placeholder for PDF to Word conversion
    // In a real implementation, you would use a library like pdf2docx
    const wordContent = `Converted from PDF\n\nThis is a demo conversion. In a real implementation, this would contain the actual content from the PDF file.`
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', 'attachment; filename="converted.docx"')
    res.send(Buffer.from(wordContent))
    
  } catch (error) {
    console.error('Error converting PDF:', error)
    res.status(500).json({ error: 'Failed to convert PDF' })
  }
})

// Split PDF endpoint
router.post('/split', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    const { mode, pageInterval, pageRanges } = req.body
    
    if (!file) {
      return res.status(400).json({ error: 'PDF file is required' })
    }

    const sourcePdf = await PDFDocument.load(file.buffer)
    const pageCount = sourcePdf.getPageCount()
    
    let splitRanges: number[][] = []

    if (mode === 'pages') {
      const interval = parseInt(pageInterval) || 1
      for (let i = 0; i < pageCount; i += interval) {
        const endPage = Math.min(i + interval - 1, pageCount - 1)
        splitRanges.push([i, endPage])
      }
    } else {
      // Parse custom ranges
      const ranges = pageRanges.split(',').map((range: string) => range.trim())
      for (const range of ranges) {
        if (range.includes('-')) {
          const [start, end] = range.split('-').map((n: string) => parseInt(n.trim()) - 1)
          if (!isNaN(start) && !isNaN(end) && start >= 0 && end < pageCount) {
            splitRanges.push([start, end])
          }
        } else {
          const pageNum = parseInt(range) - 1
          if (!isNaN(pageNum) && pageNum >= 0 && pageNum < pageCount) {
            splitRanges.push([pageNum, pageNum])
          }
        }
      }
    }

    // For simplicity, return the first split as an example
    if (splitRanges.length > 0) {
      const [startPage, endPage] = splitRanges[0]
      const newPdf = await PDFDocument.create()
      
      const pageIndices = []
      for (let j = startPage; j <= endPage; j++) {
        pageIndices.push(j)
      }
      
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices)
      copiedPages.forEach(page => newPdf.addPage(page))
      
      const pdfBytes = await newPdf.save()
      
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename="split-part-1.pdf"')
      res.send(Buffer.from(pdfBytes))
    } else {
      res.status(400).json({ error: 'Invalid page ranges' })
    }
    
  } catch (error) {
    console.error('Error splitting PDF:', error)
    res.status(500).json({ error: 'Failed to split PDF' })
  }
})

// Rotate PDF endpoint
router.post('/rotate', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    const { angle, rotateAll, pageRange } = req.body
    
    if (!file) {
      return res.status(400).json({ error: 'PDF file is required' })
    }

    const pdf = await PDFDocument.load(file.buffer)
    const pages = pdf.getPages()
    const pageCount = pdf.getPageCount()
    
    let pagesToRotate: number[] = []

    if (rotateAll === 'true') {
      pagesToRotate = Array.from({ length: pageCount }, (_, i) => i)
    } else {
      // Parse page range
      const ranges = pageRange.split(',').map((range: string) => range.trim())
      for (const range of ranges) {
        if (range.includes('-')) {
          const [start, end] = range.split('-').map((n: string) => parseInt(n.trim()) - 1)
          if (!isNaN(start) && !isNaN(end) && start >= 0 && end < pageCount) {
            for (let i = start; i <= end; i++) {
              pagesToRotate.push(i)
            }
          }
        } else {
          const pageNum = parseInt(range) - 1
          if (!isNaN(pageNum) && pageNum >= 0 && pageNum < pageCount) {
            pagesToRotate.push(pageNum)
          }
        }
      }
    }

    // Rotate specified pages
    for (const pageIndex of pagesToRotate) {
      if (pageIndex < pages.length) {
        const currentRotation = pages[pageIndex].getRotation().angle
        pages[pageIndex].setRotation(degrees(currentRotation + parseInt(angle)))
      }
    }

    const pdfBytes = await pdf.save()
    
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="rotated.pdf"')
    res.send(Buffer.from(pdfBytes))
    
  } catch (error) {
    console.error('Error rotating PDF:', error)
    res.status(500).json({ error: 'Failed to rotate PDF' })
  }
})

export default router
