import { Order } from '../models/order.js';
import { Store } from '../models/store.js';
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


// Admin: List all stores
export const listAllStores = async (req, res) => {
  try {
    const stores = await Store.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching stores" });
  }
};

// Admin: Delete any store
export const adminDeleteStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    await store.deleteOne();
    res.status(200).json({ success: true, message: "Store deleted by admin" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting store" });
  }
};


export const listDeliveryPartners = async (req, res) => {
  try {
    const partners = await User.find({ role: 'DELIVERY' })
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

    const [totalOrders, placed, packed, delivered] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "PLACED" }),
      Order.countDocuments({ status: "PACKED" }),
      Order.countDocuments({ status: "DELIVERED" }),
    ]);

    return res.status(200).json({
      totalOrders,
      placed,
      packed, 
      delivered
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Server error'
    });
  }
};
