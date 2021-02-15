import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import EventReel from './EventReel';
import GoogleMap from '../Map';
import NewEvent from '../NewEvent';
import { Focus, LoadMap, UnloadMap } from '../../store/map';
import { GetLocale } from '../../store/user';

import './home.css';
import { UnloadReel, SetEnumerable } from '../../store/reel';

export default function Home () {
  const dispatch = useDispatch();
  const list = useSelector(state => state.reel.list);
  const user = useSelector(state => state.session.user);
  const reelLoaded = useSelector(state => state.reel.loaded);
  const sessionLoaded = useSelector(state => state.session.loaded);
  const displayNewEvent = useSelector(state => state.newEvent.display);

  useEffect(() => {
    dispatch(SetEnumerable(true));
    if (user) {
      dispatch(GetLocale())
        .then(({ lng, lat }) => {
          dispatch(Focus(lng, lat, null, 10));
        })
        .then(() => {
          dispatch(LoadMap());
        });
    } else {
      dispatch(LoadMap());
      dispatch(Focus(-121.49428149672518, 38.57366700738277, null, 10));
    }

    return () => {
      dispatch(UnloadReel());
      dispatch(UnloadMap());
    };
  }, [dispatch, user]);

  return (sessionLoaded || reelLoaded) && (
    <div className='home-container'>
      {reelLoaded
        ? (
          <div className='reel-newevent-view-controller'>
            <div
              className='reel-newevent-sliding-controller'
              style={{
                left: displayNewEvent ? '-768px' : '0px'
              }}
            >
              <EventReel
                list={list}
              />
              <NewEvent />
            </div>
          </div>
          )
        : (
          <div className='loading-container'>
            <img
              className='loading-spinner'
              src={`${process.env.PUBLIC_URL}/img/dual-ring-small.svg`}
              alt='Loading...'
            />
          </div>
          )}
      <GoogleMap
        list={list}
      />
    </div>
  );
}
