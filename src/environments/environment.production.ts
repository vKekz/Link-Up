import { EnvironmentVariables } from "../interfaces/environment-variables";

/**
 * Represents the environment variables in production.
 */
export const environment: EnvironmentVariables = {
  production: true,
  supabaseUrl: process.env["SUPABASE_URL"],
  supabaseKey: process.env["SUPABASE_KEY"],
  supabaseEmailRedirectTo: process.env["SUPABASE_EMAIL_REDIRECT_TO"],
};
