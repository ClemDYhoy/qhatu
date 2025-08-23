export const formatPrice = (price) => {
return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
}).format(price);
};

export const formatDate = (date) => {
return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
}).format(new Date(date));
};

export const truncateText = (text, maxLength = 100) => {
if (text.length <= maxLength) return text;
return text.slice(0, maxLength) + '...';
};