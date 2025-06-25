import React from 'react'
import { Routes, Route } from 'react-router-dom'
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
import Header from './components/Header'

function App() {
  return (
    <AppProvider>
      <div className="App">
        <Header />
        <Routes>
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
        </Routes>
      </div>
    </AppProvider>
  )
}

export default App
