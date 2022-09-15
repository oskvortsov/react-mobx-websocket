import React from 'react';
import { CurrencyStoreProvider } from './stores/CurrencyStore';

import { CurrencyPanel } from './components/CurrencyPanel';

function App() {
  return (
      <CurrencyStoreProvider>
          <CurrencyPanel/>
      </CurrencyStoreProvider>
  );
}

export default App;
