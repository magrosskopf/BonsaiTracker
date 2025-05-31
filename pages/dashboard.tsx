import React from "react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Dashboard() {
  const { data: session } = useSession();
  const [bonsais, setBonsais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/bonsais")
        .then((res) => res.json())
        .then((data) => {
            console.log("Bonsais:", data);
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
        <p>Lade Daten...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-md">
      <h1 className="text-4xl font-bold">Deine Bonsai</h1>
      <ul className="mt-4 flex flex-row">
        {bonsais.map((bonsai) => (
            <Link href={`/bonsai/${bonsai.id}`} className="h-full w-full">
          <li key={bonsai.id} className="border p-4 mb-2 mx-1">
            
                { bonsai.images.length > 0 &&
                    <Image src={bonsai.images[0] || "/placeholder.png"} alt={bonsai.name} width={150} height={150} className="mb-2" />
                }
                <h2 className="text-2xl">{bonsai.name}</h2>
                <p>Standort: {bonsai.location}</p>
                <p>Art: {bonsai.species}</p>
                
                <p>Details ansehen</p>
            </li>
            </Link>

        ))}
      </ul>
    </div>
  );
}
