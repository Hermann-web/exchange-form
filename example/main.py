import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

app = FastAPI(title="Mobility Form Mockup API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# 1. STORAGE MODELS (Internal Representation)
# ==============================================================================

class User(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    password: str  # In real app, hash this!
    is_email_verified: bool
    created_at: str

class Session(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user_id: str
    expires_at: float

class Submission(BaseModel):
    databaseId: str
    userId: str
    firstName: str
    lastName: str
    nationality: str
    email: EmailStr
    choice1: Dict[str, Any] # Storing as dict for simplicity in storage, or could be nested model
    choice2: Dict[str, Any]
    applicationFormEccUrl: str
    applicationFormGecUrl: Optional[str] = None
    resumeUrl: str
    s5TranscriptsUrl: str
    s6TranscriptsUrl: str
    s7TranscriptsUrl: Optional[str] = None
    s8TranscriptsUrl: Optional[str] = None
    residencePermitUrl: Optional[str] = None
    motivationLetterChoice1Url: str
    motivationLetterChoice2Url: Optional[str] = None
    frenchLevelCertificateUrl: str
    englishLevelCertificateUrl: str
    passeportUrl: str
    otherFilesPdfUrl: Optional[str] = None
    createdAt: str
    updatedAt: Optional[str] = None

# ==============================================================================
# 2. DTOs (Data Transfer Objects - Inputs)
# ==============================================================================

class SignupDto(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str

class LoginDto(BaseModel):
    email: EmailStr
    password: str

class ResetPasswordDto(BaseModel):
    token: str
    newPassword: str

class SchoolChoiceDto(BaseModel):
    schoolName: str
    academicPath: str
    careerPath: Optional[str] = None
    electives: Optional[str] = None

class SaveSubmissionDto(BaseModel):
    # Meta
    firstName: str
    lastName: str
    nationality: str # 'moroccan' | 'other'
    email: EmailStr

    # Choices
    choice1: SchoolChoiceDto
    choice2: SchoolChoiceDto

    # URLs
    applicationFormEccUrl: str
    applicationFormGecUrl: Optional[str] = None
    resumeUrl: str
    s5TranscriptsUrl: str
    s6TranscriptsUrl: str
    s7TranscriptsUrl: Optional[str] = None
    s8TranscriptsUrl: Optional[str] = None
    residencePermitUrl: Optional[str] = None
    motivationLetterChoice1Url: str
    motivationLetterChoice2Url: Optional[str] = None
    frenchLevelCertificateUrl: str
    englishLevelCertificateUrl: str
    passeportUrl: str
    otherFilesPdfUrl: Optional[str] = None
    
    # Metadata
    createdAt: Optional[str] = None

class VerifyEmailConfirmDto(BaseModel):
    token: str

class PasswordResetRequestDto(BaseModel):
    email: str

# ==============================================================================
# 3. RESPONSES (Outputs)
# ==============================================================================

class UserProfileResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    is_email_verified: bool
    created_at: str

class AuthSessionResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserProfileResponse
    expires_at: float

class SignupResponse(BaseModel):
    user: UserProfileResponse
    session: AuthSessionResponse

class LoginResponse(BaseModel):
    user: UserProfileResponse
    session: AuthSessionResponse

# ==============================================================================
# 4. IN-MEMORY STORAGE
# ==============================================================================

USERS: Dict[str, User] = {}  # email -> User
SESSIONS: Dict[str, Session] = {}  # token -> Session
SUBMISSIONS: Dict[str, Submission] = {}  # user_id -> Submission
FILES: Dict[str, bytes] = {} # file_id -> bytes (Mock storage)

# ==============================================================================
# 5. HELPERS
# ==============================================================================

def get_current_user(authorization: Optional[str] = Header(None)) -> User:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != 'bearer':
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

    session = SESSIONS.get(token)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    if datetime.fromtimestamp(session.expires_at) < datetime.now():
        del SESSIONS[token]
        raise HTTPException(status_code=401, detail="Token expired")
    
    # Find user by ID from session
    # Since USERS is keyed by email, we need to search or change structure.
    # For efficiency in this mock, let's just search.
    user = next((u for u in USERS.values() if u.id == session.user_id), None)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    return user

# ==============================================================================
# 6. ENDPOINTS: AUTH
# ==============================================================================

@app.post("/auth/signup", response_model=SignupResponse)
def signup(dto: SignupDto):
    if dto.email in USERS:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    new_user = User(
        id=user_id,
        email=dto.email,
        first_name=dto.first_name,
        last_name=dto.last_name,
        password=dto.password,
        is_email_verified=False,
        created_at=datetime.now().isoformat()
    )
    USERS[dto.email] = new_user
    
    # Create session
    token = str(uuid.uuid4())
    expires_at = (datetime.now() + timedelta(days=1)).timestamp()
    
    new_session = Session(
        access_token=token,
        refresh_token=str(uuid.uuid4()),
        token_type="bearer",
        user_id=user_id,
        expires_at=expires_at
    )
    SESSIONS[token] = new_session
    
    user_profile = UserProfileResponse(**new_user.dict())
    auth_session = AuthSessionResponse(
        access_token=new_session.access_token,
        refresh_token=new_session.refresh_token,
        token_type=new_session.token_type,
        user=user_profile,
        expires_at=new_session.expires_at
    )
    
    return SignupResponse(user=user_profile, session=auth_session)

@app.post("/auth/login", response_model=LoginResponse)
def login(dto: LoginDto):
    user = USERS.get(dto.email)
    if not user or user.password != dto.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Create session
    token = str(uuid.uuid4())
    expires_at = (datetime.now() + timedelta(days=1)).timestamp()
    
    new_session = Session(
        access_token=token,
        refresh_token=str(uuid.uuid4()),
        token_type="bearer",
        user_id=user.id,
        expires_at=expires_at
    )
    SESSIONS[token] = new_session
    
    user_profile = UserProfileResponse(**user.dict())
    auth_session = AuthSessionResponse(
        access_token=new_session.access_token,
        refresh_token=new_session.refresh_token,
        token_type=new_session.token_type,
        user=user_profile,
        expires_at=new_session.expires_at
    )
    
    return LoginResponse(user=user_profile, session=auth_session)

@app.get("/auth/me", response_model=UserProfileResponse)
def me(user: User = Depends(get_current_user)):
    return UserProfileResponse(**user.dict())

@app.post("/auth/verify-email")
def send_verification_email(user: User = Depends(get_current_user)):
    print(f"Sending verification email to {user.email}")
    # Auto-verify for demo purposes
    if user.email in USERS:
        USERS[user.email].is_email_verified = True
    return {"message": "Verification email sent"}

@app.post("/auth/verify-email/confirm")
def verify_email_confirm(dto: VerifyEmailConfirmDto):
    token = dto.token
    if token == "invalid":
        raise HTTPException(status_code=400, detail="Invalid token")
    return {"message": "Email verified"}

@app.post("/auth/password/reset-request")
def password_reset_request(dto: PasswordResetRequestDto):
    if dto.email:
        print(f"Sending password reset email to {dto.email}")
    return {"message": "If email exists, reset link sent"}

@app.post("/auth/password/reset")
def password_reset(dto: ResetPasswordDto):
    return {"message": "Password updated"}

# ==============================================================================
# 7. ENDPOINTS: FILE STORAGE
# ==============================================================================

@app.post("/api/upload")
async def upload_file(
    email: str = Form(...),
    label: str = Form(...),
    submissionId: str = Form(...),
    file: UploadFile = File(...)
):
    content = await file.read()
    file_id = str(uuid.uuid4())
    FILES[file_id] = content
    
    filename = file.filename or "unknown"
    public_url = f"/static/uploads/{submissionId}/{label}/{filename}"
    
    return {
        "success": True,
        "public_url": public_url,
        "message": "File uploaded successfully"
    }

# ==============================================================================
# 8. ENDPOINTS: DATABASE (SUBMISSIONS)
# ==============================================================================

@app.post("/submissions", response_model=Submission)
def save_submission(dto: SaveSubmissionDto, user: User = Depends(get_current_user)):
    user_id = user.id
    
    # Convert DTO to Storage Model
    submission_data = dto.dict()
    
    # Handle optional fields and defaults
    created_at = submission_data.get("createdAt")
    if not created_at:
        created_at = datetime.now().isoformat()
        
    new_submission = Submission(
        databaseId=str(uuid.uuid4()),
        userId=user_id,
        firstName=dto.firstName,
        lastName=dto.lastName,
        nationality=dto.nationality,
        email=dto.email,
        choice1=dto.choice1.dict(),
        choice2=dto.choice2.dict(),
        applicationFormEccUrl=dto.applicationFormEccUrl,
        applicationFormGecUrl=dto.applicationFormGecUrl,
        resumeUrl=dto.resumeUrl,
        s5TranscriptsUrl=dto.s5TranscriptsUrl,
        s6TranscriptsUrl=dto.s6TranscriptsUrl,
        s7TranscriptsUrl=dto.s7TranscriptsUrl,
        s8TranscriptsUrl=dto.s8TranscriptsUrl,
        residencePermitUrl=dto.residencePermitUrl,
        motivationLetterChoice1Url=dto.motivationLetterChoice1Url,
        motivationLetterChoice2Url=dto.motivationLetterChoice2Url,
        frenchLevelCertificateUrl=dto.frenchLevelCertificateUrl,
        englishLevelCertificateUrl=dto.englishLevelCertificateUrl,
        passeportUrl=dto.passeportUrl,
        otherFilesPdfUrl=dto.otherFilesPdfUrl,
        createdAt=created_at,
        updatedAt=datetime.now().isoformat()
    )
        
    SUBMISSIONS[user_id] = new_submission
    
    return new_submission

@app.get("/submissions/me", response_model=Submission)
def get_my_submission(user: User = Depends(get_current_user)):
    user_id = user.id
    submission = SUBMISSIONS.get(user_id)
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    return submission

@app.get("/submissions", response_model=List[Submission])
def list_submissions(user: User = Depends(get_current_user)):
    # Admin check mock
    if "admin" not in user.email:
         pass
         
    return list(SUBMISSIONS.values())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
