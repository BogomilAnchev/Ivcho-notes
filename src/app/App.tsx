import { LoginPage } from "@/features/auth/LoginPage";
import { NotesPage } from "@/features/patients/PatientsPage";
import { useSession } from "@/features/auth/useSession";

export const App = () => {
  const { session, loading } = useSession();

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!session) return <LoginPage />;

  return <NotesPage />;
};
