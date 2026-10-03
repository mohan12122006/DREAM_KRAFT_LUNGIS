import validator from 'validator';

export const isEmail = value =>
  Boolean(value && validator.isEmail(String(value)));

export const isIndianMobile = value =>
  /^[6-9]\d{9}$/.test(String(value || ''));

export const isPinCode = value =>
  /^\d{6}$/.test(String(value || ''));

// Keep normal characters such as / in addresses.
// React safely escapes values when rendering them.
export const clean = value =>
  String(value || '').trim();