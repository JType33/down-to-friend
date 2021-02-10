import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ProfileButton from './ProfileButton';
import FormModal from '../FormModal';
import SearchBar from '../SearchBar';

import './Navigation.css';

export default function Navigation ({ isLoaded }) {
  const { user, loaded: sessionLoaded } = useSelector(state => state.session);
  return (
    <nav className='navbar'>
      <div className='user-navigation-buttons'>
        <div className='nav-button-container'>
          <NavLink to='/'>
            <button className='nav-button home'>
              Home
            </button>
          </NavLink>
        </div>
        {sessionLoaded && user
          ? (
            <>
              <ProfileButton />
              <NavLink to='/messages'>
                <button>
                  Messages
                </button>
              </NavLink>
            </>
            )
          : <FormModal />}
      </div>
      <SearchBar />
    </nav>
  );
}
