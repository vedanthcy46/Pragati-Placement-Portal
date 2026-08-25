import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // 1. Import from React Query
import './index.css'
import App from './App.jsx'
import { Toaster } from "react-hot-toast";

if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark')
}

// 2. Create the query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Automatically re-fetches when switching back to tab (F5 requirement)
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" />
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)