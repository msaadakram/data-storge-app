import { formatFileSize, formatDate, getFileType, getFileIcon } from '../utils/helpers'

function FileCard({
    file,
    isSelected,
    viewMode,
    onSelect,
    onPreview,
    onDownload,
    onDelete,
    onRename
}) {
    const type = getFileType(file.mimeType)
    const Icon = () => <span dangerouslySetInnerHTML={{ __html: getFileIcon(type) }} />

    if (viewMode === 'list') {
        return (
            <div className={`file-list-item glass-card ${isSelected ? 'selected' : ''}`}>
                <input
                    type="checkbox"
                    className="file-checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(file.id)}
                />
                <div className={`file-icon ${type}`}>
                    <Icon />
                </div>
                <div className="file-info">
                    <div className="file-name" title={file.filename}>{file.filename}</div>
                    <div className="file-meta">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{formatDate(file.uploadedAt)}</span>
                    </div>
                </div>
                <div className="file-actions">
                    <button className="btn btn-secondary" onClick={() => onPreview(file.id)} title="Preview">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </button>
                    <button className="btn btn-secondary" onClick={() => onRename(file)} title="Rename">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button className="btn btn-primary" onClick={() => onDownload(file.id)} title="Download">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </button>
                    <button className="btn btn-danger" onClick={() => onDelete(file.id)} title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={`file-card glass-card ${isSelected ? 'selected' : ''}`}>
            <div className="file-header">
                <input
                    type="checkbox"
                    className="file-checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(file.id)}
                    onClick={(e) => e.stopPropagation()}
                />
                <div className={`file-icon ${type}`}>
                    <Icon />
                </div>
                <div className="file-info">
                    <div className="file-name" title={file.filename}>{file.filename}</div>
                    <div className="file-meta">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{formatDate(file.uploadedAt)}</span>
                    </div>
                </div>
            </div>
            <div className="file-actions">
                <button className="btn btn-secondary" onClick={() => onPreview(file.id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    View
                </button>
                <button className="btn btn-primary" onClick={() => onDownload(file.id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                </button>
                <button className="btn btn-danger" onClick={() => onDelete(file.id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default FileCard
