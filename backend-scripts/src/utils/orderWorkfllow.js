export const allowedTransitions = {
  PLACED: ["STORE_ACCEPTED", "CANCELLED"],
  STORE_ACCEPTED: ["PACKING", "CANCELLED"],
  PACKING: ["PACKED", "CANCELLED"],
  PACKED: ["PICKED_UP"],
  PICKED_UP: ["ON_THE_WAY"],
  ON_THE_WAY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const rolePermissions = {
  CUSTOMER: ["CANCELLED"],
  STORE: ["STORE_ACCEPTED", "PACKING", "PACKED"],
  DELIVERY: ["PICKED_UP", "ON_THE_WAY", "DELIVERED"],
  ADMIN: ["CANCELLED"],
};

export function validateStatusTransition(
  currentStatus,
  nextStatus,
  userRole
) {
  if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
    const err = new Error(
      `Invalid status transition: ${currentStatus} → ${nextStatus}`
    );
    err.statusCode = 400;
    throw err;
  }

  if (!rolePermissions[userRole]?.includes(nextStatus)) {
    const err = new Error("You are not allowed to perform this action");
    err.statusCode = 403;
    throw err;
  }
}
