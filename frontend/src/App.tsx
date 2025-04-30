import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CompanyDetails from './pages/CompanyDetails'
import FrameworkComparison from './pages/FrameworkComparison'
import Settings from './pages/Settings'
import Layout from './components/Layout'
import { FrameworkProvider } from './context/FrameworkContext'

function App() {
  return (
    <FrameworkProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/company/:id" element={<CompanyDetails />} />
          <Route path="/compare" element={<FrameworkComparison />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </FrameworkProvider>
  )
}

export default App
