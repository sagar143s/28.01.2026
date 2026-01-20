"use client";
import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";
import axios from "axios";

export default function StoreSettings() {
  const { user, getToken } = useAuth();
  const [name, setName] = useState(user?.displayName || user?.name || "");
  const [image, setImage] = useState(user?.photoURL || user?.image || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const token = await getToken();
      await axios.post("/api/store/profile/update", { name, image, email }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage(err?.response?.data?.error || err.message);
    }
    setSaving(false);
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-56 bg-slate-50 border-r flex flex-col gap-2 p-6">
        <Link href="/store/settings" className="mb-2 px-4 py-2 rounded bg-blue-600 text-white text-center hover:bg-blue-700 transition">Settings</Link>
        <Link href="/store/settings/users" className="px-4 py-2 rounded bg-slate-200 text-slate-700 text-center hover:bg-slate-300 transition">Manage Users</Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-start mt-10">
        <div className="max-w-xl w-full p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Store Profile Settings</h2>
          <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              Name
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="border p-2 rounded" required />
            </label>
            <label className="flex flex-col gap-1">
              Email
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded" required />
            </label>
            <label className="flex flex-col gap-1">
              Profile Image URL
              <input type="text" value={image} onChange={e => setImage(e.target.value)} className="border p-2 rounded" />
            </label>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {message && <div className="text-green-600 mt-2">{message}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
