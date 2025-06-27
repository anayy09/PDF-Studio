import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { House, Wrench, Sun, Moon, List, X } from 'phosphor-react'
import { useTheme } from '../context/ThemeContext'

const Header: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [isMenuActive, setIsMenuActive] = useState(false)

  const toggleMenu = () => {
    setIsMenuActive(!isMenuActive)
  }

  return (
    <header className="navbar" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item">
            <h1 className="title is-5" style={{ fontWeight: '500' }}>
              <span style={{ color: '#4285f4' }}>A</span>
              <span style={{ color: '#ea4335' }}>u</span>
              <span style={{ color: '#fbbc05' }}>r</span>
              <span style={{ color: '#4285f4' }}>o</span>
              <span style={{ color: '#34a853' }}>r</span>
              <span style={{ color: '#ea4335' }}>a</span>
              <span>PDF</span>
            </h1>
          </Link>
          
          <a 
            role="button" 
            className={`navbar-burger ${isMenuActive ? 'is-active' : ''}`}
            aria-label="menu" 
            aria-expanded="false" 
            onClick={toggleMenu}
          >
            {isMenuActive ? <X size={24} /> : <List size={24} />}
          </a>
        </div>

        <div className={`navbar-menu ${isMenuActive ? 'is-active' : ''}`}>
          <div className="navbar-start">
            <Link 
              to="/" 
              className={`navbar-item ${location.pathname === '/' ? 'is-active' : ''}`}
              onClick={() => setIsMenuActive(false)}
            >
              <span className="icon">
                <House weight={location.pathname === '/' ? 'fill' : 'regular'} size={20} />
              </span>
              <span>{t('nav.home')}</span>
            </Link>
            
            <Link 
              to="/tools" 
              className={`navbar-item ${location.pathname.startsWith('/tools') ? 'is-active' : ''}`}
              onClick={() => setIsMenuActive(false)}
            >
              <span className="icon">
                <Wrench weight={location.pathname.startsWith('/tools') ? 'fill' : 'regular'} size={20} />
              </span>
              <span>{t('nav.tools')}</span>
            </Link>
          </div>
          
          <div className="navbar-end">
            <div className="navbar-item">
              <button
                className="button is-rounded is-small"
                onClick={toggleTheme}
                aria-label="toggle theme"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? (
                  <Moon size={18} weight="regular" />
                ) : (
                  <Sun size={18} weight="regular" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
