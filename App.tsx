
import React, { useState, useCallback } from 'react';
import { StylistOptions, GenerationResult, AspectRatio, Quality } from './types';
import ImageUploader from './components/ImageUploader';
import { generateFashionImage, checkApiKeySession } from './services/gemini';

const App: React.FC = () => {
  const [modelImg, setModelImg] = useState<string | null>(null);
  const [clothingImg, setClothingImg] = useState<string | null>(null);
  const [accessoryImg, setAccessoryImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [options, setOptions] = useState<StylistOptions>({
    background: 'Phòng Studio',
    pose: 'Đứng thẳng',
    photoStyle: 'Cinematic',
    numImages: 1,
    quality: '4K',
    aspectRatio: '1:1',
    description: '',
  });

  const handleGenerate = async () => {
    if (!modelImg || !clothingImg) {
      setError('Vui lòng tải lên cả ảnh người mẫu và ảnh trang phục.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await checkApiKeySession();
      const imageUrls = await generateFashionImage(modelImg, clothingImg, accessoryImg, options);
      
      const newResults = imageUrls.map(url => ({
        url,
        timestamp: Date.now()
      }));
      
      setResults(prev => [...newResults, ...prev]);
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("Requested entity was not found")) {
        // Reset key selection if needed
        // @ts-ignore
        if (typeof window.aistudio !== 'undefined') await window.aistudio.openSelectKey();
      }
      setError('Có lỗi xảy ra: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 text-white selection:bg-blue-400">
      <header className="px-6 py-6 border-b border-white/10 flex items-center justify-between backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white rounded-lg">
            <svg className="w-6 h-6 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AI Stylist Studio</h1>
        </div>
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <span className="text-white/70 hover:text-white cursor-pointer transition">Khám phá</span>
          <span className="text-white/70 hover:text-white cursor-pointer transition">Bộ sưu tập</span>
          <span className="bg-white/10 px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition cursor-pointer">
            Hướng dẫn
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
            <h2 className="text-lg font-bold mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Tải Ảnh Lên
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <ImageUploader id="model" label="Người mẫu" image={modelImg} onImageChange={setModelImg} />
              <ImageUploader id="clothing" label="Trang phục" image={clothingImg} onImageChange={setClothingImg} />
              <ImageUploader id="accessory" label="Phụ kiện" image={accessoryImg} onImageChange={setAccessoryImg} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-white/50 mb-2">Mô tả thêm (Tùy chọn)</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none transition h-24 resize-none"
                  placeholder="Ví dụ: Vải lụa, màu đậm hơn,..."
                  value={options.description}
                  onChange={(e) => setOptions({...options, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-white/50 mb-2">Bối cảnh</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none transition appearance-none"
                    value={options.background}
                    onChange={(e) => setOptions({...options, background: e.target.value})}
                  >
                    <option className="bg-blue-900">Studio</option>
                    <option className="bg-blue-900">Đường phố Paris</option>
                    <option className="bg-blue-900">Bãi biển</option>
                    <option className="bg-blue-900">Sự kiện sang trọng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-white/50 mb-2">Tư thế</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none transition appearance-none"
                    value={options.pose}
                    onChange={(e) => setOptions({...options, pose: e.target.value})}
                  >
                    <option className="bg-blue-900">Đứng thẳng</option>
                    <option className="bg-blue-900">Nghiêng người</option>
                    <option className="bg-blue-900">Ngồi ghế</option>
                    <option className="bg-blue-900">Tự nhiên</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-white/50 mb-2">Tỉ lệ khung hình</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1:1', '16:9', '9:16'] as AspectRatio[]).map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setOptions({...options, aspectRatio: ratio})}
                      className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                        options.aspectRatio === ratio 
                          ? 'bg-white text-blue-900 border-white shadow-lg' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-900/30 transition-all flex items-center justify-center space-x-2 group active:scale-95"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Đang tạo ảnh...</span>
                    </>
                  ) : (
                    <>
                      <span>TẠO ẢNH</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </aside>

        {/* Results Area */}
        <section className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Kết quả thiết kế</h2>
            <div className="text-sm text-white/50">{results.length} ảnh đã tạo</div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-xl mb-6 flex items-center">
              <svg className="w-5 h-5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {results.length === 0 && !loading ? (
            <div className="aspect-[16/9] bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/30 space-y-4">
              <div className="p-6 bg-white/5 rounded-full">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium">Chưa có ảnh nào được tạo</p>
              <p className="text-sm">Hãy tải lên ảnh người mẫu và trang phục để bắt đầu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading && (
                <div className="aspect-square bg-white/5 rounded-2xl animate-pulse flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-blue-400 font-medium">Đang xử lý AI...</p>
                  </div>
                </div>
              )}
              {results.map((res, i) => (
                <div key={res.timestamp + i} className="group relative bg-black rounded-2xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]">
                  <img src={res.url} alt="Generated fashion" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white/70">Tạo lúc: {new Date(res.timestamp).toLocaleTimeString()}</span>
                      <a 
                        href={res.url} 
                        download={`stylist-studio-${res.timestamp}.png`}
                        className="bg-white/20 hover:bg-white/40 p-2 rounded-lg backdrop-blur-md transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-20 border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 opacity-50 text-sm">
          <p>&copy; 2024 AI Stylist Studio. All rights reserved.</p>
          <div className="flex space-x-8">
            <span className="hover:text-white cursor-pointer transition">Chính sách bảo mật</span>
            <span className="hover:text-white cursor-pointer transition">Điều khoản sử dụng</span>
            <span className="hover:text-white cursor-pointer transition">Liên hệ trợ giúp</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
