import fs from "fs";
import path from "path";
import os from "os";

import { UserSchema, UserObject } from "@renaissance/shared";

const USER_PROFILE_PATH = path.join(os.homedir(), ".renaissance", "user.json");

/**
 * Reads the user profile stored by the Electron client from
 * ~/.renaissance/user.json and validates it against the shared UserSchema.
 *
 * @returns The parsed and validated UserObject
 * @throws If the file does not exist, cannot be read, or fails schema validation
 */
export function getUserProfile(): UserObject {
  if (!fs.existsSync(USER_PROFILE_PATH)) {
    throw new Error(`User profile not found at ${USER_PROFILE_PATH}`);
  }

  let raw: string;
  try {
    raw = fs.readFileSync(USER_PROFILE_PATH, "utf-8");
  } catch (err) {
    throw new Error(`Failed to read user profile: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("User profile file contains invalid JSON");
  }

  const result = UserSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `User profile validation failed: ${result.error.message}`
    );
  }

  return result.data;
}

/**
 * Like getUserProfile() but returns null instead of throwing when the
 * profile is missing or invalid.  Useful when the profile is optional context.
 */
export function getUserProfileOrNull(): UserObject | null {
  try {
    return getUserProfile();
  } catch {
    return null;
  }
}
