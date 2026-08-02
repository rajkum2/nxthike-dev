import React from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import HiringApp from '../hiring/HiringApp';
import type { ViewMode } from '../hiring/types';

function resolveView(pathname: string, viewParam: string | null): ViewMode | undefined {
  if (pathname.endsWith('/candidates') || viewParam === 'candidates') return 'candidates';
  if (pathname.endsWith('/pipeline') || viewParam === 'pipeline') return 'pipeline';
  if (pathname.endsWith('/dashboard') || viewParam === 'dashboard') return 'dashboard';
  if (viewParam === 'dashboard' || viewParam === 'candidates' || viewParam === 'pipeline') {
    return viewParam;
  }
  return 'dashboard';
}

const HiringTrackerPage: React.FC = () => {
  const location = useLocation();
  const [params] = useSearchParams();
  const initialView = resolveView(location.pathname, params.get('view'));

  return <HiringApp initialView={initialView} />;
};

export default HiringTrackerPage;
