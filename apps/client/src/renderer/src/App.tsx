import { BrowserRouter, Routes, Route } from "react-router-dom"
import Welcome from "./pages/Welcome"
import Dashboard from "./pages/Dashboard"

function App(): React.JSX.Element {
  const port: number | null = window.api.getServerPort()
  const serverUrl = port ? `http://127.0.0.1:${port}`: null

  console.log('Server port:', port)
  console.log('Server URL:', serverUrl)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
