import { z } from "zod";
import { nullableTrimmedString } from "./shared";

export const profilePatchSchema = z.object({
  name: nullableTrimmedString(120),
  bio: nullableTrimmedString(500, 0),
  profileImageUrl: nullableTrimmedString(500),
}).strict();
