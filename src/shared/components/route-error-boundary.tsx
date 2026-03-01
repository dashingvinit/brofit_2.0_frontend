import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Button } from "./ui/button";

export function RouteErrorBoundary() {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message ?? error.statusText;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="max-w-md text-center text-muted-foreground">{message}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
        <Button asChild>
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
