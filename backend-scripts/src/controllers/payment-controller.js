import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
//   key_secret: process.env.RAZORPAY_KEY_SECRET || 'demo_secret',
// });

let razorpay;

const getRazorpayClient = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys are not configured (RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET)');
  }

  if (!razorpay) {
    razorpay = new Razorpay({ key_id, key_secret });
  }

  return razorpay;
};

// Create a Razorpay order
export const createOrder = async (req, res) => {
  try {
    const razorpayClient = getRazorpayClient();
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        userId: req.user.id,
      },
    };

    // const order = await razorpay.orders.create(options);
    const order = await razorpayClient.orders.create(options);

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
    });
  }
};

// Verify payment signature
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details',
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay key secret is not configured',
      });
    }

    const expectedSignature = crypto
      // .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'demo_secret')
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
    });
  }
};

// Get payment details
export const getPaymentDetails = async (req, res) => {
  try {
    const razorpayClient = getRazorpayClient();
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required',
      });
    }

    // const payment = await razorpay.payments.fetch(paymentId);
    const payment = await razorpayClient.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
    });
  }
};

// Refund a payment
export const refundPayment = async (req, res) => {
  try {
    const razorpayClient = getRazorpayClient();
    const { paymentId, amount } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required',
      });
    }

    const refundOptions = {
      speed: 'normal',
    };

    if (amount) {
      refundOptions.amount = Math.round(amount * 100);
    }

    // const refund = await razorpay.payments.refund(paymentId, refundOptions);
    const refund = await razorpayClient.payments.refund(paymentId, refundOptions);

    res.status(200).json({
      success: true,
      message: 'Refund initiated successfully',
      data: refund,
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
    });
  }
};
