import { z } from "zod";
import { requiredTrimmedString } from "./shared";

export const commentCreateSchema = z.object({
  text: requiredTrimmedString(1, 1000),
});
