import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

function Map({ data, selectedRegion }) {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState(null);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    // Fetch custom India state geojson
    axios.get('https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson', { timeout: 10000 })
      .then(res => setGeoData(res.data))
      .catch(err => {
        console.error("Error loading geojson", err);
        setFetchError(true);
      });
  }, []);

  // Map data to states
  const dataMap = useMemo(() => {
    const map = {};
    if (data && data.length) {
      data.forEach(item => {
        // Simple normalization for matching
        const stateName = item.region.toLowerCase().replace(/[^a-z]/g, '');
        map[stateName] = item.demand_score;
      });
    }
    return map;
  }, [data]);

  const getColor = (score) => {
    if (score == null) return '#e2e8f0'; // light-200 default
    if (score > 75) return '#ef4444'; // Red (High Demand)
    if (score > 50) return '#eab308'; // Yellow (Moderate Demand)
    if (score > 25) return '#22c55e'; // Green (Low Demand)
    return '#10b981'; // Dark green
  };

  const style = (feature) => {
    const stateName = feature.properties.NAME_1 || feature.properties.NAME || '';
    const normalizedName = stateName.toLowerCase().replace(/[^a-z]/g, '');
    const score = dataMap[normalizedName];
    const isSelected = selectedRegion && selectedRegion.toLowerCase().replace(/[^a-z]/g, '') === normalizedName;

    return {
      fillColor: getColor(score),
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? '#2563eb' : '#94a3b8', // highlight active state with brand border
      fillOpacity: score != null ? 0.8 : 0.4
    };
  };

  const onEachFeature = (feature, layer) => {
    const stateName = feature.properties.NAME_1 || feature.properties.NAME || '';
    
    // Add simple tooltip
    layer.bindTooltip(`<strong>${stateName}</strong>`, { direction: 'auto', sticky: true });
    
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          fillOpacity: 1,
          weight: 2,
          color: '#2563eb'
        });
        layer.bringToFront();
      },
      mouseout: (e) => {
        geoData && layer.setStyle(style(feature));
      },
      click: () => {
        navigate(`/region/${stateName}`);
      }
    });
  };

  if (fetchError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
        <div className="text-red-500 mb-4 p-3 bg-red-50 rounded-full">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-slate-900 font-bold text-lg mb-2">Map Load Failed</h3>
        <p className="text-slate-500 max-w-xs mb-6 text-sm">We couldn't load the geographical data. This might be due to a network issue.</p>
        <button 
          onClick={() => { setFetchError(false); window.location.reload(); }}
          className="px-5 py-2 bg-brand-600 text-white rounded-xl font-bold shadow-md shadow-brand-200 hover:bg-brand-700 transition-all active:scale-95"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!geoData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse">Initializing Geo-Intelligence Map...</p>
      </div>
    );
  }

  return (
    <MapContainer 
      center={[22.5937, 78.9629]}
      zoom={4}
      maxBounds={[
        [6.0, 68.0], 
        [36.0, 98.0]
      ]}
      maxBoundsViscosity={1.0}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      attributionControl={true}
      minZoom={4}
      maxZoom={8}
      className="bg-light-50"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
      />
      <GeoJSON 
        key={`geojson-layer-${data?.length || 0}`}
        data={geoData} 
        style={style} 
        onEachFeature={onEachFeature} 
      />
    </MapContainer>
  );
}

Map.propTypes = {
  data: PropTypes.array,
  selectedRegion: PropTypes.string
};

export default Map;
