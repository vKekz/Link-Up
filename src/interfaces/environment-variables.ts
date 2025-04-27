/**
 * Represents the interface for environment variables.
 */
export interface EnvironmentVariables {
  /**
   * A value indicating whether the environment is in production or not.
   */
  production: boolean;

  /**
   * Project URL for the Supabase API.
   */
  supabaseUrl?: string;

  /**
   * Project API Key for the Supabase API.
   */
  supabaseKey?: string;

  /**
   * Redirect URL that is used when signing up or in a user.
   */
  supabaseEmailRedirectTo?: string;
}
