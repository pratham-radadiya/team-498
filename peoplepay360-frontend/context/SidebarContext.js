'use client';

import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext({
  mobileOpen: false,
  openMobileSidebar: () => {},
  closeMobileSidebar: () => {},
  toggleMobileSidebar: () => {},
});

export function SidebarProvider({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobileSidebar = () => setMobileOpen(true);
  const closeMobileSidebar = () => setMobileOpen(false);
  const toggleMobileSidebar = () => setMobileOpen((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{
        mobileOpen,
        openMobileSidebar,
        closeMobileSidebar,
        toggleMobileSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
