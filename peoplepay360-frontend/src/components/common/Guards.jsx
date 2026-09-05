'use client';

import { useAuth } from '../../context/AuthContext.jsx';

/**
 * RoleGuard — renders children only if user has one of the required roles
 */
export function RoleGuard({ roles = [], children, fallback = null }) {
  const { role } = useAuth();
  if (!roles.includes(role)) return fallback;
  return children;
}

/**
 * PermissionGuard — renders children only if user has the required permission
 */
export function PermissionGuard({ permission, permissions = [], anyOf = false, children, fallback = null }) {
  const { can, canAny } = useAuth();

  const allPerms = permission ? [permission, ...permissions] : permissions;

  if (allPerms.length === 0) return children;

  const allowed = anyOf ? canAny(allPerms) : allPerms.every((p) => can(p));

  return allowed ? children : fallback;
}
