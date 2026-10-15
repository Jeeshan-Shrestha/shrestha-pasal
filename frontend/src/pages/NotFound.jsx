import { Button, Empty } from "../components/ui";

export default function NotFound() {
  return (
    <Empty
      title="Page not found"
      text="The page you are looking for does not exist."
      action={<Button to="/">Back to shop</Button>}
    />
  );
}
