export interface Subject {
  id: string;
  name: string;
  shortName: string;
  fileCount: number;
  color: string; // Tailwind bg color or hex
}

export type ResourceType = "PYQ" | "Notes" | "Assignment" | "Lab Manual";

export interface TrendingResource {
  id: string;
  title: string;
  type: ResourceType;
  subject: string;
  contributor: string;
  downloads: number;
  size: string;
  url: string;
}