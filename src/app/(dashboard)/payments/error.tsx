'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="w-full max-w-xl mx-auto mt-12">
      <CardHeader className="flex flex-col space-y-2 text-center">
        <CardTitle className="text-2xl">Something went wrong.</CardTitle>
        <CardDescription>
          Please try again later or{" "}
          <button
            className="underline cursor-pointer text-muted-foreground hover:text-primary"
            onClick={reset}
          >
            refresh the page
          </button>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>{error.message}</p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-2 space-y-1 text-left text-xs">
            <summary>Technical details</summary>
            <pre>{console.error?.(error) ?? ''}</pre>
          </details>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
      </CardFooter>
    </Card>
  );
}