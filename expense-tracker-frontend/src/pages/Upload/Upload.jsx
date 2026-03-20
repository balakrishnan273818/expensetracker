import { useState, useEffect } from "react";
import { uploadFile, getUploadHistory } from "../../api/upload";
import {
    UploadCloud,
    FileText,
    X,
    CheckCircle,
    XCircle,
    Loader2
} from "lucide-react";

import {
    BANKS,
    BANK_LIST,
    getBankLabel,
    getBankLogo
} from "../../utils/banks";

import "./upload.css";

export default function Upload() {
    const [file, setFile] = useState(null);
    const [bank, setBank] = useState("hdfc");
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // ✅ Load history from backend
    useEffect(() => {
        loadHistory();
    }, []);

    async function loadHistory() {
        try {
            setLoadingHistory(true);

            const data = await getUploadHistory();

            const formatted = data.map((item) => ({
                id: item.id,
                fileName: item.file_name,
                bank: item.bank,
                date: item.uploaded_at,
                size: formatFileSize(item.file_size),
                transactions: item.transactions_added,
                status: item.status
            }));

            setHistory(formatted);
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {
            setLoadingHistory(false);
        }
    }

    const handleUpload = async () => {
        if (!file) return alert("Select file");

        setUploading(true);
        setProgress(0);

        try {
            await uploadFile(file, bank, setProgress);

            // Refresh history from backend
            await loadHistory();

            setFile(null);
        } catch (err) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setFile(e.dataTransfer.files[0]);
    };

    function formatFileSize(bytes) {
        if (!bytes) return "0 KB";

        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;

        return `${(kb / 1024).toFixed(2)} MB`;
    }

    return (
        <div className="upload-container">

            {/* Breadcrumb */}
            <div className="breadcrumb">
                <span>Expense Tracker</span>
                <span className="separator">›</span>
                <span className="active">Upload</span>
            </div>

            {/* Title */}
            <h2 className="page-title">Upload Statement</h2>

            <div className="card">

                {/* Bank Selector */}
                <div className="bank-selector">
                    <label className="label">
                        Select Bank Account <span className="required">*</span>
                    </label>

                    <div className="bank-options">
                        {BANK_LIST.map((b) => (
                            <div
                                key={b.key}
                                className={`bank-option ${bank === b.key ? "active" : ""}`}
                                onClick={() => setBank(b.key)}
                            >
                                <img src={b.logo} alt="" />
                                <span>{b.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dropzone */}
                <div
                    className="dropzone"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <div className="upload-icon">
                        <UploadCloud size={42} strokeWidth={1.5} />
                    </div>

                    <p className="main-text">Drag & Drop Files Here</p>
                    <p className="sub-text">
                        or click to browse from your computer
                    </p>

                    <input
                        type="file"
                        hidden
                        id="fileInput"
                        onChange={(e) => setFile(e.target.files[0])}
                    />

                    <label htmlFor="fileInput" className="browse-btn">
                        Browse Files
                    </label>

                    <p className="formats">
                        Supported formats: Excel (.xlsx, .xls)
                    </p>
                </div>

                {/* File Preview */}
                {file && !uploading && (
                    <div className="file-preview">
                        <div className="file-left">
                            <FileText size={20} />
                            <span>{file.name}</span>
                        </div>

                        <button
                            className="remove-btn"
                            onClick={() => setFile(null)}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Upload Button */}
                <button
                    className="upload-btn"
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading ? "Uploading..." : "Upload"}
                </button>

                {/* Progress */}
                {uploading && file && (
                    <div className="progress-card">
                        <div className="file-info">
                            <span>{file.name}</span>
                            <span>{progress}%</span>
                        </div>

                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Upload History */}
            <div className="card">
                <h3 className="upload-history-title">
                    <strong>Upload History</strong>
                </h3>

                <table className="history-table">
                    <thead>
                    <tr>
                        <th>File Name</th>
                        <th>Bank</th>
                        <th>Upload Date & Time</th>
                        <th>Size</th>
                        <th>Transactions</th>
                        <th>Status</th>
                    </tr>
                    </thead>

                    <tbody>
                    {loadingHistory ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center" }}>
                                Loading...
                            </td>
                        </tr>
                    ) : history.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center" }}>
                                No uploads yet
                            </td>
                        </tr>
                    ) : (
                        history.map((h) => (
                            <tr key={h.id}>
                                <td>{h.fileName}</td>

                                <td className="bank-cell">
                                    <img src={getBankLogo(h.bank)} alt="" />
                                    {getBankLabel(h.bank)}
                                </td>

                                <td>{h.date}</td>
                                <td>{h.size}</td>
                                <td>{h.transactions} found</td>

                                <td>
                                        <span
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                color:
                                                    h.status === "success"
                                                        ? "#16a34a"
                                                        : h.status === "failed"
                                                            ? "#dc2626"
                                                            : "#f59e0b",
                                                fontWeight: 500
                                            }}
                                        >
                                            {h.status === "success" ? (
                                                <CheckCircle size={16} />
                                            ) : h.status === "failed" ? (
                                                <XCircle size={16} />
                                            ) : (
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            )}

                                            {h.status}
                                        </span>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}