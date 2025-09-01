import { useAuth } from "../context/AuthProvider.jsx";

export default function Home() {
  const { user, signOut } = useAuth();
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Doggerz</h1>
      <p>Welcome {user?.email ?? "Guest"}.</p>
      <button className="border rounded px-3 py-1" onClick={signOut}>Sign out</button>
    </main>
  );
}
