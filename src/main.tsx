import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { SWRConfig } from 'swr'
import App from './App'
import i18n from './i18n'
import { ThemeProvider } from './context/ThemeContext'
import './styles/main.scss'

const fetcher = (url: string) => fetch(url).then(res => res.json())

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <SWRConfig value={{ fetcher }}>
            <App />
          </SWRConfig>
        </ThemeProvider>
      </I18nextProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
