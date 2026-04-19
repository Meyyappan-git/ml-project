import React, { useState, useEffect } from 'react';
import api from '../api';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

function ConnectionStatus() {
  const [status, setStatus] = useState('checking'); // 'ok', 'error', 'checking'

  const checkConnection = async () => {
    setStatus('checking');
    try {
      await api.get('/api/health');
      setStatus('ok');
    } catch (err) {
      setStatus('error');
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-white/50 backdrop-blur-sm transition-all shadow-sm">
      {status === 'checking' && (
        <>
          <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Checking API...</span>
        </>
      )}
      {status === 'ok' && (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-200"></div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">API Connected</span>
          <Wifi className="w-3 h-3 text-emerald-400 ml-0.5" />
        </>
      )}
      {status === 'error' && (
        <button 
          onClick={checkConnection}
          className="flex items-center gap-2 hover:bg-rose-50 transition-colors rounded-lg"
        >
          <div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-200"></div>
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">API Offline</span>
          <WifiOff className="w-3 h-3 text-rose-400" />
        </button>
      )}
    </div>
  );
}

export default ConnectionStatus;
