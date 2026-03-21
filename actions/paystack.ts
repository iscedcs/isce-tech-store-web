"use server";

export const createTransaction = async (opts: { payload: unknown }) => {
  try {
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(opts.payload),
      },
    );

    const paymentResponse = await response.json();
    console.log("Transaction Initialization Response:", paymentResponse);

    if (!paymentResponse?.status) {
      return {
        success: false,
        error: paymentResponse.message || "Failed to initialize payment.",
      };
    }

    return {
      success: true,
      message: "Redirecting to payment page",
      data: paymentResponse.data,
    };
  } catch (error) {
    console.error("Error initializing Paystack transaction:", error);
    return {
      success: false,
      error: "An error occurred while processing the payment.",
    };
  }
};

export async function verifyTransaction(transactionReference: string) {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${transactionReference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );
    const paymentResponse = await response.json();
    console.log("Paystack Verification Response:", paymentResponse);

    if (!paymentResponse?.status || paymentResponse.data.status !== "success") {
      return {
        success: false,
        error: paymentResponse.message || "Transaction verification failed.",
      };
    }

    return {
      success: true,
      message: "Transaction verified",
      data: paymentResponse.data,
    };
  } catch (error) {
    console.error("Error verifying Paystack transaction:", error);
    return { success: false, error: "Error verifying transaction." };
  }
}
