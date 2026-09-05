'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, User } from 'lucide-react';

export default function SearchableSelect({
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  disabled = false,
  required = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.id) === String(value));
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return options;
    return options.filter((opt) => {
      const labelMatch = opt.label?.toLowerCase().includes(q);
      const sublabelMatch = opt.sublabel?.toLowerCase().includes(q);
      const idMatch = opt.id?.toLowerCase().includes(q);
      return labelMatch || sublabelMatch || idMatch;
    });
  }, [options, searchQuery]);

  const handleSelect = (optionId) => {
    onChange && onChange({ target: { name, value: optionId } });
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange && onChange({ target: { name, value: '' } });
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Hidden input for HTML form validation */}
      <input
        type="text"
        name={name}
        value={value || ''}
        required={required}
        onChange={() => {}}
        className="sr-only"
        tabIndex={-1}
      />

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200'
            : isOpen
            ? 'border-indigo-600 bg-white ring-4 ring-indigo-500/15 shadow-sm'
            : 'border-slate-300 hover:border-slate-400 hover:bg-white'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
          {selectedOption ? (
            <>
              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="text-sm font-bold text-slate-900 truncate">
                  {selectedOption.label}
                </span>
                {selectedOption.sublabel && (
                  <span className="text-xs text-slate-500 ml-2 font-normal">
                    {selectedOption.sublabel}
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="text-sm font-medium text-slate-400">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && !disabled && (
            <span
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-indigo-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-slate-100">
          {/* Search Input Header */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to filter employees by name or ID..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.id) === String(value);
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between group transition-all text-xs ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                        }`}
                      >
                        {opt.label ? opt.label.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="truncate text-left">
                        <p className={`font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                          {opt.label}
                        </p>
                        {opt.sublabel ? (
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{opt.sublabel}</p>
                        ) : (
                          <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{opt.id}</p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 font-medium">
                No matching employees found for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-4 py-2 bg-slate-50 text-[10px] font-semibold text-slate-400 flex items-center justify-between">
            <span>{filteredOptions.length} of {options.length} options</span>
            <span>Press ESC to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
