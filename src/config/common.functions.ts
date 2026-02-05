import CryptoJS from 'crypto-js';
import { emailRegex } from './constant';

export interface QRCodeValues {
  email: string;
  schemaUrl: string;
}

export const passwordEncryption = (password: string): string => {
  const CRYPTO_PRIVATE_KEY: string = process.env.NEXT_PUBLIC_CRYPTO_PRIVATE_KEY || '';
  if (!CRYPTO_PRIVATE_KEY) {
    console.error('Encryption key is missing');
    return '';
  }
  const encryptedPassword: string = CryptoJS.AES.encrypt(
    JSON.stringify(password),
    CRYPTO_PRIVATE_KEY
  ).toString();
  return encryptedPassword;
};

export const decryptValue = (value: string): string => {
  if (!value || value === 'Not Available') {
    return 'Not Available';
  }

  const CRYPTO_PRIVATE_KEY: string = process.env.NEXT_PUBLIC_CRYPTO_PRIVATE_KEY || '';
  if (!CRYPTO_PRIVATE_KEY) {
    console.error('Decryption key is missing for value:', value);
    return '--';
  }

  try {
    const returnValue = CryptoJS.AES.decrypt(value, CRYPTO_PRIVATE_KEY);
    const decryptedString = returnValue.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      console.error('Decryption failed, empty result for value:', value);
      return '--';
    }

    try {
      const decryptValue = JSON.parse(decryptedString);
      return decryptValue;
    } catch (jsonError) {
      console.warn('Decrypted value is not JSON, returning plain string:', decryptedString);
      return decryptedString;
    }
  } catch (error) {
    console.error('Decryption error for value:', value, error);
    return '--';
  }
};

export const dateConversion = (date: string): string => {
  const newDate = new Date(date);
  const now = new Date();

  const timeDifferenceInMilliseconds = now.getTime() - newDate.getTime();
  const timeDifferenceInSeconds = Math.floor(timeDifferenceInMilliseconds / 1000);

  if (timeDifferenceInSeconds < 60) {
    return timeDifferenceInSeconds === 1 ? 'A second ago' : `${timeDifferenceInSeconds} sec ago`;
  } else if (timeDifferenceInSeconds < 3600) {
    const minutes = Math.floor(timeDifferenceInSeconds / 60);
    return minutes === 1 ? 'A minute ago' : `${minutes} minutes ago`;
  } else if (timeDifferenceInSeconds < 86400) {
    const hours = Math.floor(timeDifferenceInSeconds / 3600);
    return hours === 1 ? 'An hour ago' : `${hours} hours ago`;
  } else if (timeDifferenceInSeconds < 604800) {
    const days = Math.floor(timeDifferenceInSeconds / 86400);
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  } else if (timeDifferenceInSeconds < 2629440) {
    const weeks = Math.floor(timeDifferenceInSeconds / 604800);
    return weeks === 1 ? 'Last Week' : `${weeks} weeks ago`;
  } else if (timeDifferenceInSeconds < 31579200) {
    const months = Math.floor(timeDifferenceInSeconds / 2629440);
    return months === 1 ? 'Last Month' : `${months} months ago`;
  } else {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const year = newDate.getFullYear();
    const monthIndex = newDate.getMonth();
    const month = months[monthIndex];
    const day = String(newDate.getDate()).padStart(2, '0');
    return `${month} ${day}, ${year}`;
  }
};

export const qrCodeDecription = (qrResponce: string): QRCodeValues => {
  const qrDecriptionKey = process.env.NEXT_PUBLIC_QR_ENCRYPTION_DECREPTION_KEY || '';
  if (!qrDecriptionKey) {
    console.error('QR decryption key is missing');
    return { email: '', schemaUrl: '' };
  }
  try {
    const decryptedResult = CryptoJS.AES.decrypt(qrResponce, qrDecriptionKey);
    const decryptedQRDetails = JSON.parse(decryptedResult.toString(CryptoJS.enc.Utf8));
    return decryptedQRDetails;
  } catch (error) {
    console.error('QR decryption error:', error);
    return { email: '', schemaUrl: '' };
  }
};

export const validEmail = (email: string): string => {
  return emailRegex.test(email) ? email : '';
};