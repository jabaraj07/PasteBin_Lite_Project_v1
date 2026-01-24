import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateLink from './components/CreateLink';
import ViewPaste from './components/ViewPaste';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="app-container">
            <CreateLink/>
          </div>
        } />
        <Route path="/p/:id" element={<ViewPaste />} />
      </Routes>
    </Router>
  );
}

export default App;
