import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  CopySimple, 
  Scissors, 
  Archive, 
  FileText, 
  PencilSimple, 
  PenNib, 
  ArrowClockwise, 
  Rows 
} from 'phosphor-react'

const tools = [
  {
    id: 'merge',
    icon: CopySimple,
    path: '/tools/merge'
  },
  {
    id: 'split',
    icon: Scissors,
    path: '/tools/split'
  },
  {
    id: 'compress',
    icon: Archive,
    path: '/tools/compress'
  },
  {
    id: 'convert',
    icon: FileText,
    path: '/tools/convert'
  },
  {
    id: 'edit',
    icon: PencilSimple,
    path: '/tools/edit'
  },
  {
    id: 'sign',
    icon: PenNib,
    path: '/tools/sign'
  },
  {
    id: 'rotate',
    icon: ArrowClockwise,
    path: '/tools/rotate'
  },
  {
    id: 'organize',
    icon: Rows,
    path: '/tools/organize'
  }
]

const Home: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="section">
      <div className="container">
        {/* Hero Section with Google-style gradient background */}
        <div className="hero" style={{ 
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
          marginBottom: '2rem'
        }}>
          <div className="hero-body" style={{ padding: '4rem 2rem' }}>
            <div className="container has-text-centered">
              <h1 className="title is-1 has-text-white" style={{ fontWeight: '600' }}>{t('app.title')}</h1>
              <p className="subtitle is-4 has-text-white" style={{ maxWidth: '700px', margin: '1rem auto', opacity: '0.9' }}>{t('app.subtitle')}</p>
              
              {/* Call to action button */}
              <Link to="/tools/merge" className="button is-white is-large is-rounded mt-5" style={{ 
                padding: '0.75rem 2rem', 
                fontWeight: '500',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Tools Grid - Material Design inspired cards */}
        <div className="section" style={{ paddingTop: '1rem' }}>
          <h2 className="title is-3 mb-5" style={{ 
            textAlign: 'center', 
            fontWeight: '400',
            marginBottom: '2rem' 
          }}>
            PDF Tools
          </h2>
          
          <div className="columns is-multiline" style={{ margin: '0 -0.75rem' }}>
            {tools.map((tool) => {
              const IconComponent = tool.icon
              return (
                <div key={tool.id} className="column is-6-tablet is-4-desktop is-3-widescreen">
                  <Link to={tool.path}>
                    <div className="card tool-card" style={{ height: '100%' }}>
                      <div className="card-content">
                        <div className="content has-text-centered">
                          <div className="icon-container" style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            margin: '0 auto 1rem',
                            background: 'rgba(66, 133, 244, 0.1)'
                          }}>
                            <IconComponent size={32} weight="regular" className="has-text-primary" />
                          </div>
                          <h3 className="title is-5" style={{ fontWeight: '500' }}>
                            {t(`tools.${tool.id}.title`)}
                          </h3>
                          <p className="subtitle is-6" style={{ fontSize: '0.9rem' }}>
                            {t(`tools.${tool.id}.description`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Google-style info section */}
        <div className="section" style={{ marginTop: '2rem', padding: '2rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div className="columns is-vcentered">
            <div className="column">
              <h3 className="title is-4" style={{ fontWeight: '500' }}>Fast, Reliable, and Secure</h3>
              <p className="subtitle is-6">
                Every PDF tool in AuroraPDF is designed with speed and security in mind. 
                Your documents are processed right in your browser - your files never leave your computer.
              </p>
            </div>
            <div className="column has-text-centered">
              <div style={{ fontSize: '3rem', color: '#4285f4' }}>
                <FileText size={64} weight="duotone" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
