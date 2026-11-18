// Phase 0 Security Rules Verification Specification
// Verifies the 12 adversarial payloads defined in security_spec.md against firestore.rules.

export interface DirtyDozenScenario {
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_SCENARIOS: DirtyDozenScenario[] = [
  {
    name: '1. Unauthenticated read of user profile',
    operation: 'get',
    path: '/users/userA',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '2. Cross-user read of another user bookmark',
    operation: 'get',
    path: '/users/userA/bookmarks/nutrient_1',
    auth: { uid: 'userB', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '3. Unverified email write blocked',
    operation: 'create',
    path: '/users/userA',
    auth: { uid: 'userA', email_verified: false },
    payload: { uid: 'userA', displayName: 'Test' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '4. Shadow field injection (isAdmin)',
    operation: 'create',
    path: '/users/userA',
    auth: { uid: 'userA', email_verified: true },
    payload: { uid: 'userA', displayName: 'Test', isAdmin: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '5. Identity spoofing in uid field',
    operation: 'create',
    path: '/users/attacker',
    auth: { uid: 'attacker', email_verified: true },
    payload: { uid: 'victim', displayName: 'Spoof' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '6. Client-forged timestamp rejected',
    operation: 'create',
    path: '/users/userA/bookmarks/nutrient_1',
    auth: { uid: 'userA', email_verified: true },
    payload: {
      userId: 'userA',
      itemKey: 'nutrient:1',
      title: 'Carbohydrates',
      category: 'Macronutrient',
      createdAt: '2020-01-01T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '7. Oversized displayName rejected',
    operation: 'create',
    path: '/users/userA',
    auth: { uid: 'userA', email_verified: true },
    payload: { uid: 'userA', displayName: 'x'.repeat(121) },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '8. Invalid itemKey pattern rejected',
    operation: 'create',
    path: '/users/userA/bookmarks/bad',
    auth: { uid: 'userA', email_verified: true },
    payload: { userId: 'userA', itemKey: 'bad_format', title: 'Bad', category: 'None' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '9. Out-of-bounds quiz score rejected',
    operation: 'create',
    path: '/users/userA/quizAttempts/a1',
    auth: { uid: 'userA', email_verified: true },
    payload: { userId: 'userA', score: 999, total: 10, percentage: 9990 },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '10. Invalid mealSlot enum rejected',
    operation: 'create',
    path: '/users/userA/mealLogs/m1',
    auth: { uid: 'userA', email_verified: true },
    payload: {
      userId: 'userA',
      foodName: 'Oats',
      foodCategory: 'Whole Grains',
      calories: 150,
      mealSlot: 'Midnight',
      loggedDate: '2026-11-18',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '11. Immutable createdAt modification blocked',
    operation: 'update',
    path: '/users/userA',
    auth: { uid: 'userA', email_verified: true },
    payload: { displayName: 'Updated', createdAt: 'modified' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '12. Invalid path variable ID rejected',
    operation: 'get',
    path: '/users/user$invalid',
    auth: { uid: 'user$invalid', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
];
