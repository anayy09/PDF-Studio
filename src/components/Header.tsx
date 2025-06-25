import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { House, Wrench, Sun, Moon } from 'phosphor-react'
import { useTheme } from '../context/ThemeContext'

const Header: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="navbar is-primary" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item">
          <h1 className="title is-4 has-text-white">{t('app.title')}</h1>
        </Link>
      </div>

      <div className="navbar-menu">
        <div className="navbar-start">
          <Link 
            to="/" 
            className={`navbar-item ${location.pathname === '/' ? 'is-active' : ''}`}
          >
            <span className="icon">
              <House size={20} />
            </span>
            <span>{t('nav.home')}</span>
          </Link>
          
          <Link 
            to="/tools" 
            className={`navbar-item ${location.pathname.startsWith('/tools') ? 'is-active' : ''}`}
          >
            <span className="icon">
              <Wrench size={20} />
            </span>
            <span>{t('nav.tools')}</span>
          </Link>
        </div>
        <div className="navbar-end">
          <button
            className="navbar-item button is-white is-small"
            onClick={toggleTheme}
            aria-label="toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
