import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

function Map({ data, selectedRegion }) {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    // Fetch custom India state geojson
    axios.get('https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson')
      .then(res => setGeoData(res.data))
      .catch(err => console.error("Error loading geojson", err));
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
    if (score == null) return '#1e293b'; // dark-800 default
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
      color: isSelected ? '#ffffff' : '#334155', // highlight active state with white border
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
          color: '#ffffff'
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

  if (!geoData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-dark-900 border border-dark-700 rounded-xl">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
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
      className="bg-dark-900"
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri &mdash; Source: Esri"
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
