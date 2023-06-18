"use client";

import React from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CloseModal() {
  const router = useRouter();
  return (
    <Button
      variant="subtle"
      className="h-6 w-6 rounded-md p-0"
      onClick={() => router.back()}
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
