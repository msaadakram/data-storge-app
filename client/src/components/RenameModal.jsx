import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

function RenameModal({ file, onClose, onSuccess }) {
    const [newName, setNewName] = useState(file.filename)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        if (!newName.trim()) {
            setError('Please enter a file name')
            return
        }

        if (newName === file.filename) {
            onClose()
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await axios.put(`/api/files/${file.id}/rename`, {
                newName: newName.trim()
            })

            if (response.data.success) {
                toast.success('File renamed successfully')
                onSuccess()
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to rename file')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit()
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-backdrop" onClick={onClose}></div>
            <div className="modal-content glass-card">
                <div className="modal-header">
                    <h3>Rename File</h3>
                    <button className="btn-icon" onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>File Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={newName}
                            onChange={(e) => {
                                setNewName(e.target.value)
                                setError('')
                            }}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RenameModal
