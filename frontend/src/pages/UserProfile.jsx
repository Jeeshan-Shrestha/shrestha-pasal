import { useAuth } from "../auth/AuthContext";
import { Badge, Button, Card, PageTitle } from "../components/ui";
import { dateTime } from "../lib/format";

export default function UserProfile() {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle>My account</PageTitle>
      <Card className="mb-6 flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-purple-600 text-xl font-bold text-white">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-gray-900">
            {user.fullName}
          </p>
          <p className="truncate text-sm text-gray-600">{user.email}</p>
          {user.phone && <p className="text-sm text-gray-600">{user.phone}</p>}
          <p className="text-xs text-gray-400">
            Member since {dateTime(user.createdAt)}
          </p>
        </div>
        {isAdmin && <Badge>Admin</Badge>}
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" size="lg" to="/userProfile/myOrders">
          My orders
        </Button>
        <Button variant="outline" size="lg" to="/wishlist">
          Wishlist
        </Button>
        <Button variant="outline" size="lg" to="/userProfile/addresses">
          Addresses
        </Button>
        <Button variant="outline" size="lg" to="/userProfile/editProfile">
          Edit profile &amp; password
        </Button>
        {isAdmin && (
          <Button size="lg" to="/admin">
            Admin panel
          </Button>
        )}
        <Button
          variant="danger"
          size="lg"
          className="border border-red-200"
          onClick={signOut}
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
