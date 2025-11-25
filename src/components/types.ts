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
export const createDocumentConfigs = (icons: any) => {
  const documentConfigs: DocumentDisplay<SubmissionFormObject>[] = [
    {
      key: 'applicationFormDocx',
      label: 'Formulaire de dossier de candidature pour la mobilité S8',
      description: 'Document Microsoft Word (.docx)',
      icon: icons.DocumentTextIcon,
      filename: 'application-form.docx',
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
    {
      key: 'choice1LearningAgreement',
      label: 'Learning Agreement (École 1)',
      description: 'Document PDF (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 'learning-agreement-choice1.pdf',
    },
    {
      key: 'choice2LearningAgreement',
      label: 'Learning Agreement (École 2)',
      description: 'Document PDF (.pdf)',
      icon: icons.DocumentTextIcon,
      filename: 'learning-agreement-choice2.pdf',
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
      label: 'Supporting Attachments',
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
export const createPersonalFieldConfigs = (
  form: SubmissionForm,
  errors: SubmissionErrorType
) => {
  const personalFields: PersonalField<PersonalSubmissionFormMeta>[] = [
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
      required: true,
    },
    {
      key: 'resumePdf',
      label: 'Resume/CV (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: true,
    },
    {
      key: 's5Transcripts',
      label: 'S5 Transcripts (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: true,
    },
    {
      key: 's6Transcripts',
      label: 'S6 Transcripts (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: true,
    },
    {
      key: 'choice1LearningAgreement',
      label: 'Learning Agreement (School 1) (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: false,
      conditional: () => form.choice1.schoolName !== 'unset',
    },
    {
      key: 'choice2LearningAgreement',
      label: 'Learning Agreement (School 2) (.pdf)',
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
      key: 'residencePermit',
      label: 'Residence Permit (.pdf)',
      accept: '.pdf',
      extensions: ['pdf'],
      required: false,
      conditional: () => form.nationality === 'other',
    },
    {
      key: 'otherFilesPdf',
      label: 'More Supporting Documents (onefile, optional) (.pdf)',
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
const validateEmail = (errors: SubmissionErrorType, form: SubmissionForm) => {
  errors.email = !testEmail(form.email)
    ? `Email must be in format: firstname.lastname@${import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN}`
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
    choice1: { schoolName: 'centrale_supelec', academicPath: '' },
    choice2: { schoolName: 'em_lyon', academicPath: '' },
    applicationFormDocx: null as any,
    resumePdf: null as any,
    s5Transcripts: null as any,
    s6Transcripts: null as any,
    residencePermit: undefined,
    choice1LearningAgreement: null as any,
    choice2LearningAgreement: null as any,
    passeportPdf: null as any,
    otherFilesPdf: null as any,
  };

  const initial_errors: SubmissionErrorType = {
    firstName: '',
    lastName: '',
    email: '',
    applicationFormDocx: '',
    resumePdf: '',
    s5Transcripts: '',
    s6Transcripts: '',
    residencePermit: '',
    choice1LearningAgreement: '',
    choice2LearningAgreement: '',
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
  // const personalFieldConfigs = createPersonalFieldConfigs(form, errors);
  // const fileUploadConfigs = createFileUploadFieldConfigs(form);

  // const requiredPersonalFields = personalFieldConfigs.map((field) => field.required);
  // const requiredFileUploadFields = fileUploadConfigs.map((field) =>
  //   field.conditional ? field.conditional() : field.required
  // );

  // const requiredFields: any[] = [...requiredPersonalFields, ...requiredFileUploadFields];

  const requiredFields: any[] = [
    form.firstName,
    form.lastName,
    form.nationality,
    form.email,
    form.applicationFormDocx,
    form.resumePdf,
    form.s5Transcripts,
    form.s6Transcripts,
    form.passeportPdf,
  ];

  if (
    form.choice1.schoolName === 'centrale_supelec' ||
    form.choice1.schoolName == 'centrale_mediterranee'
  ) {
    requiredFields.push(form.choice1.academicPath);
  }

  if (
    form.choice2.schoolName === 'centrale_supelec' ||
    form.choice2.schoolName == 'centrale_mediterranee'
  ) {
    requiredFields.push(form.choice2.academicPath);
  }

  if (form.nationality === 'other') {
    requiredFields.push(form.residencePermit);
  }
  if (form.choice1.schoolName !== 'unset') {
    requiredFields.push(form.choice1LearningAgreement);
  }
  if (form.choice2.schoolName !== 'unset') {
    requiredFields.push(form.choice2LearningAgreement);
  }

  const hasAllRequiredFields = requiredFields.every((field) => field);
  const hasNoErrors = Object.values(errors).every((error) => !error);

  return hasAllRequiredFields && hasNoErrors;
};

// export const validateAllFields = (
//   form: SubmissionForm,
//   errors: SubmissionErrorType
// ): boolean => {
//   const personalFieldConfigs = createPersonalFieldConfigs(form, errors);
//   const fileUploadConfigs = createFileUploadFieldConfigs(form);

//     const hasAllRequiredPersonalFields = personalFieldConfigs.every(
//     (field) => field.validator? field.validator(form[field.key]) : field.required && form[field.key]
//   );

//   const hasAllRequiredFileUploadFields = fileUploadConfigs.every(
//     (field) => field.conditional? field.conditional() : field.required && form[field.key]
//   );

//   // const hasAllRequiredPersonalFields = personalFieldConfigs.every(
//   //   (field) => field.required && form[field.key]
//   // );

//   // const hasAllRequiredFileUploadFields = fileUploadConfigs.every(
//   //   (field) => field.required && form[field.key]
//   // );

//   const hasAllRequiredFields =
//     hasAllRequiredPersonalFields && hasAllRequiredFileUploadFields;

//   const hasNoErrors = Object.values(errors).every((error) => !error);

//   return hasAllRequiredFields && hasNoErrors;
// };
