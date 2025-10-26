"use client";
import {
  ShieldCheck, Users, KeyRound, ClipboardList, ListChecks, FileText,
  FolderKanban, FlaskConical, Bell, FileChartColumn, Database, Cpu, Cog,
  Library, Search, Upload, Bug, CheckCircle2
} from "lucide-react";

export const AOIcons = {
  shield: ShieldCheck,
  users: Users,
  key: KeyRound,
  list: ClipboardList,
  checks: ListChecks,
  file: FileText,
  kanban: FolderKanban,
  lab: FlaskConical,
  bell: Bell,
  report: FileChartColumn,
  db: Database,
  ai: Cpu,
  settings: Cog,
  library: Library,
  search: Search,
  upload: Upload,
  bug: Bug,
  ok: CheckCircle2,
} as const;

export type AOIconKey = keyof typeof AOIcons;

export function Icon({name, className}: {name: AOIconKey; className?: string}) {
  const Cmp = AOIcons[name];
  return <Cmp className={className ?? "w-5 h-5"} aria-hidden="true" />;
}
