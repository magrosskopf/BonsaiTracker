import { useState } from "react";
import { useRouter } from "next/router";
export default function Upload() {
  const router = useRouter();
  const { id } = router.query; 
  const [file, setFile] = useState<File | null>(null);
  const [bonsaiId, setBonsaiId] = useState<string>(id ? id.toString() : ""); // Add bonsaiId state
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !bonsaiId) {
      setUploadStatus("Bitte Datei und Bonsai-ID angeben.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    console.log("bonsaiid", bonsaiId);
    formData.append("bonsaiId", bonsaiId); // Include bonsaiId in the request

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setUploadStatus(`Upload erfolgreich: ${data.filePath}`);
    } else {
      const errorData = await res.json();
      setUploadStatus(`Upload fehlgeschlagen: ${errorData.error}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Bild hochladen</h1>
      <input
        type="text"
        placeholder="Bonsai-ID"
        value={bonsaiId}
        onChange={(e) => setBonsaiId(e.target.value)}
        className="mt-4 px-2 py-1 border rounded"
      />
      <input
        type="file"
        onChange={handleFileChange}
        className="mt-4"
      />
      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Hochladen
      </button>
      {uploadStatus && <p className="mt-4">{uploadStatus}</p>}
    </div>
  );
}
