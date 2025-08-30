import type {
  School,
  SubmissionForm,
  SubmissionFormMeta,
  SubmissionFormObject,
  SubmissionFormObjectUrls,
} from '@/types/submissionapi';

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

type Extension = '.docx' | '.pdf';
export type FileExtension = 'docx' | 'pdf';

export interface FileUploadField<Tform = any> {
  key: keyof Tform;
  label: string;
  accept: Extension;
  extensions: FileExtension[];
  errorKey: keyof Tform;
  required: boolean;
  conditional?: () => boolean;
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
  { value: 'em_lyon', label: 'EM Lyon' },
  { value: 'centrale_lille', label: 'Centrale Lille' },
  { value: 'centrale_mediterranee', label: 'Centrale Méditerranée' },
  { value: 'centrale_lyon', label: 'Centrale Lyon' },
  { value: 'centrale_pekin', label: 'Centrale Pékin' },
];

export const schoolLabels: Record<School, string> = {
  centrale_supelec: 'CentraleSupélec',
  em_lyon: 'EM Lyon',
  centrale_lille: 'Centrale Lille',
  centrale_mediterranee: 'Centrale Méditerranée',
  centrale_lyon: 'Centrale Lyon',
  centrale_pekin: 'Centrale Pékin',
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

export type SubmissionErrorType = { [K in keyof SubmissionForm]?: string };

// Personal fields configuration factory
export const createPersonalFieldConfigs = (
  form: SubmissionForm,
  errors: SubmissionErrorType
) => {
  const personalFields: PersonalField<SubmissionFormMeta>[] = [
    {
      key: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      validator: (value: string) => validateRequired('firstName', value, errors),
    },
    {
      key: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      validator: (value: string) => validateRequired('lastName', value, errors),
    },
    {
      key: 'nationality',
      label: 'Nationality',
      type: 'select',
      required: true,
      options: [
        { value: 'moroccan', label: 'Moroccan' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      key: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      readonly: true,
      validator: () => validateEmail(errors, form),
    },
  ];
  return personalFields;
};

// Document configuration factory
export const createFileUploadFieldConfigs = (form: SubmissionForm) => {
  const fileUploadConfigs: FileUploadField<SubmissionFormObject>[] = [
    {
      key: 'applicationFormDocx',
      label: 'Application Form (.docx)',
      accept: '.docx',
      extensions: ['docx'],
      errorKey: 'applicationFormDocx',
      required: true,
    },
    {
      key: 'resumePdf',
      label: 'Resume/CV (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      errorKey: 'resumePdf',
      required: true,
    },
    {
      key: 's5Transcripts',
      label: 'S5 Transcripts (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      errorKey: 's5Transcripts',
      required: true,
    },
    {
      key: 's6Transcripts',
      label: 'S6 Transcripts (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      errorKey: 's6Transcripts',
      required: true,
    },
    {
      key: 'school1LearningAgreement',
      label: 'Learning Agreement (School 1) (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      errorKey: 'school1LearningAgreement',
      required: true,
    },
    {
      key: 'school2LearningAgreement',
      label: 'Learning Agreement (School 2) (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      errorKey: 'school2LearningAgreement',
      required: true,
    },
    {
      key: 'passeportPdf',
      label: 'Passeport (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      errorKey: 'passeportPdf',
      required: true,
    },
    {
      key: 'residencePermit',
      label: 'Residence Permit (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      errorKey: 'residencePermit',
      required: true,
      conditional: () => form.nationality === 'other',
    },
  ];

  return fileUploadConfigs;
};

export const testEmail = (email: string): boolean => {
  if (!email) return false;

  const domain = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN || 'centrale-casablanca.ma';

  // Match "firstname.lastname@centrale-casablanca.ma" or oters depending on env
  const emailRegex = new RegExp(`^[^\\s@]+@${domain.replace('.', '\\.')}$`);
  return emailRegex.test(email);
};

// Validation functions
const validateEmail = (errors: SubmissionErrorType, form: SubmissionForm) => {
  errors.email = !testEmail(form.email)
    ? 'Email must be in format: firstname.lastname@etu.univh2c.ma'
    : '';
};

export const validateRequired = (
  field: string,
  value: string,
  errors: SubmissionErrorType
) => {
  errors[field as keyof typeof errors] = !value.trim() ? 'This field is required' : '';
};

export const initialize_submission_reactives = (
  initialEmail?: string
): { initial_form: SubmissionForm; initial_errors: SubmissionErrorType } => {
  const initial_form: SubmissionForm = {
    firstName: '',
    lastName: '',
    nationality: 'moroccan',
    email: initialEmail || '',
    school1: 'centrale_supelec',
    program1: '',
    thematicSequence1: '',
    electives1: '',
    school2: 'em_lyon',
    program2: '',
    thematicSequence2: '',
    electives2: '',
    applicationFormDocx: null as any,
    resumePdf: null as any,
    s5Transcripts: null as any,
    s6Transcripts: null as any,
    residencePermit: undefined,
    school1LearningAgreement: null as any,
    school2LearningAgreement: null as any,
    passeportPdf: null as any,
  };

  const initial_errors: SubmissionErrorType = {
    firstName: '',
    lastName: '',
    email: '',
    program1: '',
    program2: '',
    applicationFormDocx: '',
    resumePdf: '',
    s5Transcripts: '',
    s6Transcripts: '',
    residencePermit: '',
    school1LearningAgreement: '',
    school2LearningAgreement: '',
    passeportPdf: '',
    nationality: '',
    school1: '',
    school2: '',
    thematicSequence1: '',
    thematicSequence2: '',
    electives1: '',
    electives2: '',
  };

  return { initial_form, initial_errors };
};

export const validateAllFields = (
  form: SubmissionForm,
  errors: SubmissionErrorType
): boolean => {
  const requiredFields: any[] = [
    form.firstName,
    form.lastName,
    form.email,
    form.program1,
    form.program2,
    form.applicationFormDocx,
    form.resumePdf,
    form.s5Transcripts,
    form.s6Transcripts,
    form.school1LearningAgreement,
    form.school2LearningAgreement,
    form.passeportPdf,
  ];

  if (form.nationality === 'other') {
    requiredFields.push(form.residencePermit);
  }

  const hasAllRequiredFields = requiredFields.every((field) => field);
  const hasNoErrors = Object.values(errors).every((error) => !error);

  return hasAllRequiredFields && hasNoErrors;
};
