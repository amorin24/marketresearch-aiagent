import { FrameworkProvider } from './context/FrameworkContext'
import { CompanyResearchProvider } from './context/CompanyResearchContext'
import { DeveloperModeProvider } from './context/DeveloperModeContext'
import AgentWorkbench from './pages/AgentWorkbench'

function App() {
  return (
    <DeveloperModeProvider>
      <FrameworkProvider>
        <CompanyResearchProvider>
          <div className="min-h-screen bg-gray-50">
            <AgentWorkbench />
          </div>
        </CompanyResearchProvider>
      </FrameworkProvider>
    </DeveloperModeProvider>
  )
}

export default App;
