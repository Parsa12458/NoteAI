import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/vazirmatn/index.css'
import 'katex/dist/katex.min.css'
import './styles/index.css'
import { AppProviders } from './app/providers'
import { App } from './app/App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
)
