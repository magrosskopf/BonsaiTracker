import React from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function SubEntries() {
  const router = useRouter();
  const { id } = router.query;
  const [subEntries, setSubEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ date: "", notes: "", images: [] });
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/subentries?bonsaiId=${id}`)
        .then((res) => res.json())
        .then((data) => {
          setSubEntries(data);
          setLoading(false);
        })
        .catch(() => {
          setError("Fehler beim Laden der Sub-Einträge.");
          setLoading(false);
        });
    }
  }, [id]);

  const handleAddSubEntry = async () => {
    if (!newEntry.date) {
      setUploadStatus("Bitte ein gültiges Datum angeben.");
      return;
    }
    if (newEntry.notes.length > 500) {
      setUploadStatus("Notizen dürfen maximal 500 Zeichen lang sein.");
      return;
    }
    const res = await fetch("/api/subentries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newEntry, bonsaiId: id }),
    });

    if (res.ok) {
      const addedEntry = await res.json();
      setSubEntries((prev) => [...prev, addedEntry]);
      setNewEntry({ date: "", notes: "", images: [] });
      setUploadStatus("Sub-Eintrag erfolgreich hinzugefügt.");
    } else {
      setUploadStatus("Fehler beim Hinzufügen des Sub-Eintrags.");
    }
  };

  if (loading) {
    return <p>Lade Sub-Einträge...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Sub-Einträge</h1>
      <ul className="mt-4">
        {subEntries.map((entry) => (
          <li key={entry.id} className="border p-4 mb-2">
            <p>Datum: {new Date(entry.date).toLocaleDateString()}</p>
            <p>Notizen: {entry.notes || "Keine Notizen"}</p>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {entry.images?.map((image, index) => (
                <img key={index} src={image} alt={`Sub-Eintrag Bild ${index + 1}`} className="w-full h-auto" />
              ))}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <h2 className="text-2xl">Neuen Sub-Eintrag hinzufügen</h2>
        <input
          type="date"
          value={newEntry.date}
          onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
          className="mt-2"
        />
        <textarea
          placeholder="Notizen"
          value={newEntry.notes}
          onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
          className="mt-2 border p-2 w-full"
        />
        <button
          onClick={handleAddSubEntry}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Hinzufügen
        </button>
        {uploadStatus && <p className="mt-2">{uploadStatus}</p>}
      </div>
    </div>
  );
}
