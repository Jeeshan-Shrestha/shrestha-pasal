import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/AuthContext";
import { useAdminUsers, useSetUserEnabled } from "../../api/admin";
import {
  Badge,
  Button,
  ErrorBox,
  PageLoader,
  Pagination,
} from "../../components/ui";
import { dateTime } from "../../lib/format";

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useAdminUsers(page);
  const setEnabled = useSetUserEnabled();

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorBox error={error} />;

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Joined</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {data.content.map((user) => (
              <tr key={user.id} className="border-t border-gray-100">
                <td className="px-4 py-2 font-medium text-gray-900">
                  {user.fullName}
                </td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.phone}</td>
                <td className="px-4 py-2">
                  <Badge>{user.role}</Badge>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {dateTime(user.createdAt)}
                </td>
                <td className="px-4 py-2 text-right">
                  {user.id !== me.id && (
                    <Button
                      size="sm"
                      variant={user.enabled ? "danger" : "outline"}
                      disabled={setEnabled.isPending}
                      onClick={() =>
                        setEnabled.mutate(
                          { id: user.id, value: !user.enabled },
                          {
                            onSuccess: () =>
                              toast.success(
                                user.enabled ? "User disabled" : "User enabled",
                              ),
                          },
                        )
                      }
                    >
                      {user.enabled ? "Disable" : "Enable"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        onChange={setPage}
      />
    </div>
  );
}
