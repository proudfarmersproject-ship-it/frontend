// src/pages/admin/customers/AddCustomer.jsx
import { useState, useCallback } from "react";
import {
  User,
  MapPin,
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  Hash,
} from "lucide-react";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
import { useAdminCustomerStore } from "../../../store/admin/AdminCustomerStore";
import StatusModal from "../../../components/admin/StatusModal";

const wrapperData = {
  title: "Create Customer",
  description: "Register a new customer account and primary address",
  breadcrumb: [
    { label: "Dashboard", to: "/admin" },
    { label: "Customers", to: "/admin/customers" },
    { label: "New Customer", to: "/admin/customers/new" },
  ],
};

// Internal Reusable Field Component
const FormField = ({ label, icon: Icon, error, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && (
      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
        {label}
      </label>
    )}
    <div className="relative group">
      {Icon && (
        <Icon
          size={18}
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
            error
              ? "text-red-400"
              : "text-gray-400 group-focus-within:text-primary"
          }`}
        />
      )}
      <input
        {...props}
        className={`w-full p-3.5 ${
          Icon ? "pl-11" : "pl-4"
        } border-2 border-gray-200 rounded-2xl text-sm font-medium bg-gray-50 focus:ring-2 transition-all outline-none 
          ${
            error
              ? "ring-2 ring-red-100 bg-red-50"
              : "focus:ring-primary/20 bg-gray-50 hover:bg-gray-100/50"
          }`}
      />
    </div>
    {error && (
      <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-2">
        {error}
      </p>
    )}
  </div>
);

export default function AddCustomer() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "customer",
    password: "",
    address: {
      address_line1: "",
      address_line2: "",
      city: "",
      pincode: "",
    },
  });

  const [errors, setErrors] = useState({});
  const { addCustomer, successMessage, loading, error, clearStatus } =
    useAdminCustomerStore();

  const update = useCallback(
    (k, v) => {
      setForm((prev) => ({ ...prev, [k]: v }));
      if (errors[k]) setErrors((prev) => ({ ...prev, [k]: null }));
    },
    [errors]
  );

  const updateAddress = useCallback((k, v) => {
    setForm((prev) => ({ ...prev, address: { ...prev.address, [k]: v } }));
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!form.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Invalid email format";
    }
    if (!/^[6-9]\d{9}$/.test(form.phone.trim()))
      newErrors.phone = "Invalid 10-digit phone";

    if (form.password.length < 8) {
      newErrors.password = "Minimum 8 characters required";
    } else if (!/(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = "Need 1 Uppercase & 1 Number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setErrors({});
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "customer",
      password: "",
      address: { address_line1: "", address_line2: "", city: "", pincode: "" },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || loading) return;

    const payload = {
      id: "USR" + Date.now(),
      ...form,
      addresses: [
        {
          id: "AD" + Date.now(),
          full_name: `${form.first_name} ${form.last_name}`,
          ...form.address,
          is_default: true,
        },
      ],
    };

    const res = await addCustomer(payload);
    if (res?.success || !error) handleReset();
  };

  return (
    <div className="pb-10">
      {(successMessage || error) && (
        <StatusModal
          message={successMessage || error}
          type={successMessage ? "success" : "error"}
          onClose={clearStatus}
        />
      )}

      <AdminHeaderWrapper {...wrapperData} />

      <div className="grid lg:grid-cols-3 gap-8 mt-6">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Section: Basic Info */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <User size={20} />
              </div>
              <h2 className="text-lg font-black text-gray-800 tracking-tight">
                Basic Information
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <FormField
                label="First Name"
                icon={User}
                placeholder="John"
                value={form.first_name}
                error={errors.first_name}
                onChange={(e) => update("first_name", e.target.value)}
              />
              <FormField
                label="Last Name"
                placeholder="Doe"
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
              />
              <FormField
                label="Email Address"
                icon={Mail}
                type="email"
                placeholder="john@example.com"
                value={form.email}
                error={errors.email}
                onChange={(e) => update("email", e.target.value)}
              />
              <FormField
                label="Phone Number"
                icon={Phone}
                type="tel"
                placeholder="9876543210"
                value={form.phone}
                error={errors.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </div>

          {/* Section: Address */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                <MapPin size={20} />
              </div>
              <h2 className="text-lg font-black text-gray-800 tracking-tight">
                Default Shipping Address
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <FormField
                  label="Address Line 1"
                  placeholder="Street name, Apartment, Suite"
                  value={form.address.address_line1}
                  onChange={(e) =>
                    updateAddress("address_line1", e.target.value)
                  }
                />
              </div>
              <FormField
                label="Address Line 2"
                placeholder="Landmark (Optional)"
                value={form.address.address_line2}
                onChange={(e) => updateAddress("address_line2", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="City"
                  placeholder="Mumbai"
                  value={form.address.city}
                  onChange={(e) => updateAddress("city", e.target.value)}
                />
                <FormField
                  label="Pincode"
                  icon={Hash}
                  type="number"
                  placeholder="400001"
                  value={form.address.pincode}
                  onChange={(e) => updateAddress("pincode", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Confirm & Save Customer"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-colors"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Right Column: Account Security/Role */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4 mb-6">
              <div className="p-2 bg-purple-50 text-purple-500 rounded-xl">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-lg font-black text-gray-800 tracking-tight">
                Account Security
              </h2>
            </div>

            <div className="space-y-5">
              <FormField
                label="Access Password"
                icon={Lock}
                type="password"
                placeholder="••••••••"
                value={form.password}
                error={errors.password}
                onChange={(e) => update("password", e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  System Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  className="w-full p-3.5 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer appearance-none"
                >
                  <option value="customer">Standard Customer</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="text-[10px] text-gray-400 italic ml-1 mt-1 font-medium">
                  * Admins have full access to the management dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
            <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-2">
              Quick Tip
            </h4>
            <p className="text-xs text-primary/70 font-medium leading-relaxed">
              Ensure the email address is unique. The system will automatically
              send an invitation email once the account is created.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// // src/pages/admin/customers/AddCustomer.jsx
// import { useState } from "react";
// import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
// import { useAdminCustomerStore } from "../../../store/admin/AdminCustomerStore";
// import StatusModal from "../../../components/admin/StatusModal";

// const wrapperData = {
//   title: "Add Customer",
//   description: "Create a new customer account",
//   breadcrumb: [
//     { label: "Dashboard", to: "/admin" },
//     { label: "Customers", to: "/admin/customers" },
//     { label: "New Customer", to: "/admin/customers/new" },
//   ],
// };

// export default function AddCustomer() {
//   const [form, setForm] = useState({
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone: "",
//     role: "customer",
//     password: "",
//     address: {
//       address_line1: "",
//       address_line2: "",
//       city: "",
//       pincode: "",
//     },
//   });
//   const [errors, setErrors] = useState({});
//   const { addCustomer, successMessage, loading, error, clearStatus } =
//     useAdminCustomerStore();

//   const update = (k, v) => {
//     setForm({ ...form, [k]: v });
//     // Clear the error for this field as the user types
//     if (errors[k]) {
//       setErrors((prev) => {
//         const newErrors = { ...prev };
//         delete newErrors[k];
//         return newErrors;
//       });
//     }
//   };
//   const updateAddress = (k, v) =>
//     setForm({ ...form, address: { ...form.address, [k]: v } });

//   const validateForm = (form) => {
//     const errors = {};

//     // First Name
//     if (!form.first_name.trim()) {
//       errors.first_name = "First name is required";
//     } else if (form.first_name.trim().length < 2) {
//       errors.first_name = "First name must be at least 2 characters";
//     }

//     // Email
//     if (!form.email.trim()) {
//       errors.email = "Email is required";
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
//       errors.email = "Enter a valid email address";
//     }

//     // Phone (India - 10 digits)
//     if (!form.phone.trim()) {
//       errors.phone = "Phone number is required";
//     } else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
//       errors.phone = "Enter a valid 10-digit mobile number";
//     }

//     // Password
//     if (!form.password) {
//       errors.password = "Password is required";
//     } else if (form.password.length < 8) {
//       errors.password = "Password must be at least 8 characters";
//     } else if (
//       !/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/.test(form.password)
//     ) {
//       errors.password =
//         "Password must include uppercase, lowercase, number & special character";
//     }

//     return errors;
//   };
//   const convertToDbStructure = (formData) => {
//     return {
//       id: "USR" + Date.now(),
//       first_name: formData.first_name,
//       last_name: formData.last_name,
//       email: formData.email,
//       phone: formData.phone,
//       role: formData.role,
//       // Note: DB uses password_hash, but typically we send 'password' to the API
//       password: formData.password,
//       // Convert single address object into the addresses array
//       addresses: [
//         {
//           id: "AD" + Date.now(),
//           full_name: `${formData.first_name} ${formData.last_name}`,
//           phone: formData.phone,
//           email: formData.email,
//           address_line1: formData.address.address_line1,
//           address_line2: formData.address.address_line2,
//           city: formData.address.city,
//           pincode: formData.address.pincode,
//           is_default: true, // Defaulting to true for the first address
//         },
//       ],
//     };
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (loading) return;
//     const validationErrors = validateForm(form);
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       // Optional: Scroll to the first error
//       //  window.scrollTo({ top: 0, behavior: "smooth" });
//       return;
//     }

//     const dbData = convertToDbStructure(form);

//     try {
//       await addCustomer(dbData);
//       // Check for success - Assuming your store returns a success indicator
//       if (!error) {
//         handleReset();
//       }
//     } catch (err) {
//       console.error("Critical Error:", err);
//     }

//     console.log("Create customer payload", form);
//   };
//   const handleReset = () => {
//     setErrors({});
//     setForm({
//       first_name: "",
//       last_name: "",
//       email: "",
//       phone: "",
//       role: "customer",
//       password: "",
//       address: {
//         address_line1: "",
//         address_line2: "",
//         city: "",
//         pincode: "",
//       },
//     });
//     console.log("Form Data is Reset");
//   };
//   return (
//     <>
//       {/* Optimized Status Modal */}
//       {(successMessage || error) && (
//         <StatusModal
//           key={successMessage ? `success-${Date.now()}` : `error-${Date.now()}`}
//           message={successMessage || error}
//           type={successMessage ? "success" : "error"}
//           onClose={clearStatus}
//         />
//       )}
//       <AdminHeaderWrapper {...wrapperData} />
//       <div className="bg-white p-6 rounded-2xl shadow max-w-4xl">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <h2 className="text-xl font-semibold">Basic Information</h2>

//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <input
//                 type="text"
//                 placeholder="First Name *"
//                 name="first_name"
//                 value={form.first_name}
//                 onChange={(e) => update("first_name", e.target.value)}
//                 className={`p-3 border-2 rounded-xl focus:ring-2 focus:ring-primary bg-white focus:outline-none ${
//                   errors.first_name
//                     ? "border-red-500"
//                     : "border-[var(--color-border-color)]"
//                 }`}
//               />
//               {errors.first_name && (
//                 <p className="text-red-500 text-sm">{errors.first_name}</p>
//               )}
//             </div>

//             <input
//               type="text"
//               placeholder="Last Name"
//               name="last_name"
//               value={form.last_name}
//               onChange={(e) => update("last_name", e.target.value)}
//               className="p-3 border-2 rounded-xl focus:ring-2 focus:ring-primary bg-white focus:outline-none border-[var(--color-border-color)]"
//             />
//             <div>
//               <input
//                 type="email"
//                 placeholder="Email *"
//                 name="email"
//                 value={form.email}
//                 onChange={(e) => update("email", e.target.value)}
//                 className={`p-3 border-2 rounded-xl focus:ring-2 focus:ring-primary bg-white focus:outline-none ${
//                   errors.email
//                     ? "border-red-500"
//                     : "border-[var(--color-border-color)]"
//                 }`}
//               />
//               {errors.email && (
//                 <p className="text-red-500 text-sm">{errors.email}</p>
//               )}
//             </div>
//             <div>
//               <input
//                 type="tel"
//                 placeholder="Phone *"
//                 value={form.phone}
//                 name="phone"
//                 autoComplete="tel"
//                 onChange={(e) => update("phone", e.target.value)}
//                 className={`p-3 border-2 rounded-xl focus:ring-2 focus:ring-primary bg-white focus:outline-none ${
//                   errors.phone
//                     ? "border-red-500"
//                     : "border-[var(--color-border-color)]"
//                 }`}
//               />
//               {errors.phone && (
//                 <p className="text-red-500 text-sm">{errors.phone}</p>
//               )}
//             </div>
//             <div>
//               <input
//                 type="password"
//                 placeholder="Password *"
//                 autoComplete="new-password"
//                 name="password"
//                 value={form.password}
//                 onChange={(e) => update("password", e.target.value)}
//                 className={`p-3 border-2 rounded-xl focus:ring-2 focus:ring-primary bg-white focus:outline-none ${
//                   errors.password
//                     ? "border-red-500"
//                     : "border-[var(--color-border-color)]"
//                 }`}
//               />
//               {errors.password && (
//                 <p className="text-red-500 text-sm">{errors.password}</p>
//               )}
//             </div>
//             <select
//               value={form.role}
//               name="role"
//               onChange={(e) => update("role", e.target.value)}
//               className="p-3 border-2 rounded-xl focus:ring-2 focus:ring-primary bg-white focus:outline-none border-[var(--color-border-color)]"
//             >
//               <option value="customer">Customer</option>
//               <option value="admin">Admin</option>
//             </select>
//           </div>

//           <h2 className="text-xl font-semibold">Address</h2>

//           <div className="grid md:grid-cols-2 gap-4">
//             <input
//               type="text"
//               placeholder="Address Line 1"
//               value={form.address.address_line1}
//               name="address_line1"
//               onChange={(e) => updateAddress("address_line1", e.target.value)}
//               className="p-3 border-2 rounded-xl focus:ring-2 focus:ring-primary bg-white focus:outline-none border-[var(--color-border-color)]"
//             />
//             <input
//               type="text"
//               placeholder="Address Line 2"
//               value={form.address.address_line2}
//               name="address_line2"
//               onChange={(e) => updateAddress("address_line2", e.target.value)}
//               className="p-3 border-2 rounded-xl focus:ring-2 focus:ring-primary bg-white focus:outline-none border-[var(--color-border-color)]"
//             />
//             <input
//               type="text"
//               placeholder="City"
//               name="city"
//               value={form.address.city}
//               onChange={(e) => updateAddress("city", e.target.value)}
//               className="p-3 border-2 rounded-xl focus:ring-2 focus:ring-primary bg-white focus:outline-none border-[var(--color-border-color)]"
//             />
//             <input
//               type="number"
//               placeholder="Pincode"
//               name="pincode"
//               value={form.address.pincode}
//               onChange={(e) => updateAddress("pincode", e.target.value)}
//               className="p-3 border-2 rounded-xl focus:ring-2 focus:ring-primary bg-white focus:outline-none border-[var(--color-border-color)]"
//             />
//           </div>

//           {/* <button className="bg-primary text-white px-6 py-3 rounded-xl">
//             Save Customer
//           </button> */}
//           <button
//             type="submit"
//             disabled={loading}
//             className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200
//     ${
//       loading
//         ? "bg-primary/50 text-white/90 animate-pulse cursor-wait"
//         : "bg-primary hover:bg-primary-dark text-white active:scale-95"
//     }`}
//           >
//             {loading ? "Adding Customer..." : "Save Customer"}
//           </button>
//           <button
//             type="reset"
//             onClick={handleReset}
//             className="bg-gray-200 hover:bg-gray-300 text-gray-800 ml-2 px-6 py-3 rounded-xl transition-colors"
//           >
//             Reset
//           </button>
//         </form>
//       </div>
//     </>
//   );
// }
