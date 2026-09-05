import { mockContracts } from '../mock/contracts.js';

let contractsData = [...mockContracts];

export const contractApi = {
  getContracts: async (filters = {}) => {
    let result = [...contractsData];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.employeeName.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q) ||
          c.jobPosition.toLowerCase().includes(q)
      );
    }
    if (filters.status) {
      result = result.filter((c) => c.status === filters.status);
    }
    if (filters.department) {
      result = result.filter((c) => c.department === filters.department);
    }
    if (filters.employeeId) {
      result = result.filter((c) => c.employeeId === filters.employeeId);
    }
    return Promise.resolve({ data: result });
  },

  getContractById: async (id) => {
    const contract = contractsData.find((c) => c.id === id);
    return Promise.resolve({ data: contract });
  },

  createContract: async (contractData) => {
    const newContract = {
      id: `CON/2026/${String(contractsData.length + 1).padStart(4, '0')}`,
      status: 'Draft',
      ...contractData,
    };
    contractsData.unshift(newContract);
    return Promise.resolve({ data: newContract });
  },

  updateContract: async (id, updates) => {
    const index = contractsData.findIndex((c) => c.id === id);
    if (index !== -1) {
      contractsData[index] = { ...contractsData[index], ...updates };
      return Promise.resolve({ data: contractsData[index] });
    }
    return Promise.reject(new Error('Contract not found'));
  },

  deleteContract: async (id) => {
    contractsData = contractsData.filter((c) => c.id !== id);
    return Promise.resolve({ success: true });
  },
};
