import React from 'react'
import { Outlet } from 'react-router-dom'

const ToolLayout: React.FC = () => {
  return (
    <div className="section">
      <div className="container">
        <Outlet />
      </div>
    </div>
  )
}

export default ToolLayout
