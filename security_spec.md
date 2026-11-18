# Firestore Security Specification (Phase 0)

## Data Invariants
1. Every document under `/users/{userId}` and its subcollections (`bookmarks`, `quizAttempts`, `mealLogs`) is strictly owned by `request.auth.uid == userId` with `request.auth.token.email_verified == true`.
2. All document IDs (`userId`, `bookmarkId`, `attemptId`, `logId`) must pass `isValidId()` (`^[a-zA-Z0-9_\-]+$`, max 128 chars).
3. All `createdAt` / `updatedAt` timestamps must equal `request.time` on creation/update; `createdAt` and `userId`/`uid` are immutable on update.
4. No unwhitelisted shadow fields are permitted (`keys().hasOnly(...)`).
5. Every string property enforces explicit `size()` upper/lower bounds matching `firebase-blueprint.json`.

## Dirty Dozen Adversarial Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated read of `/users/userA`.
2. Cross-user read of `/users/userA/bookmarks/nutrient_1` while signed in as `userB`.
3. Unverified email write (`email_verified: false`) to `/users/userA`.
4. Shadow field injection (`{ ..., isAdmin: true }`) on `/users/userA` create.
5. UID spoofing (`{ uid: "victim", ... }`) on `/users/attacker` create.
6. Forged past timestamp (`createdAt: new Date(0)`) instead of serverTimestamp.
7. Oversized `displayName` (>120 chars) on `/users/userA`.
8. Invalid `itemKey` format (`"invalid_key"`) on `/users/userA/bookmarks/b1`.
9. Out-of-bounds quiz `score: 999` on `/users/userA/quizAttempts/a1`.
10. Invalid `mealSlot: "Midnight"` on `/users/userA/mealLogs/m1`.
11. Mutating immutable `createdAt` or `userId` on `/users/userA` update.
12. Path ID poisoning (`userId` with special characters or >128 chars).
