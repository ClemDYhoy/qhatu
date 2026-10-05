// Favoritos guardados en el navegador (localStorage)
const KEY = 'qhatu_favoritos';

export const getFavorites = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const isFavorite = (productoId) =>
  getFavorites().some((p) => p.producto_id === productoId);

export const toggleFavorite = (product) => {
  const list = getFavorites();
  const idx = list.findIndex((p) => p.producto_id === product.producto_id);

  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.unshift(product);
  }

  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 60)));
  window.dispatchEvent(new Event('favoritesChanged'));
  return list;
};
