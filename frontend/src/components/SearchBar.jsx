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
      <div className="absolute left-3 text-slate-400">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        className="w-full bg-dark-800 border border-dark-700 text-slate-200 text-sm rounded-full focus:ring-2 focus:ring-brand-500 focus:border-brand-500 block pl-10 p-2.5 outline-none transition-all placeholder-slate-500"
        placeholder="Search for a product (e.g. Laptops)..."
        value={inputValue}
        onChange={handleChange}
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 text-slate-400 hover:text-white transition-colors"
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
