import { Subject, TrendingResource } from "./types";

export const SUBJECTS_DATA: Subject[] = [
  {
    id: "cs",
    name: "Computer Science",
    shortName: "CS",
    fileCount: 245,
    color: "#3b82f6",
  }, // Blue
  {
    id: "ma",
    name: "Mathematics",
    shortName: "MA",
    fileCount: 189,
    color: "#a855f7",
  }, // Purple
  {
    id: "ph",
    name: "Physics",
    shortName: "PH",
    fileCount: 156,
    color: "#22c55e",
  }, // Green
  {
    id: "ec",
    name: "Electronics",
    shortName: "EC",
    fileCount: 203,
    color: "#eab308",
  }, // Yellow
  {
    id: "me",
    name: "Mechanical",
    shortName: "ME",
    fileCount: 178,
    color: "#f97316",
  }, // Orange
  {
    id: "ce",
    name: "Civil",
    shortName: "CE",
    fileCount: 134,
    color: "#06b6d4",
  }, // Cyan
];

export const TRENDING_RESOURCES: TrendingResource[] = [
  {
    id: "tr1",
    title: "Data Structures PYQ - 2023",
    type: "PYQ",
    subject: "Computer Science",
    contributor: "Rohan Verma",
    downloads: 234,
    size: "2.4 MB",
    url: "#",
  },
  {
    id: "tr2",
    title: "OOPS Concepts - Lecture Notes",
    type: "Notes",
    subject: "Computer Science",
    contributor: "Priya Sharma",
    downloads: 189,
    size: "1.8 MB",
    url: "#",
  },
  {
    id: "tr3",
    title: "Engineering Mathematics III - PYQ 2024",
    type: "PYQ",
    subject: "Mathematics",
    contributor: "Amit Kumar",
    downloads: 312,
    size: "3.1 MB",
    url: "#",
  },
];