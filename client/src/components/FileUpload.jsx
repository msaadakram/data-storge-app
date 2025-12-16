import { useState, useRef, useCallback } from 'react'

function FileUpload({ onUpload, uploadQueue }) {
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef(null)

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setIsDragging(false)
        onUpload(e.dataTransfer.files)
    }, [onUpload])

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleChange = (e) => {
        if (e.target.files.length > 0) {
            onUpload(e.target.files)
            e.target.value = ''
        }
    }

    return (
        <section className="upload-section">
            <div
                className={`dropzone glass-card ${isDragging ? 'dragover' : ''}`}
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="dropzone-content">
                    <div className="dropzone-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <h3>Drop files here or click to upload</h3>
                    <p>Supports all file types up to 100MB</p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    hidden
                    onChange={handleChange}
                />
            </div>

            {/* Upload Queue */}
            {uploadQueue.length > 0 && (
                <div className="upload-queue">
                    {uploadQueue.map(item => (
                        <div key={item.id} className="upload-item glass-card">
                            <div className="upload-item-info">
                                <div className="upload-item-name">{item.name}</div>
                                <div className="upload-item-progress">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${item.progress}%` }}
                                        ></div>
                                    </div>
                                    <span className="progress-text">{item.progress}%</span>
                                </div>
                            </div>
                            <span className={`upload-status ${item.status}`}>
                                {item.status === 'uploading' && 'Uploading'}
                                {item.status === 'success' && 'Done'}
                                {item.status === 'error' && 'Failed'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export default FileUpload
