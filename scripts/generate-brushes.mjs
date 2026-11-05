import fs from 'node:fs'
import path from 'node:path'

const publicDir = 'public/brush'
const assetsDir = 'assets/brush'
fs.mkdirSync(publicDir, { recursive: true })
fs.mkdirSync(assetsDir, { recursive: true })

const BRUSHES = {
  // 1. Wide horizontal brush stroke (for image masks and large backgrounds)
  'stroke-wide.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 280" preserveAspectRatio="none">
  <path fill="#000" d="M25,120 C50,70 120,40 230,32 C370,22 550,25 720,38 C810,45 870,68 885,110 C895,140 865,185 790,215 C700,250 540,258 380,254 C240,250 115,232 55,200 C15,178 8,150 25,120 Z 
  M60,95 C140,55 320,42 530,46 C710,50 820,72 855,108 C875,130 840,170 760,198 C660,232 500,238 340,234 C190,230 90,208 58,175 C40,155 42,120 60,95 Z
  M12,128 Q45,72 150,55 Q350,30 600,42 Q820,52 878,118 Q890,175 750,222 Q520,255 240,248 Q70,230 12,128 Z" />
</svg>`,

  // 2. Rough-edge underline (for headline key words)
  'stroke-underline.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" preserveAspectRatio="none">
  <path fill="#000" d="M6,34 C35,16 95,12 170,10 C250,8 330,12 385,22 C398,24 396,36 380,42 C330,52 245,54 165,52 C90,50 30,46 10,42 C2,40 2,36 6,34 Z
  M20,28 C80,18 180,14 280,16 C340,18 380,24 390,32 C385,38 340,46 270,48 C180,50 90,46 30,38 C14,35 12,30 20,28 Z" />
</svg>`,

  // 3. Painterly dab / blob (for circular photo masks & badges)
  'stroke-dab.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
  <path fill="#000" d="M150,20 C220,15 285,55 300,120 C315,185 285,255 230,290 C175,325 95,315 45,265 C-5,215 -10,135 25,75 C60,15 110,22 150,20 Z
  M160,35 C230,32 280,75 285,140 C290,205 250,270 190,285 C130,300 70,280 40,230 C10,180 20,110 65,60 C100,25 135,36 160,35 Z" />
</svg>`,

  // 4. Roller stripe (cleaner edges with bristle texture at edges)
  'stroke-roller.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 120" preserveAspectRatio="none">
  <path fill="#000" d="M5,22 C30,18 90,16 180,15 C320,14 460,16 575,20 C595,21 598,32 595,55 C592,80 595,98 578,102 C470,106 320,105 180,104 C90,103 25,100 8,95 C-2,90 -2,30 5,22 Z
  M15,28 C120,22 300,20 480,22 C560,24 585,30 588,60 C585,90 550,96 460,98 C300,100 120,98 25,92 C8,88 8,35 15,28 Z" />
</svg>`,

  // 5. Paint splatter spray (decorative accents)
  'stroke-splatter.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="95" cy="95" r="42" fill="#000"/>
  <circle cx="160" cy="70" r="14" fill="#000"/>
  <circle cx="140" cy="140" r="18" fill="#000"/>
  <circle cx="65" cy="155" r="12" fill="#000"/>
  <circle cx="45" cy="65" r="16" fill="#000"/>
  <circle cx="178" cy="115" r="8" fill="#000"/>
  <circle cx="118" cy="175" r="9" fill="#000"/>
  <circle cx="28" cy="120" r="7" fill="#000"/>
  <circle cx="108" cy="28" r="8" fill="#000"/>
  <circle cx="185" cy="45" r="5" fill="#000"/>
  <circle cx="35" cy="180" r="6" fill="#000"/>
</svg>`,

  // 6. Torn paint edge / divider (horizontal tileable section divider)
  'stroke-tear.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 80" preserveAspectRatio="none">
  <path fill="#000" d="M0,0 L1200,0 L1200,45 C1150,55 1110,38 1060,52 C1010,65 970,42 920,58 C870,72 820,40 760,56 C700,70 650,44 590,62 C530,78 480,48 420,58 C360,68 310,40 250,55 C190,70 140,46 80,60 C40,68 20,45 0,52 Z" />
</svg>`,

  // 7. Paint drop (vertical dripping drop)
  'stroke-drop.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180">
  <path fill="#000" d="M60,10 C60,10 20,70 20,115 C20,145 38,170 60,170 C82,170 100,145 100,115 C100,70 60,10 60,10 Z" />
</svg>`,

  // 8. Hand-painted swatch border (for cards & frame borders)
  'stroke-swatch.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" preserveAspectRatio="none">
  <path fill="#000" d="M28,18 C90,12 240,10 365,16 C388,18 392,30 390,68 C388,150 392,280 386,360 C384,386 370,392 335,390 C250,388 120,392 42,386 C18,384 10,370 12,330 C16,240 10,120 16,50 C18,24 22,18 28,18 Z
  M40,32 C32,75 30,220 34,350 C36,368 50,372 85,372 C170,372 290,370 360,372 C372,372 374,360 372,330 C370,220 372,85 368,40 C366,28 355,26 310,26 C220,26 90,28 40,32 Z" />
</svg>`,

  // 9. Painterly oval badge stroke
  'stroke-oval.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 240" preserveAspectRatio="none">
  <path fill="#000" d="M70,120 C70,60 140,25 250,22 C360,20 430,55 435,115 C440,180 370,218 255,220 C140,222 68,185 70,120 Z
  M90,120 C88,165 145,200 250,198 C350,196 410,165 412,120 C410,75 350,45 250,44 C150,44 92,72 90,120 Z" />
</svg>`,

  // 10. Artisan plaster corner motif
  'stroke-corner.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
  <path fill="#000" d="M10,10 L150,10 C150,10 140,40 100,50 C70,58 58,70 50,100 C40,140 10,150 10,150 Z" />
</svg>`
}

for (const [name, content] of Object.entries(BRUSHES)) {
  fs.writeFileSync(path.join(publicDir, name), content.trim(), 'utf8')
  fs.writeFileSync(path.join(assetsDir, name), content.trim(), 'utf8')
}

console.log('Successfully generated 10 organic brush stroke SVGs in public/brush & assets/brush')

