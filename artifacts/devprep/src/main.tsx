import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import PerformanceMonitor from './components/PerformanceMonitor'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from './theme'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <PerformanceMonitor
      enabled={true}
      reportToConsole={import.meta.env.DEV}
      reportToAnalytics={import.meta.env.PROD}
    />
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
)
