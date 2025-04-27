import { config } from "dotenv";

/**
 * Handler that is used to load the environment variables.
 */
export class EnvironmentHandler {
  /**
   * Loads `.env` file contents into process.env & environment.
   */
  public static load(): void {
    config();
  }
}
