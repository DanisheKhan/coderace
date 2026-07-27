import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SmoothScroll = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset window scroll on route change smoothly
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return <>{children}</>;
};

export default SmoothScroll;
