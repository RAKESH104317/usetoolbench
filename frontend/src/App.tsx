import { ChangeEvent, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function uploadAndConvert(file: File) {
  const form = new FormData();
  form.append('file', file);
  const uploadResponse = await fetch(`${API_BASE}/files/upload`, { method: 'POST', body: form });
  if (!uploadResponse.ok) {
    throw new Error('Upload failed');
  }
  const record = await uploadResponse.json();

  const convertResponse = await fetch(`${API_BASE}/pdf/to-word`, {
    method: 'POST',
    body: form,
  });

  if (!convertResponse.ok) {
    throw new Error('Document processing failed');
  }
  return await convertResponse.json();
}

export default function App() {
  const [status, setStatus] = useState('Ready');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus('Uploading and processing...');
    try {
      const result = await uploadAndConvert(file);
      setStatus('Completed');
      setDownloadUrl(result.download_url || result.output_file || null);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Processing failed');
    }
  };

  return (
    <main className="app-shell">
      <section className="card">
        <span className="eyebrow">Open-source PDF processing</span>
        <h1>PDFPro</h1>
        <p>Upload a PDF and convert it through our local FastAPI backend.</p>

        <label className="upload-box">
          <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" onChange={handleFileChange} />
          <span>Select a file</span>
        </label>

        <div className="status-box">{status}</div>

        {downloadUrl ? (
          <a className="download-link" href={`${API_BASE}${downloadUrl}`} target="_blank" rel="noreferrer">
            Download output
          </a>
        ) : null}
      </section>
    </main>
  );
}
