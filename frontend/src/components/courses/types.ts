export interface Course {
  id: number | string;
  name: string;
  code: string;
  level: string;
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