function App(): React.JSX.Element {
  const port: number | null = window.api.getServerPort()
  const serverUrl = port ? `http://127.0.0.1:${port}`: null

  console.log('Server port:', port)
  console.log('Server URL:', serverUrl)

  return (
    <div>
      <h1>Renaissance</h1>
      <p>Server port: {port ?? 'null'}</p>
      <p>Server URL: {serverUrl ?? 'null'}</p>
    </div>
  )
}

export default App
