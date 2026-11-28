import './QuestPage.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import islandsBg from './assets/islands-bg.png';
import islandBottom from './assets/island-bottom.png';
import catImg from './assets/cat.png';

const DOT_COLORS = ['#c5f0a0', '#aee6f5', '#ffb3cf', '#d6f29c'];

const PLACEHOLDER_QUESTS = [
  { label: 'work', days: '10 d', pct: 55 },
  { label: 'work', days: '10 d', pct: 62 },
  { label: 'work', days: '10 d', pct: 88 },
  { label: 'work', days: '10 d', pct: 82 },
].map((quest, index) => ({ ...quest, color: DOT_COLORS[index % DOT_COLORS.length] }));

const readQuestsFromSchedule = () => {
  try {
    const raw = localStorage.getItem('timeflow-schedule');
    const schedule = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(schedule) || schedule.length === 0) return null;

    const total = schedule.length;
    const completedCount = schedule.filter(item => item?.done).length;
    const completedShare = total ? (completedCount / total) * 100 : 0;

    return schedule.slice(0, 4).map((item, index) => ({
      label: item?.title || 'work',
      days: '10 d',
      pct: item?.done ? 100 : completedShare,
      color: DOT_COLORS[index % DOT_COLORS.length],
    }));
  } catch {
    return null;
  }
};

function QuestPage() {
  const navigate = useNavigate();
  const [quests] = useState(() => readQuestsFromSchedule() || PLACEHOLDER_QUESTS);

  return (
    <div className="quest-page">
      <img className="quest-island quest-island-a" src={islandsBg} alt="" aria-hidden="true" />
      <img className="quest-island quest-island-b" src={islandsBg} alt="" aria-hidden="true" />
      <img className="quest-island quest-island-c" src={islandBottom} alt="" aria-hidden="true" />

      <div className="quest-wordmark-wrap">
        <h1 className="quest-wordmark">healthytime!</h1>
      </div>

      <div className="quest-card">
        <h2 className="quest-card-heading">Quest</h2>
        <div className="quest-rows">
          {quests.map((quest, index) => (
            <div className="quest-row" key={index}>
              <span className="quest-dot" style={{ backgroundColor: quest.color }} />
              <span className="quest-label">{quest.label}</span>
              <span className="quest-progress-track">
                <span className="quest-progress-fill" style={{ width: `${Math.min(100, Math.max(0, quest.pct))}%` }} />
              </span>
              <span className="quest-days">{quest.days}</span>
            </div>
          ))}
        </div>
      </div>

      <img className="quest-cat" src={catImg} alt="" aria-hidden="true" />

      <button className="quest-next-button" onClick={() => navigate('/app')}>
        NEXT
      </button>
    </div>
  );
}

export default QuestPage;
