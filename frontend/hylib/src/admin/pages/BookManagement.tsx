import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Search, Plus, Book as BookIcon, ChevronDown, Library, Edit, Trash2 } from 'lucide-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import AddBookModal from '../components/AddBookModal';
import EditBookModal from '../components/EditBookModal';
import { Book, BookType, BookCondition } from '../../types';
import { bookApi } from '../../api/bookApi';

export default function BookManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await bookApi.getAllBooks();
      if (Array.isArray(response)) {
        setBooks(response);
      } else {
        // Fallback mock data matching the new Book interface
        setBooks([
          {
            id: 1,
            title: 'The Design of Everyday Things',
            author: 'Don Norman',
            publisher: 'Basic Books',
            publishYear: 2013,
            category: { id: 1, categoryName: 'Thiết kế' },
            description: 'A primer on how design serves as the communication between object and user.',
            bookType: BookType.PHYSICAL_BOOK,
            likes: 120,
            condition: BookCondition.GOOD,
            quantity: 5,
            bookUrl: '',
            imageUrl: '',
            avgRating: 4.8
          },
          {
            id: 2,
            title: 'Clean Code',
            author: 'Robert C. Martin',
            publisher: 'Prentice Hall',
            publishYear: 2008,
            category: { id: 2, categoryName: 'Lập trình' },
            description: 'A Handbook of Agile Software Craftsmanship',
            bookType: BookType.BOTH,
            likes: 340,
            condition: BookCondition.NEW,
            quantity: 12,
            bookUrl: '',
            imageUrl: '',
            avgRating: 4.9
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch books', error);
    }
  };

  const handleDeleteBook = (id: number) => {
    setBookToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (bookToDelete !== null) {
      try {
        await bookApi.deleteBook(bookToDelete.toString());
        setBooks(books.filter(b => b.id !== bookToDelete));
      } catch (error) {
        console.error('Failed to delete book', error);
        // Fallback for mock deletion
        setBooks(books.filter(b => b.id !== bookToDelete));
      }
    }
    setIsDeleteModalOpen(false);
    setBookToDelete(null);
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category?.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#f8f9fb] font-sans text-gray-900">
      <Sidebar />

      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden relative">
        <Header title="Quản lý Kho Sách" />

        <div className="p-8 flex-1 overflow-y-auto flex flex-col">
          {/* Header section */}
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Kho Sách</h1>
              <p className="text-sm text-gray-500 font-medium">Quản lý và tra cứu toàn bộ danh mục tài liệu.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Tìm kiếm sách, tác giả..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-full focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] text-sm shadow-sm transition-all bg-white"
                />
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-[#0066cc] hover:bg-[#0052a3] text-white px-5 py-2 rounded-full font-bold text-sm transition-colors shadow-md"
              >
                <Plus size={18} />
                Thêm sách mới
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 flex flex-col flex-1 shadow-sm overflow-hidden min-h-0">
            {/* Table */}
            <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="sticky top-0 z-10 bg-white shadow-sm">
                  <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-white">
                    <th className="px-6 py-5 w-24">ẢNH BÌA</th>
                    <th className="px-6 py-5">TÊN SÁCH</th>
                    <th className="px-6 py-5">TÁC GIẢ</th>
                    <th className="px-6 py-5">THỂ LOẠI</th>
                    <th className="px-6 py-5">NĂM XB</th>
                    <th className="px-6 py-5">ĐỊNH DẠNG</th>
                    <th className="px-6 py-5 text-right">TỒN KHO</th>
                    <th className="px-6 py-5 text-center">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-gray-700">
                  {filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                        Không tìm thấy sách nào trong thư viện.
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((book, index) => (
                      <tr key={book.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors bg-white">

                        {/* Cover */}
                        <td className="px-6 py-4">
                          <div className="w-12 h-16 bg-gray-50 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 overflow-hidden shrink-0 shadow-sm">
                            {book.imageUrl ? (
                              <img src={book.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                              <BookIcon size={20} className={index % 2 === 0 ? "text-gray-400" : "text-[#0066cc]"} />
                            )}
                          </div>
                        </td>

                        {/* Title & Publisher */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 mb-1">{book.title}</p>
                          <p className="text-[11px] text-gray-500 font-medium">NXB: {book.publisher}</p>
                        </td>

                        {/* Author */}
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {book.author}
                        </td>

                        {/* Categories */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">
                            {book.category?.categoryName || 'N/A'}
                          </span>
                        </td>

                        {/* Publish Year */}
                        <td className="px-6 py-4 text-gray-500 font-medium">
                          {book.publishYear}
                        </td>

                        {/* Format */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${book.bookType === BookType.EBOOK ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                              book.bookType === BookType.PHYSICAL_BOOK ? 'bg-blue-50 text-[#0066cc] border border-blue-200' :
                                'bg-green-50 text-green-700 border border-green-200'
                            }`}>
                            {book.bookType}
                          </span>
                        </td>

                        {/* Stock */}
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          {book.quantity}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-3 text-gray-400">
                            <button
                              onClick={() => {
                                setSelectedBook(book);
                                setIsEditModalOpen(true);
                              }}
                              className="hover:text-[#0056b3] transition-colors p-1 active:scale-95"
                              title="Sửa"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id)}
                              className="hover:text-red-500 transition-colors p-1 active:scale-95"
                              title="Xóa"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-white shrink-0">
              <span className="font-medium">Hiển thị 1 - {filteredBooks.length} của {filteredBooks.length} sách</span>
            </div>
          </div>
        </div>
      </main>
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa sách"
        message="Bạn có chắc chắn muốn xóa cuốn sách này không? Thao tác này không thể hoàn tác."
      />
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={fetchBooks}
      />
      <EditBookModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        book={selectedBook}
        onSave={fetchBooks}
      />
    </div>
  );
}
