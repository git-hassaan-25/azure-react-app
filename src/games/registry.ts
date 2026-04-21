import GridOnIcon from '@mui/icons-material/GridOn'
import MemoryIcon from '@mui/icons-material/Memory'
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi'
import CasinoIcon from '@mui/icons-material/Casino'
import PanToolIcon from '@mui/icons-material/PanTool'
import BoltIcon from '@mui/icons-material/Bolt'
import Grid4x4Icon from '@mui/icons-material/Grid4x4'
import AppsIcon from '@mui/icons-material/Apps'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import KeyboardIcon from '@mui/icons-material/Keyboard'
import type { SvgIconComponent } from '@mui/icons-material'

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface GameMeta {
  slug: string
  title: string
  tagline: string
  description: string
  icon: SvgIconComponent
  accent: string
  difficulty: Difficulty
  players: string
  tags: string[]
}

export const games: GameMeta[] = [
  {
    slug: 'tic-tac-toe',
    title: 'Tic Tac Toe',
    tagline: 'Classic 3-in-a-row',
    description:
      'Play head-to-head or challenge the unbeatable minimax AI. Track wins, draws, and streaks.',
    icon: GridOnIcon,
    accent: '#6C4BFF',
    difficulty: 'Easy',
    players: '1 or 2',
    tags: ['Strategy', 'Classic'],
  },
  {
    slug: 'memory-match',
    title: 'Memory Match',
    tagline: 'Test your recall',
    description:
      'Flip cards to find matching pairs. Multiple grid sizes and a move counter to sharpen your memory.',
    icon: MemoryIcon,
    accent: '#22c55e',
    difficulty: 'Medium',
    players: '1',
    tags: ['Memory', 'Puzzle'],
  },
  {
    slug: 'rock-paper-scissors',
    title: 'Rock Paper Scissors',
    tagline: 'Best of infinity',
    description:
      'The timeless duel against a CPU opponent. Simple, quick, and satisfying with animated results.',
    icon: SportsKabaddiIcon,
    accent: '#f59e0b',
    difficulty: 'Easy',
    players: '1',
    tags: ['Quick', 'Casual'],
  },
  {
    slug: 'number-guessing',
    title: 'Number Guessing',
    tagline: 'Higher or lower?',
    description:
      'Guess a secret number within a limited number of attempts. Pick a difficulty and beat your record.',
    icon: CasinoIcon,
    accent: '#FF4B8B',
    difficulty: 'Easy',
    players: '1',
    tags: ['Logic', 'Quick'],
  },
  {
    slug: 'whack-a-mole',
    title: 'Whack-a-Mole',
    tagline: 'Reflex frenzy',
    description:
      'Tap moles as fast as they appear. A timed challenge that rewards speed and accuracy.',
    icon: PanToolIcon,
    accent: '#ef4444',
    difficulty: 'Medium',
    players: '1',
    tags: ['Reflex', 'Timed'],
  },
  {
    slug: 'reaction-time',
    title: 'Reaction Time',
    tagline: 'How fast are you?',
    description:
      'Wait for green, then click. Five rounds give you an average reaction time in milliseconds.',
    icon: BoltIcon,
    accent: '#06b6d4',
    difficulty: 'Easy',
    players: '1',
    tags: ['Reflex', 'Benchmark'],
  },
  {
    slug: 'snake',
    title: 'Snake',
    tagline: 'Eat, grow, survive',
    description:
      'Guide the snake with arrow keys or swipes. Eat apples to grow — don’t hit the walls or yourself.',
    icon: Grid4x4Icon,
    accent: '#10b981',
    difficulty: 'Medium',
    players: '1',
    tags: ['Arcade', 'Classic'],
  },
  {
    slug: '2048',
    title: '2048',
    tagline: 'Slide and merge',
    description:
      'Combine matching tiles to climb the powers of two. Reach 2048 — or push far beyond.',
    icon: AppsIcon,
    accent: '#8b5cf6',
    difficulty: 'Hard',
    players: '1',
    tags: ['Puzzle', 'Strategy'],
  },
  {
    slug: 'simon-says',
    title: 'Simon Says',
    tagline: 'Follow the pattern',
    description:
      'Watch the sequence of colored lights and sounds, then repeat it back. Each round adds one more.',
    icon: LightbulbIcon,
    accent: '#f97316',
    difficulty: 'Medium',
    players: '1',
    tags: ['Memory', 'Classic'],
  },
  {
    slug: 'connect-four',
    title: 'Connect Four',
    tagline: 'Four in a row',
    description:
      'Drop discs into the grid and line up four in a row — horizontally, vertically, or diagonally.',
    icon: ViewColumnIcon,
    accent: '#eab308',
    difficulty: 'Medium',
    players: '1 or 2',
    tags: ['Strategy', 'Classic'],
  },
  {
    slug: 'typing-speed',
    title: 'Typing Speed',
    tagline: 'Words per minute',
    description:
      'Type the passage as fast and accurately as you can. Get your WPM and accuracy score instantly.',
    icon: KeyboardIcon,
    accent: '#0ea5e9',
    difficulty: 'Easy',
    players: '1',
    tags: ['Skill', 'Benchmark'],
  },
]

export const gameBySlug = (slug: string) =>
  games.find((g) => g.slug === slug)
