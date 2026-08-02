import { isJsonMode, isApiMode } from '../config/dataSource';
import { supabase } from '../lib/supabase';
import { apiFetch } from './apiClient';
import { companies as jsonCompanies } from '../data';
import type { Company } from '../types';

export async function fetchAllCompanies(): Promise<Company[]> {
  if (isApiMode()) {
    return apiFetch<Company[]>('/api/companies');
  }

  if (isJsonMode()) {
    return jsonCompanies;
  }

  const { data, error } = await (supabase as any)
    .from('employers')
    .select('*');

  if (error) throw error;

  return (data || []).map((emp: any) => ({
    id: emp.id,
    name: emp.company_name,
    logo: emp.company_logo,
    industry: emp.industry,
    location: emp.location,
    openPositions: 0,
    description: emp.company_description,
    website: emp.website,
  }));
}

export async function fetchCompanyById(id: string): Promise<Company | null> {
  if (isApiMode()) {
    try {
      return await apiFetch<Company>(`/api/companies/${id}`);
    } catch {
      return null;
    }
  }

  if (isJsonMode()) {
    return jsonCompanies.find(c => c.id === id) || null;
  }

  const { data, error } = await (supabase as any)
    .from('employers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.company_name,
    logo: data.company_logo,
    industry: data.industry,
    location: data.location,
    openPositions: 0,
    description: data.company_description,
    website: data.website,
  };
}
