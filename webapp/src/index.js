import React from 'react';

import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { ModalProvider } from './context/Modal';
import App from './App';
import configureStore from './store';
import csrfetch, { restoreCSRF } from './store/csrf';

import './index.css';

// eslint-disable-next-line no-extend-native
String.prototype.toTitleCase = function () {
  if (!this.match(/ /g)) return [this[0].toUpperCase(), this.slice(1)].join('');
  return this
    .split(' ')
    .map($ => [$[0].toUpperCase(), $.slice(1)].join(''))
    .join(' ');
};

Object.deepEq = function ($, _) {
  if (!$ || !_ || typeof $ !== 'object' || typeof _ !== 'object') return false;
  const [$$, __] = [$, _].map(Object.values);
  if ($$.length !== __.length) return false;
  for (const $_ in $$) {
    if (
      (typeof $$[+$_] !== typeof __[+$_]) ||
      (typeof $$[+$_] !== 'object' && $$[+$_] !== __[+$_]) ||
      (typeof $$[+$_] === 'object' && !Object.deepEq($$[+$_], __[+$_]))
    ) return false;
  }
  return true;
};

const store = configureStore();

if (process.env.NODE_ENV !== 'production') {
  restoreCSRF();
  window.csrfetch = csrfetch;
  window.store = store;
}

function Root () {
  return (
    <ModalProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ModalProvider>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById('root')
);
