import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import LoginScreen from './components/LoginScreen'
import Dashboard from './components/Dashboard'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const handleLogin = () => {
        setIsAuthenticated(true)
    }

    const handleLogout = () => {
        setIsAuthenticated(false)
    }

    return (
        <>
            {/* Background Animation */}
            <div className="bg-animation">
                <div className="bg-gradient"></div>
                <div className="bg-particles"></div>
            </div>

            {/* Main Content */}
            {!isAuthenticated ? (
                <LoginScreen onLogin={handleLogin} />
            ) : (
                <Dashboard onLogout={handleLogout} />
            )}

            {/* Toast Notifications */}
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#1a1a1a',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                    },
                    success: {
                        iconTheme: {
                            primary: '#22c55e',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </>
    )
}

export default App
