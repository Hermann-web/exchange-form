// src/components/types.ts
import {
  schoolLabels,
  nationalityLabels,
  type School,
  type Nationality,
  type SubmissionForm,
  type SubmissionFormObject,
  type PersonalSubmissionFormMeta,
  type SchoolSubmissionFormMeta,
  schoolAcademicPathKeyAndRequiredMap,
} from '@/types/submissionapi';
import * as icons from '@heroicons/vue/24/outline';

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
  validator?: (value: string) => string;
}

type Extension = '.docx' | '.pdf';
export type FileExtension = 'docx' | 'pdf';

export interface FileUploadField<Tform = any> {
  key: keyof Tform;
  label: string;
  accept: Extension;
  extensions: FileExtension[];
  required: boolean;
  conditional?: () => boolean;
}

export interface DocumentDisplay<T = any> {
  key: keyof T;
  label: string;
  description: string;
  icon: any;
  filename: string;
}

export interface SchoolChoiceConfig {
  title: string;
  text: string;
  choiceKey: keyof SchoolSubmissionFormMeta;
  emoji?: string;
  bgClass?: string;
}

// School configuration
export interface SchoolOption {
  value: School;
  label: string;
}

export interface NationalityOption {
  value: Nationality;
  label: string;
}

function entries<T extends Record<string, unknown>>(
  obj: T
): { [K in keyof T]: [K, T[K]] }[keyof T][] {
  return Object.entries(obj) as any;
}

export const schoolOptions: SchoolOption[] = entries(schoolLabels).map(
  ([value, label]) => ({
    value,
    label,
  })
);

export const nationalityOptions: NationalityOption[] = entries(nationalityLabels).map(
  ([value, label]) => ({
    value,
    label,
  })
);

export const schoolChoices: SchoolChoiceConfig[] = [
  {
    title: 'first_choice',
    text: 'Premier Choix',
    choiceKey: 'choice1',
    emoji: '🥇',
    bgClass: 'bg-green-500/10 border-green-400/20',
  },
  {
    title: 'second_choice',
    text: 'Deuxième Choix',
    choiceKey: 'choice2',
    emoji: '🥈',
    bgClass: 'bg-yellow-500/10 border-yellow-400/20',
  },
];

// Document configuration factory
export const createDocumentConfigs = () => {
  const documentConfigs: DocumentDisplay<SubmissionFormObject>[] = [
    {
      key: 'applicationFormEcc',
      label: 'Formulaire ECC de dossier de candidature',
      description: 'Document Microsoft Word (.docx)',
      icon: icons.DocumentTextIcon,
      filename: 'application-form-ecc.docx',
    },
    {
      key: 'applicationFormGec',
      label: 'Formulaire GEC de dossier de candidature',
      description: 'Document Microsoft Word (.docx)',
      icon: icons.DocumentTextIcon,
      filename: 'application-form-gec.docx',
    },
    {
      key: 'resumePdf',
      label:
        'Curriculum Vitae (CV) actualisé en y indiquant le lien de votre profil LinkedIn',
      description: 'Document PDF (.pdf)',
      icon: icons.AcademicCapIcon,
      filename: 'resumePdf.pdf',
    },
    {
      key: 's5Transcripts',
      label: 'Relevés de notes S5 (2 pages)',
      description: 'Document PDF (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 's5-transcripts.pdf',
    },
    {
      key: 's6Transcripts',
      label: 'Relevés de notes S6 (2 pages)',
      description: 'Document PDF (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 's6-transcripts.pdf',
    },
    // s7Transcripts, s8Transcripts
    {
      key: 's7Transcripts',
      label: 'Relevés de notes S7 (2 pages)',
      description: 'Document PDF (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 's7-transcripts.pdf',
    },
    {
      key: 's8Transcripts',
      label: 'Relevés de notes S8 (2 pages)',
      description: 'Document PDF (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 's8-transcripts.pdf',
    },
    {
      key: 'motivationLetterChoice1',
      label: 'Dossier de Candidature (École 1)',
      description: 'Document PDF (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 'learning-agreement-choice1.pdf',
    },
    {
      key: 'motivationLetterChoice2',
      label: 'Dossier de Candidature (École 2)',
      description: 'Document PDF (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 'learning-agreement-choice2.pdf',
    },
    {
      key: 'frenchLevelCertificate',
      label: 'Niveau de français',
      description: 'Document PDF (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 'french-level-certificate.pdf',
    },
    {
      key: 'englishLevelCertificate',
      label: "Niveau d'anglais",
      description: 'Document PDF (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 'english-level-certificate.pdf',
    },
    {
      key: 'passeportPdf',
      label: 'Passeport',
      description: 'Document PDF (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 'passeportPdf.pdf',
    },
    {
      key: 'residencePermit',
      label: 'Titre de séjour',
      description: 'Document PDF (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 'residence-permit.pdf',
    },
    {
      key: 'otherFilesPdf',
      label: 'Documents Supplémentaires',
      description: 'Document PDF (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 'other-files.pdf',
    },
  ];

  return documentConfigs;
};

// Utility functions
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
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
export const createPersonalFieldConfigs = () => {
  const personalFields: PersonalField<PersonalSubmissionFormMeta>[] = [
    {
      key: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      validator: (value: string) => validateRequired(value),
    },
    {
      key: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      validator: (value: string) => validateRequired(value),
    },
    {
      key: 'nationality',
      label: 'Nationality',
      type: 'select',
      required: true,
      options: [
        { value: 'moroccan', label: nationalityLabels['moroccan'] },
        { value: 'other', label: nationalityLabels['other'] },
      ],
    },
    {
      key: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      readonly: true,
      validator: (value: string) => validateEmail(value),
    },
  ];
  return personalFields;
};

// Document configuration factory
export const createFileUploadFieldConfigs = (form: SubmissionForm) => {
  const fileUploadConfigs: FileUploadField<SubmissionFormObject>[] = [
    {
      key: 'applicationFormEcc',
      label: 'Formulaire ECC de dossier de candidature (.docx)',
      accept: '.docx',
      extensions: ['docx'],
      required: true,
    },
    {
      key: 'applicationFormGec',
      label: 'Formulaire GEC de dossier de candidature (.docx)',
      accept: '.docx',
      extensions: ['docx'],
      required: true,
    },
    {
      key: 'resumePdf',
      label: 'Curriculum Vitae (CV) actualisé (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: true,
    },
    {
      key: 's5Transcripts',
      label: 'Relevés de notes S5 (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: true,
    },
    {
      key: 's6Transcripts',
      label: 'Relevés de notes S6 (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: true,
    },
    {
      key: 's7Transcripts',
      label: 'Relevés de notes S7 (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: true,
    },
    {
      key: 's8Transcripts',
      label: 'Relevés de notes S8 (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: true,
    },
    {
      key: 'motivationLetterChoice1',
      label: 'Dossier de Candidature (École 1) (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: false,
      conditional: () => form.choice1.schoolName !== 'unset',
    },
    {
      key: 'motivationLetterChoice2',
      label: 'Dossier de Candidature (École 2) (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: false,
      conditional: () => form.choice2.schoolName !== 'unset',
    },
    {
      key: 'passeportPdf',
      label: 'Passeport (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: true,
    },
    {
      key: 'frenchLevelCertificate',
      label: 'Attestation de niveau de français (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: true,
    },
    {
      key: 'englishLevelCertificate',
      label: "Attestation de niveau d'anglais (.pdf)",
      accept: '.pdf',
      extensions: ['pdf'],
      required: true,
    },
    {
      key: 'residencePermit',
      label: 'Titre de séjour (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: false,
      conditional: () => form.nationality === 'other',
    },
    {
      key: 'otherFilesPdf',
      label: 'Documents Supplémentaires (un fichier, optionnel) (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: false,
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
export const validateEmail = (value: string): string => {
  return !testEmail(value)
    ? `Email must be in format: firstname.lastname@${import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN}`
    : '';
};

export const validateRequired = (value: string): string => {
  return !value.trim() ? 'This field is required' : '';
};

export const initialize_submission_reactives = (
  initialEmail?: string
): { initial_form: SubmissionForm; initial_errors: SubmissionErrorType } => {
  const initial_form: SubmissionForm = {
    firstName: '',
    lastName: '',
    nationality: 'moroccan',
    email: initialEmail || '',
    choice1: { schoolName: 'unset', academicPath: '', careerPath: '', electives: '' },
    choice2: { schoolName: 'unset', academicPath: '', careerPath: '', electives: '' },
    applicationFormEcc: null as any,
    applicationFormGec: null as any,
    resumePdf: null as any,
    s5Transcripts: null as any,
    s6Transcripts: null as any,
    s7Transcripts: null as any,
    s8Transcripts: null as any,
    residencePermit: undefined,
    motivationLetterChoice1: null as any,
    motivationLetterChoice2: null as any,
    frenchLevelCertificate: null as any,
    englishLevelCertificate: null as any,
    passeportPdf: null as any,
    otherFilesPdf: null as any,
  };

  const initial_errors: SubmissionErrorType = {
    firstName: '',
    lastName: '',
    email: '',
    applicationFormEcc: '',
    applicationFormGec: '',
    resumePdf: '',
    s5Transcripts: '',
    s6Transcripts: '',
    s7Transcripts: '',
    s8Transcripts: '',
    residencePermit: '',
    motivationLetterChoice1: '',
    motivationLetterChoice2: '',
    frenchLevelCertificate: '',
    englishLevelCertificate: '',
    passeportPdf: '',
    nationality: '',
    choice1: '',
    choice2: '',
    otherFilesPdf: '',
  };

  return { initial_form, initial_errors };
};

export const validateAllFields = (
  form: SubmissionForm,
  errors: SubmissionErrorType
): boolean => {
  const personalFieldConfigs = createPersonalFieldConfigs();
  const fileUploadConfigs = createFileUploadFieldConfigs(form);

  const requiredPersonalFields = personalFieldConfigs
    .filter((field) => field.required)
    .map((field) => form[field.key]);
  const requiredFileUploadFields = fileUploadConfigs
    .filter((field) => (field.conditional ? field.conditional() : field.required))
    .map((field) => form[field.key]);

  const requiredFields: any[] = [...requiredPersonalFields, ...requiredFileUploadFields];

  if (
    schoolAcademicPathKeyAndRequiredMap[form.choice1.schoolName].academicPath.required
  ) {
    requiredFields.push(form.choice1.academicPath);
  }

  if (
    schoolAcademicPathKeyAndRequiredMap[form.choice2.schoolName].academicPath.required
  ) {
    requiredFields.push(form.choice2.academicPath);
  }

  if (schoolAcademicPathKeyAndRequiredMap[form.choice1.schoolName].careerPath.required) {
    requiredFields.push(form.choice1.careerPath);
  }

  if (schoolAcademicPathKeyAndRequiredMap[form.choice2.schoolName].careerPath.required) {
    requiredFields.push(form.choice2.careerPath);
  }

  if (schoolAcademicPathKeyAndRequiredMap[form.choice1.schoolName].electives.required) {
    requiredFields.push(form.choice1.electives);
  }

  if (schoolAcademicPathKeyAndRequiredMap[form.choice2.schoolName].electives.required) {
    requiredFields.push(form.choice2.electives);
  }

  const hasSetTheFirstChoice = form.choice1.schoolName !== 'unset';
  const hasAllRequiredFields = requiredFields.every((field) => field);
  const hasNoErrors = Object.values(errors).every((error) => !error);

  return hasSetTheFirstChoice && hasAllRequiredFields && hasNoErrors;
};
