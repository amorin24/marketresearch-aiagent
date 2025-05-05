import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CompanyDetails from './pages/CompanyDetails'
import FrameworkComparison from './pages/FrameworkComparison/index'
import CompanyResearch from './pages/CompanyResearch'
import Settings from './pages/Settings'
import Layout from './components/Layout'
import { FrameworkProvider } from './context/FrameworkContext'
import { CompanyResearchProvider } from './context/CompanyResearchContext'
import { DeveloperModeProvider } from './context/DeveloperModeContext'
import ChartTest from './components/test/ChartTest'

function App() {
  return (
    <DeveloperModeProvider>
      <FrameworkProvider>
        <CompanyResearchProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/company/:id" element={<CompanyDetails />} />
              <Route path="/compare" element={<>
                <ChartTest />
                <FrameworkComparison />
              </>} />
              <Route path="/research" element={<CompanyResearch />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </CompanyResearchProvider>
      </FrameworkProvider>
    </DeveloperModeProvider>
  )
}

export default App;
