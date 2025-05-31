import React from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Navigation from "swiper";
import Pagination from "swiper";

export default function BonsaiDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [bonsai, setBonsai] = useState(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedDate, setAddedDate] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [notes, setNotes] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/bonsais/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setBonsai(data);
          setAddedDate(data.addedDate || null); // Initialize addedDate
          setName(data.name || null);
          setPlace(data.location || null);
          setType(data.species || null);
          setAge(data.age || null);
          setNotes(data.notes || null);
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
    formData.append("bonsaiId", id.toString()); // Include bonsaiId in the request

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

  const handleDateChange = async () => {
    if (!addedDate || !id) return;

    const res = await fetch(`/api/bonsais/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addedDate }),
    });

    if (res.ok) {
      const updatedBonsai = await res.json();
      setBonsai(updatedBonsai);
      setUploadStatus("Datum erfolgreich aktualisiert.");
    } else {
      setUploadStatus("Fehler beim Aktualisieren des Datums.");
    }
  };

  const handleUpdate = async () => {
    if (!id) return;

    const res = await fetch(`/api/bonsais/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location: place, species: type, age, notes }),
    });

    if (res.ok) {
      const updatedBonsai = await res.json();
      setBonsai(updatedBonsai);
      setUploadStatus("Bonsai erfolgreich aktualisiert.");
    } else {
      setUploadStatus("Fehler beim Aktualisieren des Bonsais.");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Lade Bonsai-Daten...</p>;
  }

  if (!bonsai) {
    return <p className="text-center mt-10">Bonsai nicht gefunden.</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-4">Bonsai bearbeiten</h1>
        <div className="text-center text-gray-600 mb-6">
          <div className="mt-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name:
            </label>
            <input
              type="text"
              id="name"
              value={name || ""}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="place" className="block text-sm font-medium text-gray-700">
              Standort:
            </label>
            <input
              type="text"
              id="place"
              value={place || ""}
              onChange={(e) => setPlace(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Art:
            </label>
            <input
              type="text"
              id="type"
              value={type || ""}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              Alter:
            </label>
            <input
              type="number"
              id="age"
              value={age || ""}
              onChange={(e) => setAge(Number(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notizen:
            </label>
            <textarea
              id="notes"
              value={notes || ""}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            onClick={handleUpdate}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
          >
            Aktualisieren
          </button>
        </div>
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Bilder</h2>
          {bonsai.images?.length > 0 ? (
            <Swiper
              navigation
              pagination={{ clickable: true }}
              spaceBetween={20}
              slidesPerView={1}
              className="w-full"
            >
              {bonsai.images.map((image: string, index: number) => (
                <SwiperSlide key={index}>
                  <img
                    src={image}
                    alt={`Bonsai Bild ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-center text-gray-500">Keine Bilder verfügbar.</p>
          )}
        </div>
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Bild hinzufügen</h2>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={handleUpload}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
          >
            Hochladen
          </button>
          {uploadStatus && (
            <p className="mt-4 text-center text-sm text-gray-600">{uploadStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
}
