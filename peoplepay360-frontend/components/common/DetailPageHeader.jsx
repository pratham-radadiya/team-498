'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable Header for Full-Screen Detail Pages
 * @param {Array<{ label: string, href?: string }>} breadcrumbs - List of breadcrumb items
 * @param {string} title - Main title (e.g. Employee Name, Contract Ref, Request ID)
 * @param {string} [subtitle] - Optional subtitle / descriptor
 * @param {React.ReactNode} [icon] - Optional icon element
 * @param {React.ReactNode} [badge] - Optional status badge element
 * @param {React.ReactNode} [actions] - Action buttons rendered on the right
 * @param {string} [backHref] - URL for back arrow (or defaults to router.back())
 */
export default function DetailPageHeader({
  breadcrumbs = [],
  title,
  subtitle,
  icon,
  badge,
  actions,
  backHref,
}) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-4">
      {/* Top row: Breadcrumbs & Back Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3 flex-wrap">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer text-xs"
          title="Go back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <span className="text-slate-300">|</span>

        {breadcrumbs.map((bc, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              {bc.href && !isLast ? (
                <Link
                  href={bc.href}
                  className="hover:text-indigo-600 transition-colors text-slate-500"
                >
                  {bc.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-slate-900 font-semibold' : 'text-slate-500'}>
                  {bc.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 truncate">{title}</h1>
              {badge && <div>{badge}</div>}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
