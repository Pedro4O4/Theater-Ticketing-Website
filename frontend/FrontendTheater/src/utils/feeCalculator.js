/**
 * حاسبة رسوم التذاكر
 * تستخدم لحساب الرسوم على أساس سعر التذكرة وعدد التذاكر
 */
export const FEE_PERCENTAGE = 0.035; // 3.5%
export const FIXED_FEE_PER_TICKET = 1.99; // $1.99 لكل تذكرة

/**
 * حساب تفاصيل الرسوم للتذاكر
 * @param {number} ticketPrice سعر التذكرة الواحدة
 * @param {number} quantity عدد التذاكر
 * @returns {Object} تفاصيل الرسوم
 */
export function calculateFees(ticketPrice, quantity) {
    const subtotal = ticketPrice * quantity;
    const percentageFee = subtotal * FEE_PERCENTAGE;
    const fixedFee = FIXED_FEE_PER_TICKET * quantity;

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        percentageFee: parseFloat(percentageFee.toFixed(2)),
        fixedFee: parseFloat(fixedFee.toFixed(2)),
        total: parseFloat((subtotal + percentageFee + fixedFee).toFixed(2))
    };
}

/**
 * تنسيق المبالغ المالية
 * @param {number} amount المبلغ
 * @param {string} currency عملة العرض، افتراضياً بالجنيه المصري
 * @returns {string} المبلغ المنسق
 */
export function formatCurrency(amount, currency = 'EGP') {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: currency
    }).format(amount);
}