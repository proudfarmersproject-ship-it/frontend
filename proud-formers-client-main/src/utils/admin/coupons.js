import { dbData } from "./DBData";

export const fetchAllCoupons = () => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        const coupons = dbData.promo_codes.map((promo) => ({
          id: promo.id,
          code: promo.code,
          discount_type: promo.discount_type,
          discount_value: promo.discount_value,
          usage_limit: promo.usage_limit,
          used_count: promo.used_count,
          is_active: promo.is_active,

          // Optional formatted fields (useful for UI)
          //   display_value:
          //     promo.discount_type === "PERCENTAGE"
          //       ? `${promo.discount_value}%`
          //       : `₹${promo.discount_value}`,
          status: promo.is_active ? "Active" : "Inactive",
          created_at: promo.created_at,
        }));

        resolve(coupons);
      }, 500); // simulate API delay
    } catch (error) {
      reject("Failed to fetch coupons: " + error);
    }
  });
};

export const fetchCouponById = (id) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(dbData.promo_codes.find((c) => String(c.id) === String(id)));
    }, 300);
  });

export const deleteCouponById = (id) =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log("Deleted coupon:", id);
      resolve(true);
    }, 300);
  });
