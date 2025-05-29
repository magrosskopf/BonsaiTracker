import React from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function BonsaiDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [bonsai, setBonsai] = useState(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/bonsais/${id}`) 
        .then((res) => res.json())
        .then((data) => {
          setBonsai(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !id) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      const updatedBonsai = await fetch(`/api/bonsais/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: [...(bonsai.images || []), data.filePath] }),
      }).then((res) => res.json());

      setBonsai(updatedBonsai);
      setUploadStatus("Bild erfolgreich hochgeladen.");
    } else {
      setUploadStatus("Upload fehlgeschlagen.");
    }
  };

  if (loading) {
    return <p>Lade Bonsai-Daten...</p>;
  }

  if (!bonsai) {
    return <p>Bonsai nicht gefunden.</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">{bonsai.name}</h1>
      <p>Standort: {bonsai.location}</p>
      <p>Art: {bonsai.species}</p>
      <p>Alter: {bonsai.age} Jahre</p>
      <p>Notizen: {bonsai.notes || "Keine Notizen"}</p>
      <div className="mt-4">
        <h2 className="text-2xl">Bilder</h2>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {bonsai.images?.map((image: string, index: number) => (
            <img key={index} src={image} alt={`Bonsai Bild ${index + 1}`} className="w-full h-auto" />
          ))}
        </div>
      </div>
      <div className="mt-4">
        <input type="file" onChange={handleFileChange} />
        <button
          onClick={handleUpload}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Bild hochladen
        </button>
        {uploadStatus && <p className="mt-2">{uploadStatus}</p>}
      </div>
    </div>
  );
}
