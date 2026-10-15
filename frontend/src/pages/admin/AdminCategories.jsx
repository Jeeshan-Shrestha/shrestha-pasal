import { useState } from "react";
import toast from "react-hot-toast";
import { useDeleteCategory, useSaveCategory } from "../../api/admin";
import { useCategories } from "../../api/catalog";
import {
  Button,
  Card,
  ErrorBox,
  PageLoader,
  inputClass,
} from "../../components/ui";

function CategoryForm({ category, onDone }) {
  const save = useSaveCategory();
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");

  function submit(event) {
    event.preventDefault();
    save.mutate(
      { id: category?.id, name: name.trim(), description: description.trim() },
      {
        onSuccess: () => {
          toast.success("Category saved");
          setName("");
          setDescription("");
          onDone?.();
        },
      },
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className={`${inputClass} max-w-48`}
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className={`${inputClass} max-w-xs`}
      />
      <Button type="submit" disabled={save.isPending}>
        {category ? "Save" : "Add"}
      </Button>
      {onDone && category && (
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
      )}
    </form>
  );
}

export default function AdminCategories() {
  const { data, isLoading, error } = useCategories();
  const remove = useDeleteCategory();
  const [editingId, setEditingId] = useState(null);

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorBox error={error} />;

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CategoryForm />
      </Card>
      {data.map((category) => (
        <Card key={category.id} className="!p-4">
          {editingId === category.id ? (
            <CategoryForm
              category={category}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">{category.name}</p>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingId(category.id)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (window.confirm(`Delete "${category.name}"?`)) {
                      remove.mutate(category.id, {
                        onSuccess: () => toast.success("Category deleted"),
                      });
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
