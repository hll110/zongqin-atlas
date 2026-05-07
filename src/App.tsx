import { Routes, Route } from 'react-router'
import { Suspense, lazy } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoadingScreen from './components/LoadingScreen'

const Home = lazy(() => import('./pages/Home'))
const GenealogyTree = lazy(() => import('./pages/GenealogyTree'))
const SmartQuery = lazy(() => import('./pages/SmartQuery'))
const Categories = lazy(() => import('./pages/Categories'))
const RegionalDiff = lazy(() => import('./pages/RegionalDiff'))
const QuickRef = lazy(() => import('./pages/QuickRef'))
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="pt-16">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tree" element={<GenealogyTree />} />
            <Route path="/query" element={<SmartQuery />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/regional" element={<RegionalDiff />} />
            <Route path="/quickref" element={<QuickRef />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
