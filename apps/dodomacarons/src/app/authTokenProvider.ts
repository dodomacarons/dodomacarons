let _getAccessTokenSilently: (() => Promise<string>) | null = null;

export const setGetAccessTokenSilently = (fn: typeof _getAccessTokenSilently) => {
  _getAccessTokenSilently = fn;
};

export const getAccessToken = async (): Promise<string> => {
  if (!_getAccessTokenSilently) {
    throw new Error('Auth0 not initialized or user not authenticated yet');
  }
  return _getAccessTokenSilently();
};
