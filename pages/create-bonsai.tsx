import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

const CreateBonsai = () => {
  const { data: session, status } = useSession();

  // Move all hooks to the top level
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [location, setLocation] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [style, setStyle] = useState("");
  const [ownedSince, setOwnedSince] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    console.log("Session in frontend:", session); // Debugging: Log the session
    if (status === "unauthenticated") {
      signIn(); // Redirect to login page
    }
  }, [status, session]);

  if (status === "loading") {
    return <p className="text-center text-gray-500 mt-10">Loading...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Please Log In</h1>
        <button
          onClick={() => signIn()}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600"
        >
          Log In
        </button>
      </div>
    );
  }

  if (!session) {
    return null; // Prevent rendering if not authenticated
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/bonsais/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          species,
          location,
          age,
          style,
          ownedSince, // Send the date string directly
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to create Bonsai");
      }

      const { id, message } = await response.json();
      setSuccess(`${message} (ID: ${id})`);
      setName("");
      setSpecies("");
      setLocation("");
      setAge("");
      setStyle("");
      setOwnedSince("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Create a New Bonsai
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Bonsai Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="text"
            placeholder="Species"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="number"
            placeholder="Age (years)"
            value={age}
            onChange={(e) => setAge(Number(e.target.value) || "")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="text"
            placeholder="Style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="date"
            placeholder="Owned Since"
            value={ownedSince}
            onChange={(e) => setOwnedSince(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600"
          >
            Create Bonsai
          </button>
        </form>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        {success && <p className="text-green-500 mt-4 text-center">{success}</p>}
      </div>
    </div>
  );
};

export default CreateBonsai;
