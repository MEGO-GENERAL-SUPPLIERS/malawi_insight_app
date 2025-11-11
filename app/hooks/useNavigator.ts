// hooks/useNavigator.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveRoute } from '~/routes';

export const useNavigator = () => {
  const navigate = useNavigate();

  const navigateTo = useCallback(
    (routeKeyOrPath: string, options?: { replace?: boolean; state?: any }) => {
      let path: string;

      // Raw path starting with "/"
      if (routeKeyOrPath.startsWith('/')) {
        path = routeKeyOrPath;
      } else {
        try {
          path = resolveRoute(routeKeyOrPath);
        } catch {
          // If route key not found, navigate to 404 page
          path = '/404';
        }
      }

      navigate(path, options);
    },
    [navigate]
  );

  const navigateBack = useCallback(() => navigate(-1), [navigate]);
  const navigateForward = useCallback(() => navigate(1), [navigate]);

  return { navigateTo, navigateBack, navigateForward };
};

export default useNavigator;
