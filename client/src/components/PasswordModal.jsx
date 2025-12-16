import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

function PasswordModal({ onClose }) {
    const [currentPin, setCurrentPin] = useState(['', '', '', ''])
    const [newPin, setNewPin] = useState(['', '', '', ''])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const [activeSection, setActiveSection] = useState('current') // 'current' or 'new'
    const currentInputRefs = useRef([])
    const newInputRefs = useRef([])

    useEffect(() => {
        currentInputRefs.current[0]?.focus()
    }, [])

    // Auto-move to new password when current is complete
    useEffect(() => {
        if (currentPin.join('').length === 4 && activeSection === 'current') {
            setActiveSection('new')
            setTimeout(() => newInputRefs.current[0]?.focus(), 100)
        }
    }, [currentPin, activeSection])

    // Auto-submit when both are complete
    useEffect(() => {
        if (currentPin.join('').length === 4 && newPin.join('').length === 4 && !loading) {
            handleSubmit()
        }
    }, [newPin])

    const handlePinChange = (pin, setPin, refs, nextRefs, index, value) => {
        if (!/^\d*$/.test(value)) return

        const newPinValue = [...pin]
        newPinValue[index] = value.slice(-1)
        setPin(newPinValue)
        setError('')
        setSuccess('')

        if (value && index < 3) {
            refs.current[index + 1]?.focus()
        } else if (value && index === 3 && nextRefs) {
            // Move to next section
            setTimeout(() => nextRefs.current[0]?.focus(), 50)
        }
    }

    const handleKeyDown = (pin, setPin, refs, prevRefs, index, e) => {
        if (e.key === 'Backspace') {
            if (!pin[index] && index > 0) {
                const newPinValue = [...pin]
                newPinValue[index - 1] = ''
                setPin(newPinValue)
                refs.current[index - 1]?.focus()
            } else if (!pin[index] && index === 0 && prevRefs) {
                // Move to previous section
                const prevPin = prevRefs === currentInputRefs ? currentPin : newPin
                if (prevPin.join('').length > 0) {
                    prevRefs.current[3]?.focus()
                    setActiveSection(prevRefs === currentInputRefs ? 'current' : 'new')
                }
            } else {
                const newPinValue = [...pin]
                newPinValue[index] = ''
                setPin(newPinValue)
            }
            setError('')
        }

        if (e.key === 'Enter') {
            handleSubmit()
        }
    }

    const handleSubmit = async () => {
        const current = currentPin.join('')
        const newPass = newPin.join('')

        if (current.length !== 4) {
            setError('Please enter current password')
            currentInputRefs.current[0]?.focus()
            return
        }

        if (newPass.length !== 4) {
            setError('Please enter new password')
            newInputRefs.current[0]?.focus()
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await axios.post('/api/auth/change-password', {
                currentPassword: current,
                newPassword: newPass
            })

            if (response.data.success) {
                setSuccess('Password changed successfully')
                toast.success('Password changed successfully')
                setTimeout(() => onClose(), 1500)
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password')
            // Clear and focus current password
            setCurrentPin(['', '', '', ''])
            setNewPin(['', '', '', ''])
            setActiveSection('current')
            setTimeout(() => currentInputRefs.current[0]?.focus(), 100)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-backdrop" onClick={onClose}></div>
            <div className="modal-content glass-card">
                <div className="modal-header">
                    <h3>Change Password</h3>
                    <button className="btn-icon" onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>Current Password</label>
                        <div className="pin-inputs small">
                            {currentPin.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => currentInputRefs.current[index] = el}
                                    type="password"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handlePinChange(currentPin, setCurrentPin, currentInputRefs, newInputRefs, index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(currentPin, setCurrentPin, currentInputRefs, null, index, e)}
                                    onFocus={() => setActiveSection('current')}
                                    className={`pin-input ${digit ? 'filled' : ''}`}
                                    inputMode="numeric"
                                    autoComplete="off"
                                    disabled={loading}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <div className="pin-inputs small">
                            {newPin.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => newInputRefs.current[index] = el}
                                    type="password"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handlePinChange(newPin, setNewPin, newInputRefs, null, index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(newPin, setNewPin, newInputRefs, currentInputRefs, index, e)}
                                    onFocus={() => setActiveSection('new')}
                                    className={`pin-input ${digit ? 'filled' : ''}`}
                                    inputMode="numeric"
                                    autoComplete="off"
                                    disabled={loading}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="login-status" style={{ marginTop: '1rem' }}>
                        {loading && (
                            <div className="loading-indicator">
                                <div className="spinner-small"></div>
                                <span>Saving...</span>
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
                        {success && !loading && (
                            <div className="success-indicator">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>{success}</span>
                            </div>
                        )}
                        {!loading && !error && !success && (
                            <div className="hint-text">
                                Password will save automatically when complete
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={loading || currentPin.join('').length !== 4 || newPin.join('').length !== 4}
                    >
                        {loading ? 'Saving...' : 'Save Password'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PasswordModal
