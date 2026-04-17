import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import Map from './components/Map';
import RegionDetails from './components/RegionDetails';
import Charts from './components/Charts';
import { Activity, Map as MapIcon, BarChart3, Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function AppContent() {
  const navigate = useNavigate();
  const [product, setProduct] = useState('');
  const [demandData, setDemandData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('en');

  const translations = {
    en: {
      searchPlaceholder: "Search for a product...",
      appTitle: "DemandSphere",
      appSubtitle: "AI",
      navOverview: "Overview",
      navMap: "Geo Map",
      navAnalytics: "Analytics",
      localeName: "English"
    },
    hi: {
      searchPlaceholder: "किसी उत्पाद को खोजें...",
      appTitle: "डिमैंडस्फेयर",
      appSubtitle: "एआई",
      navOverview: "अवलोकन",
      navMap: "भू नक्शा",
      navAnalytics: "एनालिटिक्स",
      localeName: "हिंदी (Hindi)"
    },
    bn: {
      searchPlaceholder: "একটি পণ্য অনুসন্ধান করুন...",
      appTitle: "ডিম্যান্ডস্ফিয়ার",
      appSubtitle: "এআই",
      navOverview: "সংক্ষিপ্ত বিবরণ",
      navMap: "জিও ম্যাপ",
      navAnalytics: "বিশ্লেষণ",
      localeName: "বাংলা (Bengali)"
    },
    te: {
      searchPlaceholder: "ఒక ఉత్పత్తిని శోధించండి...",
      appTitle: "డిమాండ్‌స్ఫియర్",
      appSubtitle: "AI",
      navOverview: "అవలోకనం",
      navMap: "జియో మ్యాప్",
      navAnalytics: "విశ్లేషణలు",
      localeName: "తెలుగు (Telugu)"
    },
    mr: {
      searchPlaceholder: "एक उत्पादन शोधा...",
      appTitle: "डिमँडस्फियर",
      appSubtitle: "AI",
      navOverview: "आढावा",
      navMap: "जिओ नकाशा",
      navAnalytics: "विश्लेषण",
      localeName: "मराठी (Marathi)"
    },
    ta: {
      searchPlaceholder: "ஒரு பொருளைத் தேடுங்கள்...",
      appTitle: "டிமாண்ட்ஸ்பியர்",
      appSubtitle: "AI",
      navOverview: "கண்ணோட்டம்",
      navMap: "ஜியோ வரைபடம்",
      navAnalytics: "பகுப்பாய்வு",
      localeName: "தமிழ் (Tamil)"
    },
    gu: {
      searchPlaceholder: "કોઈ ઉત્પાદન શોધો...",
      appTitle: "ડિમાન્ડસ્ફિયર",
      appSubtitle: "AI",
      navOverview: "ઝાંખી",
      navMap: "જીઓ નકશો",
      navAnalytics: "વિશ્લેષણ",
      localeName: "ગુજરાતી (Gujarati)"
    },
    kn: {
      searchPlaceholder: "ಒಂದು ಉತ್ಪನ್ನವನ್ನು ಹುಡುಕಿ...",
      appTitle: "ಡಿಮಾಂಡ್‌ಸ್ಫಿಯರ್",
      appSubtitle: "AI",
      navOverview: "ಅವಲೋಕನ",
      navMap: "ಜಿಯೋ ನಕ್ಷೆ",
      navAnalytics: "ವಿಶ್ಲೇಷಣೆ",
      localeName: "ಕನ್ನಡ (Kannada)"
    },
    ml: {
      searchPlaceholder: "ഒരു ഉൽപ്പന്നം തിരയുക...",
      appTitle: "ഡിമാൻഡ്സ്ഫിയർ",
      appSubtitle: "AI",
      navOverview: "അവലോകനം",
      navMap: "ജിയോ മാപ്പ്",
      navAnalytics: "അനലിറ്റിക്സ്",
      localeName: "മലയാളം (Malayalam)"
    },
    pa: {
      searchPlaceholder: "ਇੱਕ ਉਤਪਾਦ ਖੋਜੋ...",
      appTitle: "ਡਿਮਾਂਡਸਫੀਅਰ",
      appSubtitle: "AI",
      navOverview: "ਸੰਖੇਪ ਜਾਣਕਾਰੀ",
      navMap: "ਜੀਓ ਨਕਸ਼ਾ",
      navAnalytics: "ਵਿਸ਼ਲੇਸ਼ਣ",
      localeName: "ਪੰਜਾਬੀ (Punjabi)"
    },
    or: {
      searchPlaceholder: "ଗୋଟିଏ ଉତ୍ପାଦ ଖୋଜନ୍ତୁ...",
      appTitle: "ଡିମାଣ୍ଡସ୍ଫିୟର୍",
      appSubtitle: "AI",
      navOverview: "ସମୀକ୍ଷା", navMap: "ଜିଓ ମ୍ୟାପ୍", navAnalytics: "ବିଶ୍ଳେଷଣ",
      localeName: "ଓଡ଼ିଆ (Odia)"
    }
  };
  
  const t = translations[language];

  const fetchDemandAll = async (searchProduct) => {
    if (!searchProduct) {
      setDemandData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/analyze', { product: searchProduct });
      setDemandData(res.data.results);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col text-slate-200">
      <header className="border-b border-dark-800 bg-dark-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-brand-400">
              <Activity className="h-6 w-6" />
              <span className="font-bold text-xl tracking-tight text-white hidden sm:block">{t.appTitle} <span className="text-brand-500">{t.appSubtitle}</span></span>
            </div>
            
            <nav className="flex items-center gap-1 bg-dark-800 p-1 rounded-lg">
              <NavLink to="/" className={({isActive}) => `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-dark-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                <Search className="h-4 w-4" /> {t.navOverview}
              </NavLink>
              <NavLink to="/map" className={({isActive}) => `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-dark-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                <MapIcon className="h-4 w-4" /> {t.navMap}
              </NavLink>
              <NavLink to="/analytics" className={({isActive}) => `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-dark-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                <BarChart3 className="h-4 w-4" /> {t.navAnalytics}
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-dark-800 border border-dark-700 text-slate-200 text-sm rounded-lg outline-none focus:ring-2 focus:ring-brand-500 py-1.5 px-2 max-w-[150px] sm:max-w-xs"
            >
              {Object.keys(translations).map((langKey) => (
                <option key={langKey} value={langKey}>
                  {translations[langKey].localeName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex gap-6 overflow-hidden max-md:flex-col relative">
        <div className="flex-1 flex flex-col gap-6 w-full h-[calc(100vh-6rem)]">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl shrink-0">
              {error}
            </div>
          )}
          
          <Routes>
            <Route path="/" element={
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="text-center space-y-4 max-w-xl">
                  <h1 className="text-4xl font-bold text-white tracking-tight">{t.appTitle} <span className="text-brand-500">{t.appSubtitle}</span></h1>
                  <p className="text-slate-400">{t.searchPlaceholder}</p>
                </div>
                <div className="w-full max-w-2xl bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-xl shadow-black/50">
                  <SearchBar onSearch={(query) => { setProduct(query); fetchDemandAll(query); }} />
                  {loading && <div className="mt-6 flex justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>}
                  {!loading && demandData.length > 0 && (
                    <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center">
                        Analysis complete for <strong>{product}</strong>! View Pan-India data or select a specific state below.
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => navigate('/map')} className="flex items-center justify-center gap-2 p-3 bg-dark-700 hover:bg-dark-600 rounded-xl border border-dark-600 transition-colors text-white font-medium">
                          <MapIcon className="w-4 h-4 text-brand-400" /> Pan-India Map <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                        <button onClick={() => navigate('/analytics')} className="flex items-center justify-center gap-2 p-3 bg-dark-700 hover:bg-dark-600 rounded-xl border border-dark-600 transition-colors text-white font-medium">
                          <BarChart3 className="w-4 h-4 text-brand-400" /> Top Analytics <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      </div>

                      <div className="mt-4 border-t border-dark-700 pt-4">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Dive deep into a specific state:</label>
                        <select 
                          onChange={(e) => { if(e.target.value) navigate(`/region/${e.target.value}`) }}
                          className="w-full bg-dark-900 border border-dark-700 text-slate-200 text-base rounded-xl outline-none focus:border-brand-500 p-3"
                          defaultValue=""
                        >
                          <option value="" disabled>Select a state...</option>
                          {demandData.map(d => (
                            <option key={d.region} value={d.region}>{d.region} (Score: {d.demand_score.toFixed(1)})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            } />

            <Route path="/map" element={
              <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden flex-1 relative shadow-xl shadow-black/50">
                {!product && !loading && (
                  <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none bg-dark-900/80 backdrop-blur-sm">
                    <span className="text-slate-200 text-lg">Please search for a product in the Overview tab first.</span>
                  </div>
                )}
                <Map data={demandData} />
              </div>
            } />

            <Route path="/region/:regionName" element={
              <RegionDetails product={product} />
            } />

            <Route path="/analytics" element={
              <div className="flex-1 flex flex-col gap-6">
                 {!product ? (
                   <div className="bg-dark-800 rounded-2xl border border-dark-700 flex-1 flex items-center justify-center shadow-xl shadow-black/50">
                     <span className="text-slate-400">Search for a product first.</span>
                   </div>
                 ) : (
                   <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 shadow-xl shadow-black/50 flex-1">
                     <Charts data={demandData} />
                   </div>
                 )}
              </div>
            } />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
