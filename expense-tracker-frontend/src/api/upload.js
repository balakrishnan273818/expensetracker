const API_BASE = "http://localhost:5000";

export async function uploadFile(file, bank, setProgress) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bank", bank);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", `${API_BASE}/api/upload`);

        // ✅ SAFE: only call if provided
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && typeof setProgress === "function") {
                const percent = Math.round(
                    (event.loaded * 100) / event.total
                );
                setProgress(percent);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject(new Error("Upload failed"));
            }
        };

        xhr.onerror = () => {
            reject(new Error("Network error"));
        };

        xhr.send(formData);
    });
}

export async function getUploadHistory() {
    const res = await fetch(`${API_BASE}/api/upload/history`);

    if (!res.ok) {
        throw new Error("Failed to fetch upload history");
    }

    return res.json();
}