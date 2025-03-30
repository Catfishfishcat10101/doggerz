import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/App.css'
import { DogProvider } from './context/DogContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DogProvider>
      <App />
    </DogProvider>
  </React.StrictMode>,
)
