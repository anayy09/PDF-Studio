# AuroraPDF - Premium PDF Toolkit

A comprehensive, elegant PDF manipulation tool built with React, TypeScript, and Bulma CSS framework.

## Features

### ✅ Implemented
- **Merge PDF**: Combine multiple PDFs with drag-and-drop reordering
- **Split PDF**: Split PDFs by page ranges or intervals
- **Compress PDF**: Reduce file size with quality options
- **PDF to Word**: Convert PDFs to editable Word documents
- **Rotate PDF**: Rotate pages in 90° increments
- **Drag & Drop**: Intuitive file upload interface
- **Progress Tracking**: Real-time processing feedback
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Toggle**: Switch between light and dark themes

### 🚧 Coming Soon
- **Edit PDF**: Canvas-based PDF editor with text, images, and annotations
- **Sign PDF**: Digital signature support with drawing, typing, and upload options
- **Organize PDF**: Advanced page management with thumbnail previews

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Bulma CSS** for elegant styling
- **Phosphor Icons** for consistent iconography
- **Roboto Font** for modern typography
- **pdf-lib** for client-side PDF manipulation
- **react-beautiful-dnd** for drag-and-drop functionality
- **i18next** for internationalization
- **SWR** for data fetching

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Multer** for file upload handling
- **pdf-lib** for server-side PDF processing
- **Helmet** for security headers
- **CORS** enabled for development

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aurora-pdf
```

2. Install dependencies:
```bash
npm install
```

3. Start the development servers:
```bash
npm run dev
```

This will start:
- Frontend development server on `http://localhost:5173`
- Backend API server on `http://localhost:3001`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
aurora-pdf/
├── src/                     # Frontend source code
│   ├── components/          # React components
│   │   ├── FileUpload.tsx   # File upload component
│   │   ├── ProgressBar.tsx  # Progress tracking
│   │   ├── MergeTool.tsx    # PDF merge functionality
│   │   ├── SplitTool.tsx    # PDF split functionality
│   │   └── ...              # Other tool components
│   ├── context/             # React context providers
│   ├── pages/              # Page components
│   ├── styles/             # SCSS styles
│   ├── utils/              # Utility functions
│   └── i18n.ts             # Internationalization setup
├── server/                 # Backend source code
│   ├── routes/             # API routes
│   └── app.ts              # Express server setup
├── public/                 # Static assets
└── dist/                   # Built application
```

## API Endpoints

### PDF Operations
- `POST /api/pdf/merge` - Merge multiple PDFs
- `POST /api/pdf/split` - Split PDF by pages or ranges
- `POST /api/pdf/compress` - Compress PDF file
- `POST /api/pdf/convert` - Convert PDF to Word
- `POST /api/pdf/rotate` - Rotate PDF pages

### File Upload Limits
- Maximum file size: 30MB per file
- Maximum files per request: 20 files
- Supported format: PDF only

## Configuration

### Environment Variables
```bash
NODE_ENV=development|production
PORT=3001                    # Server port (default: 3001)
```

### Security Features
- File type validation (PDF only)
- File size limits (30MB max)
- CORS protection
- Helmet security headers
- Input sanitization

## Performance Targets

- **First Contentful Paint**: < 1.5s on desktop, < 2.5s on mobile
- **Bundle Size**: ≤ 350kB gzipped
- **PDF Processing**: ≤ 5s for 100-page, 10MB PDF

## Browser Support

- Chrome ≥ 103
- Edge (latest)
- Safari (latest)
- Firefox (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [pdf-lib](https://github.com/Hopding/pdf-lib) for PDF manipulation
- [Bulma](https://bulma.io/) for the elegant CSS framework
- [Phosphor Icons](https://phosphoricons.com/) for beautiful icons
- [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd) for drag-and-drop functionality
