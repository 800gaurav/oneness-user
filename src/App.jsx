import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Landing from './pages/Landing'
import Store from './pages/Store'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Store />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#5C3A21',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
