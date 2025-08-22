export const isValidEmail = (email) => {
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
return phoneRegex.test(phone);
};

export const isRequired = (value) => {
return value !== null && value !== undefined && value.toString().trim() !== '';
};