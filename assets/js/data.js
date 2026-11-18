/* Catálogo PULSO. Las imágenes viven en assets/img/products/{id}--{color}--{vista}.svg */
window.PULSO_COLORS = {
  cobalto: { name: 'Cobalto', hex: '#2C46B5' },
  tinta: { name: 'Tinta', hex: '#141A3D' },
  cal: { name: 'Cal', hex: '#F1F2F4' },
  pista: { name: 'Pista', hex: '#E5532E' },
  senal: { name: 'Señal', hex: '#FFE14D' },
  hielo: { name: 'Hielo', hex: '#C9D4FF' },
  grafito: { name: 'Grafito', hex: '#3B4150' },
  musgo: { name: 'Musgo', hex: '#56704F' }
};

window.PULSO_LINES = {
  volt: { name: 'Línea Volt', short: 'Volt', sport: 'Running', blurb: 'Ligera, ventilada y reflectiva. Para salir antes de que amanezca.' },
  base: { name: 'Línea Base', short: 'Base', sport: 'Training', blurb: 'Compresión, estabilidad y tela que aguanta la sentadilla número cien.' },
  calle: { name: 'Línea Calle', short: 'Calle', sport: 'Lifestyle', blurb: 'Del entrenamiento al resto del día, sin cambiarte.' }
};

window.PULSO_PRODUCTS = [
  {
    id: 'playera-ritmo', name: 'Playera Ritmo', line: 'volt', category: 'running', gender: 'unisex',
    price: 649, compareAt: null, badge: 'Más vendido', colors: ['tinta', 'cobalto', 'cal'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'], weight: '98 g',
    description: 'Nuestra playera de carrera más ligera. Tejido AeroMesh con zonas perforadas en espalda y costados, costuras planas para que nada roce en el kilómetro 30.',
    features: ['Tejido AeroMesh 100% poliéster reciclado', 'Secado 2× más rápido que algodón', 'Vivos reflectivos laterales', 'Costuras planas anti-rozaduras'],
    tech: ['AeroMesh', 'DryPulse', 'Reflect 360']
  },
  {
    id: 'tank-sprint', name: 'Tank Sprint', line: 'volt', category: 'running', gender: 'mujer',
    price: 549, compareAt: null, badge: 'Nuevo', colors: ['pista', 'cal', 'grafito'],
    sizes: ['XS', 'S', 'M', 'L'], weight: '74 g',
    description: 'Sisa amplia y espalda abierta para correr con calor. Corte recto que no se sube y bolsillo trasero para un gel.',
    features: ['Espalda en malla abierta', 'Bolsillo trasero para gel o llave', 'Corte recto que no se sube', 'Protección UPF 40'],
    tech: ['AeroMesh', 'DryPulse']
  },
  {
    id: 'hoodie-altitud', name: 'Hoodie Altitud', line: 'calle', category: 'lifestyle', gender: 'unisex',
    price: 1499, compareAt: null, badge: 'Nuevo', colors: ['cobalto', 'grafito', 'hielo'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], weight: '540 g',
    description: 'Felpa de 380 g con interior cepillado, pensada para el calentamiento a 2,600 metros y para todo lo que viene después. Capucha de doble capa y bolsillo canguro con forro.',
    features: ['Felpa francesa 380 g/m²', 'Interior cepillado', 'Capucha de doble capa con cordón plano', 'Puños y cintura en rib elástico'],
    tech: ['Flex 4D']
  },
  {
    id: 'rompevientos-viento-norte', name: 'Rompevientos Viento Norte', line: 'volt', category: 'running', gender: 'unisex',
    price: 1899, compareAt: 2299, badge: '-17%', colors: ['tinta', 'senal', 'musgo'],
    sizes: ['S', 'M', 'L', 'XL'], weight: '160 g',
    description: 'Cortaviento repelente al agua que se guarda en su propio bolsillo. Ventilación láser en la espalda y detalles reflectivos a 360°.',
    features: ['Repelente al agua DWR sin PFC', 'Se empaca en su propio bolsillo', 'Ventilación láser en espalda', 'Cierre frontal con protector de barbilla'],
    tech: ['Reflect 360', 'AeroMesh']
  },
  {
    id: 'leggings-kinesis', name: 'Leggings Kinesis 7/8', line: 'base', category: 'training', gender: 'mujer',
    price: 1099, compareAt: null, badge: 'Más vendido', colors: ['tinta', 'musgo', 'pista'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'], weight: '210 g',
    description: 'Compresión media que sostiene sin apretar. Tiro alto con pretina que no se enrolla y tela opaca, probada en sentadilla profunda.',
    features: ['Compresión media', 'Opacidad comprobada en sentadilla', 'Pretina alta que no se enrolla', 'Bolsillo lateral para el teléfono'],
    tech: ['Flex 4D', 'DryPulse']
  },
  {
    id: 'short-zancada', name: 'Short Zancada 5"', line: 'volt', category: 'running', gender: 'hombre',
    price: 699, compareAt: null, badge: null, colors: ['cobalto', 'tinta', 'cal'],
    sizes: ['S', 'M', 'L', 'XL'], weight: '120 g',
    description: 'Short de 5 pulgadas con abertura lateral para zancada completa, malla interior y bolsillo trasero con cierre.',
    features: ['Entrepierna de 5"', 'Malla interior transpirable', 'Bolsillo trasero con cierre', 'Aberturas laterales'],
    tech: ['AeroMesh', 'DryPulse']
  },
  {
    id: 'jogger-transito', name: 'Jogger Tránsito', line: 'calle', category: 'lifestyle', gender: 'hombre',
    price: 1199, compareAt: 1399, badge: '-14%', colors: ['grafito', 'tinta', 'hielo'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], weight: '410 g',
    description: 'Jogger de corte cónico en tejido elástico de cuatro vías. Puños ajustados, bolsillos profundos y un bolsillo con cierre para lo importante.',
    features: ['Elástico de cuatro vías', 'Corte cónico', 'Bolsillo con cierre oculto', 'Cintura con cordón plano'],
    tech: ['Flex 4D']
  },
  {
    id: 'top-impulso', name: 'Top Deportivo Impulso', line: 'base', category: 'training', gender: 'mujer',
    price: 799, compareAt: null, badge: 'Nuevo', colors: ['pista', 'hielo', 'tinta'],
    sizes: ['XS', 'S', 'M', 'L'], weight: '90 g',
    description: 'Soporte medio-alto con copas removibles y banda inferior ancha que no se mueve en saltos ni burpees.',
    features: ['Soporte medio-alto', 'Copas removibles', 'Banda inferior de 6 cm', 'Tirantes acolchados'],
    tech: ['Flex 4D', 'DryPulse']
  },
  {
    id: 'gorra-cadencia', name: 'Gorra Cadencia', line: 'volt', category: 'accesorios', gender: 'unisex',
    price: 499, compareAt: null, badge: null, colors: ['cal', 'tinta', 'pista'],
    sizes: ['Única'], weight: '62 g',
    description: 'Gorra de correr de cinco paneles, visera flexible y banda de sudor absorbente. Se lava a máquina sin deformarse.',
    features: ['Visera flexible', 'Banda de sudor absorbente', 'Ojales de ventilación', 'Ajuste trasero de velcro'],
    tech: ['DryPulse']
  },
  {
    id: 'calcetas-kilometro', name: 'Calcetas Kilómetro (3 pares)', line: 'base', category: 'accesorios', gender: 'unisex',
    price: 349, compareAt: null, badge: null, colors: ['cal', 'tinta', 'senal'],
    sizes: ['CH', 'M', 'G'], weight: '3 × 28 g',
    description: 'Calcetas de media caña con talón y punta reforzados, soporte de arco y costura sin bulto en los dedos.',
    features: ['Paquete de 3 pares', 'Talón y punta reforzados', 'Soporte de arco', 'Costura de punta sin bulto'],
    tech: ['DryPulse']
  },
  {
    id: 'mochila-ruta-42', name: 'Mochila Ruta 42', line: 'calle', category: 'accesorios', gender: 'unisex',
    price: 1599, compareAt: null, badge: 'Edición limitada', colors: ['tinta', 'grafito', 'cobalto'],
    sizes: ['22 L'], weight: '780 g',
    description: 'Mochila de 22 litros con compartimento ventilado para tenis, funda acolchada para laptop de 15" y franja reflectiva.',
    features: ['Capacidad 22 L', 'Compartimento ventilado para calzado', 'Funda para laptop 15"', 'Franja reflectiva frontal'],
    tech: ['Reflect 360']
  },
  {
    id: 'manga-larga-umbral', name: 'Manga Larga Umbral', line: 'base', category: 'training', gender: 'hombre',
    price: 849, compareAt: null, badge: null, colors: ['senal', 'cobalto', 'grafito'],
    sizes: ['S', 'M', 'L', 'XL'], weight: '165 g',
    description: 'Primera capa térmica ligera para entrenar con frío. Puños con orificio para el pulgar y paneles laterales elásticos.',
    features: ['Orificio para pulgar', 'Paneles laterales elásticos', 'Tejido térmico ligero', 'Antiolor con iones de plata'],
    tech: ['Flex 4D', 'DryPulse']
  }
];

window.PULSO_TECH = [
  { key: 'AeroMesh', title: 'AeroMesh', text: 'Malla con microperforaciones en las zonas donde más sudas. Mueve el aire mientras corres.', stat: '38%', statLabel: 'más ventilación que un tejido liso' },
  { key: 'DryPulse', title: 'DryPulse', text: 'Fibras de doble canal que sacan la humedad a la superficie y la evaporan.', stat: '2×', statLabel: 'secado más rápido que el algodón' },
  { key: 'Flex 4D', title: 'Flex 4D', text: 'Elástico en cuatro direcciones que recupera su forma después de cada repetición.', stat: '360°', statLabel: 'de movimiento sin restricción' },
  { key: 'Reflect 360', title: 'Reflect 360', text: 'Detalles reflectivos en frente, espalda y costados. Te ven desde cualquier ángulo.', stat: '150 m', statLabel: 'de visibilidad con faros' }
];

window.PULSO_CATEGORIES = {
  running: 'Running', training: 'Training', lifestyle: 'Lifestyle', accesorios: 'Accesorios'
};
window.PULSO_GENDERS = { hombre: 'Hombre', mujer: 'Mujer', unisex: 'Unisex' };
