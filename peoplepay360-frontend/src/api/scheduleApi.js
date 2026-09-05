import { mockSchedules } from '../mock/schedules.js';

let schedulesData = [...mockSchedules];

export const scheduleApi = {
  getSchedules: async (filters = {}) => {
    let result = [...schedulesData];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q) ||
          s.company.toLowerCase().includes(q)
      );
    }
    if (filters.status) {
      result = result.filter((s) => s.status === filters.status);
    }
    if (filters.type) {
      result = result.filter((s) => s.type === filters.type);
    }
    return Promise.resolve({ data: result });
  },

  getScheduleById: async (id) => {
    const schedule = schedulesData.find((s) => s.id === id);
    return Promise.resolve({ data: schedule });
  },

  createSchedule: async (scheduleData) => {
    const newSchedule = {
      id: `SCH${String(schedulesData.length + 1).padStart(3, '0')}`,
      status: 'Active',
      company: 'PeoplePay360 Pvt Ltd',
      ...scheduleData,
    };
    schedulesData.push(newSchedule);
    return Promise.resolve({ data: newSchedule });
  },

  updateSchedule: async (id, updates) => {
    const index = schedulesData.findIndex((s) => s.id === id);
    if (index !== -1) {
      schedulesData[index] = { ...schedulesData[index], ...updates };
      return Promise.resolve({ data: schedulesData[index] });
    }
    return Promise.reject(new Error('Schedule not found'));
  },

  deleteSchedule: async (id) => {
    schedulesData = schedulesData.filter((s) => s.id !== id);
    return Promise.resolve({ success: true });
  },
};
