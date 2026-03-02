import { z } from "zod";
import { POST_TYPE_OPTIONS } from "@/types/domain";
import { requiredTrimmedString } from "./shared";

const entryIdsSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") {
      return [];
    }
    if (Array.isArray(value)) {
      return value.map((item) => Number(item));
    }
    return [Number(value)];
  },
  z.array(z.number().int().positive()).max(20),
);

const manualImagesSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") {
      return [];
    }
    if (Array.isArray(value)) {
      return value.map((item) => String(item));
    }
    return [String(value)];
  },
  z.array(z.string().min(1)).max(5),
);

const postObjectSchema = z.object({
  bonsaiId: z.preprocess((value) => Number(value), z.number().int().positive()),
  text: requiredTrimmedString(1, 2000),
  postType: z.enum(POST_TYPE_OPTIONS),
  entryIds: entryIdsSchema,
  manualImages: manualImagesSchema,
});

export const postCreateSchema = postObjectSchema;

export const postPatchSchema = postObjectSchema.partial().strict();
