import type { School, SubmissionFormObjectUrls } from '@/types/submissionapi';

export interface FieldOption {
  value: string;
  label: string;
}

export type FieldType = 'text' | 'email' | 'select' | 'textarea';

export interface PersonalField<TForm = any> {
  key: keyof TForm;
  label: string;
  type: FieldType;
  required?: boolean;
  readonly?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  rows?: number;
  validator?: (value: string) => void;
}

export interface FileUploadConfig<TForm = any> {
  key: keyof TForm;
  label: string;
  accept: string;
  extensions: string[];
  errorKey: keyof TForm;
  required: boolean;
  conditional?: () => boolean;
  icon?: any;
  description?: string;
}

export interface DocumentDisplay<T = any> {
  key: string;
  label: string;
  description: string;
  icon: any;
  filename: string;
  urlKey: keyof T;
}

export interface SchoolChoiceConfig {
  title: string;
  schoolKey: 'school1' | 'school2';
  programKey: 'program1' | 'program2';
  thematicKey: 'thematicSequence1' | 'thematicSequence2';
  electivesKey: 'electives1' | 'electives2';
  emoji?: string;
  bgClass?: string;
}

// School configuration
export const schoolOptions: { value: School; label: string }[] = [
  { value: 'centrale_supelec', label: 'CentraleSupélec' },
  { value: 'centrale_nantes', label: 'Centrale Nantes' },
  { value: 'centrale_lille', label: 'Centrale Lille' },
  { value: 'centrale_marseille', label: 'Centrale Marseille' },
  { value: 'centrale_lyon', label: 'Centrale Lyon' },
];

export const schoolLabels: Record<School, string> = {
  centrale_supelec: 'CentraleSupélec',
  centrale_nantes: 'Centrale Nantes',
  centrale_lille: 'Centrale Lille',
  centrale_marseille: 'Centrale Marseille',
  centrale_lyon: 'Centrale Lyon',
};

export const schoolChoices: SchoolChoiceConfig[] = [
  {
    title: 'First Choice',
    schoolKey: 'school1',
    programKey: 'program1',
    thematicKey: 'thematicSequence1',
    electivesKey: 'electives1',
    emoji: '🥇',
    bgClass: 'bg-green-500/10 border-green-400/20',
  },
  {
    title: 'Second Choice',
    schoolKey: 'school2',
    programKey: 'program2',
    thematicKey: 'thematicSequence2',
    electivesKey: 'electives2',
    emoji: '🥈',
    bgClass: 'bg-yellow-500/10 border-yellow-400/20',
  },
];

// Document configuration factory
export const createDocumentConfigs = (icons: any) => {
  const documentConfigs: DocumentDisplay<SubmissionFormObjectUrls>[] = [
    {
      key: 'applicationForm',
      label: 'Application Form',
      description: 'Microsoft Word Document (.docx)',
      icon: icons.DocumentTextIcon,
      filename: 'application-form.docx',
      urlKey: 'applicationFormUrl',
    },
    {
      key: 'resume',
      label: 'Resume/CV',
      description: 'PDF Document (.pdf)',
      icon: icons.AcademicCapIcon,
      filename: 'resume.pdf',
      urlKey: 'resumeUrl',
    },
    {
      key: 's5Transcripts',
      label: 'S5 Transcripts',
      description: 'PDF Document (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 's5-transcripts.pdf',
      urlKey: 's5TranscriptsUrl',
    },
    {
      key: 's6Transcripts',
      label: 'S6 Transcripts',
      description: 'PDF Document (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 's6-transcripts.pdf',
      urlKey: 's6TranscriptsUrl',
    },
    {
      key: 'school1LearningAgreement',
      label: 'Learning Agreement (School 1)',
      description: 'PDF Document (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 'learning-agreement-school1.pdf',
      urlKey: 'school1LearningAgreementUrl',
    },
    {
      key: 'school2LearningAgreement',
      label: 'Learning Agreement (School 2)',
      description: 'PDF Document (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 'learning-agreement-school2.pdf',
      urlKey: 'school2LearningAgreementUrl',
    },
    {
      key: 'passeport',
      label: 'Passeport',
      description: 'PDF Document (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 'passeport.pdf',
      urlKey: 'passeportUrl',
    },
    {
      key: 'residencePermit',
      label: 'Residence Permit',
      description: 'PDF Document (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 'residence-permit.pdf',
      urlKey: 'residencePermitUrl',
    },
  ];

  return documentConfigs;
};

// Utility functions
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const getElectives = (electivesString: string): string[] => {
  if (!electivesString) return [];
  return electivesString
    .split(';')
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
};

export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
