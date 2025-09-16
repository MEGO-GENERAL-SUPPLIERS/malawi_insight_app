import MainLayout from "~/components/layouts/MainLayout";
import ProtectedRoute from "~/components/routing/ProtectedRoute";

export default function Main() {
  return (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  );
}
