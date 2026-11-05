import fs from 'node:fs'
import path from 'node:path'

const matDir = 'public/images/materials'
const roomDir = 'public/images/rooms'
fs.mkdirSync(matDir, { recursive: true })
fs.mkdirSync(roomDir, { recursive: true })

const ASSETS = {
  // ── 1. FLOORS ──
  'ceramic-45x45.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="c_tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F2EBE1"/>
      <stop offset="100%" stop-color="#E2D6C6"/>
    </linearGradient>
    <pattern id="vein" width="200" height="200" patternUnits="userSpaceOnUse">
      <path d="M10,20 Q60,80 120,40 T190,160" stroke="#C4B49F" stroke-width="1.5" fill="none" opacity="0.35"/>
      <path d="M80,180 Q130,120 180,160" stroke="#B8A48D" stroke-width="1" fill="none" opacity="0.25"/>
    </pattern>
  </defs>
  <rect width="600" height="600" fill="#CEC1B0"/>
  <!-- 4 tiles with 6px grout -->
  <g fill="url(#c_tile)">
    <rect x="6" y="6" width="288" height="288" rx="3"/>
    <rect x="306" y="6" width="288" height="288" rx="3"/>
    <rect x="6" y="306" width="288" height="288" rx="3"/>
    <rect x="306" y="306" width="288" height="288" rx="3"/>
  </g>
  <rect width="600" height="600" fill="url(#vein)"/>
  <!-- subtle ceramic glaze reflection -->
  <path d="M6,6 L200,6 L6,200 Z" fill="#FFF" opacity="0.12"/>
  <path d="M306,6 L500,6 L306,200 Z" fill="#FFF" opacity="0.12"/>
</svg>`,

  'porcelain-60x60.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="p_grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FAF7F2"/>
      <stop offset="50%" stop-color="#F3ECE0"/>
      <stop offset="100%" stop-color="#E8DFD0"/>
    </linearGradient>
    <linearGradient id="gold_vein" x1="0" y1="0" x2="1" y2="0.8">
      <stop offset="0%" stop-color="#D9A84E" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#8C7040" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="#E0D6C5"/>
  <rect x="3" y="3" width="594" height="594" fill="url(#p_grad)" rx="2"/>
  <!-- Calacatta Gold veining -->
  <path d="M40,580 Q140,420 220,380 T380,260 T560,40" stroke="#7A6852" stroke-width="3" fill="none" opacity="0.45"/>
  <path d="M42,578 Q142,418 222,378 T382,258 T562,38" stroke="url(#gold_vein)" stroke-width="6" fill="none"/>
  <path d="M220,380 Q320,440 450,420 T580,500" stroke="#8A7A66" stroke-width="2" fill="none" opacity="0.35"/>
  <path d="M120,80 Q200,120 280,80 T400,140" stroke="#9E8F7C" stroke-width="1.8" fill="none" opacity="0.3"/>
  <!-- Laser-cut edge highlight -->
  <rect x="3" y="3" width="594" height="594" fill="none" stroke="#FFF" stroke-width="2" opacity="0.6"/>
</svg>`,

  'parquet-hdf.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="wood1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#C88E52"/>
      <stop offset="50%" stop-color="#B87D42"/>
      <stop offset="100%" stop-color="#9C6430"/>
    </linearGradient>
    <linearGradient id="wood2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#BA8045"/>
      <stop offset="50%" stop-color="#A56E36"/>
      <stop offset="100%" stop-color="#8D5B28"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="#4A2E12"/>
  <!-- Staggered wood planks -->
  <g stroke="#3A220C" stroke-width="2">
    <!-- Row 1 -->
    <rect x="0" y="0" width="380" height="118" fill="url(#wood1)"/>
    <rect x="382" y="0" width="218" height="118" fill="url(#wood2)"/>
    <!-- Row 2 -->
    <rect x="0" y="120" width="200" height="118" fill="url(#wood2)"/>
    <rect x="202" y="120" width="398" height="118" fill="url(#wood1)"/>
    <!-- Row 3 -->
    <rect x="0" y="240" width="460" height="118" fill="url(#wood1)"/>
    <rect x="462" y="240" width="138" height="118" fill="url(#wood2)"/>
    <!-- Row 4 -->
    <rect x="0" y="360" width="260" height="118" fill="url(#wood2)"/>
    <rect x="262" y="360" width="338" height="118" fill="url(#wood1)"/>
    <!-- Row 5 -->
    <rect x="0" y="480" width="420" height="120" fill="url(#wood1)"/>
    <rect x="422" y="480" width="178" height="120" fill="url(#wood2)"/>
  </g>
  <!-- Wood grain lines -->
  <path d="M0,45 Q300,50 600,42 M0,165 Q300,160 600,172 M0,290 Q300,285 600,298 M0,415 Q300,422 600,410 M0,540 Q300,535 600,548" stroke="#4F2D10" stroke-width="1.2" opacity="0.35" fill="none"/>
</svg>`,

  'marble-galala.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="galala_base" cx="40%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#FBF7EC"/>
      <stop offset="60%" stop-color="#EFE6D2"/>
      <stop offset="100%" stop-color="#DDCFB5"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#galala_base)"/>
  <!-- Galala crystalline veining & fossils -->
  <path d="M20,180 Q180,240 320,160 T580,220" stroke="#B8A484" stroke-width="4" fill="none" opacity="0.5"/>
  <path d="M25,182 Q185,242 325,162 T585,222" stroke="#9E8865" stroke-width="1.5" fill="none" opacity="0.7"/>
  <path d="M80,480 Q220,380 380,460 T560,390" stroke="#C2B093" stroke-width="3" fill="none" opacity="0.4"/>
  <circle cx="210" cy="270" r="14" fill="#A89472" opacity="0.25"/>
  <circle cx="430" cy="340" r="22" fill="#B29E7D" opacity="0.2"/>
  <circle cx="120" cy="420" r="18" fill="#C7B699" opacity="0.25"/>
  <!-- Polished gloss sheen -->
  <path d="M0,0 L600,280 L600,0 Z" fill="#FFF" opacity="0.08"/>
</svg>`,

  // ── 2. WALLS & PAINT ──
  'paint-glc.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#F4EFEA"/>
  <!-- Paint bucket illustration -->
  <ellipse cx="300" cy="180" rx="170" ry="40" fill="#E0D6CB"/>
  <path d="M130,180 L160,490 Q300,530 440,490 L470,180 Z" fill="#FFFFFF" stroke="#D1C4B5" stroke-width="4"/>
  <ellipse cx="300" cy="180" rx="160" ry="34" fill="#C43B27"/>
  <!-- GLC logo / label -->
  <rect x="175" y="270" width="250" height="140" rx="10" fill="#0F5C6E"/>
  <text x="300" y="325" font-family="system-ui, sans-serif" font-weight="900" font-size="38" fill="#FFF" text-anchor="middle">GLC</text>
  <text x="300" y="365" font-family="system-ui, sans-serif" font-weight="600" font-size="19" fill="#F4B223" text-anchor="middle">DAY-TONE 3030</text>
  <text x="300" y="390" font-family="system-ui, sans-serif" font-size="14" fill="#E3F1F4" text-anchor="middle">18 LITRES · MATT</text>
  <!-- Handle -->
  <path d="M125,230 Q300,80 475,230" stroke="#7A878D" stroke-width="8" fill="none"/>
</svg>`,

  'paint-jotun.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#EEF3F5"/>
  <ellipse cx="300" cy="180" rx="170" ry="40" fill="#D3DFE4"/>
  <path d="M130,180 L160,490 Q300,530 440,490 L470,180 Z" fill="#12394A" stroke="#0B232E" stroke-width="4"/>
  <ellipse cx="300" cy="180" rx="160" ry="34" fill="#6FB1D9"/>
  <!-- Jotun Fenomastic label -->
  <rect x="170" y="260" width="260" height="155" rx="12" fill="#FFFFFF"/>
  <text x="300" y="315" font-family="system-ui, sans-serif" font-weight="900" font-size="34" fill="#D8572A" text-anchor="middle">JOTUN</text>
  <text x="300" y="352" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#12394A" text-anchor="middle">FENOMASTIC</text>
  <text x="300" y="380" font-family="system-ui, sans-serif" font-size="14" fill="#5B6B73" text-anchor="middle">My Home Rich Matt · 18L</text>
  <path d="M125,230 Q300,80 475,230" stroke="#A7B8BD" stroke-width="8" fill="none"/>
</svg>`,

  'paint-wonderwall.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#FBF6EE"/>
  <ellipse cx="300" cy="180" rx="170" ry="40" fill="#E8DEC9"/>
  <path d="M130,180 L160,490 Q300,530 440,490 L470,180 Z" fill="#0A222D" stroke="#D4AF37" stroke-width="5"/>
  <ellipse cx="300" cy="180" rx="160" ry="34" fill="#E8A598"/>
  <rect x="170" y="260" width="260" height="155" rx="12" fill="#12394A" stroke="#F4B223" stroke-width="2"/>
  <text x="300" y="315" font-family="system-ui, sans-serif" font-weight="900" font-size="32" fill="#F4B223" text-anchor="middle">JOTUN LUX</text>
  <text x="300" y="352" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#FFFFFF" text-anchor="middle">WONDERWALL</text>
  <text x="300" y="380" font-family="system-ui, sans-serif" font-size="13" fill="#D9EFE3" text-anchor="middle">Velvet Luxury Sheen · 18L</text>
  <path d="M125,230 Q300,80 475,230" stroke="#D4AF37" stroke-width="8" fill="none"/>
</svg>`,

  // ── 3. CEILINGS ──
  'gypsum-ceiling.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="cove_glow" cx="50%" cy="50%" r="50%">
      <stop offset="60%" stop-color="#FFEAA7" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#FFEAA7" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="#E6DFD5"/>
  <!-- Recessed central ceiling -->
  <rect x="70" y="70" width="460" height="460" fill="#F8F5EE" stroke="#D2C8BA" stroke-width="6"/>
  <!-- Cove hidden light glow -->
  <rect x="50" y="50" width="500" height="500" fill="none" stroke="url(#cove_glow)" stroke-width="38"/>
  <!-- Drop ceiling frame -->
  <rect x="130" y="130" width="340" height="340" fill="#FFFFFF" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.18))"/>
  <!-- Recessed spotlights -->
  <circle cx="160" cy="160" r="14" fill="#FFF" stroke="#DDD" stroke-width="3"/>
  <circle cx="160" cy="160" r="7" fill="#FFEAA7"/>
  <circle cx="440" cy="160" r="14" fill="#FFF" stroke="#DDD" stroke-width="3"/>
  <circle cx="440" cy="160" r="7" fill="#FFEAA7"/>
  <circle cx="160" cy="440" r="14" fill="#FFF" stroke="#DDD" stroke-width="3"/>
  <circle cx="160" cy="440" r="7" fill="#FFEAA7"/>
  <circle cx="440" cy="440" r="14" fill="#FFF" stroke="#DDD" stroke-width="3"/>
  <circle cx="440" cy="440" r="7" fill="#FFEAA7"/>
</svg>`,

  // ── 4. ELECTRICAL ──
  'wire-elsewedy.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#F4EFE6"/>
  <!-- Coil of red copper wire -->
  <g fill="none" stroke="#D8572A" stroke-width="18" stroke-linecap="round">
    <circle cx="300" cy="300" r="210"/>
    <circle cx="300" cy="300" r="185"/>
    <circle cx="300" cy="300" r="160"/>
    <circle cx="300" cy="300" r="135"/>
  </g>
  <!-- Center reel hub -->
  <circle cx="300" cy="300" r="100" fill="#FFFFFF" stroke="#0F5C6E" stroke-width="8"/>
  <circle cx="300" cy="300" r="40" fill="#E6DCCB"/>
  <!-- El Sewedy label -->
  <text x="300" y="280" font-family="system-ui, sans-serif" font-weight="900" font-size="22" fill="#0F5C6E" text-anchor="middle">ELSEWEDY</text>
  <text x="300" y="306" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#D8572A" text-anchor="middle">ELECTRIC</text>
  <text x="300" y="328" font-family="system-ui, sans-serif" font-size="13" fill="#5B6B73" text-anchor="middle">3×3 mm² · 100M</text>
</svg>`,

  'switches-schneider.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#EAE5DC"/>
  <!-- Wall plate -->
  <rect x="100" y="100" width="400" height="400" rx="35" fill="#FFFFFF" stroke="#D5CCC0" stroke-width="4" filter="drop-shadow(0 15px 30px rgba(0,0,0,0.12))"/>
  <!-- Dual modular switches -->
  <rect x="160" y="160" width="125" height="280" rx="12" fill="#F6EFE3" stroke="#DDD1C2" stroke-width="3"/>
  <rect x="315" y="160" width="125" height="280" rx="12" fill="#F6EFE3" stroke="#DDD1C2" stroke-width="3"/>
  <!-- Rocker line -->
  <line x1="160" y1="300" x2="285" y2="300" stroke="#C4B7A5" stroke-width="3"/>
  <line x1="315" y1="300" x2="440" y2="300" stroke="#C4B7A5" stroke-width="3"/>
  <!-- Schneider indicator dots -->
  <circle cx="222" cy="200" r="4" fill="#0F5C6E"/>
  <circle cx="377" cy="200" r="4" fill="#0F5C6E"/>
</svg>`,

  // ── 5. PLUMBING ──
  'pipes-banninger.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#E8F1EC"/>
  <!-- Green German PPR pipes -->
  <g stroke="#3D9970" stroke-width="38" stroke-linecap="round">
    <line x1="80" y1="180" x2="520" y2="180"/>
    <line x1="80" y1="300" x2="520" y2="300"/>
    <line x1="80" y1="420" x2="520" y2="420"/>
  </g>
  <!-- Brass elbows and fittings -->
  <circle cx="200" cy="180" r="32" fill="#D4AF37" stroke="#997C22" stroke-width="4"/>
  <circle cx="400" cy="300" r="32" fill="#D4AF37" stroke="#997C22" stroke-width="4"/>
  <circle cx="280" cy="420" r="32" fill="#D4AF37" stroke="#997C22" stroke-width="4"/>
  <!-- Pipe highlight -->
  <line x1="80" y1="172" x2="520" y2="172" stroke="#7DBE9A" stroke-width="8"/>
  <line x1="80" y1="292" x2="520" y2="292" stroke="#7DBE9A" stroke-width="8"/>
  <line x1="80" y1="412" x2="520" y2="412" stroke="#7DBE9A" stroke-width="8"/>
</svg>`,

  // ── 6. DOORS & WINDOWS ──
  'door-wood-veneer.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#F5EFE8"/>
  <!-- Frame -->
  <rect x="140" y="40" width="320" height="520" fill="#5A3A1F" rx="4"/>
  <!-- Door leaf -->
  <rect x="160" y="55" width="280" height="490" fill="#8E5A30" rx="3"/>
  <!-- Oak veneer grooves -->
  <g stroke="#4A2E16" stroke-width="3">
    <line x1="200" y1="55" x2="200" y2="545"/>
    <line x1="260" y1="55" x2="260" y2="545"/>
    <line x1="340" y1="55" x2="340" y2="545"/>
    <line x1="400" y1="55" x2="400" y2="545"/>
  </g>
  <!-- Modern stainless steel lever handle -->
  <rect x="180" y="295" width="25" height="50" rx="4" fill="#C4CCD0" stroke="#8C999F" stroke-width="2"/>
  <rect x="155" y="305" width="45" height="12" rx="3" fill="#E3F1F4" stroke="#8C999F" stroke-width="2"/>
</svg>`,

  'window-aluminum.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#EAEAEA"/>
  <!-- Dark bronze aluminum frame -->
  <rect x="60" y="60" width="480" height="480" fill="#2C3437" rx="8"/>
  <!-- Double pane glass panels with blue reflection -->
  <rect x="80" y="80" width="210" height="440" fill="#6FB1D9" opacity="0.65"/>
  <rect x="310" y="80" width="210" height="440" fill="#6FB1D9" opacity="0.65"/>
  <!-- Glass diagonal glare -->
  <polygon points="100,80 200,80 140,520 80,520" fill="#FFF" opacity="0.25"/>
  <polygon points="330,80 430,80 370,520 310,520" fill="#FFF" opacity="0.25"/>
  <!-- Handle -->
  <rect x="278" y="270" width="12" height="60" rx="3" fill="#1C2B33"/>
</svg>`,

  // ── 7. KITCHEN ──
  'kitchen-hpl.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#F0EDE6"/>
  <!-- Upper cabinets (matte Sage) -->
  <rect x="60" y="60" width="235" height="180" fill="#7DBE9A" stroke="#5E9A78" stroke-width="3"/>
  <rect x="305" y="60" width="235" height="180" fill="#7DBE9A" stroke="#5E9A78" stroke-width="3"/>
  <!-- Backsplash subway tiles -->
  <rect x="60" y="245" width="480" height="110" fill="#FAF8F4" stroke="#E6E0D6" stroke-width="2"/>
  <!-- Quartz countertop -->
  <rect x="45" y="355" width="510" height="25" fill="#E6E0D6" stroke="#C4BDB0" stroke-width="2"/>
  <!-- Lower cabinets (Nile Navy) -->
  <rect x="60" y="380" width="235" height="180" fill="#12394A" stroke="#0B232E" stroke-width="3"/>
  <rect x="305" y="380" width="235" height="180" fill="#12394A" stroke="#0B232E" stroke-width="3"/>
  <!-- Brass bar handles -->
  <line x1="160" y1="410" x2="200" y2="410" stroke="#F4B223" stroke-width="5" stroke-linecap="round"/>
  <line x1="400" y1="410" x2="440" y2="410" stroke="#F4B223" stroke-width="5" stroke-linecap="round"/>
</svg>`,

  // ── 8. BATHROOMS ──
  'sanitary-duravit.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#E6EEF2"/>
  <!-- Modern ceramic wall-hung toilet & Grohe mixer -->
  <rect x="180" y="80" width="240" height="120" rx="8" fill="#12394A"/>
  <!-- Chrome dual flush button -->
  <rect x="250" y="120" width="100" height="50" rx="6" fill="#C4CCD0" stroke="#FFF" stroke-width="2"/>
  <circle cx="280" cy="145" r="14" fill="#E3F1F4"/>
  <circle cx="320" cy="145" r="10" fill="#E3F1F4"/>
  <!-- Ceramic toilet bowl -->
  <path d="M220,200 L380,200 Q420,380 300,450 Q180,380 220,200 Z" fill="#FFFFFF" stroke="#D1DEE5" stroke-width="5" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.1))"/>
  <ellipse cx="300" cy="270" rx="65" ry="50" fill="#EAF3F7"/>
</svg>`,

  // ── 9. RAW COMMODITIES ──
  'cement-portland.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#EAE5DE"/>
  <!-- 50kg Kraft paper cement bag -->
  <rect x="130" y="100" width="340" height="420" rx="15" fill="#C8B39B" stroke="#9E876F" stroke-width="5" filter="drop-shadow(0 15px 30px rgba(0,0,0,0.15))"/>
  <!-- Blue cement seal -->
  <circle cx="300" cy="280" r="70" fill="#12394A"/>
  <text x="300" y="270" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#FFF" text-anchor="middle">سويس</text>
  <text x="300" y="298" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#F4B223" text-anchor="middle">PORTLAND</text>
  <text x="300" y="390" font-family="system-ui, sans-serif" font-weight="800" font-size="34" fill="#1C2B33" text-anchor="middle">CEM I 42.5N</text>
  <text x="300" y="440" font-family="system-ui, sans-serif" font-weight="600" font-size="22" fill="#D8572A" text-anchor="middle">50 KG / كجم</text>
</svg>`,

  'sand-building.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#F9F5EC"/>
  <!-- Dune pile of golden sand -->
  <path d="M40,520 Q300,160 560,520 Z" fill="#E6C280"/>
  <path d="M120,520 Q300,210 500,520 Z" fill="#D8B168" opacity="0.6"/>
  <circle cx="280" cy="340" r="4" fill="#C59B4E"/>
  <circle cx="340" cy="370" r="5" fill="#C59B4E"/>
  <circle cx="240" cy="420" r="3" fill="#C59B4E"/>
  <circle cx="360" cy="440" r="4" fill="#C59B4E"/>
</svg>`,

  'brick-red-clay.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="600" height="600" fill="#F4ECE5"/>
  <!-- 3D Red hollow clay brick -->
  <polygon points="120,240 420,240 480,180 180,180" fill="#E26D46" stroke="#9C3A1A" stroke-width="3"/>
  <polygon points="420,240 480,180 480,360 420,420" fill="#A84323" stroke="#9C3A1A" stroke-width="3"/>
  <rect x="120" y="240" width="300" height="180" fill="#C44E2B" stroke="#9C3A1A" stroke-width="3"/>
  <!-- 6 holes -->
  <g fill="#5C1F0D">
    <rect x="155" y="270" width="65" height="45" rx="6"/>
    <rect x="238" y="270" width="65" height="45" rx="6"/>
    <rect x="320" y="270" width="65" height="45" rx="6"/>
    <rect x="155" y="345" width="65" height="45" rx="6"/>
    <rect x="238" y="345" width="65" height="45" rx="6"/>
    <rect x="320" y="345" width="65" height="45" rx="6"/>
  </g>
</svg>`,

  // ── 10. ROOM INSPIRATIONS (Economy, Standard, Super Lux) ──
  'room-economy.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <rect width="800" height="500" fill="#E8F1EC"/>
  <!-- Economy interior: Sage accents, light ceramic floor, neat functional sofa -->
  <polygon points="0,320 800,320 800,500 0,500" fill="#DFD7CB"/>
  <!-- Wall -->
  <rect x="0" y="0" width="800" height="320" fill="#F5EFE6"/>
  <!-- Accent wall panel in Sage -->
  <rect x="120" y="40" width="560" height="240" rx="8" fill="#7DBE9A" opacity="0.3"/>
  <!-- Modern linen sofa -->
  <rect x="220" y="260" width="360" height="130" rx="14" fill="#0F5C6E"/>
  <rect x="240" y="240" width="150" height="70" rx="10" fill="#12394A"/>
  <rect x="410" y="240" width="150" height="70" rx="10" fill="#12394A"/>
  <!-- Ceramic floor tile joints -->
  <line x1="0" y1="410" x2="800" y2="410" stroke="#C8BFB1" stroke-width="2"/>
  <line x1="260" y1="320" x2="200" y2="500" stroke="#C8BFB1" stroke-width="2"/>
  <line x1="540" y1="320" x2="600" y2="500" stroke="#C8BFB1" stroke-width="2"/>
  <!-- Warm pendant lamp -->
  <line x1="400" y1="0" x2="400" y2="90" stroke="#5B6B73" stroke-width="3"/>
  <polygon points="360,130 440,130 415,90 385,90" fill="#F4B223"/>
</svg>`,

  'room-standard.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <rect width="800" height="500" fill="#FEF7E9"/>
  <!-- Standard interior: Saffron + Navy accents, porcelain 60x60, cove lighting -->
  <polygon points="0,300 800,300 800,500 0,500" fill="#EAE3D4"/>
  <!-- Cove lighting drop ceiling -->
  <rect x="80" y="0" width="640" height="45" fill="#FFFFFF" filter="drop-shadow(0 8px 12px rgba(244,178,35,0.3))"/>
  <!-- Warm wood veneer wall slat accent -->
  <g fill="#A86E3C">
    <rect x="100" y="45" width="12" height="255"/>
    <rect x="122" y="45" width="12" height="255"/>
    <rect x="144" y="45" width="12" height="255"/>
    <rect x="166" y="45" width="12" height="255"/>
    <rect x="188" y="45" width="12" height="255"/>
  </g>
  <!-- Contemporary L-shape sofa -->
  <rect x="260" y="240" width="380" height="130" rx="16" fill="#12394A"/>
  <!-- Saffron cushion -->
  <rect x="290" y="220" width="70" height="70" rx="10" fill="#F4B223"/>
  <rect x="380" y="220" width="70" height="70" rx="10" fill="#D8572A"/>
  <!-- Coffee table -->
  <rect x="320" y="380" width="180" height="55" rx="8" fill="#FFFFFF" stroke="#D5CCC0" stroke-width="2"/>
</svg>`,

  'room-superlux.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <rect width="800" height="500" fill="#0A222D"/>
  <!-- Super Lux penthouse interior: Marble floors, dark Nile Navy + gold trim -->
  <polygon points="0,290 800,290 800,500 0,500" fill="#F4EFE6"/>
  <!-- Marble veining reflections on floor -->
  <path d="M80,360 Q300,320 600,350 T780,480" stroke="#D5A852" stroke-width="3" fill="none" opacity="0.4"/>
  <!-- Back feature wall: dark charcoal with warm brass cove strips -->
  <rect x="0" y="0" width="800" height="290" fill="#12394A"/>
  <line x1="200" y1="0" x2="200" y2="290" stroke="#F4B223" stroke-width="2"/>
  <line x1="600" y1="0" x2="600" y2="290" stroke="#F4B223" stroke-width="2"/>
  <!-- Curved velvet designer armchair in Terracotta -->
  <ellipse cx="400" cy="330" rx="180" ry="85" fill="#D8572A"/>
  <ellipse cx="400" cy="270" rx="140" ry="60" fill="#9F3D1A"/>
  <!-- Marble coffee table with brass legs -->
  <ellipse cx="400" cy="400" rx="110" ry="40" fill="#FFFFFF" stroke="#F4B223" stroke-width="4"/>
</svg>`
}

for (const [name, content] of Object.entries(ASSETS)) {
  const targetDir = name.startsWith('room-') ? roomDir : matDir
  fs.writeFileSync(path.join(targetDir, name), content.trim(), 'utf8')
}

console.log('Successfully generated material & room visual assets!')

