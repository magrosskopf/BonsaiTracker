import { useSession } from "next-auth/react";

export default function Profile() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Bitte logge dich ein, um dein Profil zu sehen.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Dein Profil</h1>
      <p className="mt-4">Name: {session.user?.name || "Nicht angegeben"}</p>
      <p>Email: {session.user?.email}</p>
    </div>
  );
}
