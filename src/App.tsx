import { PokerProvider, usePoker } from './contexts/PokerContext'
import Home from './components/Home'
import PokerRoom from './components/PokerRoom'
import './App.css'

function AppContent() {
  const { currentRoom } = usePoker()

  return (
    <>
      {!currentRoom ? <Home /> : <PokerRoom />}
    </>
  )
}

function App() {
  return (
    <PokerProvider>
      <AppContent />
    </PokerProvider>
  )
}

export default App
