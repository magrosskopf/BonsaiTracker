import React from "react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session } = useSession();
  const [bonsais, setBonsais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/bonsais")
        .then((res) => res.json())
        .then((data) => {
          setBonsais(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Bitte logge dich ein, um dein Dashboard zu sehen.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Lade Bonsai-Daten...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Deine Bonsais</h1>
      <ul className="mt-4">
        {bonsais.map((bonsai) => (
          <li key={bonsai.id} className="border p-4 mb-2">
            <h2 className="text-2xl">{bonsai.name}</h2>
            <p>Standort: {bonsai.location}</p>
            <p>Art: {bonsai.species}</p>
            <Link href={`/bonsai/${bonsai.id}`}>
              <a className="text-blue-500 underline mt-2">Details ansehen</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
