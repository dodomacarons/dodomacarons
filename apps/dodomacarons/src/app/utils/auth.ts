export const isAuth0Redirecting = (): boolean => {
  return (
    window.location.search.includes('code=') &&
    window.location.search.includes('state=')
  );
};
