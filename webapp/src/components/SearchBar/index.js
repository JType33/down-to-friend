import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Predictions from './Predictions';
import Debouncer from '../../utils/Debouncer';
import { PlaceSearch, PlaceDetails } from '../../utils/Places';
import { AutoComplete, Searching } from '../../store/search';
import { UnloadReel } from '../../store/reel';

import './Search.css';

const debouncedPlaceSearch = Debouncer(PlaceSearch, 500);
const debouncedPlaceDetails = Debouncer(PlaceDetails, 750);

export default function SearchBar () {
  const dispatch = useDispatch();
  const searched = useSelector(state => state.search.searched);
  const predictions = useSelector(state => state.search.predictions);

  const [search, updateSearch] = useState('');

  const handleSearch = ({ target: { value } }) => {
    if (searched) return;
    updateSearch(value);
    if (value.length) debouncedPlaceSearch(value, dispatch);
    else (dispatch(AutoComplete([])));
  };

  const submit = submitEvent => {
    submitEvent.preventDefault();
    dispatch(Searching(true));
    dispatch(AutoComplete([]));
    dispatch(UnloadReel());
    debouncedPlaceDetails(search, dispatch);
    dispatch(Searching(false));
  };

  return (
    <div className='searchbar-container'>
      <form
        className='searchbar-form'
        onSubmit={submit}
      >
        <button
          type='submit'
          className='location-search-submit'
        >
          <i className='fas fa-search-location search-icon' />
        </button>
        <input
          className='searchbar-input'
          type='text'
          placeholder='Anaheim | NYC | 221B Baker St'
          maxLength={50}
          value={search}
          onChange={handleSearch}
        />
        <Predictions
          predictions={predictions}
          updateSearch={updateSearch}
        />
      </form>
    </div>
  );
}
