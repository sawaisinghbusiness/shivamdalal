// SARVOTTAM — Furniture catalog & backward compatibility bridge
import { FURNITURE_CATALOG, SPACES } from './furnitureData';

export { FURNITURE_CATALOG, SPACES };

export const FURNITURE_CATEGORIES = [
  'Kitchen',
  'Bedroom',
  'Living',
  'Wardrobe',
  'TV Unit',
  'Dining',
  'Pooja',
  'Study',
  'Kids',
  'Balcony'
];

// Helper to normalize items for ProductDetail.jsx
function formatItem(d) {
  return {
    id: d.id,
    name: d.name,
    material: d.finish,
    price: d.price,
    rating: d.rating,
    img: d.img,
    size: d.size,
    specs: d.specs,
  };
}

export const FURNITURE = {
  Kitchen: (FURNITURE_CATALOG.kitchen?.designs || []).map(formatItem),
  Bedroom: (FURNITURE_CATALOG.bedroom?.designs || []).map(formatItem),
  Living: (FURNITURE_CATALOG.living?.designs || []).map(formatItem),
  Wardrobe: (FURNITURE_CATALOG.wardrobe?.designs || []).map(formatItem),
  'TV Unit': (FURNITURE_CATALOG.tv_unit?.designs || []).map(formatItem),
  Dining: (FURNITURE_CATALOG.dining?.designs || []).map(formatItem),
  Pooja: (FURNITURE_CATALOG.pooja?.designs || []).map(formatItem),
  Study: (FURNITURE_CATALOG.study?.designs || []).map(formatItem),
  Kids: (FURNITURE_CATALOG.kids?.designs || []).map(formatItem),
  Balcony: (FURNITURE_CATALOG.balcony?.designs || []).map(formatItem),
};
