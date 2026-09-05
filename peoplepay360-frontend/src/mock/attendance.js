/**
 * Mock Data — Attendance Records
 */

const today = new Date();
const formatDate = (d) => d.toISOString().split('T')[0];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const generateAttendance = (employeeId, employeeName, department, days) => {
  const records = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(today, -(i + 1));
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    const statuses = ['Present', 'Present', 'Present', 'Present', 'Late', 'Present', 'Overtime'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const checkIn = status === 'Late' ? '09:45' : '09:00';
    const checkOut = status === 'Overtime' ? '20:00' : '18:00';
    const workedHours = status === 'Overtime' ? 11 : status === 'Late' ? 7.25 : 8;
    const overtime = status === 'Overtime' ? 3 : 0;

    records.push({
      id: `ATT-${employeeId}-${formatDate(date)}`,
      employeeId,
      employeeName,
      department,
      date: formatDate(date),
      checkIn: `${formatDate(date)} ${checkIn}`,
      checkOut: `${formatDate(date)} ${checkOut}`,
      workedHours,
      overtime,
      status,
      notes: status === 'Late' ? 'Traffic delay' : '',
      manuallyEdited: false,
    });
  }
  return records;
};

export const mockAttendance = [
  ...generateAttendance('EMP001', 'Arjun Mehta', 'Engineering', 30),
  ...generateAttendance('EMP002', 'Sneha Iyer', 'Sales', 30),
  ...generateAttendance('EMP003', 'Rahul Nair', 'Engineering', 30),
  ...generateAttendance('EMP004', 'Kavya Reddy', 'HR', 30),
  ...generateAttendance('EMP005', 'Priya Sharma', 'Engineering', 30),
  // Add a few manual edits
  {
    id: 'ATT-EMP006-2026-08-15',
    employeeId: 'EMP006',
    employeeName: 'Vikram Singh',
    department: 'Finance',
    date: '2026-08-15',
    checkIn: '2026-08-15 09:00',
    checkOut: '2026-08-15 18:00',
    workedHours: 8,
    overtime: 0,
    status: 'Present',
    notes: 'Manually corrected by HR',
    manuallyEdited: true,
  },
  {
    id: 'ATT-EMP007-2026-08-20',
    employeeId: 'EMP007',
    employeeName: 'Ananya Pillai',
    department: 'Marketing',
    date: '2026-08-20',
    checkIn: '2026-08-20 10:00',
    checkOut: null,
    workedHours: null,
    overtime: 0,
    status: 'Missing Check-out',
    notes: 'Employee forgot to check out',
    manuallyEdited: false,
  },
];

export const getAttendanceByEmployee = (employeeId) =>
  mockAttendance.filter((a) => a.employeeId === employeeId);

export const getAttendanceById = (id) =>
  mockAttendance.find((a) => a.id === id) || null;

export const getTodayAttendance = (employeeId) => {
  const todayStr = formatDate(today);
  return mockAttendance.find((a) => a.employeeId === employeeId && a.date === todayStr) || null;
};

export const getAttendanceSummary = () => ({
  present: 142,
  late: 8,
  absent: 5,
  overtime: 12,
  missingCheckout: 5,
  manualEdits: 7,
  coveragePercent: 94,
});
