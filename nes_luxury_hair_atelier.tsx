import React, { useState, useEffect } from 'react';
import { 
  Scissors, Calendar, Clock, MapPin, Phone, Shield, CheckCircle, 
  Trash2, Lock, X, Menu, Sparkles, Star, DollarSign, Search, 
  User, Award, MessageSquare, ExternalLink, ChevronRight, Filter, Eye, RefreshCw,
  LogOut, LogIn, UserPlus, FileText, Check, AlertCircle, Upload, ImageIcon, Bell
} from 'lucide-react';

const INITIAL_APPOINTMENTS = [
  {
    id: 1,
    name: 'Selin Demir',
    phone: '0532 555 4433',
    service: 'Ombre / Balyaj',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Yarın
    time: '14:00',
    status: 'Onaylandı',
    message: 'Uçlarda hafif küllü tonlar istiyorum.',
    adminReply: 'Talebiniz onaylanmıştır, bekliyoruz.'
  },
  {
    id: 2,
    name: 'Zeynep Kaya',
    phone: '0553 111 2233',
    service: 'Saç Kesimi & Fön',
    date: new Date().toISOString().split('T')[0], // Bugün
    time: '16:00',
    status: 'Onaylandı',
    message: 'Katlı kesim tercih ediyorum.',
    adminReply: 'Harika bir seçim, bekliyoruz.'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  
  // Auth state (Ad-Soyad ve Şifre)
  const [user, setUser] = useState(null); // { name, password }
  const [authMode, setAuthMode] = useState(null); // 'login' or 'register'
  const [authNameInput, setAuthNameInput] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Booking state
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingService, setBookingService] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingImage, setBookingImage] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Reminder Notification State
  const [reminders, setReminders] = useState([]);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Gallery Modal
  const [activeModalImage, setActiveModalImage] = useState(null);

  // Admin Reply Modal State
  const [replyTargetId, setReplyTargetId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Admin Panel State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState(false);
  const [adminFilter, setAdminFilter] = useState('ALL');

  useEffect(() => {
    try {
      const savedApps = localStorage.getItem('nes_appointments');
      if (savedApps) {
        setAppointments(JSON.parse(savedApps));
      }
      const savedUser = localStorage.getItem('nes_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.warn("Storage warning:", e);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setReminders([]);
      return;
    }

    const myApps = appointments.filter(a => a.name.toLowerCase() === user.name.toLowerCase() && a.status === 'Onaylandı');
    const todayStr = new Date().toISOString().split('T')[0];
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const activeReminders = [];
    myApps.forEach(app => {
      if (app.date === todayStr) {
        activeReminders.push({
          id: app.id,
          text: `Bugün saat ${app.time}'de "${app.service}" randevunuz var. Lütfen zamanında salonumuzda olun, iyi günler dileriz!`
        });
      } else if (app.date === tomorrowStr) {
        activeReminders.push({
          id: app.id,
          text: `Yarın saat ${app.time}'de "${app.service}" randevunuz var. Sabırsızlıkla bekliyoruz!`
        });
      }
    });

    setReminders(activeReminders);
  }, [appointments, user]);

  const saveAppointmentsToStorage = (newApps) => {
    setAppointments(newApps);
    try {
      localStorage.setItem('nes_appointments', JSON.stringify(newApps));
    } catch (e) {
      console.warn("Storage save warning:", e);
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    const trimmedName = authNameInput.trim();
    if (!trimmedName) {
      setAuthError('Lütfen adınızı soyadınızı giriniz.');
      return;
    }

    if (authPassword.length < 6) {
      setAuthError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (!/[A-Z]/.test(authPassword)) {
      setAuthError('Şifre en az bir tane büyük harf içermelidir.');
      return;
    }

    let registeredUsers = [];
    try {
      registeredUsers = JSON.parse(localStorage.getItem('nes_registered_users')) || [];
    } catch (err) {}

    // Kayıt Olma İşlemi
    if (authMode === 'register') {
      const existing = registeredUsers.find(u => u.name.toLowerCase() === trimmedName.toLowerCase());
      if (existing) {
        setAuthError('Bu isimle zaten bir hesap kayıtlı. Lütfen giriş yapın.');
        return;
      }

      const newUser = { name: trimmedName, password: authPassword };
      registeredUsers.push(newUser);
      try {
        localStorage.setItem('nes_registered_users', JSON.stringify(registeredUsers));
        localStorage.setItem('nes_user', JSON.stringify(newUser));
      } catch (err) {}

      setUser(newUser);
      setAuthMode(null);
      setAuthNameInput('');
      setAuthPassword('');
    } 
    // Giriş Yapma İşlemi (Şifre Doğrulama)
    else {
      const foundUser = registeredUsers.find(u => u.name.toLowerCase() === trimmedName.toLowerCase());

      if (!foundUser) {
        setAuthError('Böyle bir üyelik bulunamadı. Lütfen önce Üye Olun.');
        return;
      }

      if (foundUser.password !== authPassword) {
        setAuthError('Hatalı şifre! Lütfen şifrenizi kontrol edip tekrar deneyin.');
        return;
      }

      setUser(foundUser);
      try {
        localStorage.setItem('nes_user', JSON.stringify(foundUser));
      } catch (err) {}
      
      setAuthMode(null);
      setAuthNameInput('');
      setAuthPassword('');
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('nes_user');
    } catch (err) {}
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024 * 2) {
      alert("Lütfen 2MB'dan küçük bir görsel seçin.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setBookingImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const newApp = {
      id: Date.now(),
      name: user ? user.name : bookingName,
      phone: bookingPhone,
      service: bookingService,
      date: bookingDate,
      time: bookingTime,
      status: 'Beklemede',
      message: bookingMessage,
      attachedImage: bookingImage,
      adminReply: ''
    };

    const updated = [newApp, ...appointments];
    saveAppointmentsToStorage(updated);

    setBookingSuccess(true);
    setBookingPhone('');
    setBookingService('');
    setBookingDate('');
    setBookingTime('');
    setBookingMessage('');
    setBookingImage(null);
    if (!user) setBookingName('');

    setTimeout(() => setBookingSuccess(false), 5000);
  };

  const updateStatus = (id, newStatus) => {
    const updated = appointments.map(app => app.id === id ? { ...app, status: newStatus } : app);
    saveAppointmentsToStorage(updated);
  };

  const executeDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget === 'ALL') {
      saveAppointmentsToStorage([]);
    } else {
      const updated = appointments.filter(a => a.id !== deleteTarget.id);
      saveAppointmentsToStorage(updated);
    }
    setDeleteTarget(null);
  };

  const handleSendReply = () => {
    if (!replyTargetId || !replyText.trim()) return;
    const updated = appointments.map(app => 
      app.id === replyTargetId ? { ...app, adminReply: replyText.trim() } : app
    );
    saveAppointmentsToStorage(updated);
    setReplyTargetId(null);
    setReplyText('');
    setActiveModalImage(null);
  };

  const openReplyModal = (app) => {
    setReplyTargetId(app.id);
    setReplyText(app.adminReply || '');
  };

  const myAppointments = user ? appointments.filter(a => a.name.toLowerCase() === user.name.toLowerCase()) : [];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 font-sans selection:bg-[#D4AF37] selection:text-black">
      
      {/* Navigasyon */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C5A880] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <Scissors className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-xl font-serif font-bold tracking-wider text-[#F3E5AB] block">NES</span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A880] block">Luxury Hair Atelier</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <button onClick={() => setActiveTab('home')} className={`hover:text-[#D4AF37] transition ${activeTab === 'home' ? 'text-[#D4AF37]' : 'text-gray-300'}`}>Ana Sayfa</button>
            <button onClick={() => setActiveTab('services')} className={`hover:text-[#D4AF37] transition ${activeTab === 'services' ? 'text-[#D4AF37]' : 'text-gray-300'}`}>Hizmetler & Fiyatlar</button>
            <button onClick={() => setActiveTab('gallery')} className={`hover:text-[#D4AF37] transition ${activeTab === 'gallery' ? 'text-[#D4AF37]' : 'text-gray-300'}`}>Galeri</button>
            <button onClick={() => setActiveTab('booking')} className={`hover:text-[#D4AF37] transition ${activeTab === 'booking' ? 'text-[#D4AF37]' : 'text-gray-300'}`}>Randevu Al</button>
            <button onClick={() => setActiveTab('location')} className={`hover:text-[#D4AF37] transition ${activeTab === 'location' ? 'text-[#D4AF37]' : 'text-gray-300'}`}>Konum & İletişim</button>
            {user && (
              <button onClick={() => setActiveTab('myapp')} className={`hover:text-[#D4AF37] transition flex items-center gap-1.5 ${activeTab === 'myapp' ? 'text-[#D4AF37]' : 'text-gray-300'}`}>
                <Calendar className="w-4 h-4" /> Randevularım ({myAppointments.length})
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-[#18181B] border border-[#D4AF37]/30 px-4 py-2 rounded-full">
                <span className="text-xs text-[#F3E5AB] font-medium hidden sm:inline">{user.name}</span>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition" title="Çıkış Yap">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setAuthMode('login')}
                className="px-4 py-2 rounded-full border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" /> Giriş Yap / Üye Ol
              </button>
            )}

            <button 
              onClick={() => setIsAdminOpen(true)}
              className="p-2.5 rounded-full bg-[#18181B] border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition shadow" 
              title="Admin Paneli"
            >
              <Lock className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden p-2 text-gray-300 hover:text-[#D4AF37]"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#121212] border-b border-[#D4AF37]/20 px-6 py-6 space-y-4">
            <button onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} className="block text-gray-300 hover:text-[#D4AF37]">Ana Sayfa</button>
            <button onClick={() => { setActiveTab('services'); setIsMobileMenuOpen(false); }} className="block text-gray-300 hover:text-[#D4AF37]">Hizmetler & Fiyatlar</button>
            <button onClick={() => { setActiveTab('gallery'); setIsMobileMenuOpen(false); }} className="block text-gray-300 hover:text-[#D4AF37]">Galeri</button>
            <button onClick={() => { setActiveTab('booking'); setIsMobileMenuOpen(false); }} className="block text-gray-300 hover:text-[#D4AF37]">Randevu Al</button>
            <button onClick={() => { setActiveTab('location'); setIsMobileMenuOpen(false); }} className="block text-gray-300 hover:text-[#D4AF37]">Konum & İletişim</button>
            {user && (
              <button onClick={() => { setActiveTab('myapp'); setIsMobileMenuOpen(false); }} className="block text-gray-300 hover:text-[#D4AF37]">Randevularım</button>
            )}
          </div>
        )}
      </nav>

      {/* Otomatik Hatırlatıcı Bildirim Bandı */}
      {user && reminders.length > 0 && (
        <div className="fixed top-20 left-0 right-0 z-40 bg-gradient-to-r from-[#D4AF37] via-[#C5A880] to-[#D4AF37] text-black px-4 py-3 shadow-lg flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center gap-3 text-xs sm:text-sm font-semibold tracking-wide">
            <Bell className="w-5 h-5 text-black shrink-0 animate-bounce" />
            <div>
              {reminders.map(rem => (
                <p key={rem.id}><b>Hatırlatma:</b> {rem.text}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`pt-20 ${user && reminders.length > 0 ? 'mt-12' : ''}`}>
        {activeTab === 'home' && (
          <div>
            {/* 1. Hero Bölümü */}
            <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center brightness-[0.35] scale-105 transition duration-1000" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/60"></div>
              
              <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 py-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F3E5AB] text-xs uppercase tracking-[0.3em]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Üsküdar'ın En Seçkin Saç Atölyesi
                </div>
                
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-[#F3E5AB] leading-tight tracking-wide">
                  Zarafet ve Sanatın <br />
                  <span className="bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A880] bg-clip-text text-transparent">Kusursuz Buluşması</span>
                </h1>
                
                <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
                  Kişiye özel renk tasarımı, birinci sınıf keratin bakımları ve ödüllü saç kesim uzmanlarımızla kendinizi yeniden keşfedin.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <button 
                    onClick={() => setActiveTab('booking')}
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-black font-bold text-sm uppercase tracking-widest hover:opacity-90 shadow-xl shadow-[#D4AF37]/20 transition"
                  >
                    Hemen Randevu Al
                  </button>
                  <button 
                    onClick={() => setActiveTab('services')}
                    className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37]/10 font-semibold text-sm uppercase tracking-widest transition"
                  >
                    Fiyat Listesini İncele
                  </button>
                </div>
              </div>
            </section>

            {/* Neden Biz */}
            <section className="py-24 bg-[#121212] border-t border-b border-[#D4AF37]/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-10">
                <div className="p-8 rounded-3xl bg-[#18181B] border border-[#D4AF37]/20 relative group hover:border-[#D4AF37] transition">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-6">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#F3E5AB] mb-3">Master Stylist Kadrosu</h3>
                  <p className="text-gray-400 text-sm font-light leading-relaxed">Üsküdar ve İstanbul'un önde gelen akademilerinde eğitilmiş, trendleri belirleyen profesyonel ekip.</p>
                </div>

                <div className="p-8 rounded-3xl bg-[#18181B] border border-[#D4AF37]/20 relative group hover:border-[#D4AF37] transition">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-6">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#F3E5AB] mb-3">Organik & Lüks Ürünler</h3>
                  <p className="text-gray-400 text-sm font-light leading-relaxed">Saç telinize zarar vermeyen, tamamen organik içerikli, dünya markası boya ve bakım kürleri.</p>
                </div>

                <div className="p-8 rounded-3xl bg-[#18181B] border border-[#D4AF37]/20 relative group hover:border-[#D4AF37] transition">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-6">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#F3E5AB] mb-3">Kişiye Özel Konsept</h3>
                  <p className="text-gray-400 text-sm font-light leading-relaxed">Size özel ayrılmış VIP odalarımızda, tamamen size odaklanan butik bir kuaförlük deneyimi.</p>
                </div>
              </div>
            </section>

            {/* 2. Hizmetler & Fiyatlar */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] block">Şeffaf Fiyatlandırma</span>
                <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F3E5AB]">Hizmetlerimiz & Fiyat Listesi</h2>
                <div className="w-20 h-0.5 bg-[#D4AF37] mx-auto"></div>
                <p className="text-gray-400 text-sm font-light">Her işlem öncesi saç analizi ve ücretsiz konsültasyon dahildir.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { title: 'Kesim & Şekillendirme', price: '450 ₺ - 850 ₺', desc: 'Yüz tipinize uygun modern visagisme kesim, yıkama ve profesyonel fön.', icon: Scissors },
                  { title: 'Ombre / Balyaj & Renklendirme', price: '2.200 ₺ - 4.500 ₺', desc: 'Doğal ton geçişleri, koruyucu olaplex bakımı ve özel cila uygulaması.', icon: Sparkles },
                  { title: 'Keratin & Botoks Bakımı', price: '1.100 ₺ - 2.000 ₺', desc: 'Yıpranmış saç tellerini onaran derinlemesine keratin yüklemesi.', icon: Shield },
                  { title: 'Dip / Tüm Saç Boyası', price: '850 ₺ - 1.600 ₺', desc: 'Amonyaksız, saç derisini koruyan organik boya seçenekleri.', icon: User },
                  { title: 'Gelin Paketi & Özel Gün', price: '4.500 ₺+', desc: 'Prova dahil gelin saçı, porselen makyaj ve VIP hazırlık odası.', icon: Award },
                  { title: 'Manikür & Pedikür SPA', price: '500 ₺ - 950 ₺', desc: 'Steril ekipmanlarla spa hijyeninde el/ayak bakımı ve kalıcı oje.', icon: CheckCircle }
                ].map((srv, idx) => {
                  const IconComponent = srv.icon;
                  return (
                    <div key={idx} className="p-8 rounded-3xl bg-[#121212] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition duration-300 flex flex-col justify-between group">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <span className="text-xl font-serif font-bold text-[#F3E5AB]">{srv.price}</span>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-white mb-2">{srv.title}</h3>
                        <p className="text-gray-400 text-sm font-light leading-relaxed mb-6">{srv.desc}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setBookingService(srv.title.split('&')[0].trim());
                          setActiveTab('booking');
                        }}
                        className="w-full py-3 rounded-xl bg-white/5 border border-[#D4AF37]/30 text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-black font-semibold text-xs uppercase tracking-wider transition"
                      >
                        Bu Hizmeti Seç
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. Galeri / Portfolyo */}
            <section className="py-24 bg-[#121212] border-t border-[#D4AF37]/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                  <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] block">Portfolyo</span>
                  <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F3E5AB]">Sanatsal Çalışmalarımız</h2>
                  <div className="w-20 h-0.5 bg-[#D4AF37] mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: 'Karamel Ombre Geçişi', tag: 'Renklendirme', img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80' },
                    { title: 'Modern Bob Kesim', tag: 'Kesim', img: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80' },
                    { title: 'Gelin Başı Tasarımı', tag: 'Özel Gün', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' },
                    { title: 'Işıltılı Balyaj', tag: 'Renklendirme', img: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80' },
                    { title: 'İpeksi Keratin Bakım', tag: 'Bakım', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' },
                    { title: 'Nail Art & Spa', tag: 'Manikür', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80' }
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setActiveModalImage({ url: item.img, title: item.title, tag: item.tag, isGallery: true })}
                      className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer border border-[#D4AF37]/20 shadow-xl"
                    >
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold block mb-1">{item.tag}</span>
                        <h3 className="text-xl font-serif font-bold text-[#F3E5AB]">{item.title}</h3>
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition">
                          <Eye className="w-4 h-4 text-[#D4AF37]" /> Detayları Gör & Randevu Al
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Randevu Formu */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
              <div className="p-8 sm:p-12 rounded-3xl bg-[#121212] border border-[#D4AF37]/40 shadow-2xl relative">
                
                <div className="text-center mb-10 space-y-3">
                  <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] block">VIP Rezervasyon</span>
                  <h2 className="text-3xl font-serif font-bold text-[#F3E5AB]">Online Randevu Alın</h2>
                  <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto"></div>
                  <p className="text-gray-400 text-xs font-light">Talebiniz alındıktan sonra ekibimiz onay için sizinle iletişime geçecektir.</p>
                </div>

                {bookingSuccess && (
                  <div className="mb-8 p-4 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37] text-[#F3E5AB] text-center text-sm font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37]" /> Randevu talebiniz başarıyla oluşturuldu!
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-medium">Adınız Soyadınız *</label>
                      <input 
                        type="text" 
                        required 
                        value={user ? user.name : bookingName} 
                        onChange={(e) => !user && setBookingName(e.target.value)} 
                        disabled={!!user}
                        placeholder="Örn: Leyla Yılmaz" 
                        className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-[#D4AF37]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-medium">Telefon Numaranız *</label>
                      <input 
                        type="tel" 
                        required 
                        value={bookingPhone} 
                        onChange={(e) => setBookingPhone(e.target.value)} 
                        placeholder="05XX XXX XX XX" 
                        className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-[#D4AF37]" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-medium">Hizmet Seçimi *</label>
                    <select 
                      required 
                      value={bookingService} 
                      onChange={(e) => setBookingService(e.target.value)} 
                      className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="">Lütfen Bir Hizmet Seçin</option>
                      <option value="Kesim & Şekillendirme">Kesim & Şekillendirme (450 ₺)</option>
                      <option value="Ombre / Balyaj">Ombre / Balyaj (2.200 ₺)</option>
                      <option value="Keratin Bakımı">Keratin Bakımı (1.100 ₺)</option>
                      <option value="Dip / Tüm Boya">Dip / Tüm Boya (850 ₺)</option>
                      <option value="Gelin Paketi">Gelin Paketi (4.500 ₺)</option>
                      <option value="Manikür & Pedikür">Manikür & Pedikür (500 ₺)</option>
                    </select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-medium">Tarih *</label>
                      <input 
                        type="date" 
                        required 
                        value={bookingDate} 
                        onChange={(e) => setBookingDate(e.target.value)} 
                        onClick={(e) => {
                          try { e.target.showPicker && e.target.showPicker(); } catch(err) {}
                        }}
                        className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-[#D4AF37] cursor-pointer" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-medium">Saat Dilimi *</label>
                      <select 
                        required 
                        value={bookingTime} 
                        onChange={(e) => setBookingTime(e.target.value)} 
                        className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="">Saat Seçiniz</option>
                        <option value="10:00">10:00</option>
                        <option value="12:00">12:00</option>
                        <option value="14:00">14:00</option>
                        <option value="16:00">16:00</option>
                        <option value="18:00">18:00</option>
                      </select>
                    </div>
                  </div>

                  {/* Mesaj ve Fotoğraf Yükleme */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-medium">Özel Notunuz / Mesajınız (Opsiyonel)</label>
                      <textarea 
                        rows={3} 
                        value={bookingMessage} 
                        onChange={(e) => setBookingMessage(e.target.value)} 
                        placeholder="Örn: Saçımın daha önce açılmış uçları var, bu modelden istiyorum..." 
                        className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-[#D4AF37] resize-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-medium">Referans Görsel Yükle (Opsiyonel)</label>
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-white/5 border border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37]/10 transition flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                          <Upload className="w-4 h-4 text-[#D4AF37]" /> Fotoğraf Seç
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        {bookingImage && (
                          <div className="flex items-center gap-2">
                            <img src={bookingImage} alt="Önizleme" className="w-10 h-10 object-cover rounded-lg border border-[#D4AF37]" />
                            <button type="button" onClick={() => setBookingImage(null)} className="text-red-400 text-xs hover:underline">Kaldır</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-black font-bold text-xs uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-[#D4AF37]/20"
                  >
                    Randevu Talebini Gönder
                  </button>
                </form>
              </div>
            </section>

            {/* 5. Konum & İletişim */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#121212] rounded-3xl border border-[#D4AF37]/20 my-10">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] block">Lokasyon</span>
                <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F3E5AB]">Bize Ulaşın & Konum</h2>
                <div className="w-20 h-0.5 bg-[#D4AF37] mx-auto"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="p-8 sm:p-10 rounded-3xl bg-[#18181B] border border-[#D4AF37]/30 space-y-6">
                  <h3 className="text-2xl font-serif font-bold text-[#F3E5AB]">NES Kuaför Üsküdar</h3>
                  <p className="text-sm text-gray-300 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                    Selami Ali Mh. İspir Sk. No: 4/A Nes Kuaför Üsküdar / İstanbul
                  </p>
                  <p className="text-sm text-gray-300 flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#D4AF37] shrink-0" />
                    +90 (212) 555 01 99
                  </p>
                  <p className="text-sm text-gray-300 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#D4AF37] shrink-0" />
                    Pazartesi - Cumartesi: 09:00 - 20:00 (Pazar: Yalnızca Randevu)
                  </p>
                  <div className="pt-2">
                    <a 
                      href="https://maps.app.goo.gl/fVrwzGqusjmgitqS8?g_st=aw" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37]/20 text-xs font-bold uppercase tracking-wider transition"
                    >
                      <MapPin className="w-4 h-4 text-[#D4AF37]" /> Haritada Aç & Yol Tarifi Al
                    </a>
                  </div>
                </div>

                <div className="h-80 rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl">
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.51134215162!2d29.0278143!3d41.025751!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab85743c3d52d%3A0x6b4cf8828f0951a7!2zU2VsYW1pIEFsaSwgxLBzcGlyIFNrLiBOczo0L0EsIDM0MzQxIMOaesG8w7xiYXIvxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1680000000000!5m2!1str!2str" className="w-full h-full border-0" allowFullScreen="" loading="lazy"></iframe>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] block">Şeffaf Fiyatlandırma</span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F3E5AB]">Hizmetlerimiz & Fiyat Listesi</h2>
              <div className="w-20 h-0.5 bg-[#D4AF37] mx-auto"></div>
              <p className="text-gray-400 text-sm font-light">Her işlem öncesi saç analizi ve ücretsiz konsültasyon dahildir.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: 'Kesim & Şekillendirme', price: '450 ₺ - 850 ₺', desc: 'Yüz tipinize uygun modern visagisme kesim, yıkama ve profesyonel fön.', icon: Scissors },
                { title: 'Ombre / Balyaj & Renklendirme', price: '2.200 ₺ - 4.500 ₺', desc: 'Doğal ton geçişleri, koruyucu olaplex bakımı ve özel cila uygulaması.', icon: Sparkles },
                { title: 'Keratin & Botoks Bakımı', price: '1.100 ₺ - 2.000 ₺', desc: 'Yıpranmış saç tellerini onaran derinlemesine keratin yüklemesi.', icon: Shield },
                { title: 'Dip / Tüm Saç Boyası', price: '850 ₺ - 1.600 ₺', desc: 'Amonyaksız, saç derisini koruyan organik boya seçenekleri.', icon: User },
                { title: 'Gelin Paketi & Özel Gün', price: '4.500 ₺+', desc: 'Prova dahil gelin saçı, porselen makyaj ve VIP hazırlık odası.', icon: Award },
                { title: 'Manikür & Pedikür SPA', price: '500 ₺ - 950 ₺', desc: 'Steril ekipmanlarla spa hijyeninde el/ayak bakımı ve kalıcı oje.', icon: CheckCircle }
              ].map((srv, idx) => {
                const IconComponent = srv.icon;
                return (
                  <div key={idx} className="p-8 rounded-3xl bg-[#121212] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-serif font-bold text-[#F3E5AB]">{srv.price}</span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-white mb-2">{srv.title}</h3>
                      <p className="text-gray-400 text-sm font-light leading-relaxed mb-6">{srv.desc}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setBookingService(srv.title.split('&')[0].trim());
                        setActiveTab('booking');
                      }}
                      className="w-full py-3 rounded-xl bg-white/5 border border-[#D4AF37]/30 text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-black font-semibold text-xs uppercase tracking-wider transition"
                    >
                      Bu Hizmeti Seç
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] block">Portfolyo</span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F3E5AB]">Sanatsal Çalışmalarımız</h2>
              <div className="w-20 h-0.5 bg-[#D4AF37] mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Karamel Ombre Geçişi', tag: 'Renklendirme', img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80' },
                { title: 'Modern Bob Kesim', tag: 'Kesim', img: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80' },
                { title: 'Gelin Başı Tasarımı', tag: 'Özel Gün', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' },
                { title: 'Işıltılı Balyaj', tag: 'Renklendirme', img: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80' },
                { title: 'İpeksi Keratin Bakım', tag: 'Bakım', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' },
                { title: 'Nail Art & Spa', tag: 'Manikür', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80' }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveModalImage({ url: item.img, title: item.title, tag: item.tag, isGallery: true })}
                  className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer border border-[#D4AF37]/20 shadow-xl"
                >
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold block mb-1">{item.tag}</span>
                    <h3 className="text-xl font-serif font-bold text-[#F3E5AB]">{item.title}</h3>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition">
                      <Eye className="w-4 h-4 text-[#D4AF37]" /> Detayları Gör & Randevu Al
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
            <div className="p-8 sm:p-12 rounded-3xl bg-[#121212] border border-[#D4AF37]/40 shadow-2xl relative">
              
              <div className="text-center mb-10 space-y-3">
                <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] block">VIP Rezervasyon</span>
                <h2 className="text-3xl font-serif font-bold text-[#F3E5AB]">Online Randevu Alın</h2>
                <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto"></div>
                <p className="text-gray-400 text-xs font-light">Talebiniz alındıktan sonra ekibimiz onay için sizinle iletişime geçecektir.</p>
              </div>

              {bookingSuccess && (
                <div className="mb-8 p-4 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37] text-[#F3E5AB] text-center text-sm font-medium flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#D4AF37]" /> Randevu talebiniz başarıyla oluşturuldu!
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-medium">Adınız Soyadınız *</label>
                    <input 
                      type="text" 
                      required 
                      value={user ? user.name : bookingName} 
                      onChange={(e) => !user && setBookingName(e.target.value)} 
                      disabled={!!user}
                      placeholder="Örn: Leyla Yılmaz" 
                      className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-[#D4AF37]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-medium">Telefon Numaranız *</label>
                    <input 
                      type="tel" 
                      required 
                      value={bookingPhone} 
                      onChange={(e) => setBookingPhone(e.target.value)} 
                      placeholder="05XX XXX XX XX" 
                      className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-[#D4AF37]" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-medium">Hizmet Seçimi *</label>
                  <select 
                    required 
                    value={bookingService} 
                    onChange={(e) => setBookingService(e.target.value)} 
                    className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="">Lütfen Bir Hizmet Seçin</option>
                    <option value="Kesim & Şekillendirme">Kesim & Şekillendirme (450 ₺)</option>
                    <option value="Ombre / Balyaj">Ombre / Balyaj (2.200 ₺)</option>
                    <option value="Keratin Bakımı">Keratin Bakımı (1.100 ₺)</option>
                    <option value="Dip / Tüm Boya">Dip / Tüm Boya (850 ₺)</option>
                    <option value="Gelin Paketi">Gelin Paketi (4.500 ₺)</option>
                    <option value="Manikür & Pedikür">Manikür & Pedikür (500 ₺)</option>
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-medium">Tarih *</label>
                    <input 
                      type="date" 
                      required 
                      value={bookingDate} 
                      onChange={(e) => setBookingDate(e.target.value)} 
                      onClick={(e) => {
                        try { e.target.showPicker && e.target.showPicker(); } catch(err) {}
                      }}
                      className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-[#D4AF37] cursor-pointer" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-medium">Saat Dilimi *</label>
                    <select 
                      required 
                      value={bookingTime} 
                      onChange={(e) => setBookingTime(e.target.value)} 
                      className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="">Saat Seçiniz</option>
                      <option value="10:00">10:00</option>
                      <option value="12:00">12:00</option>
                      <option value="14:00">14:00</option>
                      <option value="16:00">16:00</option>
                      <option value="18:00">18:00</option>
                    </select>
                  </div>
                </div>

                {/* Mesaj ve Fotoğraf Yükleme */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-medium">Özel Notunuz / Mesajınız (Opsiyonel)</label>
                    <textarea 
                      rows={3} 
                      value={bookingMessage} 
                      onChange={(e) => setBookingMessage(e.target.value)} 
                      placeholder="Örn: Saçımın daha önce açılmış uçları var, bu modelden istiyorum..." 
                      className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-[#D4AF37] resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-medium">Referans Görsel Yükle (Opsiyonel)</label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-white/5 border border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37]/10 transition flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                        <Upload className="w-4 h-4 text-[#D4AF37]" /> Fotoğraf Seç
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      {bookingImage && (
                        <div className="flex items-center gap-2">
                          <img src={bookingImage} alt="Önizleme" className="w-10 h-10 object-cover rounded-lg border border-[#D4AF37]" />
                          <button type="button" onClick={() => setBookingImage(null)} className="text-red-400 text-xs hover:underline">Kaldır</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-black font-bold text-xs uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-[#D4AF37]/20"
                >
                  Randevu Talebini Gönder
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] block">Lokasyon</span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F3E5AB]">Bize Ulaşın & Konum</h2>
              <div className="w-20 h-0.5 bg-[#D4AF37] mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="p-8 sm:p-10 rounded-3xl bg-[#121212] border border-[#D4AF37]/30 space-y-6">
                <h3 className="text-2xl font-serif font-bold text-[#F3E5AB]">NES Kuaför Üsküdar</h3>
                <p className="text-sm text-gray-300 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  Selami Ali Mh. İspir Sk. No: 4/A Nes Kuaför Üsküdar / İstanbul
                </p>
                <p className="text-sm text-gray-300 flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#D4AF37] shrink-0" />
                  +90 (212) 555 01 99
                </p>
                <p className="text-sm text-gray-300 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#D4AF37] shrink-0" />
                  Pazartesi - Cumartesi: 09:00 - 20:00 (Pazar: Yalnızca Randevu)
                </p>
                <div className="pt-2">
                  <a 
                    href="https://maps.app.goo.gl/fVrwzGqusjmgitqS8?g_st=aw" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37]/20 text-xs font-bold uppercase tracking-wider transition"
                  >
                    <MapPin className="w-4 h-4 text-[#D4AF37]" /> Haritada Aç & Yol Tarifi Al
                  </a>
                </div>
              </div>

              <div className="h-80 rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.51134215162!2d29.0278143!3d41.025751!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab85743c3d52d%3A0x6b4cf8828f0951a7!2zU2VsYW1pIEFsaSwgxLBzcGlyIFNrLiBOczo0L0EsIDM0MzQxIMOaesG8w7xiYXIvxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1680000000000!5m2!1str!2str" className="w-full h-full border-0" allowFullScreen="" loading="lazy"></iframe>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'myapp' && user && (
          <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] block">Hesabım</span>
              <h2 className="text-3xl font-serif font-bold text-[#F3E5AB]">Randevularım</h2>
              <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto"></div>
              <p className="text-xs text-gray-400">Hoş geldiniz, {user.name}</p>
            </div>

            <div className="space-y-4">
              {myAppointments.length === 0 ? (
                <div className="text-center py-16 bg-[#121212] rounded-3xl border border-[#D4AF37]/20">
                  <Calendar className="w-12 h-12 text-[#D4AF37]/40 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">Henüz oluşturulmuş randevunuz bulunmuyor.</p>
                  <button onClick={() => setActiveTab('booking')} className="mt-4 px-6 py-2.5 rounded-full bg-[#D4AF37] text-black text-xs font-bold uppercase">Hemen Randevu Al</button>
                </div>
              ) : (
                myAppointments.map(app => (
                  <div key={app.id} className="p-6 rounded-2xl bg-[#121212] border border-[#D4AF37]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-serif font-bold text-[#F3E5AB]">{app.service}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          app.status === 'Onaylandı' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          app.status === 'İptal' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> {app.date} - {app.time}
                      </p>
                      {app.message && (
                        <p className="text-xs text-gray-400 italic bg-white/5 p-2 rounded-lg mt-1">Notunuz: "{app.message}"</p>
                      )}
                      {app.adminReply && (
                        <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 border-l-2 border-[#D4AF37] text-xs text-gray-200 mt-2">
                          <span className="text-[9px] uppercase tracking-wider text-[#D4AF37] font-bold block mb-0.5">NES Kuaför Yanıtı:</span>
                          <p className="font-medium">"{app.adminReply}"</p>
                        </div>
                      )}
                      {app.attachedImage && (
                        <div className="mt-2">
                          <img 
                            src={app.attachedImage} 
                            alt="Yüklenen Görsel" 
                            className="h-14 w-14 object-cover rounded-lg border border-[#D4AF37]/40 cursor-pointer hover:opacity-80"
                            onClick={() => setActiveModalImage({ 
                              url: app.attachedImage, 
                              title: 'Referans Görseliniz', 
                              tag: 'Yüklenen',
                              isCustomerImage: true,
                              appointment: app
                            })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#121212] border-t border-[#D4AF37]/20 py-16 mt-20 text-gray-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold">N</div>
              <span className="text-lg font-serif font-bold text-[#F3E5AB]">NES Kuaför Üsküdar</span>
            </div>
            <p className="text-xs text-gray-400 font-light leading-relaxed">Üsküdar'ın en prestijli saç tasarım ve güzellik merkezi. Kişiye özel VIP hizmet anlayışı.</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">İletişim & Lokasyon</h4>
            <p className="text-xs text-gray-300 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#D4AF37]" /> Selami Ali Mh. İspir Sk. No: 4/A Nes Kuaför Üsküdar / İstanbul</p>
            <p className="text-xs text-gray-300 flex items-center gap-2"><Phone className="w-4 h-4 text-[#D4AF37]" /> +90 (212) 555 01 99</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Çalışma Saatleri</h4>
            <p className="text-xs text-gray-300 mb-1">Pazartesi - Cumartesi: 09:00 - 20:00</p>
            <p className="text-xs text-gray-300">Pazar: Yalnızca Özel Randevu</p>
          </div>
        </div>
      </footer>

      {/* Giriş / Üye Ol Modal */}
      {authMode && (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#D4AF37]/50 rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
            <button onClick={() => setAuthMode(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-serif font-bold text-[#F3E5AB] mb-2">{authMode === 'register' ? 'Üye Ol' : 'Giriş Yap'}</h3>
            <p className="text-xs text-gray-400 mb-6">Randevularınızı takip etmek için adınız ve şifrenizle işlem yapın.</p>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500 text-red-200 text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-1.5 font-medium">Adınız Soyadınız</label>
                <input 
                  type="text" 
                  required 
                  value={authNameInput} 
                  onChange={(e) => setAuthNameInput(e.target.value)} 
                  placeholder="Örn: Aylin Çelik" 
                  className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]" 
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-1.5 font-medium">Şifre</label>
                <input 
                  type="password" 
                  required 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)} 
                  placeholder="******" 
                  className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]" 
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Şifreniz en az 6 karakter olmalı ve en az 1 büyük harf içermelidir.</span>
              </div>

              <button type="submit" className="w-full py-3.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest hover:opacity-90 transition">
                {authMode === 'register' ? 'Kayıt Ol' : 'Giriş Yap'}
              </button>
            </form>

            <div className="mt-6 text-center">
              {authMode === 'login' ? (
                <p className="text-xs text-gray-400">
                  Hesabınız yok mu?{' '}
                  <button onClick={() => setAuthMode('register')} className="text-[#D4AF37] font-bold hover:underline">Üye Olun</button>
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Zaten hesabınız var mı?{' '}
                  <button onClick={() => setAuthMode('login')} className="text-[#D4AF37] font-bold hover:underline">Giriş Yapın</button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Paneli */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#D4AF37]/50 rounded-3xl max-w-5xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#F3E5AB]">NES VIP Yönetim Paneli</h3>
              </div>
              <button onClick={() => setIsAdminOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {!isAdminAuthenticated ? (
              <div className="py-12 text-center max-w-sm mx-auto space-y-4">
                <div className="w-16 h-16 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto text-2xl">
                  <Lock className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-serif font-bold text-[#F3E5AB]">Yönetici Doğrulama</h4>
                <p className="text-xs text-gray-400">Lütfen şifrenizi giriniz. (Varsayılan: 1234)</p>
                <input 
                  type="password" 
                  value={adminPasswordInput} 
                  onChange={(e) => setAdminPasswordInput(e.target.value)} 
                  placeholder="Şifre" 
                  className="w-full bg-[#18181B] border border-white/20 rounded-xl px-4 py-3 text-center text-lg text-white focus:outline-none focus:border-[#D4AF37]" 
                />
                <button 
                  onClick={() => {
                    if (adminPasswordInput === '1234') {
                      setIsAdminAuthenticated(true);
                      setAdminAuthError(false);
                    } else {
                      setAdminAuthError(true);
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest hover:opacity-90 transition"
                >
                  Giriş Yap
                </button>
                {adminAuthError && <p className="text-red-400 text-xs">Hatalı şifre!</p>}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="flex gap-2">
                    {['ALL', 'Beklemede', 'Onaylandı', 'İptal'].map((st) => (
                      <button 
                        key={st} 
                        onClick={() => setAdminFilter(st)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${adminFilter === st ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setDeleteTarget('ALL')}
                    className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300 text-xs font-semibold hover:bg-red-500/30 transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Tümünü Temizle
                  </button>
                </div>

                <div className="overflow-x-auto border border-white/10 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#18181B] text-[#D4AF37] uppercase tracking-wider">
                        <th className="p-4">Müşteri</th>
                        <th className="p-4">Telefon</th>
                        <th className="p-4">Hizmet</th>
                        <th className="p-4">Tarih & Saat</th>
                        <th className="p-4">Mesaj & Görsel</th>
                        <th className="p-4">Durum</th>
                        <th className="p-4 text-center">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {appointments
                        .filter(a => adminFilter === 'ALL' || a.status === adminFilter)
                        .map(app => (
                          <tr key={app.id} className="hover:bg-white/[0.02]">
                            <td className="p-4 font-semibold text-white">{app.name}</td>
                            <td className="p-4"><a href={`tel:${app.phone}`} className="text-[#D4AF37] underline">{app.phone}</a></td>
                            <td className="p-4"><span className="px-2.5 py-1 rounded-md bg-[#D4AF37]/10 text-[#F3E5AB]">{app.service}</span></td>
                            <td className="p-4 text-gray-300">{app.date} <br/><b>{app.time}</b></td>
                            <td className="p-4 max-w-xs">
                              {app.message && <p className="italic text-gray-300 bg-white/5 p-2 rounded mb-1">"{app.message}"</p>}
                              {app.adminReply && <p className="text-[#D4AF37] text-[10px] bg-[#D4AF37]/10 p-1.5 rounded mb-1"><b>Yanıtınız:</b> {app.adminReply}</p>}
                              {app.attachedImage && (
                                <button 
                                  onClick={() => setActiveModalImage({ 
                                    url: app.attachedImage, 
                                    title: `Müşteri Görseli: ${app.name}`, 
                                    tag: 'Referans',
                                    isCustomerImage: true,
                                    appointment: app
                                  })}
                                  className="relative group mt-1 block"
                                >
                                  <img src={app.attachedImage} alt="Ek" className="w-10 h-10 object-cover rounded border border-[#D4AF37]" />
                                </button>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                app.status === 'Onaylandı' ? 'bg-emerald-500/20 text-emerald-300' :
                                app.status === 'İptal' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="p-4 text-center space-x-1">
                              <button onClick={() => openReplyModal(app)} className="p-1.5 rounded bg-blue-900/40 text-blue-300 hover:bg-blue-800" title="Yanıtla">
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                              {app.status !== 'Onaylandı' && (
                                <button onClick={() => updateStatus(app.id, 'Onaylandı')} className="p-1.5 rounded bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800" title="Onayla">
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {app.status !== 'İptal' && (
                                <button onClick={() => updateStatus(app.id, 'İptal')} className="p-1.5 rounded bg-amber-900/40 text-amber-300 hover:bg-amber-800" title="İptal Et">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button onClick={() => setDeleteTarget(app)} className="p-1.5 rounded bg-red-900/40 text-red-300 hover:bg-red-800" title="Sil">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fotoğraf Görüntüleyici ve Yanıt Ekranı (Lightbox) */}
      {activeModalImage && (
        <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-[#121212] border border-[#D4AF37]/50 rounded-3xl overflow-hidden shadow-2xl">
            <button 
              onClick={() => setActiveModalImage(null)}
              className="absolute top-4 right-4 z-[100] p-3 rounded-full bg-black/80 text-white hover:text-[#D4AF37] transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="grid md:grid-cols-2">
              <div className="h-80 md:h-[480px]">
                <img src={activeModalImage.url} alt={activeModalImage.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-8 flex flex-col justify-between space-y-6 bg-[#18181B]">
                {activeModalImage.isCustomerImage ? (
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">{activeModalImage.tag}</span>
                    <h3 className="text-2xl font-serif font-bold text-[#F3E5AB]">{activeModalImage.title}</h3>
                    {activeModalImage.appointment?.message && (
                      <p className="text-xs text-gray-300 italic bg-white/5 p-3 rounded-xl mt-4">"{activeModalImage.appointment.message}"</p>
                    )}
                    <div className="mt-6 space-y-3">
                      <label className="text-xs uppercase tracking-wider text-[#D4AF37] font-medium block">Müşteriye Yanıt Gönder:</label>
                      <textarea 
                        rows={3}
                        value={replyTargetId === activeModalImage.appointment.id ? replyText : (activeModalImage.appointment.adminReply || '')}
                        onChange={(e) => {
                          setReplyTargetId(activeModalImage.appointment.id);
                          setReplyText(e.target.value);
                        }}
                        placeholder="Mesajınızı buraya yazın..."
                        className="w-full bg-[#0A0A0A] border border-white/20 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] resize-none"
                      />
                      <button 
                        onClick={handleSendReply}
                        className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-500 transition"
                      >
                        Yanıtı Kaydet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">{activeModalImage.tag}</span>
                    <h3 className="text-2xl font-serif font-bold text-[#F3E5AB]">{activeModalImage.title}</h3>
                    <p className="text-xs text-gray-400 mt-4 leading-relaxed font-light">NES Kuaför ustalarının el işçiliği ve kişiye özel tasarım anlayışıyla hazırlanmıştır.</p>
                  </div>
                )}
                {activeModalImage.isGallery && (
                  <button 
                    onClick={() => {
                      setActiveModalImage(null);
                      setBookingService(activeModalImage.tag === 'Renklendirme' ? 'Ombre / Balyaj' : 'Kesim & Şekillendirme');
                      setActiveTab('booking');
                    }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-black font-bold text-xs uppercase tracking-wider shadow-lg"
                  >
                    Bu Stille Randevu Al
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Mesaj Yanıtla Modalı */}
      {replyTargetId && !activeModalImage && (
        <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif font-bold text-[#F3E5AB]">Müşteriye Yanıt Ver</h3>
                <button onClick={() => { setReplyTargetId(null); setReplyText(''); }} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
             </div>
             <textarea 
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Yanıtınızı buraya yazın..."
                className="w-full bg-[#0A0A0A] border border-white/20 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] resize-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => { setReplyTargetId(null); setReplyText(''); }} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 text-xs font-semibold hover:bg-white/5">İptal</button>
                <button onClick={handleSendReply} className="flex-1 py-3 rounded-xl bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:opacity-90">Gönder</button>
              </div>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-red-500/50 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white">Randevuyu Sil</h3>
            <p className="text-xs text-gray-300">
              {deleteTarget === 'ALL' ? 'Tüm randevu kayıtlarını silmek istediğinize emin misiniz?' : `"${deleteTarget.name}" adlı müşterinin randevusunu silmek istiyor musunuz?`}
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 text-xs font-semibold hover:bg-white/5">İptal</button>
              <button onClick={executeDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500">Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}