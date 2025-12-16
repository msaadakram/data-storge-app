import FileCard from './FileCard'
import { formatFileSize, formatDate, getFileType, getFileIcon } from '../utils/helpers'

function FileList({
    files,
    loading,
    viewMode,
    selectedFiles,
    onSelect,
    onPreview,
    onDownload,
    onDelete,
    onRename
}) {
    if (loading) {
        return (
            <section className="files-section">
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <div className="spinner"></div>
                </div>
            </section>
        )
    }

    if (files.length === 0) {
        return (
            <section className="files-section">
                <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                    </svg>
                    <h4>No files found</h4>
                    <p>Upload your first file to get started</p>
                </div>
            </section>
        )
    }

    return (
        <section className="files-section">
            <div className="section-header">
                <h3>Your Files</h3>
                <span className="file-count">{files.length} file{files.length !== 1 ? 's' : ''}</span>
            </div>

            {viewMode === 'grid' ? (
                <div className="files-grid">
                    {files.map(file => (
                        <FileCard
                            key={file.id}
                            file={file}
                            isSelected={selectedFiles.includes(file.id)}
                            viewMode="grid"
                            onSelect={onSelect}
                            onPreview={onPreview}
                            onDownload={onDownload}
                            onDelete={onDelete}
                            onRename={onRename}
                        />
                    ))}
                </div>
            ) : (
                <div className="files-list">
                    {files.map(file => (
                        <FileCard
                            key={file.id}
                            file={file}
                            isSelected={selectedFiles.includes(file.id)}
                            viewMode="list"
                            onSelect={onSelect}
                            onPreview={onPreview}
                            onDownload={onDownload}
                            onDelete={onDelete}
                            onRename={onRename}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

export default FileList
