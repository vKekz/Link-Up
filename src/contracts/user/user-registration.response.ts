/**
 * Represents the response when registering a user.
 */
export interface UserRegistrationResponse {
  /**
   * Gets the ID when the response is successful.
   */
  id?: string;

  /**
   * Gets the error code when registration failed.
   */
  error?: string;

  /**
   * Gets the error message when registration failed.
   */
  message?: string;
}
