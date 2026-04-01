export interface Subject {
  id: string;
  name: string;
  shortName: string;
  fileCount: number;
  color: string; // Tailwind bg color or hex
}



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
export interface Subject {
  id: string;
  name: string;
  shortName: string;
  fileCount: number;
  color: string; // Tailwind bg color or hex
}

export type ResourceType =
  | "PYQ"
  | "Notes"
  | "Assignment"
  | "Lab Manual"
  | "Syllabus";

export type FolderType =
  | "PYQs"
  | "Notes"
  | "Syllabus"
  | "Assignments"
  | "Lab Manual";

export interface AcademicFile {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string; // e.g. "Jan 2024"
  url: string;
  year?: string; // e.g. "2023" for PYQs
}

export interface SubjectFolder {
  id: FolderType;
  label: FolderType;
  iconName: string; // MaterialCommunityIcons name
  color: string; // accent hex
  fileCount: number;
  files: AcademicFile[];
}

export interface BTechSubjectData {
  subjectId: string;
  semester: number;
  folders: SubjectFolder[];
}

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

export interface CategoryItem {
  id: string;
  title: string;
  iconName: string;
  iconColor: string;
}