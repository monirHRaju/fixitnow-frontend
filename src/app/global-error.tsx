"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h1 className="text-4xl font-bold text-destructive mb-4">500</h1>
          <h2 className="text-xl font-semibold mb-2">Server Error</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {error.message || "Something went wrong on our end. Please try again later."}
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}