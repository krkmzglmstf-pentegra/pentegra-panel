"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-semibold">Bir seyler ters gitti.</h2>
      <p className="text-sm text-muted-foreground">Beklenmeyen bir hata olustu.</p>
      <Button onClick={() => reset()}>Tekrar dene</Button>
    </div>
  );
}
