import fs from 'node:fs'

const catalogPath = 'utils/calc/catalog.js'
let content = fs.readFileSync(catalogPath, 'utf8')

const VISUAL_MAP = {
  'mat-cel-eco': { image_url: '/images/materials/gypsum-ceiling.svg', thumb_url: '/images/materials/gypsum-ceiling.svg', swatch_color: '#F8F5EE', pattern: null },
  'mat-cel-std': { image_url: '/images/materials/gypsum-ceiling.svg', thumb_url: '/images/materials/gypsum-ceiling.svg', swatch_color: '#FFEAA7', pattern: null },
  'mat-cel-lux': { image_url: '/images/materials/gypsum-ceiling.svg', thumb_url: '/images/materials/gypsum-ceiling.svg', swatch_color: '#7DBE9A', pattern: null },

  'mat-elc-eco': { image_url: '/images/materials/wire-elsewedy.svg', thumb_url: '/images/materials/wire-elsewedy.svg', swatch_color: '#D8572A', pattern: null },
  'mat-elc-std': { image_url: '/images/materials/switches-schneider.svg', thumb_url: '/images/materials/switches-schneider.svg', swatch_color: '#12394A', pattern: null },
  'mat-elc-lux': { image_url: '/images/materials/switches-schneider.svg', thumb_url: '/images/materials/switches-schneider.svg', swatch_color: '#F4B223', pattern: null },

  'mat-bth-eco': { image_url: '/images/materials/sanitary-duravit.svg', thumb_url: '/images/materials/sanitary-duravit.svg', swatch_color: '#C4CCD0', pattern: null },
  'mat-bth-std': { image_url: '/images/materials/sanitary-duravit.svg', thumb_url: '/images/materials/sanitary-duravit.svg', swatch_color: '#0F5C6E', pattern: null },
  'mat-bth-lux': { image_url: '/images/materials/sanitary-duravit.svg', thumb_url: '/images/materials/sanitary-duravit.svg', swatch_color: '#12394A', pattern: null },

  'mat-mkt-cement': { image_url: '/images/materials/cement-portland.svg', thumb_url: '/images/materials/cement-portland.svg', swatch_color: '#C8B39B', pattern: null },
  'mat-mkt-wire3mm': { image_url: '/images/materials/wire-elsewedy.svg', thumb_url: '/images/materials/wire-elsewedy.svg', swatch_color: '#D8572A', pattern: null },
  'mat-mkt-paint-sqm': { image_url: '/images/materials/paint-jotun.svg', thumb_url: '/images/materials/paint-jotun.svg', swatch_color: '#6FB1D9', pattern: null },
  'mat-mkt-gypsum-board': { image_url: '/images/materials/gypsum-ceiling.svg', thumb_url: '/images/materials/gypsum-ceiling.svg', swatch_color: '#F8F5EE', pattern: null }
}

for (const [id, meta] of Object.entries(VISUAL_MAP)) {
  const target = `id: '${id}',`
  const injection = `id: '${id}',
    image_url: '${meta.image_url}',
    thumb_url: '${meta.thumb_url}',
    swatch_color: '${meta.swatch_color}',
    pattern: ${meta.pattern ? `'${meta.pattern}'` : 'null'},`

  content = content.replace(target, injection)
}

fs.writeFileSync(catalogPath, content, 'utf8')
console.log('Successfully completed injecting all visual fields into utils/calc/catalog.js')
