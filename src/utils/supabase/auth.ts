import type {
  AuthApiInterface,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  UserProfile,
  AuthSession,
  AuthUser,
} from '@/types/authapi';
import { lazySupabase } from './lib';
import { ApiError } from '@/types/exceptions';

export const authApi: AuthApiInterface = {
  emailVerificationStrategy: 'provider-hosted',
  passwordResetStrategy: 'provider-hosted',

  async login(email, password): Promise<LoginResponse> {
    const supabase = lazySupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error?.code == 'email_not_confirmed') {
      throw new ApiError('Email not confirmed !', 401);
    }

    if (error) throw error;

    const userIn = data.user;

    const user: AuthUser = {
      id: userIn.id,
      email: userIn.email || 'unset',
      created_at: userIn.created_at,
    };

    const sessionIn = data.session;

    const session: AuthSession = {
      access_token: sessionIn.access_token,
      refresh_token: sessionIn.refresh_token,
      expires_at: sessionIn.expires_at,
      token_type: sessionIn.token_type,
      user: user,
    };

    if (!user) throw new Error('User not found');

    return {
      user: user,
      session: session,
    };
  },

  async signup(userData: SignupRequest): Promise<SignupResponse> {
    const supabase = lazySupabase();
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
        },
      },
    });

    if (error) throw error;
    const userIn = data.user;
    const sessionIn = data.session;

    if (!userIn || !sessionIn) throw new Error('User or session not found');

    const user: AuthUser = {
      id: userIn.id,
      email: userIn.email || 'unset',
      created_at: userIn.created_at,
    };

    const session: AuthSession = {
      access_token: sessionIn.access_token,
      refresh_token: sessionIn.refresh_token,
      expires_at: sessionIn.expires_at,
      token_type: sessionIn.token_type,
      user: user,
    };

    return {
      user: user,
      session: session,
    };
  },

  async me(): Promise<UserProfile> {
    const supabase = lazySupabase();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    console.log(`user: ${JSON.stringify(user)}`);
    console.log(`error: ${error}`);

    if (error) throw error;
    if (!user) throw new Error('User not found');

    return {
      id: user.id,
      email: user.email || 'unset',
      first_name: user.user_metadata?.first_name || 'unset',
      last_name: user.user_metadata?.last_name || 'unset',
      is_email_verified: !!user.email_confirmed_at,
      created_at: user.created_at,
    };
  },

  async logout(): Promise<void> {
    const supabase = lazySupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async sendVerificationEmail(): Promise<void> {
    const supabase = lazySupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      if (error) throw error;
    }
  },

  // send verification email // no session // so rely on email
  async sendVerificationEmailNoSession(email: string): Promise<void> {
    const supabase = lazySupabase();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw error;
  },

  async verifyEmailFromOTP(_token: string): Promise<boolean> {
    // Supabase usually handles this via link click which redirects to app with session
    // If we need to manually verify with a token (OTP), we would use verifyOtp
    // But typically for email links, the session is established upon redirect if configured correctly.
    // If this method is called, it implies we have a token to verify.
    // Assuming token is an OTP or similar if not using magic link auto-login.
    // For now, we'll assume provider-hosted handles the flow or we might need to implement verifyOtp if the app extracts token from URL.

    // If the token is a hash fragment access_token, supabase client auto-detects it usually.
    // If it's a PKCE flow code, we exchange it.

    // Given the interface, let's try to verify if it's an OTP/Token
    /*
        const { error } = await supabase.auth.verifyOtp({
          token,
          type: 'signup',
          email: '...', // we might need email here which is tricky without session
        });
        */
    throw new Error(
      'verifyEmailFromOTP not fully implemented for Supabase strategy as it relies on provider flow'
    );
    return true;
  },

  async resetPasswordRequest(email: string): Promise<void> {
    const supabase = lazySupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`, // Example redirect
    });
    if (error) throw error;
  },

  async updatePasswordWithoutSession(
    _newPassword: string,
    _token: string,
    _username?: string
  ): Promise<void> {
    // This flow typically involves:
    // 1. User clicks link -> app opens with #access_token=... (Supabase recovers session)
    // 2. OR User has a token (OTP) to exchange.

    // If we are here, we might be in a state where we need to exchange token for session then update password.
    // Or if the token is the recovery token (OTP).

    /*
        if (username) {
            const { error } = await supabase.auth.verifyOtp({
                email: username,
                token,
                type: 'recovery',
            });
            if (error) throw error;
            
            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
            if (updateError) throw updateError;
        }
        */
    throw new Error(
      'updatePasswordWithoutSession not fully implemented for Supabase strategy'
    );
  },

  async updatePassword(newPassword: string, _token?: string): Promise<void> {
    const supabase = lazySupabase();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  async getSession(): Promise<AuthSession | null> {
    const supabase = lazySupabase();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session as AuthSession | null;
  },
};
