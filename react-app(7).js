import React, { useState, useEffect, useRef } from 'react';

const CELL_SIZE = 20;
const RULER_BG = '#e8e8e8';
const INK_COLOR = '#000000';
const GRID_LINE = '#dcdcdc';
const WHITE = '#ffffff';
const FONT_MONO = "'Courier New', Courier, monospace";
const FONT_MAIN = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function getColumnLabel(index) {
  let label = '';
  let i = index + 1;
  while (i > 0) {
    let rem = (i - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    i = Math.floor((i - 1) / 26);
  }
  return label;
}

const styles = {
  gridLayer: {
    position: 'fixed',
    top: 20,
    left: 30,
    width: 'calc(100% - 30px)',
    height: 'calc(100% - 20px)',
    backgroundImage: `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
    backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
    zIndex: 0,
    pointerEvents: 'none',
  },
  rulerX: {
    position: 'fixed',
    top: 0,
    left: 30,
    right: 0,
    height: 20,
    background: RULER_BG,
    borderBottom: `1px solid ${INK_COLOR}`,
    display: 'flex',
    overflow: 'hidden',
    zIndex: 100,
    fontFamily: FONT_MONO,
    fontSize: 10,
    lineHeight: '20px',
    color: '#666',
    userSelect: 'none',
  },
  rulerXSpan: {
    display: 'inline-block',
    width: CELL_SIZE,
    textAlign: 'center',
    borderRight: '1px solid #ccc',
    flexShrink: 0,
  },
  rulerY: {
    position: 'fixed',
    top: 20,
    left: 0,
    bottom: 0,
    width: 30,
    background: RULER_BG,
    borderRight: `1px solid ${INK_COLOR}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 100,
    fontFamily: FONT_MONO,
    fontSize: 10,
    color: '#666',
    userSelect: 'none',
  },
  rulerYSpan: {
    display: 'block',
    height: CELL_SIZE,
    lineHeight: `${CELL_SIZE}px`,
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
    flexShrink: 0,
  },
  cornerPiece: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 30,
    height: 20,
    background: INK_COLOR,
    zIndex: 101,
  },
  activeCellIndicator: {
    position: 'fixed',
    width: CELL_SIZE,
    height: CELL_SIZE,
    border: `1px solid ${INK_COLOR}`,
    background: 'rgba(0,0,0,0.1)',
    pointerEvents: 'none',
    zIndex: 50,
  },
  coordDisplay: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    background: INK_COLOR,
    color: WHITE,
    fontFamily: FONT_MONO,
    fontSize: 12,
    padding: '5px 10px',
    zIndex: 200,
  },
  nav: {
    position: 'fixed',
    top: 40,
    right: 40,
    background: WHITE,
    border: `1px solid ${INK_COLOR}`,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 999,
  },
  navItem: {
    display: 'block',
    height: CELL_SIZE,
    lineHeight: `${CELL_SIZE}px`,
    padding: '0 10px',
    borderBottom: `1px solid ${GRID_LINE}`,
    fontSize: 12,
    textTransform: 'uppercase',
    textDecoration: 'none',
    color: INK_COLOR,
    transition: 'all 0.1s',
    cursor: 'crosshair',
  },
  navItemHover: {
    background: INK_COLOR,
    color: WHITE,
  },
  navItemLast: {
    borderBottom: 'none',
  },
  mainStage: {
    position: 'relative',
    marginTop: 20,
    marginLeft: 30,
    width: 'calc(100% - 30px)',
    minHeight: '100vh',
    zIndex: 10,
    padding: CELL_SIZE * 2,
    fontFamily: FONT_MAIN,
  },
  contentCard: {
    background: WHITE,
    border: `1px solid ${GRID_LINE}`,
    padding: CELL_SIZE,
    position: 'relative',
    marginBottom: CELL_SIZE * 3,
    boxShadow: '10px 10px 0px rgba(0,0,0,0.05)',
    backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)`,
    backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
  },
  h1: {
    fontSize: 14,
    lineHeight: `${CELL_SIZE}px`,
    margin: `0 0 ${CELL_SIZE}px 0`,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: 700,
  },
  h2: {
    fontSize: 32,
    lineHeight: `${CELL_SIZE * 2}px`,
    margin: `0 0 ${CELL_SIZE}px 0`,
    fontWeight: 400,
    letterSpacing: -0.5,
    maxWidth: 800,
  },
  p: {
    fontSize: 14,
    lineHeight: `${CELL_SIZE}px`,
    margin: `0 0 ${CELL_SIZE}px 0`,
    maxWidth: '45ch',
  },
  metaData: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    color: '#666',
    marginBottom: CELL_SIZE,
    display: 'block',
  },
  pixelLogo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 10px)',
    gridTemplateRows: 'repeat(5, 10px)',
    gap: 0,
    marginBottom: CELL_SIZE,
  },
  px: {
    background: INK_COLOR,
    width: 10,
    height: 10,
  },
  pxO: {
    background: 'transparent',
    width: 10,
    height: 10,
  },
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    borderTop: `1px solid ${INK_COLOR}`,
    marginTop: CELL_SIZE,
  },
  projectRow: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: '3fr 1fr 2fr',
    borderBottom: `1px solid ${GRID_LINE}`,
    transition: 'background 0.1s',
    cursor: 'crosshair',
  },
  pCell: {
    padding: '10px',
    fontSize: 13,
    borderRight: `1px solid ${GRID_LINE}`,
    display: 'flex',
    alignItems: 'center',
    fontFamily: FONT_MAIN,
  },
  pCellLast: {
    borderRight: 'none',
  },
  pHeader: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: 11,
    background: '#eee',
  },
  uMono: {
    fontFamily: FONT_MONO,
  },
};

const PixelLogo = () => {
  const pattern = [
    true, true, true, true, true,
    true, false, false, false, false,
    true, false, false, false, false,
    true, false, false, false, false,
    true, true, true, true, true,
  ];
  return (
    <div style={styles.pixelLogo}>
      {pattern.map((filled, i) => (
        <div key={i} style={filled ? styles.px : styles.pxO} />
      ))}
    </div>
  );
};

const RulerX = ({ cols }) => (
  <div style={styles.rulerX}>
    {Array.from({ length: cols }, (_, i) => (
      <span key={i} style={styles.rulerXSpan}>{getColumnLabel(i)}</span>
    ))}
  </div>
);

const RulerY = ({ rows }) => (
  <div style={styles.rulerY}>
    {Array.from({ length: rows }, (_, i) => (
      <span key={i} style={styles.rulerYSpan}>{i + 1}</span>
    ))}
  </div>
);

const NavItem = ({ children, isLast, onClick, active }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      style={{
        ...styles.navItem,
        ...(isLast ? styles.navItemLast : {}),
        ...(hovered || active ? styles.navItemHover : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.preventDefault(); onClick && onClick(); }}
    >
      {children}
    </a>
  );
};

const ProjectRow = ({ name, year, sector, isHeader }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...styles.projectRow,
        ...(hovered && !isHeader ? { background: '#f7f7f7' } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ ...styles.pCell, ...(isHeader ? styles.pHeader : {}) }}>{name}</div>
      <div style={{ ...styles.pCell, ...(isHeader ? styles.pHeader : {}), ...(!isHeader ? styles.uMono : {}) }}>{year}</div>
      <div style={{ ...styles.pCell, ...styles.pCellLast, ...(isHeader ? styles.pHeader : {}) }}>{sector}</div>
    </div>
  );
};

const PixelBackground = ({ pixels }) => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 5,
    overflow: 'hidden',
  }}>
    {pixels.map((p, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          background: INK_COLOR,
          width: CELL_SIZE,
          height: CELL_SIZE,
          left: p.x,
          top: p.y,
        }}
      />
    ))}
  </div>
);

const App = () => {
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [cursor, setCursor] = useState({ visible: false, x: 0, y: 0, label: 'X: A | Y: 1' });
  const [pixels, setPixels] = useState([]);
  const [activeNav, setActiveNav] = useState('index');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      * { cursor: crosshair !important; box-sizing: border-box; }
      body { margin: 0; padding: 0; background-color: #f0f0f0; overflow-x: hidden; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setDims({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const generated = [];
    const strokes = 8;
    for (let s = 0; s < strokes; s++) {
      let startX = Math.floor(Math.random() * (window.innerWidth / CELL_SIZE));
      let startY = Math.floor(Math.random() * (window.innerHeight / CELL_SIZE));
      let length = 20 + Math.floor(Math.random() * 50);
      let dx = Math.random() > 0.5 ? 1 : -1;
      let dy = Math.random() > 0.5 ? 1 : 0;
      for (let i = 0; i < length; i++) {
        let thickness = Math.floor(Math.random() * 3) + 1;
        for (let t = 0; t < thickness; t++) {
          if (Math.random() > 0.2) {
            generated.push({
              x: (startX + i * dx) * CELL_SIZE,
              y: (startY + i * dy + t) * CELL_SIZE,
            });
          }
        }
      }
    }
    setPixels(generated);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = Math.floor((e.clientX - 30) / CELL_SIZE);
      const y = Math.floor((e.clientY - 20) / CELL_SIZE);
      const visualX = x * CELL_SIZE + 30;
      const visualY = y * CELL_SIZE + 20;
      if (e.clientX > 30 && e.clientY > 20) {
        setCursor({
          visible: true,
          x: visualX,
          y: visualY,
          label: `X: ${getColumnLabel(x)} | Y: ${y + 1}`,
        });
      } else {
        setCursor(prev => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const cols = Math.ceil(dims.width / CELL_SIZE);
  const rows = Math.ceil(dims.height / CELL_SIZE);

  const projects = [
    { name: 'System Archaeology', year: '2–3 wks', sector: 'Insertion Map' },
    { name: 'AI Integration Layer', year: '6–10 wks', sector: 'Working Adapters' },
    { name: 'Internal Deployment', year: '2–4 wks', sector: 'Trained Team' },
    { name: 'VerifyUS', year: '2024', sector: 'Recruitment' },
    { name: 'GhostClaw', year: '2024', sector: 'Infrastructure' },
  ];

  return (
    <div style={{ margin: 0, padding: 0, backgroundColor: '#f0f0f0', fontFamily: FONT_MAIN, color: INK_COLOR, overflowX: 'hidden', width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      <div style={styles.cornerPiece} />
      <RulerX cols={cols} />
      <RulerY rows={rows} />
      <div style={styles.gridLayer} />

      {cursor.visible && (
        <div style={{
          ...styles.activeCellIndicator,
          transform: `translate(${cursor.x}px, ${cursor.y}px)`,
        }} />
      )}

      <div style={styles.coordDisplay}>{cursor.label}</div>

      <nav style={styles.nav}>
        <NavItem active={activeNav === 'index'} onClick={() => setActiveNav('index')}>Overview [A]</NavItem>
        <NavItem active={activeNav === 'projects'} onClick={() => setActiveNav('projects')}>Services [B]</NavItem>
        <NavItem active={activeNav === 'agency'} onClick={() => setActiveNav('agency')}>Work [C]</NavItem>
        <NavItem isLast active={activeNav === 'contact'} onClick={() => setActiveNav('contact')}>Contact [D]</NavItem>
      </nav>

      <PixelBackground pixels={pixels} />

      <div style={styles.mainStage}>

        <div style={{
          ...styles.contentCard,
          maxWidth: 600,
          marginLeft: CELL_SIZE * 4,
          marginTop: CELL_SIZE * 4,
        }}>
          <PixelLogo />
          <span style={styles.metaData}>AI.IMPL // V.1.0</span>
          <h1 style={styles.h1}>Velocity</h1>
          <h2 style={styles.h2}>We make legacy enterprise infrastructure Claude-ready. No rip-and-replace.</h2>
          <br />
          <div style={{ display: 'flex', gap: 20 }}>
            <div>
              <span style={styles.metaData}>BASE</span>
              <p style={styles.p}>London, UK</p>
            </div>
            <div>
              <span style={styles.metaData}>STATUS</span>
              <p style={styles.p}>Taking<br />Engagements</p>
            </div>
          </div>
        </div>

        <div style={{
          ...styles.contentCard,
          marginLeft: CELL_SIZE * 12,
          width: `calc(100% - ${CELL_SIZE * 16}px)`,
        }}>
          <h1 style={styles.h1}>Engagement Model</h1>
          <div style={styles.projectGrid}>
            <ProjectRow name="Phase" year="Duration" sector="Output" isHeader />
            {projects.map((proj, i) => (
              <ProjectRow key={i} name={proj.name} year={proj.year} sector={proj.sector} />
            ))}
          </div>
        </div>

        <div style={{
          ...styles.contentCard,
          maxWidth: 400,
          marginLeft: CELL_SIZE * 2,
        }}>
          <h1 style={styles.h1}>Approach</h1>
          <p style={styles.p}>We don't modernise your stack. We wire AI into what you already have. Most legacy systems from 2010–2018 have enough surface area to support Claude integration today. We find those points, build the adapters, and hand off systems your team can run.</p>
          <br />
          <p style={{ ...styles.p, fontFamily: FONT_MONO }}>-&gt; VIEW ENGAGEMENT MODEL</p>
        </div>

      </div>
    </div>
  );
};

export default App;