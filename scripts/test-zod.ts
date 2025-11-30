// ./scripts/test-zod.ts
import { z } from 'zod';
import {
  LoginRequestSchema,
  SignupRequestSchema,
  AuthUserSchema,
  AuthSessionSchema,
  UserProfileSchema,
} from '../src/types/authapi.ts';
import {
  SubmissionFormSchema,
  SubmissionMetaDbSchema,
} from '../src/types/submissionapi.ts';

// Mock File class for Node environment if not present
if (typeof File === 'undefined') {
  global.File = class File {
    name: string;
    lastModified: number;
    constructor(parts: any[], name: string, options?: any) {
      this.name = name;
      this.lastModified = Date.now();
    }
  } as any;
}

console.log('--- Testing Auth Schemas ---');

try {
  console.log('Testing valid login...');
  LoginRequestSchema.parse({ email: 'test@example.com', password: 'password' });
  console.log('✅ Valid login passed');
} catch (e) {
  console.error('❌ Valid login failed', e);
}

try {
  console.log('Testing invalid login (invalid email)...');
  LoginRequestSchema.parse({ email: 'invalid-email', password: 'password' });
  console.error('❌ Invalid login passed (should fail)');
} catch (e) {
  console.log('✅ Invalid login failed as expected');
}

try {
  console.log('Testing valid signup...');
  SignupRequestSchema.parse({
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    password: 'password123',
  });
  console.log('✅ Valid signup passed');
} catch (e) {
  console.error('❌ Valid signup failed', e);
}

try {
  console.log('Testing valid AuthUser...');
  AuthUserSchema.parse({
    id: 'user-123',
    email: 'test@example.com',
    created_at: '2023-01-01',
  });
  console.log('✅ Valid AuthUser passed');
} catch (e) {
  console.error('❌ Valid AuthUser failed', e);
}

try {
  console.log('Testing valid AuthSession...');
  AuthSessionSchema.parse({
    access_token: 'token-123',
    refresh_token: 'refresh-123',
    token_type: 'bearer',
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  });
  console.log('✅ Valid AuthSession passed');
} catch (e) {
  console.error('❌ Valid AuthSession failed', e);
}

try {
  console.log('Testing valid UserProfile...');
  UserProfileSchema.parse({
    id: 'user-123',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    is_email_verified: true,
  });
  console.log('✅ Valid UserProfile passed');
} catch (e) {
  console.error('❌ Valid UserProfile failed', e);
}

console.log('\n--- Testing Submission Schema ---');

const validSubmission = {
  firstName: 'John',
  lastName: 'Doe',
  nationality: 'moroccan',
  email: 'john.doe@student-cs.fr',
  choice1: {
    schoolName: 's9_centrale_supelec_gif',
    academicPath: 'Data Science',
    careerPath: 'Engineer',
    electives: '',
  },
  choice2: {
    schoolName: 'unset',
    academicPath: '',
    careerPath: '',
    electives: '',
  },
  applicationFormEcc: new File([], 'form.docx'),
  resumePdf: new File([], 'resume.pdf'),
  s5Transcripts: new File([], 's5.pdf'),
  s6Transcripts: new File([], 's6.pdf'),
  motivationLetterChoice1: new File([], 'letter.pdf'),
  frenchLevelCertificate: new File([], 'french.pdf'),
  englishLevelCertificate: new File([], 'english.pdf'),
  passeportPdf: new File([], 'passport.pdf'),
};

try {
  console.log('Testing valid submission form...');
  SubmissionFormSchema.parse(validSubmission);
  console.log('✅ Valid submission form passed');
} catch (e) {
  console.error('❌ Valid submission form failed', e);
  if (e instanceof z.ZodError) {
    console.error(JSON.stringify(e.format(), null, 2));
  }
}

try {
  console.log('Testing invalid submission (missing file)...');
  const invalidSubmission = { ...validSubmission, resumePdf: undefined };
  SubmissionFormSchema.parse(invalidSubmission);
  console.error('❌ Invalid submission passed (should fail)');
} catch (e) {
  console.log('✅ Invalid submission failed as expected');
}

try {
  console.log('Testing valid SubmissionMetaDb...');
  SubmissionMetaDbSchema.parse({
    ...validSubmission,
    applicationFormEccUrl: 'http://example.com/form.docx',
    resumeUrl: 'http://example.com/resume.pdf',
    s5TranscriptsUrl: 'http://example.com/s5.pdf',
    s6TranscriptsUrl: 'http://example.com/s6.pdf',
    motivationLetterChoice1Url: 'http://example.com/letter.pdf',
    frenchLevelCertificateUrl: 'http://example.com/french.pdf',
    englishLevelCertificateUrl: 'http://example.com/english.pdf',
    passeportUrl: 'http://example.com/passport.pdf',
    createdAt: '2023-01-01T00:00:00Z',
    databaseId: 'db-123',
    // Remove File objects as they are not part of SubmissionMetaDb (it has URLs instead)
    applicationFormEcc: undefined,
    resumePdf: undefined,
    s5Transcripts: undefined,
    s6Transcripts: undefined,
    motivationLetterChoice1: undefined,
    frenchLevelCertificate: undefined,
    englishLevelCertificate: undefined,
    passeportPdf: undefined,
  });
  console.log('✅ Valid SubmissionMetaDb passed');
} catch (e) {
  console.error('❌ Valid SubmissionMetaDb failed', e);
  if (e instanceof z.ZodError) {
    console.error(JSON.stringify(e.format(), null, 2));
  }
}
