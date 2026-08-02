// Helper script to export frontend TS data as JSON for the Python seed script
// Run from project root: node backend/export_data.js

const fs = require('fs');
const path = require('path');

// Read and eval TS files (they're essentially JS with type annotations stripped)
function loadTsData(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  // Remove TypeScript imports and type annotations
  content = content.replace(/import type \{[^}]+\} from '[^']+';/g, '');
  content = content.replace(/import \{[^}]+\} from '[^']+';/g, '');
  content = content.replace(/: Job\[\]/g, '');
  content = content.replace(/: Event\[\]/g, '');
  content = content.replace(/: EventDetail\[\]/g, '');
  content = content.replace(/: Course\[\]/g, '');
  content = content.replace(/: CourseDetail\[\]/g, '');
  content = content.replace(/: Company\[\]/g, '');
  content = content.replace(/: Record<string, EventDetail>/g, '');
  content = content.replace(/: Record<string, CourseDetail>/g, '');
  // Replace export const with const
  content = content.replace(/export const /g, 'const ');
  // Handle spread operator references like ...events[0]
  // We'll eval with the variables in scope
  return content;
}

// Jobs
const jobsContent = loadTsData(path.join(__dirname, '..', 'src', 'data', 'jobs.ts'));
const jobsFunc = new Function(jobsContent + '\nreturn jobs;');
const jobs = jobsFunc();

// Events
const eventsContent = loadTsData(path.join(__dirname, '..', 'src', 'data', 'events.ts'));
const eventsFunc = new Function(eventsContent + '\nreturn { events, eventDetails };');
const { events, eventDetails } = eventsFunc();

// Courses
const coursesContent = loadTsData(path.join(__dirname, '..', 'src', 'data', 'courses.ts'));
const coursesFunc = new Function(coursesContent + '\nreturn { courses, courseDetails };');
const { courses, courseDetails } = coursesFunc();

// Companies
const companiesContent = loadTsData(path.join(__dirname, '..', 'src', 'data', 'companies.ts'));
const companiesFunc = new Function(companiesContent + '\nreturn companies;');
const companies = companiesFunc();

const output = { jobs, events, eventDetails, courses, courseDetails, companies };
const outputPath = path.join(__dirname, 'seed_data.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Exported seed data to ${outputPath}`);
console.log(`  Jobs: ${jobs.length}`);
console.log(`  Events: ${events.length}`);
console.log(`  Event Details: ${Object.keys(eventDetails).length}`);
console.log(`  Courses: ${courses.length}`);
console.log(`  Course Details: ${Object.keys(courseDetails).length}`);
console.log(`  Companies: ${companies.length}`);
