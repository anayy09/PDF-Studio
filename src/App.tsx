import React from 'react'
import { Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Home from './pages/Home'
import ToolLayout from './pages/ToolLayout'
import MergeTool from './components/MergeTool'
import SplitTool from './components/SplitTool'
import CompressTool from './components/CompressTool'
import ConvertTool from './components/ConvertTool'
import EditTool from './components/EditTool'
import SignTool from './components/SignTool'
import RotateTool from './components/RotateTool'
import OrganizeTool from './components/OrganizeTool'
import Header from './components/HeaderNew'
import AnimatedRoutes from './components/AnimatedRoutes'

function App() {
  return (
    <AppProvider>
      <div className="App" style={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}>
        <Header />
        <div style={{ flex: 1 }}>
          <AnimatedRoutes>
            <Route path="/" element={<Home />} />
            <Route path="/tools" element={<ToolLayout />}>
              <Route path="merge" element={<MergeTool />} />
              <Route path="split" element={<SplitTool />} />
              <Route path="compress" element={<CompressTool />} />
              <Route path="convert" element={<ConvertTool />} />
              <Route path="edit" element={<EditTool />} />
              <Route path="sign" element={<SignTool />} />
              <Route path="rotate" element={<RotateTool />} />
              <Route path="organize" element={<OrganizeTool />} />
            </Route>
          </AnimatedRoutes>
        </div>
        <footer className="footer" style={{ 
          padding: '1.5rem', 
          background: 'var(--surface-color)',
          borderTop: '1px solid var(--border-color)',
          marginTop: 'auto'
        }}>
          <div className="container has-text-centered">
            <p className="is-size-7" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
              © {new Date().getFullYear()} AuroraPDF. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </AppProvider>
  )
}

export default App
