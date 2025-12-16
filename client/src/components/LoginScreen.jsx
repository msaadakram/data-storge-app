import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

function LoginScreen({ onLogin }) {
    const [pin, setPin] = useState(['', '', '', ''])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [shake, setShake] = useState(false)
    const inputRefs = useRef([])

    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    // Auto-submit when all 4 digits are entered
    useEffect(() => {
        const password = pin.join('')
        if (password.length === 4 && !loading) {
            verifyPassword(password)
        }
    }, [pin])

    const verifyPassword = async (password) => {
        setLoading(true)
        setError('')

        try {
            const response = await axios.post('/api/auth/verify', { password })
            if (response.data.success) {
                onLogin()
            }
        } catch (err) {
            // Trigger shake animation
            setShake(true)
            setError(err.response?.data?.message || 'Invalid password')

            // Clear and reset after shake animation
            setTimeout(() => {
                setShake(false)
                setPin(['', '', '', ''])
                inputRefs.current[0]?.focus()
            }, 600)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return

        const newPin = [...pin]
        newPin[index] = value.slice(-1)
        setPin(newPin)
        setError('')

        // Move to next input if value entered
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!pin[index] && index > 0) {
                // Move to previous input and clear it
                const newPin = [...pin]
                newPin[index - 1] = ''
                setPin(newPin)
                inputRefs.current[index - 1]?.focus()
            } else {
                // Clear current input
                const newPin = [...pin]
                newPin[index] = ''
                setPin(newPin)
            }
            setError('')
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
        if (pastedData.length === 4) {
            const newPin = pastedData.split('')
            setPin(newPin)
        }
    }

    const handleFocus = (index) => {
        // Select the input content on focus
        inputRefs.current[index]?.select()
    }

    return (
        <div className="login-screen">
            <div className="glass-card login-card">
                <div className="logo">
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h1>Secure Vault</h1>
                    <p className="subtitle">Enter your 4-digit PIN to access</p>
                </div>

                <div className="pin-container">
                    <div className={`pin-inputs ${shake ? 'shake' : ''}`}>
                        {pin.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="password"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                onFocus={() => handleFocus(index)}
                                className={`pin-input ${digit ? 'filled' : ''} ${error ? 'error' : ''}`}
                                inputMode="numeric"
                                autoComplete="off"
                                disabled={loading}
                            />
                        ))}
                    </div>
                    <div className="pin-dots">
                        {pin.map((digit, index) => (
                            <span key={index} className={`pin-dot ${digit ? 'active' : ''}`}></span>
                        ))}
                    </div>
                </div>

                {/* Status indicator */}
                <div className="login-status">
                    {loading && (
                        <div className="loading-indicator">
                            <div className="spinner-small"></div>
                            <span>Verifying...</span>
                        </div>
                    )}
                    {error && !loading && (
                        <div className="error-indicator">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}
                    {!loading && !error && (
                        <div className="hint-text">
                            PIN will auto-verify when complete
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LoginScreen
