import React from 'react'
import ReactDOM from 'react-dom/client'
import { scan } from 'react-scan'
import App from './App'

if (typeof window !== 'undefined') {
  // scan({ enabled: true })
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
)
