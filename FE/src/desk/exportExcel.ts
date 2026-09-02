/**
 * Excel export for the desk Candidates screen.
 *
 * The candidates list is server-paginated (BE caps pageSize at 100), so a full
 * export walks every page of the current filter set before building the sheet.
 * PII columns follow the same masking rules as the table: values the API
 * already masked (`piiMasked`) go out as-is, otherwise the viewer's mask
 * toggle decides.
 */

import * as XLSX from 'xlsx';
import { deskApi, type DeskCandidate } from './api';
import { stage } from './tokens';
import { maskEmail, maskPhone } from './ui';

/** Hard ceiling so an "all candidates" export can't run away. */
export const EXPORT_ROW_CAP = 10000;

const PAGE_SIZE = 100; // BE maximum

export async function fetchAllFilteredCandidates(
  filters: Record<string, unknown>,
  onProgress?: (page: number, totalPages: number) => void,
): Promise<DeskCandidate[]> {
  const out: DeskCandidate[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await deskApi.candidates({ ...filters, page, pageSize: PAGE_SIZE });
    out.push(...res.items);
    totalPages = Math.min(res.totalPages || 1, Math.ceil(EXPORT_ROW_CAP / PAGE_SIZE));
    onProgress?.(page, totalPages);
    page += 1;
  } while (page <= totalPages && out.length < EXPORT_ROW_CAP);
  return out.slice(0, EXPORT_ROW_CAP);
}

function pii(
  value: string | null | undefined,
  wireMasked: boolean | undefined,
  masked: boolean,
  mask: (v?: string | null) => string,
): string {
  if (!value) return '';
  if (wireMasked) return value; // already masked by the API — never mask twice
  return masked ? mask(value) : value;
}

export function buildCandidateSheetRows(list: DeskCandidate[], masked: boolean) {
  return list.map((c) => ({
    ID: c.id,
    Name: c.name || '',
    Stage: stage(c.status).label,
    'Hiring role': c.roleName || '',
    Phone: pii(c.phone, c.piiMasked, masked, maskPhone),
    Email: pii(c.email, c.piiMasked, masked, maskEmail),
    City: c.city || '',
    Source: c.source || '',
    Gender: c.gender || '',
    'Latest role': c.latestRole || '',
    'Latest company': c.latestCompany || '',
    Experience: c.experienceDuration
      || (c.hasWorkExperience === 'yes' ? 'Experienced' : c.hasWorkExperience === 'no' ? 'Fresher' : ''),
    'Current CTC': c.currentCtc ?? '',
    'Expected CTC': c.expectedCtc ?? '',
    'Notice (days)': c.noticeDays ?? '',
    Institute: c.institute || '',
    Degree: c.degree || '',
    Stream: c.stream || '',
    'Graduation year': c.graduationYear || '',
    'Relevant skills': c.relevantSkills || '',
    'Other skills': c.otherSkills || '',
    Languages: c.languages || '',
    Certifications: c.certifications || '',
    Companies: c.companies || '',
    'Job titles': c.jobTitles || '',
    Availability: c.availability || '',
    Tags: (c.tags || []).join(', '),
    Notes: c.notes || '',
    Starred: c.starred ? 'Yes' : 'No',
    DND: c.dnc ? 'Yes' : 'No',
    'Resume link': c.resumeLink || c.downloadLink || '',
    'Application link': c.applicationLink || '',
    Created: c.createdAt || '',
    Updated: c.updatedAt || '',
  }));
}

export function downloadCandidatesXlsx(list: DeskCandidate[], masked: boolean, filename: string) {
  const ws = XLSX.utils.json_to_sheet(buildCandidateSheetRows(list, masked));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Candidates');
  XLSX.writeFile(wb, filename);
}

export function candidateExportFilename(roleName?: string | null) {
  const slug = (roleName || 'all')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'all';
  return `candidates_${slug}_${new Date().toISOString().slice(0, 10)}.xlsx`;
}
