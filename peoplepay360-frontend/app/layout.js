import './globals.css';
import { AuthProvider } from '../src/context/AuthContext.jsx';

export const metadata = {
  title: 'PeoplePay360 — HR & Payroll',
  description: 'Integrated HR and Payroll management platform for modern organizations.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
