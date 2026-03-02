import { Banknote, Droplets, Zap, Wifi, Snowflake, Store, Calculator } from 'lucide-react';

export const IconMap = {
    Banknote, Droplets, Zap, Wifi, Snowflake, Store, Calculator,
};

export const englishToBangla = (str) => {
    if (str === null || str === undefined) return '';
    const banglaDigits = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return str.toString().replace(/[0-9]/g, match => banglaDigits[match]);
};

export const banglaToEnglish = (str) => {
    if (str === null || str === undefined) return '';
    const englishDigits = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
    // replace both bengali and keep english
    return str.toString().replace(/[০-৯]/g, match => englishDigits[match]);
};

export const getBanglaMonthYear = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const banglaMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    return `${banglaMonths[parseInt(month) - 1]}, ${englishToBangla(year)}`;
};

export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '০.০০ ৳';
    const num = Number(amount);
    return `${englishToBangla(num.toFixed(2))} ৳`;
};
