const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'mascot');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// W3C compliant SVG defs with standard XML attributes (stop-color, not camelCase)
function getCommonDefs() {
  return `
    <defs>
      <!-- Fur gradient (warm golden orange 3D lighting) -->
      <linearGradient id="furMain" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFD494" />
        <stop offset="35%" stop-color="#F5A623" />
        <stop offset="75%" stop-color="#E2841A" />
        <stop offset="100%" stop-color="#C2680D" />
      </linearGradient>

      <!-- Head 3D soft radial light -->
      <radialGradient id="headSphere" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#FFE3BA" />
        <stop offset="45%" stop-color="#F5A623" />
        <stop offset="85%" stop-color="#DE7912" />
        <stop offset="100%" stop-color="#B85D08" />
      </radialGradient>

      <!-- Cream Urajiro (White cheeks, snout, chest) -->
      <linearGradient id="creamFur" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="65%" stop-color="#FFFDF8" />
        <stop offset="100%" stop-color="#FDEFD8" />
      </linearGradient>

      <!-- Inner ear gradient -->
      <linearGradient id="innerEar" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF7ED" />
        <stop offset="60%" stop-color="#FFDECE" />
        <stop offset="100%" stop-color="#FCA5A5" />
      </linearGradient>

      <!-- Navy Yukata / Happi 3D gradient -->
      <linearGradient id="yukataNavy" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#334155" />
        <stop offset="40%" stop-color="#1E293B" />
        <stop offset="90%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>

      <!-- Red Obi Belt & Red Book -->
      <linearGradient id="obiRed" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#F87171" />
        <stop offset="45%" stop-color="#EF4444" />
        <stop offset="90%" stop-color="#B91C1C" />
        <stop offset="100%" stop-color="#991B1B" />
      </linearGradient>

      <!-- Rising Sun Red Circle -->
      <radialGradient id="sunRed" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#FCA5A5" />
        <stop offset="60%" stop-color="#EF4444" />
        <stop offset="100%" stop-color="#B91C1C" />
      </radialGradient>

      <!-- Gold book spine -->
      <linearGradient id="goldSpine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FEF08A" />
        <stop offset="50%" stop-color="#FACC15" />
        <stop offset="100%" stop-color="#CA8A04" />
      </linearGradient>

      <!-- Glossy eye pupil -->
      <radialGradient id="eyeGloss" cx="30%" cy="25%" r="75%">
        <stop offset="0%" stop-color="#44403C" />
        <stop offset="55%" stop-color="#1C1917" />
        <stop offset="100%" stop-color="#09090B" />
      </radialGradient>

      <!-- Pink paw pads -->
      <radialGradient id="pinkPad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#FBCFE8" />
        <stop offset="70%" stop-color="#F472B6" />
        <stop offset="100%" stop-color="#DB2777" />
      </radialGradient>
    </defs>
  `;
}

// 5-petal Sakura crest
function getSakuraCrest(x, y, scale = 1) {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <circle cx="0" cy="-6" r="4.2" fill="#FFFFFF" />
      <circle cx="5.7" cy="-1.9" r="4.2" fill="#FFFFFF" />
      <circle cx="3.5" cy="4.9" r="4.2" fill="#FFFFFF" />
      <circle cx="-3.5" cy="4.9" r="4.2" fill="#FFFFFF" />
      <circle cx="-5.7" cy="-1.9" r="4.2" fill="#FFFFFF" />
      <!-- Center pistil -->
      <circle cx="0" cy="0" r="2.5" fill="#F472B6" />
    </g>
  `;
}

// Hachimaki headband with "日本●語"
function getHeadband(cx = 128, cy = 92, width = 146, angle = 0) {
  return `
    <g transform="rotate(${angle} ${cx} ${cy})">
      <!-- White cloth headband band with 3D curve -->
      <path d="M ${cx - width/2} ${cy - 12} Q ${cx} ${cy - 18} ${cx + width/2} ${cy - 12} Q ${cx + width/2 + 2} ${cy + 14} ${cx + width/2} ${cy + 14} Q ${cx} ${cy + 8} ${cx - width/2} ${cy + 14} Z"
        fill="#FFFFFF"
        stroke="#CBD5E1"
        stroke-width="2"
      />

      <!-- Cloth fold lines -->
      <path d="M ${cx - width/2 + 10} ${cy} Q ${cx} ${cy - 4} ${cx + width/2 - 10} ${cy}" stroke="#E2E8F0" stroke-width="1.2" fill="none" />

      <!-- Text: 日本●語 -->
      <text x="${cx - 36}" y="${cy + 6}" font-family="sans-serif" font-size="14" font-weight="900" fill="#0F172A" text-anchor="middle">日</text>
      <!-- Center Red Rising Sun Circle -->
      <circle cx="${cx - 16}" cy="${cy + 1}" r="6.5" fill="url(#sunRed)" stroke="#B91C1C" stroke-width="0.8" />
      <!-- Japanese kanji 本 and 語 -->
      <text x="${cx + 4}" y="${cy + 6}" font-family="sans-serif" font-size="13" font-weight="900" fill="#0F172A" text-anchor="middle">本</text>
      <text x="${cx + 26}" y="${cy + 6}" font-family="sans-serif" font-size="13" font-weight="900" fill="#0F172A" text-anchor="middle">語</text>

      <!-- Headband Knot & Bow on left side -->
      <g transform="translate(${cx - width/2 - 2}, ${cy + 2})">
        <!-- Knot center -->
        <ellipse cx="0" cy="0" rx="6" ry="7" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.2" />
        <!-- Bow loop top -->
        <path d="M -4 -3 C -14 -12 -18 -4 -4 1 Z" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.2" />
        <!-- Bow loop bottom -->
        <path d="M -4 2 C -18 8 -16 16 -3 4 Z" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.2" />
        <!-- Tail hanging -->
        <path d="M -2 5 Q -8 18 -14 24 Q -6 20 0 10 Z" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1" />
      </g>
    </g>
  `;
}

// 3D Shiba Head (Ears, Head, Urajiro cheeks, Eyes, Nose, Mouth, Blush, Eyebrows)
function getShibaHead(options = {}) {
  const {
    cx = 128,
    cy = 108,
    r = 66,
    eyeState = 'open',
    mouthState = 'open_happy',
    tilt = 0,
  } = options;

  return `
    <g transform="rotate(${tilt} ${cx} ${cy})">
      <!-- 1. Ears -->
      <!-- Left Ear (viewer left) -->
      <g>
        <path d="M ${cx - 62} ${cy - 20} Q ${cx - 68} ${cy - 85} ${cx - 36} ${cy - 78} Q ${cx - 16} ${cy - 48} ${cx - 24} ${cy - 12} Z"
          fill="url(#furMain)"
          stroke="#C2680D"
          stroke-width="2"
        />
        <!-- Left Inner Ear Cream/Pink -->
        <path d="M ${cx - 54} ${cy - 24} Q ${cx - 60} ${cy - 74} ${cx - 38} ${cy - 70} Q ${cx - 24} ${cy - 44} ${cx - 28} ${cy - 18} Z"
          fill="url(#innerEar)"
        />
      </g>

      <!-- Right Ear (viewer right) -->
      <g>
        <path d="M ${cx + 62} ${cy - 20} Q ${cx + 68} ${cy - 85} ${cx + 36} ${cy - 78} Q ${cx + 16} ${cy - 48} ${cx + 24} ${cy - 12} Z"
          fill="url(#furMain)"
          stroke="#C2680D"
          stroke-width="2"
        />
        <!-- Right Inner Ear Cream/Pink -->
        <path d="M ${cx + 54} ${cy - 24} Q ${cx + 60} ${cy - 74} ${cx + 38} ${cy - 70} Q ${cx + 24} ${cy - 44} ${cx + 28} ${cy - 18} Z"
          fill="url(#innerEar)"
        />
      </g>

      <!-- 2. Main Head Sphere -->
      <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.94}" fill="url(#headSphere)" stroke="#C2680D" stroke-width="1.5" />

      <!-- 3. Shiba Urajiro (White Cheeks & Muzzle) -->
      <path d="M ${cx - 58} ${cy + 18}
               C ${cx - 68} ${cy + 42}, ${cx - 42} ${cy + 60}, ${cx} ${cy + 62}
               C ${cx + 42} ${cy + 60}, ${cx + 68} ${cy + 42}, ${cx + 58} ${cy + 18}
               C ${cx + 46} ${cy - 4}, ${cx + 26} ${cy + 6}, ${cx} ${cy + 8}
               C ${cx - 26} ${cy + 6}, ${cx - 46} ${cy - 4}, ${cx - 58} ${cy + 18} Z"
        fill="url(#creamFur)"
        stroke="#E2E8F0"
        stroke-width="1"
      />

      <!-- 4. Rosy Airbrush Cheeks Blush -->
      <ellipse cx="${cx - 42}" cy="${cy + 26}" rx="14" ry="8" fill="#F472B6" opacity="0.6" />
      <ellipse cx="${cx + 42}" cy="${cy + 26}" rx="14" ry="8" fill="#F472B6" opacity="0.6" />

      <!-- 5. Eyebrows (Cream round dots above eyes) -->
      <ellipse cx="${cx - 24}" cy="${cy - 22}" rx="7" ry="5" fill="#FFFFFF" stroke="#FEF08A" stroke-width="0.8" />
      <ellipse cx="${cx + 24}" cy="${cy - 22}" rx="7" ry="5" fill="#FFFFFF" stroke="#FEF08A" stroke-width="0.8" />

      <!-- 6. Eyes -->
      ${getEyes(cx, cy, eyeState)}

      <!-- 7. Nose (Cute black rounded triangle with specular highlight) -->
      <path d="M ${cx - 9} ${cy + 16} Q ${cx} ${cy + 14} ${cx + 9} ${cy + 16} Q ${cx + 6} ${cy + 25} ${cx} ${cy + 27} Q ${cx - 6} ${cy + 25} ${cx - 9} ${cy + 16} Z"
        fill="#18181B"
      />
      <!-- Nose shine -->
      <ellipse cx="${cx - 2}" cy="${cy + 18}" rx="3.5" ry="1.8" fill="#A1A1AA" />

      <!-- 8. Mouth -->
      ${getMouth(cx, cy, mouthState)}

      <!-- 9. Headband: 日本●語 -->
      ${getHeadband(cx, cy - 14, 142, 0)}
    </g>
  `;
}

function getEyes(cx, cy, state) {
  if (state === 'wink') {
    return `
      <!-- Left Eye Open -->
      <ellipse cx="${cx - 26}" cy="${cy + 3}" rx="11" ry="13" fill="url(#eyeGloss)" />
      <!-- Big catchlight -->
      <circle cx="${cx - 22}" cy="${cy - 2}" r="5" fill="#FFFFFF" />
      <!-- Small catchlight -->
      <circle cx="${cx - 28}" cy="${cy + 8}" r="2.5" fill="#FFFFFF" />

      <!-- Right Eye Winking (Curved lash) -->
      <path d="M ${cx + 14} ${cy + 4} Q ${cx + 26} ${cy - 5} ${cx + 38} ${cy + 4}" stroke="#18181B" stroke-width="4.5" stroke-linecap="round" fill="none" />
      <!-- Star sparkle next to wink -->
      <path d="M ${cx + 46} ${cy - 4} L ${cx + 49} ${cy - 1} L ${cx + 53} ${cy} L ${cx + 49} ${cy + 1} L ${cx + 46} ${cy + 4} L ${cx + 43} ${cy + 1} L ${cx + 39} ${cy} L ${cx + 43} ${cy - 1} Z" fill="#FACC15" />
    `;
  }
  if (state === 'closed') {
    return `
      <!-- Peaceful curved closed eyes for listening -->
      <path d="M ${cx - 38} ${cy + 2} Q ${cx - 26} ${cy + 12} ${cx - 14} ${cy + 2}" stroke="#18181B" stroke-width="4.5" stroke-linecap="round" fill="none" />
      <path d="M ${cx + 14} ${cy + 2} Q ${cx + 26} ${cy + 12} ${cx + 38} ${cy + 2}" stroke="#18181B" stroke-width="4.5" stroke-linecap="round" fill="none" />
    `;
  }
  if (state === 'curious') {
    return `
      <!-- Left Eye looking up/curious -->
      <ellipse cx="${cx - 26}" cy="${cy + 2}" rx="11" ry="13" fill="url(#eyeGloss)" />
      <circle cx="${cx - 23}" cy="${cy - 3}" r="5" fill="#FFFFFF" />
      <circle cx="${cx - 29}" cy="${cy + 8}" r="2.5" fill="#FFFFFF" />

      <!-- Right Eye looking up/curious -->
      <ellipse cx="${cx + 26}" cy="${cy + 2}" rx="11" ry="13" fill="url(#eyeGloss)" />
      <circle cx="${cx + 29}" cy="${cy - 3}" r="5" fill="#FFFFFF" />
      <circle cx="${cx + 23}" cy="${cy + 8}" r="2.5" fill="#FFFFFF" />
    `;
  }
  // Default open glossy 3D anime eyes
  return `
    <!-- Left Eye -->
    <ellipse cx="${cx - 26}" cy="${cy + 3}" rx="11" ry="13" fill="url(#eyeGloss)" />
    <!-- Big Catchlight Top-Right -->
    <circle cx="${cx - 22}" cy="${cy - 2}" r="5" fill="#FFFFFF" />
    <!-- Secondary Catchlight Bottom-Left -->
    <circle cx="${cx - 29}" cy="${cy + 8}" r="2.5" fill="#FFFFFF" />

    <!-- Right Eye -->
    <ellipse cx="${cx + 26}" cy="${cy + 3}" rx="11" ry="13" fill="url(#eyeGloss)" />
    <!-- Big Catchlight Top-Right -->
    <circle cx="${cx + 30}" cy="${cy - 2}" r="5" fill="#FFFFFF" />
    <!-- Secondary Catchlight Bottom-Left -->
    <circle cx="${cx + 23}" cy="${cy + 8}" r="2.5" fill="#FFFFFF" />
  `;
}

function getMouth(cx, cy, state) {
  if (state === 'open_happy' || state === 'open_smile') {
    return `
      <!-- Happy open mouth with pink tongue -->
      <path d="M ${cx - 16} ${cy + 28} Q ${cx} ${cy + 25} ${cx + 16} ${cy + 28} Q ${cx + 12} ${cy + 47} ${cx} ${cy + 49} Q ${cx - 12} ${cy + 47} ${cx - 16} ${cy + 28} Z"
        fill="#BE123C"
        stroke="#18181B"
        stroke-width="2"
      />
      <!-- Cute Pink Tongue -->
      <path d="M ${cx - 10} ${cy + 41} Q ${cx} ${cy + 35} ${cx + 10} ${cy + 41} Q ${cx + 8} ${cy + 47} ${cx} ${cy + 48} Q ${cx - 8} ${cy + 47} ${cx - 10} ${cy + 41} Z"
        fill="#FB7185"
      />
      <!-- Muzzle center line -->
      <path d="M ${cx} ${cy + 25} L ${cx} ${cy + 28}" stroke="#18181B" stroke-width="2" stroke-linecap="round" />
    `;
  }
  if (state === 'wide_grin') {
    return `
      <!-- Wide celebratory open mouth -->
      <path d="M ${cx - 20} ${cy + 27} Q ${cx} ${cy + 24} ${cx + 20} ${cy + 27} Q ${cx + 16} ${cy + 52} ${cx} ${cy + 54} Q ${cx - 16} ${cy + 52} ${cx - 20} ${cy + 27} Z"
        fill="#9F1239"
        stroke="#18181B"
        stroke-width="2"
      />
      <!-- Cute Pink Tongue -->
      <path d="M ${cx - 14} ${cy + 42} Q ${cx} ${cy + 36} ${cx + 14} ${cy + 42} Q ${cx + 10} ${cy + 52} ${cx} ${cy + 53} Q ${cx - 10} ${cy + 52} ${cx - 14} ${cy + 42} Z"
        fill="#FDA4AF"
      />
      <path d="M ${cx - 22} ${cy + 25} Q ${cx - 20} ${cy + 28} ${cx - 18} ${cy + 30}" stroke="#18181B" stroke-width="2" stroke-linecap="round" fill="none" />
      <path d="M ${cx + 22} ${cy + 25} Q ${cx + 20} ${cy + 28} ${cx + 18} ${cy + 30}" stroke="#18181B" stroke-width="2" stroke-linecap="round" fill="none" />
    `;
  }
  return `
    <path d="M ${cx - 14} ${cy + 30} Q ${cx} ${cy + 38} ${cx + 14} ${cy + 30}"
      stroke="#18181B"
      stroke-width="3"
      stroke-linecap="round"
      fill="none"
    />
    <path d="M ${cx} ${cy + 25} L ${cx} ${cy + 33}" stroke="#18181B" stroke-width="2" stroke-linecap="round" />
  `;
}

// Full Body: Navy Yukata + Sakura Crest + Red Obi + Legs
function getYukataBody(options = {}) {
  const { cx = 128, cy = 175 } = options;
  return `
    <g id="yukata-body">
      <!-- Main Navy Yukata Torso -->
      <path d="M ${cx - 38} ${cy - 15}
               L ${cx - 52} ${cy + 40}
               C ${cx - 52} ${cy + 48}, ${cx - 40} ${cy + 52}, ${cx - 24} ${cy + 52}
               L ${cx + 24} ${cy + 52}
               C ${cx + 40} ${cy + 52}, ${cx + 52} ${cy + 48}, ${cx + 52} ${cy + 40}
               L ${cx + 38} ${cy - 15} Z"
        fill="url(#yukataNavy)"
        stroke="#0F172A"
        stroke-width="2"
      />

      <!-- White Collar Lapels (Crossed Kimono Style) -->
      <path d="M ${cx - 20} ${cy - 14} L ${cx} ${cy + 22} L ${cx - 8} ${cy + 38}" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" />
      <path d="M ${cx + 20} ${cy - 14} L ${cx} ${cy + 22} L ${cx + 8} ${cy + 38}" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" />

      <!-- White Sakura Cherry Blossom on Left Chest -->
      ${getSakuraCrest(cx + 20, cy + 10, 1.2)}

      <!-- Red Obi Sash Belt -->
      <rect x="${cx - 46}" y="${cy + 22}" width="92" height="15" rx="4" fill="url(#obiRed)" stroke="#7F1D1D" stroke-width="1.2" />
      <!-- Knot in Center with Bow Loops -->
      <g transform="translate(${cx}, ${cy + 30})">
        <!-- Center knot -->
        <ellipse cx="0" cy="0" rx="7" ry="6" fill="#DC2626" stroke="#7F1D1D" stroke-width="1.2" />
        <!-- Left bow loop -->
        <path d="M -5 -2 C -18 -8 -20 6 -6 3 Z" fill="url(#obiRed)" stroke="#7F1D1D" stroke-width="1.2" />
        <!-- Right bow loop -->
        <path d="M 5 -2 C 18 -8 20 6 6 3 Z" fill="url(#obiRed)" stroke="#7F1D1D" stroke-width="1.2" />
        <!-- Hanging ribbon tails -->
        <path d="M -3 3 Q -8 16 -12 24 Q -4 18 0 8 Z" fill="#DC2626" />
        <path d="M 3 3 Q 8 16 12 24 Q 4 18 0 8 Z" fill="#DC2626" />
      </g>

      <!-- Feet (Two chubby paws in front) -->
      <g id="feet">
        <!-- Left Foot -->
        <ellipse cx="${cx - 24}" cy="${cy + 54}" rx="14" ry="10" fill="url(#creamFur)" stroke="#D97706" stroke-width="2" />
        <!-- Right Foot -->
        <ellipse cx="${cx + 24}" cy="${cy + 54}" rx="14" ry="10" fill="url(#creamFur)" stroke="#D97706" stroke-width="2" />
      </g>
    </g>
  `;
}

// Red Japanese Book (日本語)
function getRedBook(x = 55, y = 145, scale = 1, angle = -8) {
  return `
    <g transform="translate(${x}, ${y}) rotate(${angle}) scale(${scale})">
      <!-- Book Cover (Vibrant Red Hardcover) -->
      <rect x="0" y="0" width="38" height="54" rx="4" fill="url(#obiRed)" stroke="#7F1D1D" stroke-width="1.5" />
      <!-- Book Pages Edge (White) -->
      <rect x="34" y="3" width="5" height="48" rx="1" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="0.8" />
      <!-- Gold Ribbon / Spine accent -->
      <rect x="0" y="0" width="6" height="54" rx="2" fill="url(#goldSpine)" />

      <!-- Vertical Kanji: 日本語 -->
      <text x="20" y="16" font-family="sans-serif" font-size="10" font-weight="900" fill="#FFFFFF" text-anchor="middle">日</text>
      <text x="20" y="28" font-family="sans-serif" font-size="10" font-weight="900" fill="#FFFFFF" text-anchor="middle">本</text>
      <text x="20" y="40" font-family="sans-serif" font-size="10" font-weight="900" fill="#FFFFFF" text-anchor="middle">語</text>
    </g>
  `;
}

// Waving Left Paw with Pink Pads
function getWavingPaw(x = 188, y = 115) {
  return `
    <g transform="translate(${x}, ${y})">
      <!-- Arm in Navy Sleeve -->
      <path d="M -12 25 L 4 0 C 14 -12, 34 2, 24 16 L 4 36 Z" fill="url(#yukataNavy)" stroke="#0F172A" stroke-width="1.5" />
      <!-- White cuff -->
      <ellipse cx="6" cy="18" rx="10" ry="5" fill="#FFFFFF" transform="rotate(45 6 18)" />

      <!-- Raised Shiba Paw -->
      <ellipse cx="14" cy="4" rx="14" ry="15" fill="url(#creamFur)" stroke="#D97706" stroke-width="2" />

      <!-- Center Pink Cushion Pad (Heart-ish shape) -->
      <path d="M 9 6 C 9 2, 14 0, 15 4 C 16 0, 21 2, 21 6 C 21 11, 15 14, 15 14 C 15 14, 9 11, 9 6 Z"
        fill="url(#pinkPad)"
      />

      <!-- 4 Round Pink Toe Beans -->
      <circle cx="6" cy="-4" r="3.2" fill="url(#pinkPad)" />
      <circle cx="12" cy="-8" r="3.4" fill="url(#pinkPad)" />
      <circle cx="18" cy="-8" r="3.4" fill="url(#pinkPad)" />
      <circle cx="23" cy="-3" r="3.2" fill="url(#pinkPad)" />
    </g>
  `;
}

// ==========================================
// POSE 1: Main / Waving Mascot (THE ORIGINAL ASSET)
// ==========================================
function generateMainWavingSVG() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="512" height="512">
      ${getCommonDefs()}

      <!-- Soft pedestal shadow -->
      <ellipse cx="128" cy="242" rx="68" ry="10" fill="#020617" opacity="0.25" />

      <!-- Body & Outfit -->
      ${getYukataBody({ cx: 128, cy: 175 })}

      <!-- Right Arm holding Red Book -->
      <g>
        <path d="M 85 158 Q 65 168 62 188 Q 80 196 95 178 Z" fill="url(#yukataNavy)" stroke="#0F172A" stroke-width="1.5" />
        ${getRedBook(46, 142, 1, -10)}
        <!-- White paw wrapping around the book -->
        <ellipse cx="64" cy="178" rx="8" ry="6" fill="url(#creamFur)" stroke="#D97706" stroke-width="1.5" />
      </g>

      <!-- Head -->
      ${getShibaHead({ cx: 128, cy: 96, eyeState: 'open', mouthState: 'open_happy' })}

      <!-- Left Waving Paw with Pink Pads -->
      ${getWavingPaw(174, 102)}

      <!-- Sparkles -->
      <path d="M 224 88 L 226 93 L 231 95 L 226 97 L 224 102 L 222 97 L 217 95 L 222 93 Z" fill="#FACC15" />
      <path d="M 38 78 L 40 82 L 44 84 L 40 86 L 38 90 L 36 86 L 32 84 L 36 82 Z" fill="#FACC15" />
    </svg>
  `;
}

// ==========================================
// POSE 2: Winking / Joy
// ==========================================
function generateWinkingSVG() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="512" height="512">
      ${getCommonDefs()}
      <ellipse cx="128" cy="242" rx="68" ry="10" fill="#020617" opacity="0.25" />
      ${getYukataBody({ cx: 128, cy: 175 })}
      <!-- Right paw holding book -->
      ${getRedBook(46, 142, 1, -10)}
      <ellipse cx="64" cy="178" rx="8" ry="6" fill="url(#creamFur)" stroke="#D97706" stroke-width="1.5" />

      <!-- Head with Wink and Joy smile -->
      ${getShibaHead({ cx: 128, cy: 96, eyeState: 'wink', mouthState: 'open_happy' })}

      <!-- Left Waving Paw -->
      ${getWavingPaw(174, 102)}

      <path d="M 226 76 L 228 82 L 234 84 L 228 86 L 226 92 L 224 86 L 218 84 L 224 82 Z" fill="#FACC15" />
    </svg>
  `;
}

// ==========================================
// POSE 3: Cheering / Celebration / Success
// ==========================================
function generateCheeringSVG() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="512" height="512">
      ${getCommonDefs()}
      <ellipse cx="128" cy="242" rx="68" ry="10" fill="#020617" opacity="0.25" />
      ${getYukataBody({ cx: 128, cy: 175 })}

      <!-- Head wide grin -->
      ${getShibaHead({ cx: 128, cy: 98, eyeState: 'open', mouthState: 'wide_grin' })}

      <!-- Both paws thrown high up cheering! -->
      <!-- Left paw high -->
      ${getWavingPaw(172, 85)}

      <!-- Right paw high (Mirrored) -->
      <g transform="translate(84, 85) scale(-1, 1)">
        ${getWavingPaw(0, 0)}
      </g>

      <!-- Celebration Sparkles & Confetti -->
      <circle cx="48" cy="62" r="3.5" fill="#EF4444" />
      <circle cx="208" cy="58" r="3.5" fill="#3B82F6" />
      <circle cx="128" cy="32" r="4" fill="#F59E0B" />
      <path d="M 32 82 L 35 88 L 41 90 L 35 92 L 32 98 L 29 92 L 23 90 L 29 88 Z" fill="#FACC15" />
      <path d="M 224 82 L 227 88 L 233 90 L 227 92 L 224 98 L 221 92 L 215 90 L 221 88 Z" fill="#FACC15" />
    </svg>
  `;
}

// ==========================================
// POSE 4: Studying / Learning at Desk
// ==========================================
function generateStudyingSVG() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="512" height="512">
      ${getCommonDefs()}
      <defs>
        <linearGradient id="woodDesk" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#D97706" />
          <stop offset="100%" stop-color="#92400E" />
        </linearGradient>
      </defs>

      <!-- Head slightly focused -->
      ${getShibaHead({ cx: 128, cy: 92, eyeState: 'open', mouthState: 'open_happy' })}

      <!-- Yukata Torso behind desk -->
      <path d="M 86 142 L 68 185 L 188 185 L 170 142 Z" fill="url(#yukataNavy)" stroke="#0F172A" stroke-width="2" />
      ${getSakuraCrest(148, 156, 1)}

      <!-- Wooden Study Desk -->
      <g>
        <polygon points="28,185 228,185 242,215 14,215" fill="url(#woodDesk)" stroke="#78350F" stroke-width="2" />
        <rect x="14" y="215" width="228" height="28" rx="2" fill="#78350F" />
      </g>

      <!-- Open Notebook on desk -->
      <g transform="translate(90, 178)">
        <rect x="0" y="0" width="76" height="32" rx="3" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2" />
        <line x1="38" y1="0" x2="38" y2="32" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="2,2" />
        <!-- Lined notes -->
        <line x1="6" y1="8" x2="32" y2="8" stroke="#E2E8F0" stroke-width="1.5" />
        <line x1="6" y1="16" x2="32" y2="16" stroke="#E2E8F0" stroke-width="1.5" />
        <line x1="6" y1="24" x2="28" y2="24" stroke="#E2E8F0" stroke-width="1.5" />
        <line x1="44" y1="8" x2="70" y2="8" stroke="#E2E8F0" stroke-width="1.5" />
        <line x1="44" y1="16" x2="70" y2="16" stroke="#E2E8F0" stroke-width="1.5" />
      </g>

      <!-- Paws resting on desk with green pencil -->
      <ellipse cx="82" cy="192" rx="10" ry="7" fill="url(#creamFur)" stroke="#D97706" stroke-width="1.5" />

      <!-- Right paw holding green pencil -->
      <g transform="translate(162, 185) rotate(-35)">
        <rect x="-3" y="-18" width="6" height="24" rx="1" fill="#10B981" stroke="#047857" stroke-width="1" />
        <polygon points="-3,-18 3,-18 0,-26" fill="#FACC15" />
        <polygon points="-1,-23 1,-23 0,-26" fill="#1E293B" />
        <ellipse cx="0" cy="0" rx="10" ry="8" fill="url(#creamFur)" stroke="#D97706" stroke-width="1.5" />
      </g>
    </svg>
  `;
}

// ==========================================
// POSE 5: Listening with Red & Pink Headphones
// ==========================================
function generateListeningSVG() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="512" height="512">
      ${getCommonDefs()}
      <ellipse cx="128" cy="242" rx="68" ry="10" fill="#020617" opacity="0.25" />
      ${getYukataBody({ cx: 128, cy: 175 })}
      ${getRedBook(46, 142, 1, -10)}
      <ellipse cx="64" cy="178" rx="8" ry="6" fill="url(#creamFur)" stroke="#D97706" stroke-width="1.5" />

      <!-- Head with serene closed eyes & happy smile -->
      ${getShibaHead({ cx: 128, cy: 96, eyeState: 'closed', mouthState: 'peaceful_smile' })}

      <!-- Red & Pink Over-Ear Headphones -->
      <g>
        <!-- Silver Headband Arch -->
        <path d="M 64 88 C 64 36, 192 36, 192 88" fill="none" stroke="#94A3B8" stroke-width="6" stroke-linecap="round" />
        <path d="M 64 88 C 64 36, 192 36, 192 88" fill="none" stroke="#E2E8F0" stroke-width="3" stroke-linecap="round" />

        <!-- Left Ear Cushion (Red / Coral) -->
        <g transform="translate(60, 92) rotate(15)">
          <rect x="-12" y="-20" width="24" height="40" rx="12" fill="#E11D48" stroke="#881337" stroke-width="2" />
          <ellipse cx="0" cy="0" rx="8" ry="15" fill="#FDA4AF" />
        </g>

        <!-- Right Ear Cushion (Red / Coral) -->
        <g transform="translate(196, 92) rotate(-15)">
          <rect x="-12" y="-20" width="24" height="40" rx="12" fill="#E11D48" stroke="#881337" stroke-width="2" />
          <ellipse cx="0" cy="0" rx="8" ry="15" fill="#FDA4AF" />
        </g>
      </g>

      <!-- Floating Pink Music Notes ♫ ♪ -->
      <g fill="#F43F5E">
        <path d="M 38 68 Q 44 60 48 64 L 48 54 Q 54 52 58 54 L 58 64 A 4 4 0 1 1 54 67 L 54 58 L 44 60 L 44 68 A 4 4 0 1 1 38 68 Z" />
        <path d="M 214 62 A 4 4 0 1 1 210 65 L 210 52 L 222 49 L 222 56 L 214 58 Z" />
        <circle cx="228" cy="74" r="2.5" fill="#FDA4AF" />
      </g>
    </svg>
  `;
}

// ==========================================
// POSE 6: Thinking / Curious with Question Mark
// ==========================================
function generateThinkingSVG() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="512" height="512">
      ${getCommonDefs()}
      <ellipse cx="128" cy="242" rx="68" ry="10" fill="#020617" opacity="0.25" />
      ${getYukataBody({ cx: 128, cy: 175 })}

      <!-- Head tilted curiously -->
      ${getShibaHead({ cx: 128, cy: 96, eyeState: 'curious', mouthState: 'curious', tilt: -5 })}

      <!-- Paw resting on chin thoughtfully -->
      <g transform="translate(142, 132)">
        <path d="M 12 28 L 2 -4 C 1 -10, -8 -10, -7 -2 L 2 34 Z" fill="url(#yukataNavy)" stroke="#0F172A" stroke-width="1.5" />
        <ellipse cx="-2" cy="-6" rx="9" ry="8" fill="url(#creamFur)" stroke="#D97706" stroke-width="1.5" />
      </g>

      <!-- Big Cute Blue Question Mark ? Floating Above -->
      <g transform="translate(196, 44)">
        <path d="M 6 0 C 18 0, 26 8, 26 18 C 26 26, 18 30, 15 36 C 13 40, 13 44, 13 48"
          fill="none" stroke="#3B82F6" stroke-width="6.5" stroke-linecap="round"
        />
        <circle cx="13" cy="59" r="4.5" fill="#3B82F6" />
      </g>
    </svg>
  `;
}

// ==========================================
// POSE 7: Walking with Navy Backpack
// ==========================================
function generateWalkingSVG() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="512" height="512">
      ${getCommonDefs()}
      <ellipse cx="128" cy="244" rx="72" ry="10" fill="#020617" opacity="0.25" />

      <!-- Cute Navy Backpack behind -->
      <rect x="74" y="146" width="28" height="42" rx="8" fill="#1E293B" stroke="#0F172A" stroke-width="2" />
      <path d="M 88 146 L 88 188" stroke="#475569" stroke-width="1.5" />

      <!-- Energetic Walking Legs -->
      <g id="walking-legs">
        <!-- Back leg -->
        <ellipse cx="106" cy="226" rx="12" ry="8" fill="url(#creamFur)" stroke="#D97706" stroke-width="2" />
        <!-- Front stepping leg -->
        <ellipse cx="148" cy="224" rx="14" ry="9" fill="url(#creamFur)" stroke="#D97706" stroke-width="2" />
      </g>

      <!-- Yukata Torso in motion -->
      <path d="M 94 155 L 82 205 L 168 205 L 158 155 Z" fill="url(#yukataNavy)" stroke="#0F172A" stroke-width="2" />
      <!-- Backpack straps -->
      <path d="M 100 156 L 104 195" stroke="#64748B" stroke-width="4" stroke-linecap="round" />
      <!-- Sakura Crest -->
      ${getSakuraCrest(142, 172, 1.1)}
      <!-- Red Obi -->
      <rect x="84" y="185" width="84" height="12" rx="3" fill="url(#obiRed)" stroke="#7F1D1D" stroke-width="1" />

      <!-- Head smiling forward -->
      ${getShibaHead({ cx: 128, cy: 96, eyeState: 'open', mouthState: 'open_happy' })}
    </svg>
  `;
}

// ==========================================
// POSE 8: Holding Red Flag "がんばろう！"
// ==========================================
function generateFlagSVG() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="512" height="512">
      ${getCommonDefs()}
      <ellipse cx="128" cy="242" rx="68" ry="10" fill="#020617" opacity="0.25" />
      ${getYukataBody({ cx: 128, cy: 175 })}

      <!-- Head winking encouragingly -->
      ${getShibaHead({ cx: 128, cy: 96, eyeState: 'wink', mouthState: 'open_happy' })}

      <!-- Left Paw holding Flag Pole -->
      <g>
        <!-- Wood Flag Pole -->
        <rect x="180" y="70" width="5" height="135" rx="2" fill="#D97706" stroke="#78350F" stroke-width="0.8" />
        <circle cx="182.5" cy="70" r="4" fill="#F59E0B" />

        <!-- Red Triangular Pennant Flag: がんばろう！ -->
        <path d="M 185 74 L 248 94 L 185 118 Z" fill="url(#obiRed)" stroke="#7F1D1D" stroke-width="1.5" />
        <text x="214" y="98" font-family="sans-serif" font-size="8" font-weight="900" fill="#FFFFFF" text-anchor="middle">がんばろう！</text>

        <!-- Paw gripping pole -->
        <ellipse cx="182" cy="155" rx="8" ry="7" fill="url(#creamFur)" stroke="#D97706" stroke-width="1.5" />
      </g>
    </svg>
  `;
}

// ==========================================
// POSE 9: Sitting Reading Red Book
// ==========================================
function generateReadingSVG() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="512" height="512">
      ${getCommonDefs()}
      <ellipse cx="128" cy="240" rx="76" ry="12" fill="#020617" opacity="0.25" />

      <!-- Sitting Cross-Legged Body -->
      <path d="M 78 165 C 64 195, 60 225, 88 230 C 114 234, 142 234, 168 230 C 196 225, 192 195, 178 165 Z" fill="url(#yukataNavy)" stroke="#0F172A" stroke-width="2" />
      <!-- Crossed Feet Paws at bottom -->
      <ellipse cx="88" cy="226" rx="14" ry="9" fill="url(#creamFur)" stroke="#D97706" stroke-width="2" />
      <ellipse cx="168" cy="226" rx="14" ry="9" fill="url(#creamFur)" stroke="#D97706" stroke-width="2" />

      <!-- Open Red Book held in both paws -->
      <g transform="translate(86, 175)">
        <!-- Red Cover -->
        <rect x="0" y="4" width="84" height="42" rx="4" fill="url(#obiRed)" stroke="#7F1D1D" stroke-width="1.5" />
        <!-- White Open Pages -->
        <rect x="4" y="2" width="76" height="38" rx="2" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
        <line x1="42" y1="2" x2="42" y2="40" stroke="#94A3B8" stroke-width="2" />
        <text x="22" y="22" font-family="sans-serif" font-size="8" font-weight="900" fill="#0F172A" text-anchor="middle">日本語</text>
        <text x="62" y="22" font-family="sans-serif" font-size="8" font-weight="900" fill="#0F172A" text-anchor="middle">学ぼう</text>
      </g>

      <!-- Head smiling down at book -->
      ${getShibaHead({ cx: 128, cy: 104, eyeState: 'open', mouthState: 'open_happy' })}
    </svg>
  `;
}

// Compile all SVGs to PNG files
const poses = [
  { name: 'mascot.png', svg: generateMainWavingSVG() },
  { name: 'mascot_original.png', svg: generateMainWavingSVG() },
  { name: 'shiba_waving.png', svg: generateMainWavingSVG() },
  { name: 'shiba_winking.png', svg: generateWinkingSVG() },
  { name: 'shiba_cheering.png', svg: generateCheeringSVG() },
  { name: 'shiba_studying.png', svg: generateStudyingSVG() },
  { name: 'shiba_listening.png', svg: generateListeningSVG() },
  { name: 'shiba_thinking.png', svg: generateThinkingSVG() },
  { name: 'shiba_walking.png', svg: generateWalkingSVG() },
  { name: 'shiba_flag.png', svg: generateFlagSVG() },
  { name: 'shiba_reading.png', svg: generateReadingSVG() },
  { name: 'mascot.svg', rawSvg: generateMainWavingSVG() }
];

console.log('Generating official Nihon Shiba mascot assets with standard XML stop-color...');

const rootPublic = path.join(__dirname, '..', 'public');

for (const pose of poses) {
  if (pose.rawSvg) {
    fs.writeFileSync(path.join(OUTPUT_DIR, pose.name), pose.rawSvg);
    console.log(`Saved SVG: ${pose.name}`);
    continue;
  }

  const tmpSvg = `/tmp/${pose.name}.svg`;
  const outPng = path.join(OUTPUT_DIR, pose.name);
  fs.writeFileSync(tmpSvg, pose.svg);

  try {
    execSync(`rsvg-convert -w 512 -h 512 "${tmpSvg}" -o "${outPng}"`);
    console.log(`Rendered PNG: ${pose.name} (${fs.statSync(outPng).size} bytes)`);
  } catch (err) {
    console.error(`Error rendering ${pose.name}:`, err.message);
  }
}

// Ensure /public/image.png exists and matches mascot.png
try {
  fs.copyFileSync(path.join(OUTPUT_DIR, 'mascot.png'), path.join(rootPublic, 'image.png'));
  console.log('Copied mascot.png to /public/image.png');
} catch (e) {
  console.log('Copy image.png error:', e.message);
}

console.log('All Nihon Shiba mascot assets generated successfully with full colors!');
