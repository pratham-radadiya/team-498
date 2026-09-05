'use client';

import { useAuth } from '../../context/AuthContext.jsx';

export function RoleGuard({ roles = [], allowedRoles = [], children, fallback = null }) {
  const { role } = useAuth();
  const targetRoles = roles.length > 0 ? roles : allowedRoles;
  if (targetRoles.length > 0 && !targetRoles.includes(role)) {
    return fallback;
  }
  return children;
}

export default RoleGuard;
