import { useEffect, useState } from "react";
import { Pencil, Save, Mail, Phone, ShieldCheck } from "lucide-react";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
import {
  fetchAdminProfile,
  updateAdminProfile,
} from "../../../utils/admin/profile";

export default function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    addresses: [],
  });

  const update = (k, v) => setForm({ ...form, [k]: v });

  useEffect(() => {
    fetchAdminProfile().then((data) => {
      setForm({
        first_name: data.profile.first_name,
        last_name: data.profile.last_name,
        email: data.profile.email,
        phone: data.profile.phone,
        addresses: data.addresses,
      });
      setLoading(false);
    });
  }, []);

  const handleSave = () => {
    updateAdminProfile(form).then(() => setEditMode(false));
  };

  if (loading) return <div className="p-10">Loading profile...</div>;

  return (
    <div className="space-y-10">
      {/* HEADER */}
      {/* <AdminHeaderWrapper
        title="Profile"
        description="Manage your personal and account information"
        breadcrumb={[{ label: "Profile" }]}
      /> */}
      <div>
        <h1 className="text-2xl font-medium text-[var(--color-text-heading)]">
          Admin Profile
        </h1>
      </div>
      {/* PROFILE HERO */}
      {/* <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 shadow-xl"> */}
      <div className="bg-secondary-light text-white rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-semibold">
              {form.first_name[0]}
            </div>

            <div>
              <h1 className="text-2xl font-semibold">
                {form.first_name} {form.last_name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                <ShieldCheck size={14} /> Administrator
              </div>
            </div>
          </div>

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <Pencil size={16} /> Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="bg-primary px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <Save size={16} /> Save Changes
            </button>
          )}
        </div>
      </div>

      {/* INFO CARDS */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* CONTACT INFO */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Contact Information</h3>

          <div className="space-y-5">
            {/* Email */}
            <div className="flex items-start gap-4">
              <Mail className="text-gray-400 mt-1" size={18} />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Email</p>
                {editMode ? (
                  <input
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="mt-1 w-full border-b focus:outline-none py-1"
                  />
                ) : (
                  <p className="font-medium">{form.email}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <Phone className="text-gray-400 mt-1" size={18} />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Phone</p>
                {editMode ? (
                  <input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="mt-1 w-full border-b focus:outline-none py-1"
                  />
                ) : (
                  <p className="font-medium">{form.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Personal Information</h3>

          <div className="space-y-5">
            {["first_name", "last_name"].map((field) => (
              <div key={field}>
                <p className="text-sm text-gray-500 capitalize">
                  {field.replace("_", " ")}
                </p>
                {editMode ? (
                  <input
                    value={form[field]}
                    onChange={(e) => update(field, e.target.value)}
                    className="mt-1 w-full border-b focus:outline-none py-1"
                  />
                ) : (
                  <p className="font-medium">{form[field]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ADDRESSES */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Saved Addresses</h3>

        <div className="grid md:grid-cols-2 gap-5">
          {form.addresses.map((addr) => (
            <div
              key={addr.id}
              className={`rounded-xl p-5 border ${
                addr.is_default
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <p className="font-medium">{addr.full_name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {addr.address_line1}, {addr.address_line2}
              </p>
              <p className="text-sm text-gray-600">
                {addr.city}, {addr.state} - {addr.pincode}
              </p>

              {addr.is_default && (
                <span className="inline-block mt-3 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  Default Address
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
