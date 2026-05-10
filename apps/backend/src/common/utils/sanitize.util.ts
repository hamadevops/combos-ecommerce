export const sanitizeData = (
  data: Record<string, any> | null | undefined,
): Record<string, any> => {
  if (!data) return {};
  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken'];

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = '***MASKED***';
    }
  });

  return sanitized;
};
