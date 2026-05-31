import axiosClient from './axiosClient';

export const userAddressApi = {
  getUserAddresses: (userId: number) => {
    return axiosClient.get(`/user-address/${userId}`);
  },
  createUserAddress: (userId: number, data: any) => {
    return axiosClient.post(`/user-address/${userId}`, data);
  },
  updateUserAddress: (userId: number, addressId: number, data: any) => {
    return axiosClient.put(`/user-address/${userId}/${addressId}`, data);
  },
  deleteUserAddress: (userId: number, addressId: number) => {
    return axiosClient.delete(`/user-address/${userId}/${addressId}`);
  }
};
