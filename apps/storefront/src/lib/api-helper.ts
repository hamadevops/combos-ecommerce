export const request = async <T>(promise: Promise<{ data?: T; error?: unknown }>): Promise<T> => {
  const { data, error } = await promise;
  if (error) {
    throw error;
  }
  // Type assertion because generated types might be slightly different
  // or loosely typed (unknown) in some error cases,
  // but the success path 'data' matches T.
  return data as T;
};
