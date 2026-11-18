export function isNetworkError(error: any): boolean {
  const status = error?.response?.status;
  return (
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNABORTED' ||
    error?.code === 'ECONNREFUSED' ||
    status === 503 ||
    status === 502 ||
    status === 504 ||
    (status === 500 && error?.response?.data?.code === 'BACKEND_OFFLINE') ||
    error?.message?.includes('Network Error') ||
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('ECONNREFUSED')
  );
}
