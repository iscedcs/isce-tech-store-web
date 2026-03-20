export function orderShippedTemplate({
  customerName,
  orderId,
  order,
  shippingInfo,
  waybill,
}: {
  customerName: string;
  orderId: string;
  order: any;
  shippingInfo: any;
  waybill: string;
}) {
  const trackingUrl = `${process.env.NEXT_PUBLIC_URL || ""}/track?waybill=${encodeURIComponent(waybill)}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #1a202c;">Your order has shipped!</h2>
      <p>Hi ${customerName}, your order <b>#${orderId}</b> is on its way.</p>
      <h3>Waybill Number</h3>
      <p style="font-size: 18px; color: #2563eb;"><b>${waybill}</b></p>
      <h3>Order Details</h3>
      <ul>
        ${order.orderItems.map((item: any) => `<li>${item.product.name} (x${item.quantity})</li>`).join("")}
      </ul>
      <h3>How to Track Your Order</h3>
      <ol>
        <li>Open <a href="${trackingUrl}">ISCE Shipment Tracking</a></li>
        <li>Your waybill number is: <b>${waybill}</b></li>
        <li>View your latest shipment updates in one place</li>
      </ol>
      <hr />
      <p style="font-size: 12px; color: #888;">If you have any questions, reply to this email or contact support.</p>
    </div>
  `;
}

export function orderDeliveredTemplate({
  customerName,
  orderId,
  order,
  shippingInfo,
}: {
  customerName: string;
  orderId: string;
  order: any;
  shippingInfo: any;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #1a202c;">Order Delivered!</h2>
      <p>Hi ${customerName}, your order <b>#${orderId}</b> has been delivered. We hope you enjoy your purchase!</p>
      <h3>Order Details</h3>
      <ul>
        ${order.orderItems.map((item: any) => `<li>${item.product.name} (x${item.quantity})</li>`).join("")}
      </ul>
      <hr />
      <p style="font-size: 12px; color: #888;">If you have any questions or feedback, reply to this email or contact support.</p>
    </div>
  `;
}

export function orderCancelledTemplate({
  customerName,
  orderId,
  order,
  shippingInfo,
  reason,
}: {
  customerName: string;
  orderId: string;
  order: any;
  shippingInfo: any;
  reason?: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #b91c1c;">Order Cancelled</h2>
      <p>Hi ${customerName}, your order <b>#${orderId}</b> has been cancelled.</p>
      ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ""}
      <h3>Order Details</h3>
      <ul>
        ${order.orderItems.map((item: any) => `<li>${item.product.name} (x${item.quantity})</li>`).join("")}
      </ul>
      <hr />
      <p style="font-size: 12px; color: #888;">If you have any questions, reply to this email or contact support.</p>
    </div>
  `;
}
export function orderPaidTemplate({
  customerName,
  orderId,
  order,
  shippingInfo,
}: {
  customerName: string;
  orderId: string;
  order: any;
  shippingInfo: any;
}) {
  const isPickup = shippingInfo?.deliveryMethod === "pickup";
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #1a202c;">Thank you for your order, ${customerName}!</h2>
      <p>Your order <b>#${orderId}</b> has been received and payment was successful.</p>
      <h3>Order Details</h3>
      <ul>
        ${order.orderItems.map((item: any) => `<li>${item.product.name} (x${item.quantity})</li>`).join("")}
      </ul>
      <p><b>Total:</b> ₦${order.totalAmount.toLocaleString()}</p>
      <h3>${isPickup ? "Pickup Location" : "Delivery Address"}</h3>
      <p>
        ${
          isPickup
            ? `${shippingInfo.pickupLocationName || ""}<br/>${shippingInfo.pickupLocationAddress || ""}`
            : `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}`
        }
      </p>
      <p>We will notify you as soon as your order is being processed.</p>
      <hr />
      <p style="font-size: 12px; color: #888;">If you have any questions, reply to this email or contact support.</p>
    </div>
  `;
}

export function orderProcessingTemplate({
  customerName,
  orderId,
  order,
  shippingInfo,
  waybill,
}: {
  customerName: string;
  orderId: string;
  order: any;
  shippingInfo: any;
  waybill: string;
}) {
  const isPickup = shippingInfo?.deliveryMethod === "pickup";
  const trackingUrl = `${process.env.NEXT_PUBLIC_URL || ""}/track?waybill=${encodeURIComponent(waybill)}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #1a202c;">Your order is being processed!</h2>
      <p>Hi ${customerName}, your order <b>#${orderId}</b> is now being processed.</p>
      <h3>Waybill Number</h3>
      <p style="font-size: 18px; color: #2563eb;"><b>${waybill}</b></p>
      <h3>Order Details</h3>
      <ul>
        ${order.orderItems.map((item: any) => `<li>${item.product.name} (x${item.quantity})</li>`).join("")}
      </ul>
      <h3>${isPickup ? "Pickup Location" : "Delivery Address"}</h3>
      <p>
        ${
          isPickup
            ? `${shippingInfo.pickupLocationName || ""}<br/>${shippingInfo.pickupLocationAddress || ""}`
            : `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}`
        }
      </p>
      <h3>How to Track Your Order</h3>
      <ol>
        <li>Open <a href="${trackingUrl}">ISCE Shipment Tracking</a></li>
        <li>Your waybill number is: <b>${waybill}</b></li>
        <li>Check the latest movement and delivery status there</li>
      </ol>
      <hr />
      <p style="font-size: 12px; color: #888;">If you have any questions, reply to this email or contact support.</p>
    </div>
  `;
}
