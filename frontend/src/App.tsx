import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CompanyDetails from './pages/CompanyDetails'
import FrameworkComparison from './pages/FrameworkComparison/index'
import Settings from './pages/Settings'
import Layout from './components/Layout'
import { FrameworkProvider } from './context/FrameworkContext'
import ChartTest from './components/test/ChartTest'

function App() {
  return (
    <FrameworkProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/company/:id" element={<CompanyDetails />} />
          <Route path="/compare" element={<>
            <ChartTest />
            <FrameworkComparison />
          </>} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </FrameworkProvider>
  )
}

export default App;
