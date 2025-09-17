import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
      </div>
    </Router>
  );
}

export default App;