import csrfetch from './csrf.js';

const USER = 'session/USER';

const LOAD = 'session/LOAD';

const UNLOAD = 'session/UNLOAD';

export const SetSession = (user = null, loaded, loadState) => ({ type: USER, user, loaded, loadState });

export const LoadSession = () => ({ type: LOAD });

export const UnloadSession = () => ({ type: UNLOAD });

export const RestoreUser = () => async dispatch => {
  const { data: { user } } = await csrfetch('/api/session');
  dispatch(SetSession(user, true, 'cold'));
};

export const LogIn = (identification, password) => async dispatch => {
  const { data: { user } } = await csrfetch('/api/session', {
    method: 'POST',
    body: JSON.stringify({ identification, password })
  });
  dispatch(SetSession(user, true, 'hot'));
};

export const SignUp = newUser => async dispatch => {
  const { firstName, email, password } = newUser;
  const { data: { user } } = await csrfetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({
      firstName,
      email,
      password
    })
  });
  dispatch(SetSession(user, false, 'hot'));
};

export const LogOut = () => async dispatch => {
  await csrfetch('/api/session', {
    method: 'DELETE'
  });
  dispatch(SetSession(null, true, 'hot'));
};

export default function reducer (
  // eslint-disable-next-line default-param-last
  state = { user: null, loaded: false },
  { type, user, loaded, loadState }) {
  switch (type) {
    case USER:
      return { ...state, user, loaded, loadState };
    case LOAD:
      return { ...state, loaded: true, loadState: 'hot' };
    case UNLOAD:
      return { ...state, loaded: false, loadState: 'hot' };
    default:
      return state;
  }
}
