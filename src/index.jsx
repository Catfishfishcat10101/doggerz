import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/App.css';
import { Provider } from 'react-redux';
import store from './redux/store';
import { GameStateProvider } from './components/context/GameStateContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
// If you have a service worker, you can register it here