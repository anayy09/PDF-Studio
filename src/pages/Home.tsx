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
        <div className="hero is-primary-light">
          <div className="hero-body">
            <div className="container has-text-centered">
              <h1 className="title is-1">{t('app.title')}</h1>
              <p className="subtitle is-3">{t('app.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="columns is-multiline">
            {tools.map((tool) => {
              const IconComponent = tool.icon
              return (
                <div key={tool.id} className="column is-6-tablet is-4-desktop is-3-widescreen">
                  <Link to={tool.path}>
                    <div className="card tool-card">
                      <div className="card-content">
                        <div className="content has-text-centered">
                          <div className="icon is-large has-text-primary">
                            <IconComponent size={48} />
                          </div>
                          <h3 className="title is-5">{t(`tools.${tool.id}.title`)}</h3>
                          <p className="subtitle is-6">{t(`tools.${tool.id}.description`)}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
