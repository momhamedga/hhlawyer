import { LucideIcon } from "lucide-react";

export interface StatItemProps {
  label: string;
  value: string;
  index?: number;
}

// 2. Timeline
export interface TimelineItem {
  year: string;
  title: string;
  company: string;
}

export interface TimelineSectionProps {
  title: string;
  items: TimelineItem[];
}

export interface VisionValue {
  title: string;
  desc: string;
  icon: LucideIcon; 
  color: string;
}
export interface ValueItemCardProps extends VisionValue {
  index: number;
}