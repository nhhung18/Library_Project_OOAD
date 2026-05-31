import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Settings, ChevronDown, Heart, ArrowRight } from 'lucide-react';
import { bookApi } from '../api/bookApi';
import { categoryApi } from '../api/categoryApi';
import { Book, Category } from '../types';

interface BooksViewProps {
  onBookClick: (id: string) => void;
  onBack: () => void;
  searchQuery: string;
}

const BooksView = ({ onBookClick, onBack, searchQuery }: BooksViewProps) => {
  const [filter, setFilter] = useState('Tất cả');
  const [categories, setCategories] = useState<string[]>(['Tất cả', 'Sách đang còn']);
  const [booksData, setBooksData] = useState<Book[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, catRes] = await Promise.all([
          bookApi.getAllBooks(),
          categoryApi.getAllCategories()
        ]);
        if (Array.isArray(booksRes)) {
          setBooksData(booksRes);
        }
        if (Array.isArray(catRes)) {
          const catNames = catRes.map((c: Category) => c.categoryName);
          setCategories(['Tất cả', ...catNames, 'Sách đang còn']);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const filteredBooks = booksData.filter(book => {
    const matchesFilter = filter === 'Tất cả' || (filter === 'Sách đang còn' ? book.quantity > 0 : book.category?.categoryName === filter);
    const matchesSearch = searchQuery === '' || book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-none px-4 md:px-12 lg:px-16 py-12">
      <div className="flex items-center space-x-6 mb-10">
        <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight">Sách</h2>
      </div>

      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap ${filter === cat ? 'bg-[#1e3b2b] text-white shadow-md shadow-[#1e3b2b]/20' : 'bg-white/50 border border-white/60 text-gray-500 hover:bg-white/80 hover:text-gray-900 backdrop-blur-md'}`}>{cat}</button>
          ))}
        </div>
        <button className="flex items-center space-x-2 bg-white/50 border border-white/60 backdrop-blur-md px-5 py-2.5 rounded-full font-bold text-sm text-gray-700 hover:bg-white/80 hover:text-gray-900 transition-colors shadow-sm">
          <Settings size={18} className="rotate-90" /><span>Sort By</span><ChevronDown size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
        {filteredBooks.map((book) => {
          const status = book.quantity > 0 ? 'active' : 'out';
          const typeLabel = book.bookType === 'EBOOK' ? 'Ebook' : book.bookType === 'PHYSICAL_BOOK' ? 'Sách giấy' : 'Cả hai';
          
          return (
            <motion.div key={book.id} whileHover={{ y: -8 }} className="group cursor-pointer p-3 glass-panel rounded-[2.5rem] transition-all hover:shadow-xl flex flex-col justify-between">
              <div className="relative aspect-[3/4.2] rounded-3xl overflow-hidden shadow-sm bg-ink/5 mb-4" onClick={() => onBookClick(book.id.toString())}>
                <img src={book.imageUrl || `https://picsum.photos/seed/${book.id}/400/533`} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-ink shadow-sm">
                  {typeLabel}
                </div>
              </div>
              <div className="space-y-3 px-2 pb-1 flex-1 flex flex-col justify-end">
                <div onClick={() => onBookClick(book.id.toString())}>
                  <h3 className="font-display italic font-bold text-xl text-ink tracking-tight leading-tight group-hover:text-forest transition-colors line-clamp-2">{book.title}</h3>
                  <p className="text-ink/60 font-medium text-xs mt-1 uppercase tracking-wider">{book.author}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-ink/40 tracking-wider"><span>Còn {book.quantity}</span><span>{book.likes || 0} thích</span></div>
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => status === 'active' && onBookClick(book.id.toString())}
                    className={`flex-1 py-3 rounded-full font-bold text-xs transition-all ${status === 'active' ? 'bg-[#1e3b2b] text-white shadow-md shadow-[#1e3b2b]/20 hover:shadow-lg hover:-translate-y-0.5' : 'bg-white/50 border border-white/60 text-gray-400 cursor-not-allowed'}`}
                  >
                    {status === 'active' ? 'Xem' : 'Đã hết'}
                  </button>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="w-11 h-11 bg-white/50 border border-white/60 hover:bg-white/80 hover:text-terra text-gray-400 rounded-full flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                  >
                    <Heart size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-center space-x-3">
        {[1, 2, 3, 4].map((page) => (
          <button key={page} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${page === 1 ? 'bg-[#1e3b2b] text-white shadow-md shadow-[#1e3b2b]/20' : 'text-gray-500 bg-white/50 border border-white/60 hover:bg-white/80 backdrop-blur-md'}`}>{page}</button>
        ))}
        <span className="text-gray-400 font-bold px-2">...</span>
        <button className="flex items-center space-x-2 text-gray-900 font-bold text-sm hover:translate-x-1 transition-transform pl-4"><span>Next</span><ArrowRight size={18} /></button>
      </div>
    </motion.div>
  );
};

export default BooksView;
