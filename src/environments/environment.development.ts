import { EnvironmentVariables } from "../interfaces/environment-variables";

/**
 * Represents the environment variables in development.
 */
export const environment: EnvironmentVariables = {
  production: false,
  supabaseUrl: process.env["SUPABASE_URL"],
  supabaseKey: process.env["SUPABASE_KEY"],
  supabaseEmailRedirectTo: process.env["SUPABASE_EMAIL_REDIRECT_TO"],
};
