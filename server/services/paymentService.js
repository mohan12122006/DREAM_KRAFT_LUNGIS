export async function createPaymentIntent(order) {
  return {
    provider: 'placeholder',
    status: 'payment_pending',
    amount: order.grandTotal,
    reference: order.orderNumber
  };
}
