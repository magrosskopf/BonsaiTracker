import React from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Navigation from "swiper";
import Pagination from "swiper";
import Link from "next/link";

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
    formData.append("bonsaiId", id.toString()); // Include bonsaiId in the request

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      const updatedBonsai = await fetch(`/api/bonsais/${id}`)
        .then((res) => res.json());

      setBonsai(updatedBonsai);
      setUploadStatus("Bild erfolgreich hochgeladen.");
    } else {
      setUploadStatus("Upload fehlgeschlagen.");
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
        <h1 className="text-4xl font-bold text-center mb-4">{bonsai.name}</h1>
        <div className="text-center text-gray-600 mb-6">
          <p>Standort: {bonsai.location}</p>
          <p>Art: {bonsai.species}</p>
          <p>Alter: {bonsai.age} Jahre</p>
          <p>Notizen: {bonsai.notes || "Keine Notizen"}</p>
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
          
          <Link href={`/bonsai/edit/${id}`}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
          >
            Bearbeiten
          </Link>
          
        </div>
      </div>
    </div>
  );
}
