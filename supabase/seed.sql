-- ============================================================================
-- Tashteeb (تشطيب) — Initial Reference Seed Data
-- ============================================================================

insert into public.governorate_factors (code, label_en, label_ar, factor) values
  ('cairo', 'Cairo', 'القاهرة', 1.00),
  ('giza', 'Giza', 'الجيزة', 1.00),
  ('alexandria', 'Alexandria', 'الإسكندرية', 0.98),
  ('qalyubia', 'Qalyubia', 'القليوبية', 0.98),
  ('dakahlia', 'Dakahlia', 'الدقهلية', 0.95),
  ('sharqia', 'Sharqia', 'الشرقية', 0.95),
  ('gharbia', 'Gharbia', 'الغربية', 0.95),
  ('port_said', 'Port Said', 'بورسعيد', 0.99),
  ('suez', 'Suez', 'السويس', 0.99),
  ('ismailia', 'Ismailia', 'الإسماعيلية', 0.97),
  ('assiut', 'Assiut', 'أسيوط', 0.93),
  ('luxor', 'Luxor', 'الأقصر', 0.96),
  ('aswan', 'Aswan', 'أسوان', 0.97),
  ('red_sea', 'Red Sea', 'البحر الأحمر', 1.08),
  ('south_sinai', 'South Sinai', 'جنوب سيناء', 1.10)
on conflict (code) do update set factor = excluded.factor;

insert into public.materials (slug, category, tier, is_calculator_item, calc_mode, label_en, label_ar, brand, unit, unit_ar, sale_unit, sale_unit_ar, coverage_per_unit, waste_pct, labour_price)
values
  ('ceramic-floor-tiles-cleopatra-45x45', 'floors', 'economy', true, 'coverage', 'Ceramic floor tiles 45x45 (Grade A)', 'سيراميك أرضيات كليوباترا 45×45 فرز أول', 'Cleopatra', 'm²', 'م²', 'carton', 'كرتونة', 1.500, 0.100, 165),
  ('porcelain-60x60-cleopatra', 'floors', 'standard', true, 'coverage', 'Porcelain 60x60 laser-cut (Cleopatra)', 'بورسلين كليوباترا 60×60 قطع ليزر', 'Cleopatra Group', 'm²', 'م²', 'carton', 'كرتونة', 1.440, 0.100, 220),
  ('imported-marble-slabs-crema-marfil', 'floors', 'super_lux', true, 'coverage', 'Polished marble slabs (Galala Extra / Crema)', 'رخام ألواح مصقول (جلالة إكسترا / كريما)', 'Shaq El Thoaban', 'm²', 'م²', 'm2', 'م²', 1.000, 0.120, 340),
  ('jotun-fenomastic-my-home-rich-matt-18l', 'walls', 'standard', true, 'paint_buckets', 'Jotun Fenomastic Washable Silk/Matt (18L)', 'جوتن فينوماستيك قابل للغسيل (بستلة 18 لتر)', 'Jotun Egypt', 'bucket', 'بستلة 18 لتر', 'bucket', 'بستلة', 110.000, 0.050, 82),
  ('knauf-gypsum-board-shadow-gap', 'ceilings', 'standard', true, 'coverage', 'Knauf gypsum board + shadow gap & hidden LED', 'جبس بورد كناوف أبيض وأخضر مع بيت نور وشادو جاب', 'Knauf Egypt', 'm²', 'م²', 'm2', 'م²', 1.000, 0.080, 65),
  ('elsewedy-wiring-venus-switches-abb-panel', 'electrical', 'standard', true, 'coverage', 'El Sewedy 2/3/4mm + Venus switches + ABB panel', 'سلوك السويدي 2-4 مم + مفاتيح فينوس + لوحة قواطع ABB', 'El Sewedy / ABB', 'point', 'نقطة', 'point', 'نقطة', 1.000, 0.000, 195),
  ('banninger-german-ppr-kassel-sika-point', 'plumbing', 'standard', true, 'coverage', 'Banninger German PPR + Kassel UPVC + Sika 107', 'تغذية باننجر ألماني + صرف كاسيل + عزل سيكا 107', 'Banninger / Sika', 'point', 'نقطة', 'point', 'نقطة', 1.000, 0.000, 620),
  ('engineered-wood-veneer-doors-tango-double', 'doors', 'standard', true, 'coverage', 'Engineered wood veneer door + Ahram lockset', 'أبواب خشب هندسي قشرة أرو شاملة البرور والكوالين', 'Art Wood', 'door', 'باب شامل', 'piece', 'قطعة', 1.000, 0.000, 850),
  ('portland-cement-cem-i-42-5n-ton', 'raw_materials', 'standard', false, 'coverage', 'Portland Cement CEM I 42.5N (Suez / Lafarge)', 'أسمنت بورتلاندي عادي 42.5 (السويس / لافارج)', 'Suez / Lafarge', 'ton', 'طن', 'ton', 'طن', 1.000, 0.030, 0)
on conflict (slug) do nothing;
