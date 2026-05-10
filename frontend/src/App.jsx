import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Toast from './components/Toast';
import Home from './pages/Home';
import Tutorials from './pages/Tutorials';
import TutorialDetail from './pages/TutorialDetail';
import DaxGenerator from './pages/DaxGenerator';
import PowerQueryGenerator from './pages/PowerQueryGenerator';
import InteractiveGuide from './pages/InteractiveGuide';
import ErrorsDatabase from './pages/ErrorsDatabase';
import History from './pages/History';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/"        element={<Home />} />
            <Route path="/tutorials"       element={<Tutorials />} />
            <Route path="/tutorials/:id"   element={<TutorialDetail />} />
            <Route path="/dax"             element={<DaxGenerator />} />
            <Route path="/mquery"          element={<PowerQueryGenerator />} />
            <Route path="/guide"           element={<InteractiveGuide />} />
            <Route path="/errors"          element={<ErrorsDatabase />} />
            <Route path="/history"         element={<History />} />
          </Routes>
        </Layout>
        <Toast />
      </Router>
    </AppProvider>
  );
}
