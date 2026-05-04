import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { ApiPage } from './pages/ApiPage'
import { HomePage } from './pages/HomePage'

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <p className="brand">Gott Calculator</p>
        <nav>
          <Link to="/">Calculator</Link>
          <Link to="/api/gott">Endpoint</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/api/gott" element={<ApiPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
