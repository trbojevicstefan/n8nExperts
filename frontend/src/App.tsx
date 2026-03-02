import { AuthProvider } from "@/context/AuthProvider"
import { AppRouter } from "@/routes"

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
