import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Willkommen beim Bonsai Tracker</h1>
      {!session ? (
        <button
          onClick={() => signIn()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Login
        </button>
      ) : (
        <div className="mt-4">
          <p>Hallo, {session.user?.name || "Benutzer"}!</p>
          <button
            onClick={() => signOut()}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
