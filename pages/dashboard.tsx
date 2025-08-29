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
    <div className="w-full  p-5">
      <h1 className="text-4xl font-bold">Deine Bonsai</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
        {bonsais.map((bonsai) => (
           
          <div className="card card-md  bg-base-300 w-96 shadow-sm ">
             <figure>
               {bonsai.images.length > 0 ? (
                 <img
                   src={bonsai.images[0] || "/public/uploads/1748636775038-fleisch_steak.jpg"}
                   alt={bonsai.name}
                    className="w-full h-48 object-cover rounded-lg "
                 />
               ) : (
                 <img
                   src="/public/uploads/1748636775038-fleisch_steak.jpg"
                   alt="Placeholder"
                   width={150}
                   height={150}
                   className="mb-2 object-cover"
                 />
               )}
             </figure>
             <div className="card-body ">
               <div>
                 <h2 className="card-title">{bonsai.name}</h2>
                 <p>Standort: {bonsai.location}</p>
                 <p>Art: {bonsai.species}</p>
               </div>
               <div className="card-actions justify-end mt-4">
                 <a href={`/bonsai/${bonsai.id}`} className="btn btn-primary">Details ansehen</a>
               </div>
             </div>
         </div>
        ))}
      </div>
    </div>
  );
}
