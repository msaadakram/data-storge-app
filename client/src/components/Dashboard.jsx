import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import FileUpload from './FileUpload'
import FileList from './FileList'
import FilePreview from './FilePreview'
import PasswordModal from './PasswordModal'
import RenameModal from './RenameModal'
import { formatFileSize, formatDate, getFileType } from '../utils/helpers'

function Dashboard({ onLogout }) {
    const [files, setFiles] = useState([])
    const [filteredFiles, setFilteredFiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [sortBy, setSortBy] = useState('date-desc')
    const [viewMode, setViewMode] = useState('grid')
    const [selectedFiles, setSelectedFiles] = useState([])
    const [previewFile, setPreviewFile] = useState(null)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [renameFile, setRenameFile] = useState(null)
    const [uploadQueue, setUploadQueue] = useState([])

    // Load files on mount
    useEffect(() => {
        loadFiles()
    }, [])

    // Filter and sort files
    useEffect(() => {
        let result = [...files]

        // Search filter
        if (searchQuery) {
            result = result.filter(file =>
                file.filename.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Type filter
        if (filterType !== 'all') {
            result = result.filter(file => getFileType(file.mimeType) === filterType)
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.uploadedAt) - new Date(a.uploadedAt)
                case 'date-asc':
                    return new Date(a.uploadedAt) - new Date(b.uploadedAt)
                case 'name-asc':
                    return a.filename.localeCompare(b.filename)
                case 'name-desc':
                    return b.filename.localeCompare(a.filename)
                case 'size-desc':
                    return b.size - a.size
                case 'size-asc':
                    return a.size - b.size
                default:
                    return 0
            }
        })

        setFilteredFiles(result)
    }, [files, searchQuery, filterType, sortBy])

    const loadFiles = async () => {
        try {
            const response = await axios.get('/api/files')
            if (response.data.success) {
                setFiles(response.data.files)
            }
        } catch (error) {
            toast.error('Failed to load files')
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = useCallback(async (fileList) => {
        const filesArray = Array.from(fileList)

        for (const file of filesArray) {
            const uploadId = Date.now() + Math.random()

            setUploadQueue(prev => [...prev, {
                id: uploadId,
                name: file.name,
                progress: 0,
                status: 'uploading'
            }])

            const formData = new FormData()
            formData.append('file', file)

            try {
                await axios.post('/api/files/upload', formData, {
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100)
                        setUploadQueue(prev => prev.map(item =>
                            item.id === uploadId ? { ...item, progress: percent } : item
                        ))
                    }
                })

                setUploadQueue(prev => prev.map(item =>
                    item.id === uploadId ? { ...item, status: 'success', progress: 100 } : item
                ))

                toast.success(`${file.name} uploaded successfully`)
            } catch (error) {
                setUploadQueue(prev => prev.map(item =>
                    item.id === uploadId ? { ...item, status: 'error' } : item
                ))
                toast.error(`Failed to upload ${file.name}`)
            }
        }

        // Reload files after all uploads
        await loadFiles()

        // Clear completed uploads after delay
        setTimeout(() => {
            setUploadQueue(prev => prev.filter(item => item.status === 'uploading'))
        }, 3000)
    }, [])

    const handleDownload = async (fileId) => {
        try {
            const response = await axios.get(`/api/files/download?id=${fileId}`)
            if (response.data.success) {
                const link = document.createElement('a')
                link.href = response.data.url
                link.download = response.data.filename
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                toast.success('Download started')
            }
        } catch (error) {
            toast.error('Download failed')
        }
    }

    const handleDelete = async (fileId) => {
        if (!confirm('Are you sure you want to delete this file?')) return

        try {
            const response = await axios.delete(`/api/files/[id]?id=${fileId}`)
            if (response.data.success) {
                setFiles(prev => prev.filter(f => f.id !== fileId))
                setSelectedFiles(prev => prev.filter(id => id !== fileId))
                toast.success('File deleted')
            }
        } catch (error) {
            toast.error('Delete failed')
        }
    }

    const handleBatchDelete = async () => {
        if (!confirm(`Delete ${selectedFiles.length} files?`)) return

        let deleted = 0
        for (const fileId of selectedFiles) {
            try {
                await axios.delete(`/api/files/[id]?id=${fileId}`)
                deleted++
            } catch (error) {
                console.error('Failed to delete:', fileId)
            }
        }

        await loadFiles()
        setSelectedFiles([])
        toast.success(`${deleted} files deleted`)
    }

    const handlePreview = async (fileId) => {
        try {
            const response = await axios.get(`/api/files/preview?id=${fileId}`)
            if (response.data.success) {
                setPreviewFile({
                    id: fileId,
                    url: response.data.url,
                    filename: response.data.filename,
                    mimeType: response.data.mimeType
                })
            }
        } catch (error) {
            toast.error('Failed to load preview')
        }
    }

    const handleSelectFile = (fileId) => {
        setSelectedFiles(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        )
    }

    const handleSelectAll = () => {
        if (selectedFiles.length === filteredFiles.length) {
            setSelectedFiles([])
        } else {
            setSelectedFiles(filteredFiles.map(f => f.id))
        }
    }

    const totalSize = files.reduce((sum, f) => sum + f.size, 0)

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <div className="header-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h2>File Vault</h2>
                </div>
                <div className="header-actions">
                    <div className="storage-info">
                        <span className="storage-text">
                            Storage: <span className="storage-value">{formatFileSize(totalSize)}</span>
                        </span>
                        <span className="storage-text">
                            Files: <span className="storage-value">{files.length}</span>
                        </span>
                    </div>
                    <button
                        className="btn btn-ghost"
                        onClick={() => setShowPasswordModal(true)}
                        title="Change Password"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                    </button>
                    <button className="btn btn-ghost" onClick={onLogout} title="Lock">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </header>

            <main className="main-content">
                {/* Upload Section */}
                <FileUpload onUpload={handleUpload} uploadQueue={uploadQueue} />

                {/* Toolbar */}
                <div className="toolbar">
                    <div className="search-box">
                        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        {['all', 'image', 'video', 'audio', 'pdf', 'doc'].map(type => (
                            <button
                                key={type}
                                className={`filter-btn ${filterType === type ? 'active' : ''}`}
                                onClick={() => setFilterType(type)}
                            >
                                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    <select
                        className="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="size-desc">Largest First</option>
                        <option value="size-asc">Smallest First</option>
                    </select>

                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                            </svg>
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <line x1="8" y1="6" x2="21" y2="6" />
                                <line x1="8" y1="12" x2="21" y2="12" />
                                <line x1="8" y1="18" x2="21" y2="18" />
                                <line x1="3" y1="6" x2="3.01" y2="6" />
                                <line x1="3" y1="12" x2="3.01" y2="12" />
                                <line x1="3" y1="18" x2="3.01" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Batch Actions */}
                {selectedFiles.length > 0 && (
                    <div className="batch-actions">
                        <span className="selected-count">
                            <strong>{selectedFiles.length}</strong> file(s) selected
                        </span>
                        <button className="btn btn-secondary" onClick={handleSelectAll}>
                            {selectedFiles.length === filteredFiles.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <button className="btn btn-danger" onClick={handleBatchDelete}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Delete Selected
                        </button>
                    </div>
                )}

                {/* Files Section */}
                <FileList
                    files={filteredFiles}
                    loading={loading}
                    viewMode={viewMode}
                    selectedFiles={selectedFiles}
                    onSelect={handleSelectFile}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                    onRename={(file) => setRenameFile(file)}
                />
            </main>

            {/* Modals */}
            {previewFile && (
                <FilePreview
                    file={previewFile}
                    onClose={() => setPreviewFile(null)}
                    onDownload={() => handleDownload(previewFile.id)}
                />
            )}

            {showPasswordModal && (
                <PasswordModal onClose={() => setShowPasswordModal(false)} />
            )}

            {renameFile && (
                <RenameModal
                    file={renameFile}
                    onClose={() => setRenameFile(null)}
                    onSuccess={() => {
                        setRenameFile(null)
                        loadFiles()
                    }}
                />
            )}
        </div>
    )
}

export default Dashboard
