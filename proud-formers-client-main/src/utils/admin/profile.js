import { dbData } from "./DBData";

export const fetchAdminProfile = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const admin = dbData.users.find((u) => u.role === "admin");
      const addresses = dbData.addresses.filter((a) => a.user_id === admin.id);

      resolve({
        profile: admin,
        addresses,
      });
    }, 500);
  });
};

export const updateAdminProfile = (payload) => {
  return new Promise((resolve) => {
    console.log("Updated Admin Payload:", payload);
    setTimeout(() => resolve({ success: true }), 500);
  });
};
