import './StartPage.css';
import { useNavigate } from 'react-router-dom';
import meadowBg from './assets/meadow-bg.png';
import sunClouds from './assets/sun-clouds.png';
import startButtonImg from './assets/start-button.png';

function StartPage() {
  const navigate = useNavigate();

  return (
    <div className="start-page">
      <img className="sun-clouds" src={sunClouds} alt="" aria-hidden="true" />
      <img className="meadow-bg" src={meadowBg} alt="" aria-hidden="true" />
      <div className="start-content">
        <h1 className="start-wordmark">
          <span>healthy</span>
          <span>time!</span>
        </h1>
        <button className="start-button" aria-label="Start" onClick={() => navigate('/app')}>
          <img src={startButtonImg} alt="" />
        </button>
      </div>
    </div>
  );
}

export default StartPage;
