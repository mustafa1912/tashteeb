/**
 * Core configuration constants for the Tashteeb Calculation Engine.
 * Pure JavaScript — shared by client, Nitro server routes, and Vitest unit tests.
 */

export const CATEGORIES = [
  { key: 'floors', label_en: 'Floors', label_ar: 'الأرضيات والسيراميك', budgetWeight: 0.22, color: '#D8572A', colorClass: 'text-terracotta', bgClass: 'bg-terracotta', icon: 'Grid' },
  { key: 'kitchen', label_en: 'Kitchen', label_ar: 'المطبخ', budgetWeight: 0.18, color: '#7DBE9A', colorClass: 'text-sage', bgClass: 'bg-sage', icon: 'UtensilsCrossed' },
  { key: 'bathrooms', label_en: 'Bathrooms & sanitary', label_ar: 'الحمامات والصحي', budgetWeight: 0.14, color: '#12394A', colorClass: 'text-navy', bgClass: 'bg-navy', icon: 'Bath' },
  { key: 'walls', label_en: 'Walls & paint', label_ar: 'الحوائط والدهانات', budgetWeight: 0.12, color: '#F4B223', colorClass: 'text-saffron', bgClass: 'bg-saffron', icon: 'Paintbrush' },
  { key: 'electrical', label_en: 'Electrical', label_ar: 'الكهرباء والتأسيس', budgetWeight: 0.10, color: '#A58FD6', colorClass: 'text-lilac', bgClass: 'bg-lilac', icon: 'Zap' },
  { key: 'plumbing', label_en: 'Plumbing', label_ar: 'السباكة والعزل', budgetWeight: 0.09, color: '#0F5C6E', colorClass: 'text-teal', bgClass: 'bg-teal', icon: 'Droplet' },
  { key: 'doors', label_en: 'Doors & windows', label_ar: 'الأبواب والشبابيك', budgetWeight: 0.09, color: '#E8A598', colorClass: 'text-clay', bgClass: 'bg-clay', icon: 'DoorClosed' },
  { key: 'ceilings', label_en: 'Ceilings', label_ar: 'الأسقف والجبس بورد', budgetWeight: 0.06, color: '#6FB1D9', colorClass: 'text-sky', bgClass: 'bg-sky', icon: 'Maximize' },
  { key: 'raw_materials', label_en: 'Raw construction materials', label_ar: 'الخامات ومواد البناء الأولية', budgetWeight: 0.00, color: '#8C999F', colorClass: 'text-ink-secondary', bgClass: 'bg-sand', icon: 'Layers' }
]

export const PACKAGES = {
  economy: {
    key: 'economy',
    label_en: 'Economy',
    label_ar: 'اقتصادي (Economy)',
    approxPerSqm: 3150,
    colorTheme: 'sage',
    colorHex: '#7DBE9A',
    bgTint: '#F3F9F5',
    image: '/images/rooms/room-economy.svg',
    badge_en: 'PRACTICAL VALUE',
    badge_ar: 'قيمة عملية',
    desc_en: 'Durable local ceramics, GLC acrylic paint, El Sewedy core wiring, and Lecico sanitary ware — ideal for rentals or starter budgets.',
    desc_ar: 'سيراميك فرز أول محلي، دهانات أكريليك عملية، تأسيس سلوك السويدي، وأطقم ليسيكو — مثالي للاستثمار الإيجاري والميزانيات المحددة.'
  },
  standard: {
    key: 'standard',
    label_en: 'Standard',
    label_ar: 'قياسي متكامل (Standard)',
    approxPerSqm: 4040,
    colorTheme: 'saffron',
    colorHex: '#F4B223',
    bgTint: '#FEF8EC',
    image: '/images/rooms/room-standard.svg',
    badge_en: 'MOST CHOSEN',
    badge_ar: 'الأكثر اختياراً',
    desc_en: 'Cleopatra 60×60 porcelain, Jotun washable paint, shadow-gap gypsum ceilings, engineered veneer doors, and Duravit/Grohe bathrooms.',
    desc_ar: 'بورسلين كليوباترا 60×60، دهانات جوتن قابلة للغسيل، جبس بورد ببيت نور، أبواب قشرة هندسية، وحمامات ديورافيت وجروهي.'
  },
  super_lux: {
    key: 'super_lux',
    label_en: 'Super Lux',
    label_ar: 'سوبر لوكس فاخر (Super Lux)',
    approxPerSqm: 5580,
    colorTheme: 'navy',
    colorHex: '#12394A',
    accentHex: '#F4B223',
    bgTint: '#EBF1F4',
    image: '/images/rooms/room-superlux.svg',
    badge_en: 'ARCHITECTURAL GRADE',
    badge_ar: 'تشطيب فندقي',
    desc_en: 'Large-format marble & HDF parquet, Jotun Wonderwall velvet finishes, moisture-rated cove ceilings, Schneider modular, and concealed Grohe.',
    desc_ar: 'رخام وأرضيات باركيه HDF، دهانات جوتن مخملية وديكورية، أسقف معلقة مقاومة للرطوبة، مفاتيح شنايدر، وصحي دفن جروهي.'
  }
}

export const GOVERNORATES = [
  { code: 'cairo', label_en: 'Cairo', label_ar: 'القاهرة', factor: 1.0 },
  { code: 'giza', label_en: 'Giza', label_ar: 'الجيزة', factor: 1.0 },
  { code: 'alexandria', label_en: 'Alexandria', label_ar: 'الإسكندرية', factor: 0.98 },
  { code: 'qalyubia', label_en: 'Qalyubia', label_ar: 'القليوبية', factor: 0.98 },
  { code: 'dakahlia', label_en: 'Dakahlia', label_ar: 'الدقهلية', factor: 0.95 },
  { code: 'sharqia', label_en: 'Sharqia', label_ar: 'الشرقية', factor: 0.95 },
  { code: 'gharbia', label_en: 'Gharbia', label_ar: 'الغربية', factor: 0.95 },
  { code: 'port_said', label_en: 'Port Said', label_ar: 'بورسعيد', factor: 0.99 },
  { code: 'suez', label_en: 'Suez', label_ar: 'السويس', factor: 0.99 },
  { code: 'ismailia', label_en: 'Ismailia', label_ar: 'الإسماعيلية', factor: 0.97 },
  { code: 'assiut', label_en: 'Assiut', label_ar: 'أسيوط', factor: 0.93 },
  { code: 'luxor', label_en: 'Luxor', label_ar: 'الأقصر', factor: 0.96 },
  { code: 'aswan', label_en: 'Aswan', label_ar: 'أسوان', factor: 0.97 },
  { code: 'red_sea', label_en: 'Red Sea', label_ar: 'البحر الأحمر', factor: 1.08 },
  { code: 'south_sinai', label_en: 'South Sinai', label_ar: 'جنوب سيناء', factor: 1.10 }
]

export const UNIT_TYPES = [
  { code: 'apartment', label_en: 'Apartment', label_ar: 'شقة سكنية', heightFactor: 1.0 },
  { code: 'duplex', label_en: 'Duplex', label_ar: 'دوبلكس', heightFactor: 1.05 },
  { code: 'villa', label_en: 'Standalone / Townhouse', label_ar: 'فيلا / تاون هاوس', heightFactor: 1.08 },
  { code: 'shop', label_en: 'Commercial / Office', label_ar: 'مكتب / محل تجاري', heightFactor: 1.10 }
]

export const AREA_RULES = {
  ceilingHeight: 2.8,
  doorOpeningSqm: 2.0,
  windowOpeningSqm: 1.5,
  paintCoats: 2,
  paintCoveragePerBucket: 110, // m2 per coat per 18L bucket
  paintWastePct: 0.05
}

export const ROOM_POINTS_CONFIG = {
  electrical: {
    bedroom: 8,
    reception: 10,
    bathroom: 4,
    kitchen: 10,
    balcony: 2,
    corridorBase: 6
  },
  plumbing: {
    bathroom: 7,
    kitchen: 4
  }
}

export const EXTRAS_CATALOG = [
  {
    key: 'central_ac',
    label_en: 'Concealed / Split AC piping & drainage',
    label_ar: 'تأسيس مواسير وصرف التكييفات النحاس',
    desc_en: 'Muller copper piping, Armaflex insulation & concealed condensate drains for all rooms.',
    desc_ar: 'مواسير نحاس مولر مع العزل وصرف التكييفات المخفي لجميع الغرف والريسبشن.',
    unit_price: 6800,
    labour_price: 1700,
    qtyFromApartment: apt => Math.max(2, (Number(apt.bedrooms) || 2) + (Number(apt.reception) || 1)),
    sale_unit: 'point',
    sale_unit_ar: 'نقطة تكييف'
  },
  {
    key: 'smart_home',
    label_en: 'Smart lighting & shutter control pack',
    label_ar: 'باقة التحكم الذكي في الإضاءة والشتر',
    desc_en: 'Neutral-wire smart relays, Wi-Fi/Zigbee hub, scene switches & app setup.',
    desc_ar: 'ريليهات ذكية للإضاءة والشتر مع سنترال تحكم وتطبيق الموبايل.',
    unit_price: 28500,
    labour_price: 6500,
    qtyFromApartment: () => 1,
    sale_unit: 'set',
    sale_unit_ar: 'مجموعة'
  },
  {
    key: 'ready_kitchen',
    label_en: 'Custom HPL / Acrylic kitchen cabinets',
    label_ar: 'وحدات مطبخ HPL / أكريليك جاهزة التركيب',
    desc_en: 'Moisture-resistant MDF core, soft-close Blum hinges, upper & lower units.',
    desc_ar: 'علب مطبخ علوية وسفلية مقاومة للرطوبة بمفصلات بلوم هادئة الغلق.',
    unit_price: 8900,
    labour_price: 1400,
    qtyFromApartment: apt => Math.max(4, Math.round((Number(apt.area) || 120) * 0.055)),
    sale_unit: 'meter',
    sale_unit_ar: 'متر طولي'
  },
  {
    key: 'waste_removal',
    label_en: 'Debris hauling & site dumpsters',
    label_ar: 'نقل المخلفات والردش وتوريد الرمل والأسمنت الأولي',
    desc_en: 'Scheduled rubble removal trucks, bags, and building management clearance.',
    desc_ar: 'سيارات رفع المخلفات والشكائر وتصاريح النقل طوال فترة التشطيب.',
    unit_price: 3200,
    labour_price: 1300,
    qtyFromApartment: apt => Math.max(2, Math.ceil((Number(apt.area) || 120) / 45)),
    sale_unit: 'trip',
    sale_unit_ar: 'نقلة'
  },
  {
    key: 'final_cleaning',
    label_en: 'Deep post-construction handover cleaning',
    label_ar: 'نظافة عميقة وتلميع نهائي قبل التسليم',
    desc_en: 'Industrial floor scrubbing, paint-spot removal, window track detailing & sanitization.',
    desc_ar: 'جلي وتلميع الأرضيات وإزالة بقع الدهانات وتنظيف مسارات الألوميتال والتعقيم.',
    unit_price: 55,
    labour_price: 25,
    qtyFromApartment: apt => Math.max(50, Math.round(Number(apt.area) || 120)),
    sale_unit: 'm2',
    sale_unit_ar: 'م²'
  }
]

export function getGovernorateFactor(code = 'cairo') {
  const found = GOVERNORATES.find(g => g.code === code)
  return found ? found.factor : 1.0
}
