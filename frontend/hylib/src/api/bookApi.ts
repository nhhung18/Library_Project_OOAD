import axiosClient from './axiosClient';

// Add the Book interface if not imported from types.ts
import { Book } from '../types';

export const bookApi = {
  /**
   * Fetch all books
   * Corresponding to GET /api/books in backend
   */
  getAllBooks: () => {
    return axiosClient.get('/books');
  },

  /**
   * Fetch a single book by ID
   */
  getBookById: (id: number) => {
    return axiosClient.get(`/books/${id}`);
  },

  /**
   * Add a new book
   */
  createBook: (data: Omit<Book, 'id'>) => {
    return axiosClient.post('/books', data);
  },

  /**
   * Update a book
   */
  updateBook: (id: number, data: Partial<Book>) => {
    return axiosClient.put(`/books/${id}`, data);
  },

  /**
   * Delete a book
   */
  deleteBook: (id: number) => {
    return axiosClient.delete(`/books/${id}`);
  },
};
