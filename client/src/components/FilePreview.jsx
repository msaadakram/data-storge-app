function FilePreview({ file, onClose, onDownload }) {
    const renderPreview = () => {
        const { mimeType, url, filename } = file

        if (mimeType.startsWith('image/')) {
            return <img src={url} alt={filename} />
        }

        if (mimeType.startsWith('video/')) {
            return <video src={url} controls autoPlay />
        }

        if (mimeType.startsWith('audio/')) {
            return <audio src={url} controls autoPlay />
        }

        if (mimeType === 'application/pdf') {
            return <iframe src={url} title={filename} />
        }

        return (
            <div className="preview-unsupported">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                </svg>
                <p>Preview not available for this file type.<br />Click Download to view the file.</p>
            </div>
        )
    }

    return (
        <div className="modal-overlay">
            <div className="modal-backdrop" onClick={onClose}></div>
            <div className="modal-content glass-card large">
                <div className="modal-header">
                    <h3>{file.filename}</h3>
                    <button className="btn-icon" onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="modal-body preview-body">
                    <div className="preview-container">
                        {renderPreview()}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    <button className="btn btn-primary" onClick={onDownload}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FilePreview
