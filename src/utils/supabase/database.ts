import type {
  DataBaseApiInterface,
  SubmissionData,
  SubmissionMetaDb,
} from '@/types/submissionapi';
import { lazySupabase } from './lib';

export const databaseApi: DataBaseApiInterface = {
  async saveSubmission(submissionData: SubmissionData): Promise<SubmissionMetaDb> {
    // We assume the table 'submissions' exists and has columns matching SubmissionData
    const supabase = lazySupabase();
    const { data, error } = await supabase
      .from('submissions')
      .insert([submissionData])
      .select()
      .single();

    if (error) throw error;

    return {
      ...submissionData,
      databaseId: data.id,
      metadataUrl: '', // Not applicable for Supabase DB
    };
  },

  async getMySubmission(email: string): Promise<SubmissionMetaDb | null> {
    const supabase = lazySupabase();
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }

    return {
      ...data,
      databaseId: data.id,
      metadataUrl: '',
    };
  },

  async listAllSubmissions(): Promise<SubmissionMetaDb[]> {
    const supabase = lazySupabase();
    const { data, error } = await supabase.from('submissions').select('*');

    if (error) throw error;

    return data.map((item: any) => ({
      ...item,
      databaseId: item.id,
      metadataUrl: '',
    }));
  },
};
