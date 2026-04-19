import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Search, X } from 'lucide-react';
import debounce from 'lodash/debounce';

function SearchBar({ onSearch }) {
  const [inputValue, setInputValue] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((nextValue) => {
      onSearch(nextValue);
    }, 500),
    [onSearch]
  );

  const handleChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    debouncedSearch(val);
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
  };

  return (
    <div className="relative flex items-center w-full">
      <div className="absolute left-4 text-brand-400">
        <Search className="h-5 w-5" />
      </div>
      <input
        type="text"
        className="w-full bg-surface-50/80 border-2 border-surface-200 text-slate-800 text-base rounded-2xl focus:ring-4 focus:ring-brand-400/20 focus:border-brand-400 block pl-12 pr-12 p-3.5 outline-none transition-all placeholder-slate-400 shadow-sm hover:border-brand-300"
        placeholder="Search for a product (e.g. Laptops)..."
        value={inputValue}
        onChange={handleChange}
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-4 text-slate-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-50"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
