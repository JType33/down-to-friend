import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import Home from './components/Home';
import Navigation from './components/Navigation';
import UserProfile from './components/UserProfile';
import { RestoreUser } from './store/session';

export default function App () {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(RestoreUser());
  }, [dispatch]);

  return (
    <>
      <Navigation />
      <Switch>
        <Route exact path='/'>
          <Home />
        </Route>
        <Route exact path='/users/:userId'>
          <UserProfile />
        </Route>
      </Switch>
    </>
  );
}
