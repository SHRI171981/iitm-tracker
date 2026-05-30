export interface Course {
  id: number | string;
  name: string;
  code: string;
  credits: number;
  level: string | "Foundation" | "Diploma in Data Science" | "Diploma in Programming" | "BSc Degree" | "BS Degree" | "PG Diploma" | "M Tech";
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