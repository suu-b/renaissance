import fs from "fs";
import path from "path";
import os from "os";

import { UserSchema, UserObject } from "@renaissance/shared";

/**
 * Reads the user profile stored by the Electron client
 * and validates it against the shared UserSchema.
 *
 * @param profilePath - Optional path to the user profile JSON file. Defaults to process.env.USER_RENAISSANCE_PROFILE_PATH or ~/.renaissance/user.json.
 * @returns The parsed and validated UserObject
 * @throws If the file does not exist, cannot be read, or fails schema validation
 */
export function getUserProfile(profilePath?: string): UserObject {
  const targetPath =
    profilePath ||
    process.env.USER_RENAISSANCE_PROFILE_PATH ||
    path.join(os.homedir(), ".renaissance", "user.json");

  if (!targetPath || !fs.existsSync(targetPath)) {
    throw new Error(`User profile not found at ${targetPath}`);
  }

  let raw: string;
  try {
    raw = fs.readFileSync(targetPath, "utf-8");
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
 * profile is missing or invalid. Useful when the profile is optional context.
 */
export function getUserProfileOrNull(profilePath?: string): UserObject | null {
  try {
    return getUserProfile(profilePath);
  } catch {
    return null;
  }
}
