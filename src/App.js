import './App.css';
import { useEffect, useMemo, useState } from 'react';

const Icon = ({ name, size = 18 }) => {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    timer: <><circle cx="12" cy="13" r="8"/><path d="M12 9v5l3 2M9 2h6"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20V7"/><path d="M2 20h20"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7z"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    play: <path d="m8 5 11 7-11 7z"/>,
    pause: <><path d="M9 5v14M15 5v14"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

const parseLines = value => value.split('\n').map(line => line.trim()).filter(Boolean);

const initialSchedule = [
  { time: '09:00', end: '09:25', title: 'วางแผนงานและจัดลำดับความสำคัญ', type: 'work', done: true },
  { time: '09:25', end: '10:10', title: 'Deep work: งานสำคัญ', type: 'focus', done: false },
  { time: '10:10', end: '10:25', title: 'พักสายตาและยืดตัว', type: 'break', done: false },
  { time: '10:25', end: '11:15', title: 'ต่อเนื่องงานที่มีโฟกัส', type: 'focus', done: false },
];

function Sidebar({ active, setActive }) {
  const nav = [
    ['grid', 'ภาพรวม'], ['calendar', 'ปฏิทิน'], ['timer', 'โฟกัส'], ['chart', 'สถิติ'],
  ];
  return (
    <aside className="sidebar">
      <div className="logo" title="Timeflow">T</div>
      <nav>
        {nav.map(([icon, label]) => (
          <button key={icon} className={active === icon ? 'nav-button active' : 'nav-button'} onClick={() => setActive(icon)} title={label}>
            <Icon name={icon} size={19}/>
          </button>
        ))}
      </nav>
      <button className="nav-button settings" title="ตั้งค่า" onClick={() => setActive('settings')}><Icon name="settings" size={19}/></button>
    </aside>
  );
}

function App() {
  const [active, setActive] = useState('grid');
  const [aiText, setAiText] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'สวัสดีครับ บอกสิ่งที่อยากทำวันนี้ งานที่ต้องหลีกเลี่ยง และช่วงเวลาที่มีได้เลย' },
  ]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [canDo, setCanDo] = useState('ออกแบบหน้า Dashboard\nตอบอีเมลลูกค้า\nเตรียมงานประชุม 14:00');
  const [cannotDo, setCannotDo] = useState('ประชุมฉุกเฉิน\nงานที่ต้องรอข้อมูลจากทีม');
  const [duration, setDuration] = useState(25);
  const [schedule, setSchedule] = useState(() => {
    try { return JSON.parse(localStorage.getItem('timeflow-schedule')) || initialSchedule; }
    catch { return initialSchedule; }
  });
  const [seconds, setSeconds] = useState(duration * 60);
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    localStorage.setItem('timeflow-schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSeconds(value => {
        if (value <= 1) { setRunning(false); setToast('จบช่วงโฟกัสแล้ว!'); return 0; }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [seconds]);

  const generatePlan = () => {
    const tasks = parseLines(canDo);
    const blocked = parseLines(cannotDo);
    if (!tasks.length) { setToast('กรุณาระบุงานที่สามารถทำได้'); return; }
    let minute = 9 * 60;
    const plan = [];
    tasks.forEach((task, index) => {
      const start = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
      const focusMinutes = index === 0 ? duration : Math.max(20, duration);
      minute += focusMinutes;
      const end = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
      plan.push({ time: start, end, title: task, type: index === 0 ? 'focus' : 'work', done: false });
      if (index < tasks.length - 1) {
        const breakStart = end;
        minute += 10;
        const breakEnd = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
        plan.push({ time: breakStart, end: breakEnd, title: 'พักสั้นและดูข้อมูลที่ต้องรอ', type: 'break', done: false });
      }
    });
    setSchedule(plan);
    setSeconds(duration * 60);
    setRunning(false);
    setToast(`จัดตารางแล้ว · หลบหลีก ${blocked.length} รายการ`);
  };

  const toggleDone = index => setSchedule(items => items.map((item, i) => i === index ? { ...item, done: !item.done } : item));

  const completed = schedule.filter(item => item.done).length;

  const askAI = (event) => {
    event?.preventDefault();
    const prompt = aiText.trim();
    if (!prompt) return;
    setChatMessages(messages => [...messages, { role: 'user', text: prompt }]);
    setAiText('');

    const lines = prompt
      .replace(/ห้าม|หลีกเลี่ยง|ทำไม่ได้/g, '\n')
      .split(/[,\n]+/)
      .map(line => line.trim())
      .filter(Boolean);
    const tasks = lines.filter(line => !line.includes('ประชุม'));
    if (tasks.length) {
      const plan = [];
      let minute = 9 * 60;
      tasks.slice(0, 5).forEach((task, index) => {
        const start = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
        minute += duration;
        const end = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
        plan.push({ time: start, end, title: task, type: 'focus', done: false });
        if (index < Math.min(tasks.length, 5) - 1) {
          const breakStart = end;
          minute += 10;
          const breakEnd = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
          plan.push({ time: breakStart, end: breakEnd, title: 'พักสายตาและยืดตัว', type: 'break', done: false });
        }
      });
      setSchedule(plan);
    }
    setChatMessages(messages => [
      ...messages,
      { role: 'assistant', text: `จัดตารางให้แล้วครับ แบ่งเป็น ${tasks.length} งานหลัก พร้อมพักระหว่างช่วงโฟกัส ข้ามช่วงประชุมและรายการที่ระบุว่าไม่ควรทำ` },
    ]);
  };

  return (
    <div className="app-shell">
      <Sidebar active={active} setActive={setActive}/>
      <main className="main">
        <header className="topbar">
          <div>
            <p className="date">วันพุธ, 25 พฤศจิกายน</p>
            <h1>{active === 'grid' ? 'สวัสดีตอนเช้า' : active === 'calendar' ? 'ปฏิทินและตารางเวลา' : active === 'timer' ? 'โหมดโฟกัส' : 'สถิติการทำงาน'}</h1>
          </div>
          <div className="header-actions">
            <button className="icon-button" title="ค้นหา" onClick={() => { setActive('grid'); setToast('ค้นหาแผนงานวันนี้'); }}><Icon name="search" size={17}/></button>
            <button className="icon-button" title="การแจ้งเตือน" onClick={() => setNotificationsOpen(value => !value)}><Icon name="bell" size={17}/></button>
            <button className="avatar" onClick={() => setProfileOpen(value => !value)}>JS</button>
          </div>
          {notificationsOpen && <div className="header-popover notifications"><strong>การแจ้งเตือน</strong><p>มี 3 งานที่ต้องเริ่มวันนี้</p></div>}
          {profileOpen && <div className="header-popover profile-menu"><strong>Jane Smith</strong><button onClick={() => setToast('เปิดหน้าการตั้งค่าบัญชี')}>ตั้งค่าบัญชี</button></div>}
        </header>

        {active !== 'grid' ? (
          <section className="standalone-page">
            {active === 'calendar' && <>
              <div className="page-heading"><div><span>ปฏิทิน</span><h2>ตารางวันนี้</h2></div><button onClick={() => setActive('grid')} className="generate-button">กลับภาพรวม</button></div>
              <div className="calendar-grid">{schedule.map(item => <button key={`${item.time}-${item.title}`} onClick={() => toggleDone(schedule.indexOf(item))} className={item.done ? 'calendar-slot done' : 'calendar-slot'}><b>{item.time}</b><span>{item.title}</span></button>)}</div>
            </>}
            {active === 'timer' && <>
              <div className="page-heading"><div><span>โฟกัส</span><h2>{formattedTime}</h2></div><button onClick={() => setActive('grid')} className="generate-button">กลับภาพรวม</button></div>
              <div className="timer-page"><div className="timer-ring large"><div><strong>{formattedTime}</strong><span>โฟกัส</span></div></div><button className="generate-button" onClick={() => setRunning(value => !value)}>{running ? 'หยุดชั่วคราว' : 'เริ่มโฟกัส'}</button></div>
            </>}
            {active === 'chart' && <>
              <div className="page-heading"><div><span>สถิติ</span><h2>ผลงานประจำวัน</h2></div><button onClick={() => setActive('grid')} className="generate-button">กลับภาพรวม</button></div>
              <div className="chart-page"><div><strong>{completed}</strong><span>งานเสร็จ</span></div><div><strong>{schedule.length}</strong><span>งานทั้งหมด</span></div><div><strong>{schedule.length ? Math.round(completed / schedule.length * 100) : 0}%</strong><span>ความสำเร็จ</span></div></div>
            </>}
            {active === 'settings' && <>
              <div className="page-heading"><div><span>การตั้งค่า</span><h2>ปรับแต่งการทำงาน</h2></div><button onClick={() => setActive('grid')} className="generate-button">กลับภาพรวม</button></div>
              <div className="settings-page"><label>ช่วงโฟกัสเริ่มต้น<select value={duration} onChange={event => setDuration(Number(event.target.value))}><option value="25">25 นาที</option><option value="45">45 นาที</option><option value="60">60 นาที</option></select></label><button className="generate-button" onClick={() => setToast('บันทึกการตั้งค่าแล้ว')}>บันทึกการตั้งค่า</button></div>
            </>}
          </section>
        ) : (
        <div className="workspace">
          <section className="planner">
            <div className="planner-heading">
              <div><span className="eyebrow"><Icon name="spark" size={14}/> AI Planner</span><h2>วันนี้คุณวางแผนทำอะไร?</h2></div>
              <span className="plan-status">พร้อมจัดตาราง</span>
            </div>

            <div className="prompt-grid">
              <label className="prompt-card can">
                <span className="prompt-title"><i><Icon name="check" size={14}/></i> วันนี้ทำได้ / ต้องทำ</span>
                <textarea value={canDo} onChange={event => setCanDo(event.target.value)} placeholder="พิมพ์งานทีละบรรทัด"/>
              </label>
              <label className="prompt-card cannot">
                <span className="prompt-title"><i>×</i> ทำไม่ได้ / หลีกเลี่ยง</span>
                <textarea value={cannotDo} onChange={event => setCannotDo(event.target.value)} placeholder="เช่น ประชุมฉุกเฉิน, งานเร่งด่วน"/>
              </label>
            </div>

            <div className="planner-footer">
              <div className="duration">
                <span>ช่วงโฟกัส</span>
                {[25, 45, 60].map(value => <button key={value} className={duration === value ? 'selected' : ''} onClick={() => { setDuration(value); setSeconds(value * 60); }}>{value} นาที</button>)}
              </div>
              <button className="generate-button" onClick={generatePlan}><Icon name="spark" size={16}/> จัดตารางให้ฉัน</button>
            </div>
            <form className="ai-chat-bar" onSubmit={askAI}>
              <span className="ai-chat-icon"><Icon name="spark" size={16}/></span>
              <input value={aiText} onChange={event => setAiText(event.target.value)} placeholder="พิมพ์งานทั้งหมดที่อยากทำ เช่น “ทำรายงาน 1 ชั่วโมง ห้ามประชุมบ่าย”"/>
              <button type="submit" aria-label="ให้ AI จัดเวลา"><Icon name="spark" size={16}/><span>จัดเวลา</span></button>
            </form>
            {chatMessages.length > 1 && <div className="ai-chat-preview"><strong>AI:</strong> {chatMessages[chatMessages.length - 1].text}</div>}
          </section>

          <aside className="focus-card">
            <div className="focus-heading"><span>โหมดโฟกัส</span><button title="More">•••</button></div>
            <div className="timer-ring" style={{ '--progress': `${(seconds / (duration * 60)) * 360}deg` }}>
              <div><strong>{formattedTime}</strong><span>โฟกัส</span></div>
            </div>
            <p>{schedule.find(item => item.type === 'focus' && !item.done)?.title || 'พร้อมเริ่มงานสำคัญ'}</p>
            <button className="timer-button" onClick={() => setRunning(value => !value)}>
              <Icon name={running ? 'pause' : 'play'} size={15}/>{running ? 'หยุดชั่วคราว' : 'เริ่มโฟกัส'}
            </button>
          </aside>

          <section className="timeline-card">
            <div className="timeline-heading">
              <div><h2>ตารางวันนี้</h2><p>{completed}/{schedule.length} รายการเสร็จแล้ว</p></div>
              <button onClick={() => setSchedule(items => [...items, { time: '12:00', end: '12:30', title: 'งานใหม่', type: 'work', done: false }])}><Icon name="plus" size={15}/> เพิ่มงาน</button>
            </div>
            <div className="timeline">
              {schedule.map((item, index) => (
                <div className={`timeline-item ${item.done ? 'done' : ''}`} key={`${item.time}-${item.title}`}>
                  <div className="timeline-time"><strong>{item.time}</strong><span>{item.end}</span></div>
                  <button className={`task-dot ${item.type}`} onClick={() => toggleDone(index)} aria-label={item.done ? 'ทำรายการแล้ว' : 'ทำรายการ'}>{item.done && <Icon name="check" size={12}/>}</button>
                  <div className="task-content"><strong>{item.title}</strong><span>{item.type === 'break' ? 'พักผ่อน' : item.type === 'focus' ? 'โฟกัสสูงสุด' : 'งานทั่วไป'}</span></div>
                </div>
              ))}
            </div>
          </section>

          <aside className="summary-card">
            <h3>ภาพรวมวันนี้</h3>
            <div className="progress-ring"><div><strong>{schedule.length ? Math.round(completed / schedule.length * 100) : 0}%</strong><span>ความสำเร็จ</span></div></div>
            <div className="summary-stats"><div><strong>{schedule.filter(item => item.type === 'focus').length}</strong><span>ช่วงโฟกัส</span></div><div><strong>{schedule.filter(item => item.done).length}</strong><span>เสร็จแล้ว</span></div></div>
          </aside>
        </div>
        )}
      </main>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

export default App;
