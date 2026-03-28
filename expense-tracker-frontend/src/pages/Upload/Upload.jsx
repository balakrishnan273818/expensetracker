import { useState, useEffect } from "react";
import { uploadFile, getUploadHistory } from "../../api/upload";
import { formatDateTime } from "../../utils/date";
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

    const [bank, setBank] = useState("idfc");

    const [uploading, setUploading] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const [activeUploadId, setActiveUploadId] = useState(null);
    const [totalTxns, setTotalTxns] = useState(null);
    const [uploadCompleted, setUploadCompleted] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    useEffect(() => {
        if (!activeUploadId) return;

        const interval = setInterval(() => {
            loadHistory();
        }, 2000);

        return () => clearInterval(interval);
    }, [activeUploadId]);

    async function loadHistory() {
        try {
            const data = await getUploadHistory();

            const formatted = data.map((item) => ({
                id: item.id,
                fileName: item.file_name,
                bank: item.bank,
                date: formatDateTime(item.uploaded_at),
                size: formatFileSize(item.file_size),
                transactions: item.transactions_added,
                total: item.total_records,
                processed: item.processed_records,
                status: item.status
            }));

            // ✅ Restore active upload after refresh
            let currentUploadId = activeUploadId;

            if (!currentUploadId) {
                const processingUpload = formatted.find(
                    (h) => h.status === "processing"
                );

                if (processingUpload) {
                    currentUploadId = processingUpload.id;
                    setActiveUploadId(processingUpload.id);
                }
            }

            setHistory((prev) => {
                const map = new Map(prev.map((h) => [h.id, h]));

                formatted.forEach((item) => {
                    const existing = map.get(item.id);

                    if (
                        !existing ||
                        existing.status !== item.status ||
                        existing.transactions !== item.transactions ||
                        existing.processed !== item.processed
                    ) {
                        map.set(item.id, item);
                    }
                });

                return Array.from(map.values()).sort((a, b) => b.id - a.id);
            });

            // keep existing success logic
            if (currentUploadId) {
                const current = formatted.find(
                    (h) => h.id === currentUploadId
                );

                if (current) {
                    const inserted = current.transactions || 0;

                    // existing logic
                    if (current.status === "success" && !totalTxns) {
                        setTotalTxns(inserted);
                    }

                    // ✅ NEW: completion acknowledgement (minimal change)
                    if (current.status === "success" && !uploadCompleted) {
                        setUploadCompleted(true);

                        setTimeout(() => {
                            alert("Upload completed successfully");

                            // remove progress bar
                            setActiveUploadId(null);

                            // reset flag
                            setUploadCompleted(false);
                        }, 100);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {
            setLoadingHistory(false);
        }
    }

    const handleUpload = async () => {
        if (!file) return alert("Select file");

        setUploading(true);
        setTotalTxns(null);

        try {
            const res = await uploadFile(file, bank);

            if (res?.id) {
                setActiveUploadId(res.id);
            }

            setTimeout(loadHistory, 1000);

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

    function formatDateTime(dateStr) {
        if (!dateStr) return "-";

        const date = new Date(dateStr);

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    }

    // ✅ DERIVED PROGRESS (NO STATE, NO FLICKER)
    const activeUpload = history.find(
        (h) => h.id === activeUploadId
    );

    const progress =
        activeUpload && activeUpload.total > 0
            ? Math.min(
                Math.round(
                    ((activeUpload.processed || 0) /
                        activeUpload.total) *
                    100
                ),
                100
            )
            : 0;

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
                            <span>{file?.name || "Uploading..."}</span>
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
                {activeUploadId && (
                    <div className="progress-card">
                        <div className="file-info">
                            <span>
                                {history.find(h => h.id === activeUploadId)?.fileName || "Uploading..."}
                            </span>
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