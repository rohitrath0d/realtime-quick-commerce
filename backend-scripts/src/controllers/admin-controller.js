import { Order } from '../models/order.js';
import { User } from '../models/user.js';

/**
 * List Orders (Admin)
 * Optional query: ?status=PLACED
*/

export const listOrders = async (req, res) => {
  try {
    const { status } = req.query;

    // const query = status ? { status } : {};
    const query = {};

    if (status) {
      const allowedStatuses = Order.schema.path("status").enumValues;

      if (!allowedStatuses.includes(status)) {
        throw new Error("Invalid order status filter");
      }
      
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("customer", "name email")
      .populate("deliveryPartner", "name email")
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Server error'
    });
  }
};

export const listDeliveryPartners = async (req, res) => {
  try {
    const partners = await User.find({ role: 'partner' })
      .select('-password')
      .limit(200);

    res.status(200).json({
      success: true,
      count: partners.length,
      data: partners,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Server error'
    });
  }
};

export const liveStats = async (req, res) => {
  try {
    // const totalOrders = await Order.countDocuments();
    // const placed = await Order.countDocuments({ status: 'PLACED' });
    // const accepted = await Order.countDocuments({ status: 'ACCEPTED' });

    const [totalOrders, placed, accepted] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "PLACED" }),
      Order.countDocuments({ status: "ACCEPTED" }),
    ]);

    return res.status(200).json({
      count: partners.length,
      data: partners,
      totalOrders,
      placed,
      accepted
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Server error'
    });
  }
};
