import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import NotFound from './pages/NotFound'

const TicTacToe = lazy(() => import('./games/TicTacToe'))
const MemoryMatch = lazy(() => import('./games/MemoryMatch'))
const RockPaperScissors = lazy(() => import('./games/RockPaperScissors'))
const NumberGuessing = lazy(() => import('./games/NumberGuessing'))
const WhackAMole = lazy(() => import('./games/WhackAMole'))
const ReactionTime = lazy(() => import('./games/ReactionTime'))
const Snake = lazy(() => import('./games/Snake'))
const Game2048 = lazy(() => import('./games/Game2048'))
const SimonSays = lazy(() => import('./games/SimonSays'))
const ConnectFour = lazy(() => import('./games/ConnectFour'))
const TypingSpeed = lazy(() => import('./games/TypingSpeed'))

function PageFallback() {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route
          path="games/tic-tac-toe"
          element={
            <Suspense fallback={<PageFallback />}>
              <TicTacToe />
            </Suspense>
          }
        />
        <Route
          path="games/memory-match"
          element={
            <Suspense fallback={<PageFallback />}>
              <MemoryMatch />
            </Suspense>
          }
        />
        <Route
          path="games/rock-paper-scissors"
          element={
            <Suspense fallback={<PageFallback />}>
              <RockPaperScissors />
            </Suspense>
          }
        />
        <Route
          path="games/number-guessing"
          element={
            <Suspense fallback={<PageFallback />}>
              <NumberGuessing />
            </Suspense>
          }
        />
        <Route
          path="games/whack-a-mole"
          element={
            <Suspense fallback={<PageFallback />}>
              <WhackAMole />
            </Suspense>
          }
        />
        <Route
          path="games/reaction-time"
          element={
            <Suspense fallback={<PageFallback />}>
              <ReactionTime />
            </Suspense>
          }
        />
        <Route
          path="games/snake"
          element={
            <Suspense fallback={<PageFallback />}>
              <Snake />
            </Suspense>
          }
        />
        <Route
          path="games/2048"
          element={
            <Suspense fallback={<PageFallback />}>
              <Game2048 />
            </Suspense>
          }
        />
        <Route
          path="games/simon-says"
          element={
            <Suspense fallback={<PageFallback />}>
              <SimonSays />
            </Suspense>
          }
        />
        <Route
          path="games/connect-four"
          element={
            <Suspense fallback={<PageFallback />}>
              <ConnectFour />
            </Suspense>
          }
        />
        <Route
          path="games/typing-speed"
          element={
            <Suspense fallback={<PageFallback />}>
              <TypingSpeed />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
