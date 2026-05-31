import axiosClient from './axiosClient';
import { Cart, CartItem, BookType } from '../types';

export const cartApi = {
  getCartByUserId: (userId: number): Promise<Cart> => {
    return axiosClient.get(`/carts/user/${userId}`);
  },

  getCartItemsByCartId: (cartId: number): Promise<CartItem[]> => {
    return axiosClient.get(`/cart-items/cart/${cartId}`);
  },

  createCartItem: (data: { cartId: number; bookId: number; bookType: BookType }): Promise<CartItem> => {
    return axiosClient.post('/cart-items', data);
  },

  deleteCartItem: (id: number): Promise<any> => {
    return axiosClient.delete(`/cart-items/${id}`);
  },

  updateCartItem: (id: number, data: { bookId?: number; bookType?: BookType }): Promise<CartItem> => {
    return axiosClient.put(`/cart-items/${id}`, data);
  }
};
