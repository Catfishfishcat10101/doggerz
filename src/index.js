import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/App.css';
import { Provider } from 'react-redux';
import store from './redux/store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebase';
import { useDispatch } from 'react-redux';
import { setUser } from './redux/userSlice';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
// If you have a service worker, you can register it here