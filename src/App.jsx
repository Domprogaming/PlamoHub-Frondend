import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Home, Search, ShoppingBag, Heart, Package, ScanLine, 
  Menu, X, Filter, ChevronRight, Plus, Minus, ShoppingCart,
  Camera, CheckCircle, Clock, Archive, RefreshCw, CreditCard
} from 'lucide-react';

const API_URL = 'https://plamohub-backend-production.up.railway.app/api';
const GRADE_COLORS = {
  EG: "bg-green-500", HG: "bg-blue-500", RG: "bg-red-600",
  MG: "bg-yellow-500", PG: "bg-purple-600", None: "bg-gray-500"
};

// Data cadangan jika API Laravel tidak dapat dijangkau (berguna untuk lingkungan preview)
const MOCK_PRODUCTS = [
  { id: 1, name: "RX-78-2 Gundam", grade: "EG", scale: "1/144", price: 110000, desc: "Entry Grade yang sangat ramah pemula. Tidak butuh nipper untuk merakitnya. Artikulasi sangat baik untuk kelasnya.", imageColor: "bg-gray-200", series: "Mobile Suit Gundam", image: "/images/mg_rx78_gundam_v3_62.jpg" },
  { id: 2, name: "Gundam Aerial", grade: "HG", scale: "1/144", price: 230000, desc: "High Grade dari seri The Witch from Mercury. Desain modern dengan pemisahan warna yang luar biasa.", imageColor: "bg-blue-100", series: "The Witch from Mercury", image: "/images/HG-Gundam-Aerial_0.jpg" },
  { id: 3, name: "RX-178B GUNDAM MK-11", grade: "RG", scale: "1/144", price: 750000, desc: "Real Grade dengan detail super presisi dan inner frame yang kokoh. Termasuk Fin Funnel yang ikonik.", imageColor: "bg-gray-800", series: "Char's Counterattack", image: "/images/mg-rx-178-gundam-mk2-2.jpg" },
  { id: 4, name: "Gundam Barbatos", grade: "MG", scale: "1/100", price: 850000, desc: "Master Grade dengan inner frame Gundam Frame terlengkap. Detail mekanik piston yang bisa bergerak.", imageColor: "bg-yellow-100", series: "Iron-Blooded Orphans", image: "/images/item_0000014284_Ti1gOkD5_101.jpg" },
  { id: 5, name: "Unicorn Gundam", grade: "PG", scale: "1/60", price: 3500000, desc: "Perfect Grade raksasa dengan fitur transformasi penuh dari Unicorn mode ke Destroy mode. (LED dijual terpisah).", imageColor: "bg-red-50", series: "Gundam UC", image: "/images/Gundam-Universe-RX-0-Unicorn-Gundam_0.jpg" },
  { id: 6, name: "Zaku II Char's Custom", grade: "HG", scale: "1/144", price: 260000, desc: "Zaku legendaris warna merah dengan mobilitas 3 kali lipat (secara lore). Versi Revive.", imageColor: "bg-red-200", series: "Mobile Suit Gundam", image: "/images/7f880f4d52c246bea936a2371a38159a.jpg" },
  { id: 8, name: "Wing Gundam Zero EW", grade: "MG", scale: "1/100", price: 950000, desc: "Versi Ka dari Wing Zero EW. Sayap malaikat yang ikonik dengan detail baru.", imageColor: "bg-blue-50", series: "Gundam Wing: Endless Waltz", image: "/images/mg-rx-178-gundam-mk2-2.jpg" },
]
const FormatRupiah = ({ value }) => <span>Rp {Number(value).toLocaleString('id-ID')}</span>;

const ProductImage = ({ src, name, color }) => (
  <div className={`w-full h-full relative overflow-hidden ${color || 'bg-slate-200'}`}>
    {src ? (
      <img src={src} alt={name} className="w-full h-full object-cover object-center" />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold text-xl relative">
        <Package size={64} className="opacity-20 absolute" />
        <span className="relative z-10 text-center px-4 mix-blend-difference text-white">{name}</span>
      </div>
    )}
  </div>
);

const Badge = ({ children, colorClass }) => (
  <span className={`px-2 py-1 text-xs font-bold text-white rounded-md ${colorClass} shadow-sm backdrop-blur-md bg-opacity-90`}>{children}</span>
);

export default function PlamoHub() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resProducts = await axios.get(`${API_URL}/gunplas`);
      setProducts(resProducts.data);

      const resInventory = await axios.get(`${API_URL}/inventory`);
      const formattedInventory = resInventory.data.map(item => ({
        ...item.gunpla,
        inventory_id: item.id,
        status: item.status,
        addedAt: item.created_at
      }));
      setInventory(formattedInventory);
    } catch (error) {
      showNotification("Server Offline. Menampilkan data mode simulasi lokal.", "error");
      setProducts(MOCK_PRODUCTS);
      setInventory([
        { ...MOCK_PRODUCTS[0], inventory_id: 101, status: 'Completed', addedAt: new Date().toISOString() },
        { ...MOCK_PRODUCTS[2], inventory_id: 102, status: 'Backlog', addedAt: new Date().toISOString() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (view, product = null) => {
    setCurrentView(view);
    if (product) setSelectedProduct(product);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    showNotification(`${product.name} ditambahkan ke Keranjang!`);
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.find(item => item.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
      showNotification(`${product.name} dihapus dari Wishlist`);
    } else {
      setWishlist([...wishlist, product]);
      showNotification(`${product.name} ditambahkan ke Wishlist!`);
    }
  };

  const addToInventory = async (product, status = 'Backlog') => {
    try {
      await axios.post(`${API_URL}/inventory`, { gunpla_id: product.id, status: status });
      showNotification(`${product.name} berhasil masuk ke ${status}!`);
      fetchData();
    } catch (error) {
      setInventory([...inventory, { ...product, inventory_id: Date.now(), status, addedAt: new Date().toISOString() }]);
      showNotification(`${product.name} berhasil masuk ke ${status} (Mode Simulasi)!`);
    }
  };

  const updateInventoryStatus = async (inventory_id, newStatus) => {
    try {
      await axios.put(`${API_URL}/inventory/${inventory_id}`, { status: newStatus });
      fetchData();
    } catch (error) {
      setInventory(inventory.map(item => item.inventory_id === inventory_id ? { ...item, status: newStatus } : item));
      showNotification("Status diperbarui (Mode Simulasi).", "success");
    }
  };

  const removeFromInventory = async (inventory_id) => {
    try {
      await axios.delete(`${API_URL}/inventory/${inventory_id}`);
      showNotification(`Item dihapus dari My Backlog`);
      fetchData();
    } catch (error) {
      setInventory(inventory.filter(item => item.inventory_id !== inventory_id));
      showNotification(`Item dihapus dari My Backlog (Mode Simulasi)`);
    }
  };

  // --- VIEWS ---

  const LandingView = () => (
    <div className="animate-fade-in">
      <section className="bg-slate-900 text-white py-20 px-6 rounded-b-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Package size={400} />
        </div>
        <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Kendalikan <span className="text-blue-500">Backlog</span> Gunpla-mu!
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Punya tumpukan dus yang belum dirakit? PlamoHub membantu Anda melacak koleksi, mencari inspirasi rakitan, memantau harga wishlist, dan belanja kit idaman.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigateTo('catalog')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center">
                Belanja Sekarang <ChevronRight size={20} className="ml-2" />
              </button>
              <button onClick={() => navigateTo('scanner')} className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-8 py-3 rounded-full font-bold transition-all flex items-center">
                <ScanLine size={20} className="mr-2" /> Scan Dus Gunpla
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 p-6 rounded-2xl shadow-xl transform translate-y-8">
                <Archive className="text-yellow-500 mb-4" size={40} />
                <h3 className="font-bold text-xl mb-2">My Backlog</h3>
                <p className="text-slate-400 text-sm">Catat apa saja yang belum dirakit agar tidak beli double.</p>
              </div>
              <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
                <Heart className="text-red-500 mb-4" size={40} />
                <h3 className="font-bold text-xl mb-2">Price Tracker</h3>
                <p className="text-slate-400 text-sm">Pantau harga wishlist dari berbagai toko e-commerce.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Kit Populer Saat Ini</h2>
            <p className="text-slate-500 mt-2">Banyak dicari oleh builder lain.</p>
          </div>
          <button onClick={() => navigateTo('catalog')} className="text-blue-600 font-semibold hover:underline flex items-center">
            Lihat Semua <ChevronRight size={16} />
          </button>
        </div>
        
        {isLoading ? (
           <div className="flex justify-center py-10"><RefreshCw className="animate-spin text-blue-500" size={32} /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const CatalogView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGrade, setFilterGrade] = useState('All');

    const filteredProducts = useMemo(() => {
      return products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchGrade = filterGrade === 'All' || p.grade === filterGrade;
        return matchSearch && matchGrade;
      });
    }, [products, searchTerm, filterGrade]);

    return (
      <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-8 text-slate-900">Katalog Gunpla</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama mobile suit..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Filter size={20} className="text-slate-500 mr-2" />
            {['All', 'EG', 'HG', 'RG', 'MG', 'PG'].map(grade => (
              <button
                key={grade}
                onClick={() => setFilterGrade(grade)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filterGrade === grade ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {grade === 'All' ? 'Semua Grade' : grade}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-blue-500" size={48} /></div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <Package size={64} className="mx-auto text-slate-300 mb-4" />
            <p className="text-xl font-medium">Tidak ada produk yang cocok dengan pencarian.</p>
          </div>
        )}
      </div>
    );
  };

  const ProductCard = ({ product }) => {
    const isWishlisted = wishlist.some(item => item.id === product.id);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col cursor-pointer" onClick={() => navigateTo('detail', product)}>
        <div className="h-56 w-full relative">
          <ProductImage src={product.image} name={product.name} color={product.imageColor} />
          
          <div className="absolute top-3 left-3 z-10">
            <Badge colorClass={GRADE_COLORS[product.grade] || GRADE_COLORS.None}>{product.grade}</Badge>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
            className={`absolute top-3 right-3 p-2 z-10 rounded-full backdrop-blur-md transition-colors ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-slate-700 hover:bg-white'}`}
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <p className="text-xs text-slate-500 font-semibold mb-1">{product.series}</p>
          <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2 line-clamp-2">{product.name}</h3>
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
            <span className="font-bold text-blue-600"><FormatRupiah value={product.price} /></span>
            <button 
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
              className="bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 p-2 rounded-lg transition-colors"
              title="Tambah ke Keranjang"
            >
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DetailView = () => {
    if (!selectedProduct) return null;
    const isWishlisted = wishlist.some(item => item.id === selectedProduct.id);

    return (
      <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
        <button onClick={() => navigateTo('catalog')} className="text-slate-500 hover:text-blue-600 mb-6 flex items-center font-medium">
          <ChevronRight size={16} className="rotate-180 mr-1" /> Kembali ke Katalog
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="h-96 md:h-auto min-h-[400px]">
              <ProductImage src={selectedProduct.image} name={selectedProduct.name} color={selectedProduct.imageColor} />
            </div>
            <div className="p-8 md:p-12 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Badge colorClass={GRADE_COLORS[selectedProduct.grade]}>{selectedProduct.grade} - {selectedProduct.scale}</Badge>
                  <p className="text-sm text-slate-500 font-semibold mt-3">{selectedProduct.series}</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">{selectedProduct.name}</h1>
                </div>
                <button 
                  onClick={() => toggleWishlist(selectedProduct)}
                  className={`p-3 rounded-full border transition-colors ${isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                >
                  <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>
              
              <div className="text-3xl font-extrabold text-blue-600 my-6">
                <FormatRupiah value={selectedProduct.price} />
              </div>

              <div className="prose prose-slate mb-8">
                <h3 className="text-lg font-semibold text-slate-800">Deskripsi</h3>
                <p className="text-slate-600 leading-relaxed">{selectedProduct.desc}</p>
              </div>

              <div className="mt-auto space-y-3">
                <button 
                  onClick={() => addToCart(selectedProduct)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 flex justify-center items-center transition-all"
                >
                  <ShoppingCart className="mr-2" /> Beli / Tambah ke Keranjang
                </button>
                <button 
                  onClick={() => addToInventory(selectedProduct)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-4 rounded-xl font-bold text-lg flex justify-center items-center transition-all border border-slate-200"
                >
                  <Archive className="mr-2" size={20} /> Masukkan ke My Backlog
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InventoryView = () => {
    const [filterStatus, setFilterStatus] = useState('All');
    
    const filteredInventory = useMemo(() => {
      if (filterStatus === 'All') return inventory;
      return inventory.filter(item => item.status === filterStatus);
    }, [inventory, filterStatus]);

    const stats = {
      backlog: inventory.filter(i => i.status === 'Backlog').length,
      wip: inventory.filter(i => i.status === 'In Progress').length,
      completed: inventory.filter(i => i.status === 'Completed').length,
    };

    return (
      <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Backlog & Inventory</h1>
            <p className="text-slate-500 mt-1">Lacak tumpukan dosa gunpla Anda di sini.</p>
          </div>
          <button onClick={() => navigateTo('scanner')} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg flex items-center font-semibold hover:bg-slate-800 transition-colors">
            <ScanLine size={18} className="mr-2" /> Scan Dus Baru
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <div className="flex items-center text-red-600 mb-2 font-bold"><Archive size={18} className="mr-2" /> Backlog</div>
            <div className="text-3xl font-black text-slate-900">{stats.backlog} <span className="text-base font-normal text-slate-500">Kit</span></div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
            <div className="flex items-center text-yellow-600 mb-2 font-bold"><Clock size={18} className="mr-2" /> In Progress</div>
            <div className="text-3xl font-black text-slate-900">{stats.wip} <span className="text-base font-normal text-slate-500">Kit</span></div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <div className="flex items-center text-green-600 mb-2 font-bold"><CheckCircle size={18} className="mr-2" /> Selesai</div>
            <div className="text-3xl font-black text-slate-900">{stats.completed} <span className="text-base font-normal text-slate-500">Kit</span></div>
          </div>
        </div>

        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
          {['All', 'Backlog', 'In Progress', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-3 font-semibold whitespace-nowrap transition-colors border-b-2 ${filterStatus === status ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              {status === 'All' ? 'Semua Status' : status}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-blue-500" size={48} /></div>
        ) : filteredInventory.length > 0 ? (
          <div className="space-y-4">
            {filteredInventory.map((item) => {
              return (
                <div key={item.inventory_id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-shadow">
                  <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                     <ProductImage src={item.image} name={item.name} color={item.imageColor} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge colorClass={GRADE_COLORS[item.grade]}>{item.grade}</Badge>
                      <span className="text-xs text-slate-400">Ditambahkan: {new Date(item.addedAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                  </div>
                  
                  <div className="flex items-center bg-slate-50 p-1 rounded-lg w-full md:w-auto overflow-x-auto flex-shrink-0 border border-slate-200">
                    {['Backlog', 'In Progress', 'Completed'].map(stat => (
                      <button
                        key={stat}
                        onClick={() => updateInventoryStatus(item.inventory_id, stat)}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${item.status === stat ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        {stat}
                      </button>
                    ))}
                  </div>

                  <button onClick={() => removeFromInventory(item.inventory_id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors"><X size={20} /></button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
            <Archive size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-medium">Tidak ada kit di kategori ini.</p>
          </div>
        )}
      </div>
    );
  };

  const WishlistView = () => {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center"><Heart className="mr-3 text-red-500" /> Wishlist & Price Tracker</h1>
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow">
                 <div className="h-48 relative">
                   <ProductImage src={item.image} name={item.name} color={item.imageColor} />
                   <button onClick={() => toggleWishlist(item)} className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm text-red-500 rounded-full hover:bg-red-50 transition-colors z-10"><X size={16} /></button>
                 </div>
                 <div className="p-5">
                   <Badge colorClass={GRADE_COLORS[item.grade]}>{item.grade}</Badge>
                   <h3 className="font-bold text-lg mt-2 mb-3 line-clamp-1">{item.name}</h3>
                   <div className="bg-slate-50 p-3 rounded-lg mb-4 border border-slate-100">
                     <div className="text-xs text-slate-500 mb-1 flex items-center"><Search size={12} className="mr-1"/> Harga Terbaik:</div>
                     <div className="text-lg font-bold text-blue-600"><FormatRupiah value={item.price} /></div>
                   </div>
                   <button onClick={() => addToCart(item)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold flex justify-center items-center"><ShoppingCart size={16} className="mr-2" /> Masukkan Keranjang</button>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm"><Heart size={64} className="mx-auto text-slate-200 mb-4" /><p className="text-xl font-medium text-slate-500">Wishlist Anda kosong.</p></div>
        )}
      </div>
    );
  };

  const ScannerView = () => {
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    const simulateScan = () => {
      setScanning(true); setScanResult(null);
      setTimeout(() => {
        setScanning(false);
        if(products.length > 0) setScanResult(products[Math.floor(Math.random() * products.length)]);
      }, 2000);
    };

    return (
      <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex justify-center items-center"><ScanLine className="mr-3 text-blue-600" size={32} /> Barcode Scanner</h1>
        </div>

        <div className="w-full max-w-sm aspect-[3/4] md:aspect-square bg-slate-900 rounded-3xl relative overflow-hidden shadow-2xl mb-8 flex items-center justify-center">
          {scanning ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm z-20">
              <div className="w-full h-1 bg-blue-500 shadow-[0_0_20px_5px_rgba(59,130,246,0.5)] animate-scan"></div>
              <p className="text-white mt-4 font-medium animate-pulse">Memindai Barcode...</p>
            </div>
          ) : scanResult ? (
             <div className="absolute inset-0 flex flex-col bg-white z-20 text-center justify-center animate-fade-in">
                <div className="h-48 w-full mb-4"><ProductImage src={scanResult.image} name={scanResult.name} color={scanResult.imageColor} /></div>
                <div className="px-6 pb-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2 -mt-12 relative z-10 border-4 border-white"><CheckCircle size={32} className="text-green-500" /></div>
                  <h3 className="font-bold text-xl text-slate-900 mb-1">Kit Ditemukan!</h3>
                  <p className="text-blue-600 font-bold mb-6">{scanResult.grade} {scanResult.name}</p>
                  <button onClick={() => { addToInventory(scanResult, 'Backlog'); setScanResult(null); }} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold mb-2">Tambah ke Backlog</button>
                  <button onClick={() => setScanResult(null)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold">Scan Ulang</button>
                </div>
             </div>
          ) : (
            <>
              <Camera size={64} className="text-slate-700" />
              <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-xl opacity-50"></div><div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-xl opacity-50"></div><div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-xl opacity-50"></div><div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-xl opacity-50"></div>
            </>
          )}
        </div>

        {!scanning && !scanResult && <button onClick={simulateScan} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg"><ScanLine className="mr-2 inline" /> Simulasikan Scan</button>}
      </div>
    );
  };

  // --- KOMPONEN KERANJANG DENGAN INTEGRASI MIDTRANS ---
  const CartView = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const updateQty = (id, delta) => setCart(cart.map(item => item.id === id ? { ...item, qty: item.qty + delta } : item).filter(item => item.qty > 0));

    // FUNGSI CHECKOUT MIDTRANS
    const handleCheckout = async () => {
      if (cart.length === 0) return;
      setIsProcessing(true);

      try {
        const response = await axios.post(`${API_URL}/checkout`, {
          total_price: total,
          items: cart 
        });

        const snapToken = response.data.snap_token;

        if (window.snap) {
          window.snap.pay(snapToken, {
            onSuccess: function(result){
              showNotification("Pembayaran Berhasil! Pesanan diproses.");
              setCart([]);
              navigateTo('catalog');
            },
            onPending: function(result){
              showNotification("Menunggu pembayaran Anda. Silakan selesaikan.", "success");
              setCart([]);
              navigateTo('catalog');
            },
            onError: function(result){
              showNotification("Pembayaran gagal. Silakan coba lagi.", "error");
            },
            onClose: function(){
              showNotification("Anda menutup pop-up sebelum menyelesaikan pembayaran.", "error");
            }
          });
        }

      } catch (error) {
        showNotification("Server pembayaran offline. Mensimulasikan pembayaran berhasil!", "success");
        setCart([]);
        navigateTo('catalog');
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center"><ShoppingBag className="mr-3 text-blue-600" /> Keranjang Belanja</h1>
        {cart.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-grow space-y-4">
              {cart.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0"><ProductImage src={item.image} name={item.name} color={item.imageColor} /></div>
                  <div className="flex-grow"><h3 className="font-bold text-slate-900 text-lg">{item.name}</h3><div className="text-blue-600 font-bold"><FormatRupiah value={item.price} /></div></div>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg border border-slate-200 p-1">
                    <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded"><Minus size={16} /></button>
                    <span className="font-bold w-6 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded"><Plus size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
                <h3 className="font-bold text-lg mb-4 border-b pb-2">Ringkasan</h3>
                <div className="flex justify-between text-slate-600 mb-2"><span>Item</span><span>{cart.reduce((s, i) => s + i.qty, 0)}</span></div>
                <div className="flex justify-between font-bold text-xl text-slate-900 mt-4 pt-4 border-t border-slate-100"><span>Total</span><span className="text-blue-600"><FormatRupiah value={total} /></span></div>
                
                <button 
                  onClick={handleCheckout} 
                  disabled={isProcessing}
                  className={`w-full text-white py-3.5 rounded-xl font-bold mt-6 shadow-lg flex justify-center items-center transition-all ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isProcessing ? <RefreshCw className="animate-spin mr-2" size={20} /> : <CreditCard className="mr-2" size={20} />}
                  {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
                </button>
                <p className="text-center text-xs text-slate-400 mt-3">Pembayaran Aman dengan Midtrans</p>
              </div>
            </div>
          </div>
        ) : (
           <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100"><ShoppingCart size={64} className="mx-auto text-slate-200 mb-4" /><p className="text-xl font-medium text-slate-500 mb-4">Keranjang kosong.</p></div>
        )}
      </div>
    );
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-0">
      <style>{`.animate-fade-in { animation: fadeIn 0.4s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-scan { animation: scan 2s infinite linear; position: absolute; top: 0; left: 0; right: 0; } @keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }`}</style>
      
      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in pointer-events-none">
          <div className={`px-6 py-3 rounded-full shadow-2xl font-medium flex items-center gap-2 ${notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
            {notification.type === 'error' ? <X size={18} /> : <CheckCircle size={18} className="text-green-400" />} {notification.message}
          </div>
        </div>
      )}

      {/* Header Desktop */}
      <header className="bg-white sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('landing')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Package className="text-white" size={20} /></div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">Plamo<span className="text-blue-600">Hub</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <button onClick={() => navigateTo('landing')} className={`hover:text-blue-600 ${currentView === 'landing' ? 'text-blue-600 font-bold' : ''}`}>Beranda</button>
            <button onClick={() => navigateTo('catalog')} className={`hover:text-blue-600 ${currentView === 'catalog' ? 'text-blue-600 font-bold' : ''}`}>Katalog</button>
            <button onClick={() => navigateTo('inventory')} className={`hover:text-blue-600 ${currentView === 'inventory' ? 'text-blue-600 font-bold' : ''}`}>My Backlog</button>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => navigateTo('scanner')} className="text-slate-500 hover:text-blue-600 hidden md:block"><ScanLine size={24} /></button>
            <button onClick={() => navigateTo('wishlist')} className="text-slate-500 hover:text-red-500 relative"><Heart size={24} />{wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}</button>
            <button onClick={() => navigateTo('cart')} className="text-slate-500 hover:text-blue-600 relative"><ShoppingBag size={24} />{cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartItemCount}</span>}</button>
            <button className="md:hidden text-slate-500" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
      </header>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-30 bg-white p-6 border-b border-slate-200">
          <nav className="flex flex-col gap-6 font-bold text-xl text-slate-700">
            <button onClick={() => navigateTo('landing')} className="text-left border-b border-slate-100 pb-2">Beranda</button>
            <button onClick={() => navigateTo('catalog')} className="text-left border-b border-slate-100 pb-2">Katalog Belanja</button>
            <button onClick={() => navigateTo('inventory')} className="text-left border-b border-slate-100 pb-2">My Backlog Tracker</button>
            <button onClick={() => navigateTo('scanner')} className="text-left border-b border-slate-100 pb-2 flex items-center"><ScanLine className="mr-2 text-blue-600"/> Scan Barcode</button>
          </nav>
        </div>
      )}

      {/* Konten */}
      <main className="min-h-[calc(100vh-200px)]">
        {currentView === 'landing' && <LandingView />}
        {currentView === 'catalog' && <CatalogView />}
        {currentView === 'detail' && <DetailView />}
        {currentView === 'inventory' && <InventoryView />}
        {currentView === 'wishlist' && <WishlistView />}
        {currentView === 'cart' && <CartView />}
        {currentView === 'scanner' && <ScannerView />}
      </main>

      {/* Bottom Nav Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-6 flex justify-between items-center z-40 pb-safe">
        <button onClick={() => navigateTo('landing')} className={`flex flex-col items-center p-2 ${currentView === 'landing' ? 'text-blue-600' : 'text-slate-400'}`}><Home size={24} /><span className="text-[10px] font-semibold mt-1">Beranda</span></button>
        <button onClick={() => navigateTo('catalog')} className={`flex flex-col items-center p-2 ${currentView === 'catalog' ? 'text-blue-600' : 'text-slate-400'}`}><Search size={24} /><span className="text-[10px] font-semibold mt-1">Katalog</span></button>
        <button onClick={() => navigateTo('scanner')} className={`flex flex-col items-center p-3 bg-blue-600 text-white rounded-full -mt-8 shadow-lg`}><ScanLine size={24} /></button>
        <button onClick={() => navigateTo('inventory')} className={`flex flex-col items-center p-2 ${currentView === 'inventory' ? 'text-blue-600' : 'text-slate-400'}`}><Archive size={24} /><span className="text-[10px] font-semibold mt-1">Backlog</span></button>
        <button onClick={() => navigateTo('cart')} className={`flex flex-col items-center p-2 relative ${currentView === 'cart' ? 'text-blue-600' : 'text-slate-400'}`}><ShoppingBag size={24} />{cartItemCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{cartItemCount}</span>}<span className="text-[10px] font-semibold mt-1">Cart</span></button>
      </div>
    </div>
  );
}