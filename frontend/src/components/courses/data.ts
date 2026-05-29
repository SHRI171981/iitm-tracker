import { type Course } from './types';

export const coursesData: Course[] = [
  { id: 1, name: "Web Development Bootcamp", code: "WD101", level: "Beginner", weeks: 12, hours: 120, website: "https://webdevbootcamp.link", playlist: "https://youtube.com/playlist?list=wd101" },
  { id: 2, name: "Advanced Python for Data Science", code: "PY201", level: "Advanced", weeks: 16, hours: 160, website: "https://python-ds.link", playlist: "https://youtube.com/playlist?list=py201" },
  { id: 3, name: "Intro to Cybersecurity", code: "SEC101", level: "Intermediate", weeks: 6, hours: 45, website: "https://cybersecurity.link", playlist: "https://youtube.com/playlist?list=sec101" },
  { id: 4, name: "Machine Learning with TensorFlow", code: "ML301", level: "Advanced", weeks: 20, hours: 200, website: "https://mltensorflow.link", playlist: "https://youtube.com/playlist?list=ml301" },
  { id: 5, name: "User Experience Design Fundamentals", code: "UX101", level: "Beginner", weeks: 8, hours: 60, website: "https://uxdesign.link", playlist: "https://youtube.com/playlist?list=ux101" },
  { id: 6, name: "Cloud Architecture on AWS", code: "AWS201", level: "Intermediate", weeks: 10, hours: 80, website: "https://aws-cloud.link", playlist: "https://youtube.com/playlist?list=aws201" }
];