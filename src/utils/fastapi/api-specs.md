### 3. Module 1: Auth API (`AuthModule`)

Implementation of `AuthApiInterface`.

#### 3.1 DTOs (Data Transfer Objects)

```typescript
// Matches SignupRequest
export class SignupDto {
  @IsEmail() email: string;
  @IsString() first_name: string;
  @IsString() last_name: string;
  @IsString() @MinLength(8) password: string;
}

// Matches LoginRequest
export class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}

// Matches Password Reset
export class ResetPasswordDto {
  @IsString() token: string;
  @IsString() @MinLength(8) newPassword: string;
}
```

#### 3.2 Endpoints

##### `POST /auth/register`

- **Input:** `SignupDto`
- **Output:** `SignupResponse`
  ```json
  {
    "user": { "id": "...", "email": "..." },
    "session": { "access_token": "...", "refresh_token": "..." }
  }
  ```

##### `POST /auth/login`

- **Input:** `LoginDto`
- **Output:** `LoginResponse` (Same structure as signup)

##### `GET /auth/me`

- **Guard:** `JwtAuthGuard`
- **Output:** `UserProfile`
  ```json
  {
    "id": "uuid",
    "email": "student@school.edu",
    "first_name": "John",
    "last_name": "Doe",
    "is_email_verified": true
  }
  ```

##### `POST /auth/resend-verification`

- **Input:** `{ "email": "string" }`
- **Action:** If user exists, triggers `sendVerificationEmail(email)`.
- **Output:** `200 OK`

##### `POST /auth/verify?token=...`

- **Action:** Validates token -> Updates `User.is_verified = true`.
- **Output:** `200 OK`

##### `POST /auth/password/reset-request`

- **Input:** `{ "email": "string" }`
- **Output:** `200 OK` (Always 200 security practice, even if email not found)

##### `POST /auth/password/reset`

- **Input:** `ResetPasswordDto` (`token`, `newPassword`)
- **Output:** `200 OK`

\newpage

### 4. Module 2: (optional) Storage API (`StorageModule`)

Implementation of `FileStorageApiInterface`.

#### 4.1 Endpoints

##### `POST /api/upload`

- **Guard:** `JwtAuthGuard`
- **Content-Type:** `multipart/form-data`
- **Input:**
  - `file`: Binary file.
  - `email`: String.
  - `label`: String (Enum: `applicationFormEcc`, `resumePdf`, etc. from `SubmissionFormObject`).
  - `submissionId`: String.
- **Logic:**
  1.  Validate `label` against allowed file types.
  2.  Upload to S3/Local with path: `uploads/{userId}/{label}/{timestamp}.ext`.
- **Output:** `{ "success": true, "public_url": "...", "message": "..." }`

\newpage

### 5. Module 3: Submission API (`SubmissionModule`)

Implementation of `DataBaseApiInterface`.

#### 5.1 DTOs

**Transformation Logic:** The API receives nested JSON (`SubmissionData`). The Backend maps this to the relational DB schema.

```typescript
class SchoolChoiceDto {
  // Matches SchoolChoice interface
  @IsString() schoolName: string;
  @IsString() academicPath: string;
  @IsOptional() @IsString() careerPath: string;
  @IsOptional() @IsString() electives: string; //";" separated list
}

export class SaveSubmissionDto {
  // Matches SubmissionData
  // Meta
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsEnum(['moroccan', 'other']) nationality: 'moroccan' | 'other';
  @IsEmail() email: string;

  // Choices
  @ValidateNested() @Type(() => SchoolChoiceDto) choice1: SchoolChoiceDto;
  @ValidateNested() @Type(() => SchoolChoiceDto) choice2: SchoolChoiceDto;

  // URLs (Matches SubmissionFormObjectUrls)
  @IsUrl() applicationFormEccUrl: string;
  @IsUrl() applicationFormGecUrl: string;
  @IsUrl() resumeUrl: string;
  @IsUrl() s5TranscriptsUrl: string;
  @IsUrl() s6TranscriptsUrl: string;
  @IsOptional() @IsUrl() s7TranscriptsUrl?: string;
  @IsOptional() @IsUrl() s8TranscriptsUrl?: string;
  @IsOptional() @IsUrl() residencePermitUrl?: string;
  @IsUrl() motivationLetterChoice1Url: string;
  @IsOptional() @IsUrl() motivationLetterChoice2Url?: string;
  @IsUrl() frenchLevelCertificateUrl: string;
  @IsUrl() englishLevelCertificateUrl: string;
  @IsUrl() passeportUrl: string;
  @IsOptional() @IsUrl() otherFilesPdfUrl?: string;

  // Metadata
  @IsOptional() @IsString() createdAt?: string;
}
```

#### 5.2 Endpoints

##### `POST /submissions`

- **Guard:** `JwtAuthGuard`, `VerifiedUserGuard`.
- **Input:** `SaveSubmissionDto`.
- **Logic (Transaction):**
  1.  Get `userId` from token.
  2.  **Upsert** `Submission` table (update URLs/Nationality if exists).
  3.  **Delete** existing `SubmissionChoice` rows for this `submission_id`.
  4.  **Insert** new `SubmissionChoice` rows:
      - Row 1: `{ submission_id, priority: 1, ...choice1 }`
      - Row 2: `{ submission_id, priority: 2, ...choice2 }`
- **Output:** `SubmissionMetaDb` (JSON)

##### `GET /submissions/me`

- **Guard:** `JwtAuthGuard`.
- **Input:** None.
- **Logic:**
  1.  Find `Submission` by `userId`. Return `null` if not found.
  2.  Find `SubmissionChoice` where `submission_id` matches.
  3.  **Reconstruct JSON:** Map DB rows back to `choice1` and `choice2` based on `priority`.
- **Output:** `SubmissionMetaDb` (or `null`)
  ```json
  {
    "databaseId": "uuid",
    "firstName": "...",
    "choice1": { "schoolName": "...", "academicPath": "..." },
    "choice2": { "schoolName": "...", "academicPath": "..." },
    "applicationFormEccUrl": "...",
    ...
  }
  ```

##### `GET /submissions` (Admin)

- **Guard:** `JwtAuthGuard`, `RolesGuard('admin')`.
- **Output:** `SubmissionMetaDb[]`
  - Returns array of all submissions.
  - Choices are nested inside each object.
