'use client'

const STARS = [
  { top: '3%',  left: '8%',  size: 2.5, dur: 3.2, delay: 0   },
  { top: '6%',  left: '22%', size: 2,   dur: 4.1, delay: 0.5 },
  { top: '2%',  left: '38%', size: 3,   dur: 2.8, delay: 1   },
  { top: '8%',  left: '55%', size: 2,   dur: 3.6, delay: 0.3 },
  { top: '4%',  left: '70%', size: 2.5, dur: 5,   delay: 0.8 },
  { top: '10%', left: '82%', size: 2,   dur: 3.9, delay: 1.4 },
  { top: '2%',  left: '91%', size: 3,   dur: 2.5, delay: 0.2 },
  { top: '13%', left: '14%', size: 2,   dur: 4.4, delay: 0.7 },
  { top: '5%',  left: '46%', size: 2,   dur: 3.1, delay: 1.9 },
  { top: '11%', left: '62%', size: 2.5, dur: 4.7, delay: 1.1 },
  { top: '7%',  left: '76%', size: 2,   dur: 2.9, delay: 2.2 },
  { top: '15%', left: '30%', size: 2,   dur: 5.2, delay: 0.4 },
  { top: '1%',  left: '60%', size: 3,   dur: 3.5, delay: 0.6 },
  { top: '9%',  left: '5%',  size: 2,   dur: 4.8, delay: 1.7 },
  { top: '4%',  left: '85%', size: 2.5, dur: 3.3, delay: 0.9 },
]

const EMBERS = [
  { left: '50%', bottom: '30px', ex: '-10px', ey: '-40px', dur: 1.8, delay: 0,   color: '#FCD34D' },
  { left: '50%', bottom: '26px', ex: '8px',   ey: '-34px', dur: 2.2, delay: 0.4, color: '#F97316' },
  { left: '50%', bottom: '32px', ex: '-5px',  ey: '-48px', dur: 2.6, delay: 0.9, color: '#FCD34D' },
  { left: '50%', bottom: '24px', ex: '12px',  ey: '-38px', dur: 1.6, delay: 1.3, color: '#EF4444' },
  { left: '50%', bottom: '28px', ex: '-14px', ey: '-30px', dur: 2,   delay: 0.6, color: '#FCD34D' },
]

export default function CampfireScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Sky */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 0%,#050304 0%,#0A0704 40%,#0D0B06 70%,#110D08 100%)' }}
      />

      {/* Stars */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: s.top, left: s.left,
            width: s.size, height: s.size,
            boxShadow: `0 0 ${s.size * 2}px white`,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Moon */}
      <div
        className="absolute animate-moon rounded-full"
        style={{
          top: '7%', right: '17%',
          width: 36, height: 36,
          background: '#FEFCE8',
        }}
      >
        <div
          className="absolute rounded-full"
          style={{ top: 3, left: 8, width: 28, height: 28, background: '#0B0908' }}
        />
      </div>

      {/* Forest — all layers in one SVG */}
      <svg
        className="absolute bottom-0 left-0 w-full h-full"
        viewBox="0 0 900 660"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="firelight" cx="50%" cy="72%" r="28%">
            <stop offset="0%"   stopColor="#B45309" stopOpacity="0.45" />
            <stop offset="40%"  stopColor="#92400E" stopOpacity="0.2"  />
            <stop offset="100%" stopColor="#000000" stopOpacity="0"    />
          </radialGradient>
        </defs>

        {/* Layer 1 — farthest */}
        <g style={{ animation: 'treesway 9s ease-in-out infinite', transformOrigin: '450px 300px' }}>
          <path d="M0,420 L0,380 L12,355 L24,380 L35,340 L46,380 L58,325 L70,380 L82,345 L94,380 L106,332 L118,380 L130,350 L142,380 L154,328 L166,380 L178,342 L190,380 L202,318 L214,380 L226,338 L238,380 L250,325 L262,380 L274,345 L286,380 L298,315 L310,380 L322,340 L334,380 L346,330 L358,380 L370,348 L382,380 L394,320 L406,380 L418,342 L430,380 L442,335 L454,380 L466,350 L478,380 L490,322 L502,380 L514,338 L526,380 L538,328 L550,380 L562,345 L574,380 L586,318 L598,380 L610,340 L622,380 L634,330 L646,380 L658,348 L670,380 L682,322 L694,380 L706,342 L718,380 L730,335 L742,380 L754,350 L766,380 L778,325 L790,380 L802,340 L814,380 L826,330 L838,380 L850,345 L862,380 L874,322 L886,380 L898,338 L900,380 L900,420 Z" fill="#040302" />
        </g>

        {/* Layer 2 */}
        <g style={{ animation: 'treesway 7s ease-in-out infinite 0.5s', transformOrigin: '450px 350px' }}>
          <path d="M0,450 L0,400 L15,365 L28,400 L42,330 L56,400 L70,348 L84,400 L100,318 L116,400 L130,355 L144,400 L158,335 L172,400 L186,360 L200,400 L215,322 L230,400 L244,348 L258,400 L272,325 L286,400 L300,358 L314,400 L328,315 L342,400 L356,342 L370,400 L384,332 L398,400 L412,355 L426,400 L440,320 L454,400 L468,345 L482,400 L496,330 L510,400 L524,360 L538,400 L552,318 L566,400 L580,348 L594,400 L608,328 L622,400 L636,355 L650,400 L664,322 L678,400 L692,342 L706,400 L720,335 L734,400 L748,358 L762,400 L776,315 L790,400 L804,345 L818,400 L832,332 L846,400 L860,355 L874,400 L888,325 L900,400 L900,450 Z" fill="#050403" />
        </g>

        {/* Layer 3 — mid */}
        <g style={{ animation: 'treesway 6s ease-in-out infinite 1s', transformOrigin: '450px 400px' }}>
          <path d="M0,480 L0,420 L18,372 L34,420 L50,335 L66,420 L84,358 L100,420 L118,318 L136,420 L152,362 L168,420 L184,338 L200,420 L218,372 L234,420 L250,325 L268,420 L284,355 L300,420 L316,340 L334,420 L350,368 L366,420 L382,322 L398,420 L414,352 L430,420 L446,335 L462,420 L478,365 L494,420 L510,320 L526,420 L542,348 L558,420 L574,332 L590,420 L606,362 L622,420 L638,318 L654,420 L670,355 L686,420 L702,338 L718,420 L734,368 L750,420 L766,325 L782,420 L798,355 L814,420 L830,340 L846,420 L862,368 L878,420 L894,328 L900,420 L900,480 Z" fill="#060504" />
        </g>

        {/* Layer 4 — near-mid, flanking clearing */}
        <g style={{ animation: 'treesway 5s ease-in-out infinite 0.3s', transformOrigin: '450px 430px' }}>
          <path d="M0,510 L0,445 L20,398 L38,445 L55,365 L72,445 L90,385 L106,445 L124,352 L142,445 L158,378 L174,445 L190,360 L206,445 L220,385 L234,445 L248,372 L262,445 L276,395 L290,445 L304,368 L318,445 L332,388 L346,445 L360,445 Z" fill="#080605" />
          <path d="M540,445 L554,445 L568,388 L582,445 L596,368 L610,445 L624,395 L638,445 L652,372 L666,445 L680,385 L694,445 L708,360 L722,445 L736,378 L750,445 L766,352 L782,445 L798,385 L814,445 L830,365 L848,445 L864,398 L882,445 L900,445 L900,510 Z" fill="#080605" />
        </g>

        {/* Layer 5 — foreground trees framing scene */}
        <g style={{ animation: 'treesway2 4s ease-in-out infinite 0.8s', transformOrigin: '450px 500px' }}>
          <path d="M0,530 L0,480 L14,455 L22,480 L30,440 L38,480 L48,425 L58,480 L68,442 L76,480 L84,448 L90,480 L94,530 Z" fill="#0A0806" />
          <path d="M60,530 L60,475 L76,440 L88,475 L100,415 L112,475 L126,435 L138,475 L150,420 L162,475 L172,440 L182,475 L190,530 Z" fill="#0B0907" />
          <path d="M155,530 L155,470 L172,428 L186,470 L200,408 L214,470 L228,425 L240,470 L252,415 L264,470 L274,430 L284,470 L290,530 Z" fill="#090705" />
          <path d="M610,530 L610,470 L622,430 L634,470 L648,415 L660,470 L674,425 L686,470 L698,408 L712,470 L728,428 L742,470 L745,530 Z" fill="#090705" />
          <path d="M710,530 L710,475 L724,440 L736,475 L750,420 L762,475 L774,435 L786,475 L800,415 L812,475 L824,440 L836,475 L840,530 Z" fill="#0B0907" />
          <path d="M806,530 L806,480 L818,448 L826,480 L836,442 L844,480 L854,425 L864,480 L874,440 L882,480 L892,455 L900,480 L900,530 Z" fill="#0A0806" />
        </g>

        {/* Ground */}
        <rect x="0" y="500" width="900" height="160" fill="#080604" />
        <rect x="0" y="500" width="900" height="30"  fill="#0A0805" />

        {/* Fire ambient light */}
        <rect x="0" y="0" width="900" height="660" fill="url(#firelight)" />

        {/* Clearing */}
        <ellipse cx="450" cy="520" rx="120" ry="22" fill="#0D0A06" opacity="0.8" />
        <ellipse cx="450" cy="516" rx="80"  ry="14" fill="#110D08" opacity="0.6" />
      </svg>

      {/* Ground overlay */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '20%', background: 'linear-gradient(to top,#0A0804 0%,#0E0C08 60%,#12100A 100%)' }}
      />

      {/* Ground glow */}
      <div
        className="absolute animate-glow"
        style={{ bottom: '14%', left: '30%', right: '30%', height: '14%', background: 'radial-gradient(ellipse 100% 80% at 50% 100%,rgba(180,83,9,.35) 0%,rgba(120,53,15,.15) 55%,transparent 80%)' }}
      />

      {/* ── CAMPFIRE ── */}
      <div className="absolute" style={{ bottom: '17%', left: '50%', transform: 'translateX(-50%)' }}>

        {/* Stones */}
        <div className="absolute" style={{ bottom: -3, left: '50%', transform: 'translateX(-50%)' }}>
          {[
            { w:8, h:5, l:-16, b:0 }, { w:7, h:4, l:-9, b:-1 },
            { w:8, h:5, l:0,   b:-2 },{ w:7, h:4, l:8,  b:-1 },
            { w:6, h:4, l:14,  b:1  },
          ].map((s, i) => (
            <div key={i} className="absolute rounded-full" style={{ width: s.w, height: s.h, left: s.l, bottom: s.b, background: '#1C1410' }} />
          ))}
        </div>

        {/* Logs */}
        <div className="absolute" style={{ bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>
          <div className="absolute rounded" style={{ width:34, height:7, background:'#3B1F0A', transform:'rotate(-28deg)', left:-8, bottom:2 }} />
          <div className="absolute rounded" style={{ width:34, height:7, background:'#3B1F0A', transform:'rotate(28deg)',  left:4,  bottom:2 }} />
          <div className="absolute rounded" style={{ width:24, height:6, background:'#2D1608',                             left:-4, bottom:5 }} />
        </div>

        {/* Flames */}
        <div className="absolute" style={{ bottom: 8, left: '50%', transform: 'translateX(-50%)', transformOrigin: 'bottom center' }}>
          {/* Outer */}
          <div className="animate-flicker" style={{ width:38, height:54, background:'radial-gradient(ellipse 50% 80% at 50% 100%,#92400E 0%,#B45309 28%,#D97706 52%,#F59E0B 72%,transparent 100%)', borderRadius:'50% 50% 44% 44%' }} />
          {/* Mid */}
          <div className="absolute animate-flicker2" style={{ bottom:0, left:'50%', transform:'translateX(-50%)', width:26, height:40, background:'radial-gradient(ellipse 50% 80% at 50% 100%,#DC2626 0%,#EA580C 28%,#F97316 52%,#FB923C 72%,transparent 100%)', borderRadius:'50% 50% 44% 44%' }} />
          {/* Inner */}
          <div className="absolute animate-flicker3" style={{ bottom:0, left:'50%', transform:'translateX(-50%)', width:15, height:28, background:'radial-gradient(ellipse 50% 80% at 50% 100%,#FEF08A 0%,#FDE047 38%,#FBBF24 68%,transparent 100%)', borderRadius:'50% 50% 44% 44%' }} />
          {/* Core */}
          <div className="absolute" style={{ bottom:2, left:'50%', transform:'translateX(-50%)', width:7, height:11, background:'white', borderRadius:'50% 50% 44% 44%', opacity:.75 }} />
        </div>

        {/* Fire ground glow */}
        <div className="absolute animate-glow" style={{ bottom:-6, left:'50%', transform:'translateX(-50%)', width:100, height:22, background:'radial-gradient(ellipse 80% 60% at 50% 100%,rgba(251,146,60,.45) 0%,transparent 80%)' }} />

        {/* Smoke */}
        {[
          { w:16, b:58, ml:-8,  dur:'3s',   del:'0s'   },
          { w:12, b:50, ml:-2,  dur:'3.8s', del:'0.8s' },
          { w:9,  b:44, ml:-10, dur:'4.2s', del:'1.5s' },
        ].map((s, i) => (
          <div key={i} className="absolute rounded-full animate-smoke" style={{ width:s.w, height:s.w, left:'50%', bottom:s.b, marginLeft:s.ml, background:'rgba(180,170,160,.13)', animationDuration:s.dur, animationDelay:s.del }} />
        ))}

        {/* Embers */}
        {EMBERS.map((e, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-ember"
            style={{ width:2, height:2, left:e.left, bottom:e.bottom, background:e.color, animationDuration:`${e.dur}s`, animationDelay:`${e.delay}s` }}
          />
        ))}
      </div>

      {/* Silhouettes */}
      <svg
        className="absolute"
        style={{ bottom: '13.5%', left: '50%', transform: 'translateX(-50%)', width: 150, height: 36 }}
        viewBox="0 0 150 36"
      >
        <ellipse cx="32"  cy="34" rx="14" ry="5" fill="#050402" />
        <circle  cx="32"  cy="24" r="7"          fill="#060503" />
        <rect    x="22"   y="28"  width="20" height="8" rx="3"  fill="#060503" />
        <ellipse cx="118" cy="34" rx="14" ry="5" fill="#050402" />
        <circle  cx="118" cy="24" r="7"          fill="#060503" />
        <rect    x="108"  y="28"  width="20" height="8" rx="3"  fill="#060503" />
      </svg>
    </div>
  )
}
