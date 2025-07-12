/**
 * تكوين رسوم التذاكر
 * يحدد النسبة المئوية والرسوم الثابتة لكل تذكرة
 */
module.exports = {
    PERCENTAGE_FEE: 0.035, // 3.5%
    FIXED_FEE_PER_TICKET: 1.99, // $1.99 لكل تذكرة

    // دالة لحساب الرسوم
    calculateFees: function(ticketPrice, quantity) {
        const subtotal = ticketPrice * quantity;
        const percentageFee = parseFloat((subtotal * this.PERCENTAGE_FEE).toFixed(2));
        const fixedFee = parseFloat((this.FIXED_FEE_PER_TICKET * quantity).toFixed(2));

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            percentageFee,
            fixedFee,
            total: parseFloat((subtotal + percentageFee + fixedFee).toFixed(2))
        };
    }
};