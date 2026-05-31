// @/components/course-details-admin/types.ts
export interface Course {
  id: number | string;
  name: string;
  code: string;
  credits: number;
  level: string | "Foundation" | "Diploma in Data Science" | "Diploma in Programming" | "Degree";
  num_weeks: number;
  num_hours: number;
  website: string;
  playlist: string;
}

export interface Week {
  id: string;
  name: string;
  num: number;
  course_id: string;
}

export interface Lecture {
  id: string;
  name: string;
  num: number;
  week_id: string;
}

export interface Dependency {
  id: string;
  from_course_id: string;
  to_course_id: string;
}