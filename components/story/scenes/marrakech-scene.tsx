export function MarrakechScene() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 720" preserveAspectRatio="none">
        <defs>
          <linearGradient id="marrSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0c0609" />
            <stop offset="0.55" stopColor="#2b0f09" />
            <stop offset="1" stopColor="#3d1508" />
          </linearGradient>
          <linearGradient id="marrGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(240,189,125,0.5)" />
            <stop offset="1" stopColor="rgba(240,189,125,0)" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1440" height="720" fill="url(#marrSky)" />

        {/* stars */}
        <circle cx="200" cy="120" r="1.5" fill="#f2ead9" />
        <circle cx="420" cy="80" r="1" fill="#f2ead9" />
        <circle cx="980" cy="90" r="1.2" fill="#f2ead9" />
        <circle cx="1180" cy="150" r="1" fill="#f2ead9" />
        <circle cx="1330" cy="60" r="1.4" fill="#f2ead9" />

        {/* low warm moon */}
        <circle cx="1080" cy="330" r="64" fill="#e9c890" />
        <circle cx="1080" cy="330" r="64" fill="none" stroke="rgba(233,200,144,0.35)" strokeWidth="30" />

        {/* distant skyline */}
        <path d="M0,560 L0,470 L70,470 L70,430 L120,430 L120,470 L200,470 L200,520 L260,520 L260,470 L330,470 L330,560 Z" fill="#5a2416" />
        <path d="M330,560 L330,440 L380,440 L380,340 L420,340 L420,440 L470,440 L470,560 Z" fill="#5a2416" />
        <rect x="372" y="300" width="16" height="40" fill="#5a2416" />
        <circle cx="380" cy="292" r="8" fill="#5a2416" />
        <path d="M470,560 L470,470 L540,470 L540,560 Z" fill="#5a2416" />
        <path d="M1200,560 L1200,470 L1270,470 L1270,430 L1320,430 L1320,470 L1390,470 L1390,560 Z" fill="#5a2416" />

        {/* near skyline with arches */}
        <path d="M0,560 L0,520 L90,520 L90,470 L150,470 L150,520 L240,520 L240,560 Z" fill="#3a150d" />
        <path d="M240,560 L240,500 L300,500 L300,560 Z" fill="#3a150d" />
        <path d="M300,560 L300,470 L360,470 L360,400 L400,400 L400,470 L470,470 L470,560 Z" fill="#3a150d" />
        <path d="M360,470 L360,430 L400,430 L400,470 Z" fill="#0d0705" />
        <path d="M620,560 L620,510 L680,510 L680,560 Z" fill="#3a150d" />
        <path d="M760,560 L760,520 L840,520 L840,560 Z" fill="#3a150d" />
        <path d="M1040,560 L1040,490 L1100,490 L1100,520 L1160,520 L1160,560 Z" fill="#3a150d" />

        {/* palm trees */}
        <g fill="#2b150a">
          <path d="M520,560 Q530,470 560,420 L568,420 Q536,470 528,560 Z" />
          <path d="M560,420 Q500,400 470,380 Q520,404 560,416 Z" />
          <path d="M560,420 Q620,398 660,388 Q618,410 564,420 Z" />
          <path d="M560,420 Q540,390 530,370 Q550,398 562,414 Z" />
          <path d="M560,420 Q580,392 592,372 Q578,398 566,414 Z" />
        </g>
        <g fill="#2b150a">
          <path d="M880,560 Q890,480 915,440 L923,440 Q896,478 888,560 Z" />
          <path d="M915,440 Q860,424 830,410 Q872,426 911,434 Z" />
          <path d="M915,440 Q966,418 1000,404 Q962,426 919,438 Z" />
          <path d="M915,440 Q898,414 890,398 Q906,420 917,432 Z" />
          <path d="M915,440 Q932,416 942,400 Q930,420 921,432 Z" />
        </g>

        {/* ground */}
        <rect x="0" y="560" width="1440" height="160" fill="#0d0705" />
        <line x1="0" y1="560" x2="1440" y2="560" stroke="#2b1208" strokeWidth="3" />

        {/* road sheen */}
        <ellipse cx="720" cy="566" rx="220" ry="24" fill="#241008" />
      </svg>

      {/* moon glow */}
      <div
        className="absolute blur-3xl"
        style={{
          right: "20%",
          top: "26%",
          width: "22rem",
          height: "22rem",
          background: "radial-gradient(closest-side, rgb(240 189 125 / 0.14), transparent 70%)",
        }}
      />
    </div>
  );
}
