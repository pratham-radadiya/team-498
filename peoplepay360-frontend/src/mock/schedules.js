/**
 * Mock Data — Working Schedules
 */

export const mockSchedules = [
  {
    id: 'SCH001',
    name: '40 Hours/Week',
    type: 'Standard',
    company: 'PeoplePay360 Pvt Ltd',
    status: 'Active',
    weeklyHours: 40,
    days: [
      { day: 'Monday', startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
      { day: 'Tuesday', startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
      { day: 'Wednesday', startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
      { day: 'Thursday', startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
      { day: 'Friday', startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
    ],
  },
  {
    id: 'SCH002',
    name: 'Flexible Hybrid',
    type: 'Flexible',
    company: 'PeoplePay360 Pvt Ltd',
    status: 'Active',
    weeklyHours: 37.5,
    days: [
      { day: 'Monday', startTime: '10:00', endTime: '18:30', breakHours: 1, workHours: 7.5 },
      { day: 'Tuesday', startTime: '10:00', endTime: '18:30', breakHours: 1, workHours: 7.5 },
      { day: 'Wednesday', startTime: '10:00', endTime: '18:30', breakHours: 1, workHours: 7.5 },
      { day: 'Thursday', startTime: '10:00', endTime: '18:30', breakHours: 1, workHours: 7.5 },
      { day: 'Friday', startTime: '10:00', endTime: '17:30', breakHours: 0.5, workHours: 7 },
    ],
  },
  {
    id: 'SCH003',
    name: 'Night Shift',
    type: 'Night',
    company: 'PeoplePay360 Pvt Ltd',
    status: 'Active',
    weeklyHours: 40,
    days: [
      { day: 'Monday', startTime: '21:00', endTime: '06:00', breakHours: 1, workHours: 8 },
      { day: 'Tuesday', startTime: '21:00', endTime: '06:00', breakHours: 1, workHours: 8 },
      { day: 'Wednesday', startTime: '21:00', endTime: '06:00', breakHours: 1, workHours: 8 },
      { day: 'Thursday', startTime: '21:00', endTime: '06:00', breakHours: 1, workHours: 8 },
      { day: 'Friday', startTime: '21:00', endTime: '06:00', breakHours: 1, workHours: 8 },
    ],
  },
  {
    id: 'SCH004',
    name: 'Part-time 20h',
    type: 'Part-time',
    company: 'PeoplePay360 Pvt Ltd',
    status: 'Active',
    weeklyHours: 20,
    days: [
      { day: 'Monday', startTime: '09:00', endTime: '13:00', breakHours: 0, workHours: 4 },
      { day: 'Tuesday', startTime: '09:00', endTime: '13:00', breakHours: 0, workHours: 4 },
      { day: 'Wednesday', startTime: '09:00', endTime: '13:00', breakHours: 0, workHours: 4 },
      { day: 'Thursday', startTime: '09:00', endTime: '13:00', breakHours: 0, workHours: 4 },
      { day: 'Friday', startTime: '09:00', endTime: '13:00', breakHours: 0, workHours: 4 },
    ],
  },
  {
    id: 'SCH005',
    name: 'Retail Weekend',
    type: 'Weekend',
    company: 'PeoplePay360 Pvt Ltd',
    status: 'Inactive',
    weeklyHours: 16,
    days: [
      { day: 'Saturday', startTime: '10:00', endTime: '18:00', breakHours: 0, workHours: 8 },
      { day: 'Sunday', startTime: '10:00', endTime: '18:00', breakHours: 0, workHours: 8 },
    ],
  },
];

export const getScheduleById = (id) => mockSchedules.find((s) => s.id === id) || null;
