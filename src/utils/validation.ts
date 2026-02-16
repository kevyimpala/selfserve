export const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export const isStrongEnoughPassword = (value: string) => value.trim().length >= 6;

export const isNonEmpty = (value: string) => value.trim().length > 0;
