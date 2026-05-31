import axiosClient from './axiosClient';
import { PaymentTransaction } from '../types';

export const paymentApi = {
  getAllPayments: () => {
    return axiosClient.get('/payment-transactions');
  },
  
  createPayment: (data: Partial<PaymentTransaction>) => {
    return axiosClient.post('/payment-transactions', data);
  },

  updatePayment: (id: number, data: Partial<PaymentTransaction>) => {
    return axiosClient.put(`/payment-transactions/${id}`, data);
  },

  deletePayment: (id: number) => {
    return axiosClient.delete(`/payment-transactions/${id}`);
  },

  calculateReturnPayment: (returnId: number) => {
    return axiosClient.get(`/payment-transactions/calculate-return/${returnId}`);
  },

  processReturnPayment: (returnId: number, data: { paymentMethod: string }) => {
    return axiosClient.post(`/payment-transactions/process-return/${returnId}`, data);
  }
};
