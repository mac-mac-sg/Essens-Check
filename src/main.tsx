import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles.css'
import './redesign.css'
import './redesign-fixes.css'
import './wissen.css'

const wurzel = document.getElementById('root')
if (!wurzel) throw new Error('Wurzelelement #root fehlt')

createRoot(wurzel).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
