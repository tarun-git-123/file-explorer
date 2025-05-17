import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app.css'
import App from './App.jsx'
import { FileOperationProvider } from './FileOperationContext';

createRoot(document.getElementById('root')).render(
    <FileOperationProvider>
        <App />
    </FileOperationProvider>
)
