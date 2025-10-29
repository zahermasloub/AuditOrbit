"use client";
import Container from "@/components/layout/Container";
import { AuditorWorkspace } from "@/components/auditor/AuditorWorkspace";

export default function AuditorPage() {
  return (
    <Container className="py-8 sm:py-10">
      <AuditorWorkspace />
    </Container>
  );
}
