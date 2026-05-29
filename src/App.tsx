import { createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';
import Statistics from './pages/Statistics';
import Budget from './pages/Budget';
import { useDarkMode } from './store/useDarkMode';

interface DarkCtx { dark: boolean; toggle: () => void; }
export const DarkContext = createContext<DarkCtx>({ dark: false, toggle: () => {} });
export const useDark = () => useContext(DarkContext);

function WithNav({ children }: { children: React.ReactNode }) {
  return <>{children}<BottomNav /></>;
}

export default function App() {
  const { dark, toggle } = useDarkMode();

  return (
    <DarkContext.Provider value={{ dark, toggle }}>
      <BrowserRouter>
        <Routes>
          <Route path="/"             element={<WithNav><Home /></WithNav>} />
          <Route path="/transactions" element={<WithNav><Transactions /></WithNav>} />
          <Route path="/add"          element={<AddTransaction />} />
          <Route path="/statistics"   element={<WithNav><Statistics /></WithNav>} />
          <Route path="/budget"       element={<WithNav><Budget /></WithNav>} />
        </Routes>
      </BrowserRouter>
    </DarkContext.Provider>
  );
}
