import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './components/ProtectedRoute.tsx'
import { PublicRoute } from './components/PublicRoute.tsx'
import { Navbar } from './components/layout/Navbar'
import { ThemeProvider } from './components/theme/ThemeProvider'
import { AuthProvider } from './context/AuthContext'
import { ConversationPage } from './pages/ConversationPage'
import { AssetDetailsPage } from './pages/AssetDetailsPage'
import { ExplorePage } from './pages/ExplorePage'
import { HistoryDetailsPage } from './pages/HistoryDetailsPage'
import { HistoryPage } from './pages/HistoryPage'
import { IPOPage } from './pages/IPOPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { MutualFundsPage } from './pages/MutualFundsPage'
import { RegisterPage } from './pages/RegisterPage'
import { StockDetailsPage } from './pages/StockDetailsPage'
import { StocksPage } from './pages/StocksPage'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-slate-100 text-slate-900 antialiased">
            <Navbar />
            <main className="min-h-[calc(100vh-80px)]">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/conversation/:conversationId" element={<ConversationPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/explore/stocks" element={<StocksPage />} />
                <Route path="/explore/ipos" element={<IPOPage />} />
                <Route path="/explore/mutual-funds" element={<MutualFundsPage />} />
                <Route path="/stocks/:stockId" element={<StockDetailsPage />} />
                <Route path="/ipos/:assetId" element={<AssetDetailsPage assetType="ipo" />} />
                <Route path="/mutual-funds/:assetId" element={<AssetDetailsPage assetType="mutual-fund" />} />
                <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                <Route path="/history/:historyId" element={<ProtectedRoute><HistoryDetailsPage /></ProtectedRoute>} />
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
