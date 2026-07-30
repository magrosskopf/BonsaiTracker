Status: DRAFT
Last Modified: 2026-07-03

# Analysis: community-api test clarity

## Current State

The branch change in `tests/community-api.test.ts` correctly restores the required `image` field in the mocked `ProfileRecord`.

The remaining maintainability issue is local to the test fixture:
- the same user data is duplicated at the profile root and inside `posts[0].user`
- the duplicated block makes the intent of the test harder to scan
- future schema changes to shared user fields would need to be updated in two places

## Scope

Files in scope:
- `/home/agent/workspace/tests/community-api.test.ts`

Files out of scope:
- runtime code under `pages/`, `components/`, `lib/`, `prisma/`
- workflow files under `workflows/`
- existing feature documentation under `dev/features/2026-07-03_issue-1-test-issue/`

## Test Coverage

Protected behavior:
- `mapPublicProfileToDto` omits the private `email` field
- `mapSelfProfileToDto` preserves the `email` field
- post mapping still exposes `bonsaiId`, `entryReferenceIds`, and `viewerHasLiked`

Existing tests:
- `/home/agent/workspace/tests/community-api.test.ts`

Coverage assessment:
- the refactoring only changes shared fixture construction inside an already-covered test file
- the exercised behavior remains covered by the two existing tests in this file

## Success Criteria

1. The fixture data is defined once for shared user fields.
2. Test intent becomes easier to read.
3. No assertions or runtime behavior change.
4. `npm test` and `npm run typecheck` remain green.
