export const AppError = {
  MODEL_NOT_FOUND: (modelName: string): string =>
    'Instance of ' + modelName + ' not found',
  FAILED_TO_CREATE: (modelName: string): string =>
    'Failed to create instance of ' + modelName + '.',
  USER_NOT_FOUND: 'User not found',
  USERS_NOT_FOUND: 'Users not found',
  GROUP_NOT_FOUND: 'Group not found',
  DATABASE_CALL_FAILED: 'Database call failed',
  CANNOT_RETURN_ZERO_DOCUMENTS: 'Cannot return zero documents',
  INCORRECT_ID: (idName?: string): string => `Incorrect ${idName || 'id'}`,
};
