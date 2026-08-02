import * as XLSX from 'xlsx';
import type { Candidate, PipelineStatus } from './types';
import { STATUS_LABELS } from './types';

export function s(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v);
}

export function filterAndSort(
  candidates: Candidate[],
  filters: {
    search: string;
    status: PipelineStatus | 'all';
    city: string;
    experience: 'all' | 'yes' | 'no';
    aiMatch: string;
    starredOnly: boolean;
    hasNotes: boolean;
  },
  sortKey: string,
  sortDir: 'asc' | 'desc',
): Candidate[] {
  const q = filters.search.trim().toLowerCase();
  let list = candidates.filter((c) => {
    if (filters.status !== 'all' && c.status !== filters.status) return false;
    if (filters.city && s(c.city).toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.experience === 'yes' && s(c.hasWorkExperience).toLowerCase() !== 'yes') return false;
    if (filters.experience === 'no' && s(c.hasWorkExperience).toLowerCase() === 'yes') return false;
    if (filters.aiMatch && s(c.aiResumeMatch).toLowerCase() !== filters.aiMatch.toLowerCase()) return false;
    if (filters.starredOnly && !c.starred) return false;
    if (filters.hasNotes && !s(c.notes).trim()) return false;
    if (!q) return true;
    const blob = [
      c.name,
      c.email,
      c.phone,
      c.city,
      c.institute,
      c.degree,
      c.companies,
      c.jobTitles,
      c.otherSkills,
      c.languages,
      c.notes,
      c.tags?.join(' '),
      c.latestRole,
      c.careerObjective,
    ]
      .map(s)
      .join(' ')
      .toLowerCase();
    return blob.includes(q);
  });

  list = [...list].sort((a, b) => {
    const av = s((a as unknown as Record<string, unknown>)[sortKey]).toLowerCase();
    const bv = s((b as unknown as Record<string, unknown>)[sortKey]).toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  return list;
}

export function uniqueCities(candidates: Candidate[]): string[] {
  const set = new Set<string>();
  for (const c of candidates) {
    const city = s(c.city).trim();
    if (city) set.add(city);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function exportToExcel(candidates: Candidate[], filename: string) {
  const rows = candidates.map((c) => ({
    ID: c.id,
    Role: c.roleName,
    Status: STATUS_LABELS[c.status],
    Starred: c.starred ? 'Yes' : 'No',
    Tags: (c.tags || []).join(', '),
    Notes: c.notes,
    Name: c.name,
    Email: c.email,
    Phone: c.phone,
    City: c.city,
    Gender: c.gender,
    Institute: c.institute,
    Degree: c.degree,
    Stream: c.stream,
    GraduationYear: c.graduationYear,
    AI_Resume_Match: c.aiResumeMatch,
    Has_Work_Experience: c.hasWorkExperience,
    Companies: c.companies,
    Job_Titles: c.jobTitles,
    Work_Experience: c.workExperienceDetail,
    Experience_Duration: c.experienceDuration,
    Latest_Role: c.latestRole,
    Latest_Company: c.latestCompany,
    Languages: c.languages,
    Skills: c.otherSkills,
    Certifications: c.certifications,
    Availability: c.availability,
    Applied_At: c.appliedAt,
    Application_Link: c.applicationLink,
    Resume_Link: c.resumeLink,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Candidates');
  XLSX.writeFile(wb, filename);
}

export function parseImportedExcel(file: File): Promise<Candidate[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
        const now = new Date().toISOString();
        const list: Candidate[] = rows.map((row, i) => {
          const id = `custom_import_${Date.now()}_${i}`;
          return {
            id,
            roleId: String(row.RoleId || row.roleId || 'imported'),
            roleName: String(row.Role || row.roleName || 'Imported'),
            status: (String(row.Status || 'new').toLowerCase().replace(/\s+/g, '_') as PipelineStatus) || 'new',
            tags: String(row.Tags || '')
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
            notes: String(row.Notes || ''),
            starred: String(row.Starred || '').toLowerCase() === 'yes',
            createdAt: now,
            updatedAt: now,
            name: (row.Name as string) || null,
            applicationLink: (row.Application_Link as string) || null,
            phone: row.Phone != null ? String(row.Phone) : null,
            email: (row.Email as string) || null,
            city: (row.City as string) || null,
            gender: (row.Gender as string) || null,
            otherSkills: (row.Skills as string) || null,
            aiResumeMatch: (row.AI_Resume_Match as string) || null,
            institute: (row.Institute as string) || null,
            degree: (row.Degree as string) || null,
            stream: (row.Stream as string) || null,
            graduationYear: (row.GraduationYear as string) || null,
            performancePg: null,
            performanceUg: null,
            performance12: null,
            performance10: null,
            chatLink: null,
            resumeLink: (row.Resume_Link as string) || null,
            downloadLink: null,
            appliedAt: (row.Applied_At as string) || now,
            hasWorkExperience: (row.Has_Work_Experience as string) || null,
            totalRoles: null,
            internshipCount: null,
            fulltimeCount: null,
            companies: (row.Companies as string) || null,
            jobTitles: (row.Job_Titles as string) || null,
            workExperienceDetail: (row.Work_Experience as string) || null,
            experienceDuration: (row.Experience_Duration as string) || null,
            latestRole: (row.Latest_Role as string) || null,
            latestCompany: (row.Latest_Company as string) || null,
            careerObjective: null,
            languages: (row.Languages as string) || null,
            certifications: (row.Certifications as string) || null,
            projects: null,
            extraCurricular: null,
            additionalDetails: null,
            relevantSkills: null,
            educationFromPdf: null,
            streamFromPdf: null,
            pdfFile: null,
            availability: (row.Availability as string) || null,
            aiInterviewScores: {},
            skillFlags: {},
          };
        });
        resolve(list);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export function scoreSummary(c: Candidate): string {
  const scores = Object.entries(c.aiInterviewScores || {})
    .filter(([, v]) => v !== null && v !== undefined && String(v) !== '')
    .map(([k, v]) => `${k}: ${v}`);
  return scores.join(' · ');
}
