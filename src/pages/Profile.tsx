import UserProfile from "@/components/UserProfile";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user, isLoading } = useAuth();
  const userRole = user?.role || "buyer";

  if (isLoading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Please log in to view your profile</h2>
            <p className="text-gray-500">You need to be authenticated to access this page.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <UserProfile userRole={userRole} user={user} />
    </DashboardLayout>
  );
};

export default Profile;
