import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import Map from './components/Map';
import RegionDetails from './components/RegionDetails';
import Charts from './components/Charts';
import BrandDemand from './components/BrandDemand';
import { Activity, Map as MapIcon, BarChart3, Search, ArrowRight, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function AppContent() {
  const navigate = useNavigate();
  const [product, setProduct] = useState('');
  const [demandData, setDemandData] = useState([]);
  const [selectedState, setSelectedState] = useState('');
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
      navBrands: "ब्रांड अंतर्दृष्टि",
      localeName: "हिंदी (Hindi)"
    },
    bn: {
      searchPlaceholder: "একটি পণ্য অনুসন্ধান করুন...",
      appTitle: "ডিম্যান্ডস্ফিয়ার",
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
      navBrands: "బ్రాండ్ అంతర్దృష్టి",
      localeName: "తెలుగు (Telugu)"
    },
    mr: {
      searchPlaceholder: "एक उत्पादन शोधा...",
      appTitle: "डिमँडस्फियर",
      appSubtitle: "AI",
      navOverview: "आढावा",
      navMap: "जिओ नकाशा",
      navAnalytics: "विश्लेषण",
      navBrands: "ब्रँड अंतर्दृष्टी",
      localeName: "मराठी (Marathi)"
    },
    ta: {
      searchPlaceholder: "ஒரு பொருளைத் தேடுங்கள்...",
      appTitle: "டிமாண்ட்ஸ்பியர்",
      appSubtitle: "AI",
      navOverview: "கண்ணோட்டம்",
      navMap: "ஜியோ வரைபடம்",
      navAnalytics: "பகுப்பாய்வு",
      navBrands: "பிராண்ட் நுண்ணறிவு",
      localeName: "தமிழ் (Tamil)"
    },
    gu: {
      searchPlaceholder: "કોઈ ઉત્પાદન શોધો...",
      appTitle: "ડિમાન્ડસ્ફિયર",
      appSubtitle: "AI",
      navOverview: "ઝાંખી",
      navMap: "જીઓ નકશો",
      navAnalytics: "વિશ્લેષણ",
      navBrands: "બ્રાન્ડ આંતર્દૃષ્ટિ",
      localeName: "ગુજરાતી (Gujarati)"
    },
    kn: {
      searchPlaceholder: "ಒಂದು ಉತ್ಪನ್ನವನ್ನು ಹುಡುಕಿ...",
      appTitle: "ಡಿಮಾಂಡ್‌ಸ್ಫಿಯರ್",
      appSubtitle: "AI",
      navOverview: "ಅವಲೋಕನ",
      navMap: "ಜಿಯೋ ನಕ್ಷೆ",
      navAnalytics: "ವಿಶ್ಲೇಷಣೆ",
      navBrands: "ಬ್ರ್ಯಾಂಡ್ ಒಳನೋಟ",
      localeName: "ಕನ್ನಡ (Kannada)"
    },
    ml: {
      searchPlaceholder: "ഒരു ഉൽപ്പന്നം തിരയുക...",
      appTitle: "ഡിമാൻഡ്സ്ഫിയർ",
      appSubtitle: "AI",
      navOverview: "അവലോകനം",
      navMap: "ജിയോ മാപ്പ്",
      navAnalytics: "അനലിറ്റിക്സ്",
      navBrands: "ബ്രാൻഡ് ഇൻസൈറ്റ്",
      localeName: "മലയാളം (Malayalam)"
    },
    pa: {
      searchPlaceholder: "ਇੱਕ ਉਤਪਾਦ ਖੋਜੋ...",
      appTitle: "ਡਿਮਾਂਡਸਫੀਅਰ",
      appSubtitle: "AI",
      navOverview: "ਸੰਖੇਪ ਜਾਣਕਾਰੀ",
      navMap: "ਜੀਓ ਨਕਸ਼ਾ",
      navAnalytics: "ਵਿਸ਼ਲੇਸ਼ਣ",
      navBrands: "ਬ੍ਰਾਂਡ ਇਨਸਾਈਟ",
      localeName: "ਪੰਜਾਬੀ (Punjabi)"
    },
    or: {
      searchPlaceholder: "ଗୋଟିଏ ଉତ୍ପାଦ ଖୋଜନ୍ତୁ...",
      appTitle: "ଡିମାଣ୍ଡସ୍ଫିୟର୍",
      appSubtitle: "AI",
      navOverview: "ସମୀକ୍ଷା", navMap: "ଜିଓ ମ୍ୟାପ୍", navAnalytics: "ବିଶ୍ଳେଷଣ",
      navBrands: "ବ୍ରାଣ୍ଡ ଅନ୍ତର୍ଦୃଷ୍ଟି",
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
    <div className="min-h-screen flex flex-col text-slate-800">
      {/* Header with frosted glass effect */}
      <header className="border-b border-white/60 bg-white/60 backdrop-blur-xl sticky top-0 z-10 shadow-sm shadow-indigo-100/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-lg shadow-md shadow-brand-500/20">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 hidden sm:block">{t.appTitle} <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">{t.appSubtitle}</span></span>
            </div>
            
            <nav className="flex items-center gap-1 bg-surface-50/80 backdrop-blur p-1 rounded-xl border border-surface-200/50">
              <NavLink to="/" className={({isActive}) => `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white text-brand-600 shadow-sm shadow-brand-200/50' : 'text-slate-500 hover:text-brand-600 hover:bg-white/50'}`}>
                <Search className="h-4 w-4" /> {t.navOverview}
              </NavLink>
              <NavLink to="/map" className={({isActive}) => `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white text-brand-600 shadow-sm shadow-brand-200/50' : 'text-slate-500 hover:text-brand-600 hover:bg-white/50'}`}>
                <MapIcon className="h-4 w-4" /> {t.navMap}
              </NavLink>
              <NavLink to="/analytics" className={({isActive}) => `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white text-brand-600 shadow-sm shadow-brand-200/50' : 'text-slate-500 hover:text-brand-600 hover:bg-white/50'}`}>
                <BarChart3 className="h-4 w-4" /> {t.navAnalytics}
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/80 backdrop-blur border border-surface-200 text-slate-700 text-sm rounded-xl outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 py-1.5 px-3 max-w-[150px] sm:max-w-xs shadow-sm cursor-pointer"
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
            <div className="bg-red-50/80 backdrop-blur border border-red-200 text-red-600 p-4 rounded-xl shrink-0 shadow-sm">
              {error}
            </div>
          )}
          
          <Routes>
            <Route path="/" element={
              <div className="flex flex-col items-center justify-center h-full gap-8">
                <div className="text-center space-y-4 max-w-xl">
                  <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">{t.appTitle} <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">{t.appSubtitle}</span></h1>
                  <p className="text-slate-500 text-lg">{t.searchPlaceholder}</p>
                </div>
                <div className="w-full max-w-2xl glass-card p-8 rounded-2xl">
                  <SearchBar onSearch={(query) => { setProduct(query); fetchDemandAll(query); }} />
                  {loading && <div className="mt-6 flex justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>}
                  {!loading && demandData.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-700 text-center font-medium">
                        ✨ Analysis complete for <strong>{product}</strong>! View Pan-India data or select a specific state below.
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => navigate('/map')} className="flex items-center justify-center gap-2 p-3 bg-blue-50/80 hover:bg-blue-100 rounded-xl border border-blue-200/60 transition-all text-slate-700 font-medium hover:shadow-md hover:shadow-blue-100/50 hover:-translate-y-0.5">
                          <MapIcon className="w-4 h-4 text-blue-500" /> Pan-India Map <ArrowRight className="w-4 h-4 ml-1 text-blue-400" />
                        </button>
                        <button onClick={() => navigate('/analytics')} className="flex items-center justify-center gap-2 p-3 bg-violet-50/80 hover:bg-violet-100 rounded-xl border border-violet-200/60 transition-all text-slate-700 font-medium hover:shadow-md hover:shadow-violet-100/50 hover:-translate-y-0.5">
                          <BarChart3 className="w-4 h-4 text-violet-500" /> Analytics <ArrowRight className="w-4 h-4 ml-1 text-violet-400" />
                        </button>
                        <button onClick={() => navigate('/analytics')} className="flex items-center justify-center gap-2 p-3 bg-amber-50/80 hover:bg-amber-100 rounded-xl border border-amber-200/60 transition-all text-slate-700 font-medium hover:shadow-md hover:shadow-amber-100/50 hover:-translate-y-0.5">
                          <Building2 className="w-4 h-4 text-amber-500" /> Brand Insight <ArrowRight className="w-4 h-4 ml-1 text-amber-400" />
                        </button>
                      </div>

                      <div className="mt-4 border-t border-surface-200 pt-4">
                        <label className="block text-sm font-medium text-slate-500 mb-2">Choose a state to see demand in that state:</label>
                        <select 
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            if (e.target.value) navigate(`/region/${e.target.value}`);
                          }}
                          className="w-full bg-surface-50 border border-surface-200 text-slate-700 text-base rounded-xl outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 p-3"
                        >
                          <option value="">All India (Pan-India view)</option>
                          {demandData.map(d => (
                            <option key={d.region} value={d.region}>{d.region} (Score: {d.demand_score.toFixed(1)})</option>
                          ))}
                        </select>
                        {selectedState && (
                          <button
                            onClick={() => navigate('/analytics')}
                            className="mt-3 w-full flex items-center justify-center gap-2 p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all text-indigo-600 font-medium text-sm hover:shadow-md hover:shadow-indigo-100/50"
                          >
                            <Building2 className="w-4 h-4" /> View Brand Demand in {selectedState} <ArrowRight className="w-4 h-4 ml-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            } />

            <Route path="/map" element={
              <div className="glass-card rounded-2xl overflow-hidden flex-1 relative">
                {!product && !loading && (
                  <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none bg-white/70 backdrop-blur-sm">
                    <span className="text-slate-500 text-lg bg-white/80 px-6 py-3 rounded-xl shadow-sm border border-surface-200">Please search for a product in the Overview tab first.</span>
                  </div>
                )}
                <Map data={demandData} />
              </div>
            } />

            <Route path="/region/:regionName" element={
              <RegionDetails product={product} />
            } />

            <Route path="/analytics" element={
              <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
                 {!product ? (
                   <div className="glass-card rounded-2xl flex-1 flex items-center justify-center">
                     <span className="text-slate-400 text-lg">Search for a product first to view detailed analytics.</span>
                   </div>
                 ) : (
                   <div className="glass-card rounded-2xl p-6 flex-1 overflow-y-auto">
                     <Charts data={demandData} product={product} selectedState={selectedState} onStateChange={setSelectedState} />
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
