// SARVOTTAM — Painting services & styles (demo data)

export const PAINT_SERVICES = [
  { id: 'interior', name: 'Interior Painting', desc: 'Bedroom, hall, full ghar', rate: '₹8 – ₹18 / sq.ft', icon: 'home' },
  { id: 'exterior', name: 'Exterior Painting', desc: 'Bahari deewar, weatherproof', rate: '₹12 – ₹25 / sq.ft', icon: 'building' },
  { id: 'texture',  name: 'Texture & Designer', desc: 'Designer walls, patterns', rate: '₹40 – ₹120 / sq.ft', icon: 'star' },
  { id: 'waterproof', name: 'Waterproofing', desc: 'Seelan, leakage solution', rate: '₹15 – ₹35 / sq.ft', icon: 'shield' },
];

export const PAINT_CATEGORIES = ['Bedroom', 'Living Hall', 'Office', 'Exterior'];

export const PAINT_STYLES = {
  Bedroom: [
    { id: 'p1', name: 'Pastel Dreams',    tag: 'Soft & calm',  img: 'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?auto=format&fit=crop&w=500&q=80' },
    { id: 'p2', name: 'Royal Elegance',   tag: 'Deep & rich',  img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=500&q=80' },
    { id: 'p3', name: 'Modern Texture',   tag: 'Trendy',       img: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=500&q=80' },
    { id: 'p4', name: 'Warm Neutrals',    tag: 'Cozy',         img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80' },
  ],
  'Living Hall': [
    { id: 'p5', name: 'Accent Wall',      tag: 'Bold one wall', img: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=500&q=80' },
    { id: 'p6', name: 'Earthy Tones',     tag: 'Natural',       img: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=500&q=80' },
    { id: 'p7', name: 'Classic White',    tag: 'Timeless',      img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80' },
    { id: 'p8', name: 'Bold & Bright',    tag: 'Energetic',     img: 'https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?auto=format&fit=crop&w=500&q=80' },
  ],
  Office: [
    { id: 'p9',  name: 'Professional Grey', tag: 'Focused',     img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=80' },
    { id: 'p10', name: 'Fresh Blue',        tag: 'Productive',  img: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=500&q=80' },
    { id: 'p11', name: 'Minimal White',     tag: 'Clean',       img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=500&q=80' },
    { id: 'p12', name: 'Brand Accent',      tag: 'Custom color',img: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=500&q=80' },
  ],
  Exterior: [
    { id: 'p13', name: 'Weatherproof White', tag: 'Long-lasting', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80' },
    { id: 'p14', name: 'Heritage Look',      tag: 'Traditional',  img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=500&q=80' },
    { id: 'p15', name: 'Modern Facade',      tag: 'Contemporary', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80' },
    { id: 'p16', name: 'Bungalow Charm',     tag: 'Premium',      img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=500&q=80' },
  ],
};
