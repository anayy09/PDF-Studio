import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const ToolLayout: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  
  // Get current tool name from URL path
  const currentTool = location.pathname.split('/').pop() || ''

  return (
    <div className="section">
      <div className="container">
        <div className="card" style={{ 
          borderRadius: '16px', 
          boxShadow: '0 1px 3px var(--shadow-color)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)'
        }}>
          <div className="card-header" style={{ 
            background: 'var(--surface-color)',
            borderBottom: '1px solid var(--border-color)',
            padding: '1rem'
          }}>
            <div className="card-header-title">
              <h2 className="title is-4" style={{ fontWeight: '500' }}>
                {t(`tools.${currentTool}.title`)}
              </h2>
            </div>
          </div>
          <div className="card-content" style={{ padding: '1.5rem' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ToolLayout
