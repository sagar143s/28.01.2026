"use client"
import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon, StarIcon, FolderIcon, TicketIcon, TruckIcon, RefreshCw, User as UserIcon, Users as UsersIcon, MessageSquare, Sparkles, BellIcon, MailIcon, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import axios from "axios";

const StoreSidebar = ({storeInfo}) => {
    const [showSettings, setShowSettings] = useState(false);
    const pathname = usePathname()

    const sidebarLinks = [
        { name: 'Dashboard', href: '/store', icon: HomeIcon },
        { name: 'Categories', href: '/store/categories', icon: FolderIcon },
        { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
        { name: 'Manage Product', href: '/store/manage-product', icon: SquarePenIcon },
        { name: 'Coupons', href: '/store/coupons', icon: TicketIcon },
        { name: 'Shipping', href: '/store/shipping', icon: TruckIcon },
        { name: 'Customers', href: '/store/customers', icon: UsersIcon },
        { name: 'Manage Users', href: '/store/settings/users', icon: UserIcon },
        { name: 'Orders', href: '/store/orders', icon: LayoutListIcon },
        { name: 'Return Requests', href: '/store/return-requests', icon: RefreshCw },
        { name: 'Reviews', href: '/store/reviews', icon: StarIcon },
        { name: 'Support Tickets', href: '/store/tickets', icon: MessageSquare },
        { name: 'Contact Us Messages', href: '/store#contact-messages', icon: StarIcon },
        { name: 'Product Notifications', href: '/store/product-notifications', icon: BellIcon },
        { name: 'Promotional Emails', href: '/store/promotional-emails', icon: MailIcon },
    ]

    const featuredProductsLink = { name: 'Featured Products', href: '/store/featured-products', icon: Sparkles }
    const carouselSliderLink = { name: 'Carousel Slider', href: '/store/carousel-slider', icon: StarIcon }
    const dealsLink = { name: 'Deals of the Day', href: '/store/deals', icon: Clock }

    return (
        <div className="inline-flex h-full flex-col justify-between border-r border-slate-200 sm:min-w-60">
            <div>
                <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
                    <Image
                        className="w-14 h-14 rounded-full shadow-md"
                        src={storeInfo?.logo && !storeInfo.logo.includes('placehold.co') ? storeInfo.logo : '/default-store-logo.png'}
                        alt={storeInfo?.name || 'Store Logo'}
                        width={80}
                        height={80}
                    />
                    <p className="text-slate-700">{storeInfo?.name || 'Store'}</p>
                </div>
                <div className="max-sm:mt-6">
                    {
                        sidebarLinks.map((link, index) => (
                            <Link key={index} href={link.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === link.href && 'bg-slate-100 sm:text-slate-600'}`}>
                                <link.icon size={18} className="sm:ml-5" />
                                <p className="max-sm:hidden">{link.name}</p>
                                {pathname === link.href && <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                            </Link>
                        ))
                    }
                    
                    {/* Divider Line */}
                    <div className="my-4 border-t border-slate-300 mx-2.5"></div>
                    
                    {/* Featured Products Link - Below Contact Messages */}
                    <Link href={featuredProductsLink.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === featuredProductsLink.href && 'bg-slate-100 sm:text-slate-600'}`}>
                        <featuredProductsLink.icon size={18} className="sm:ml-5" />
                        <p className="max-sm:hidden">{featuredProductsLink.name}</p>
                        {pathname === featuredProductsLink.href && <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                    </Link>
                    {/* Carousel Slider Link - Below Featured Products */}
                    <Link href={carouselSliderLink.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === carouselSliderLink.href && 'bg-slate-100 sm:text-slate-600'}`}>
                        <carouselSliderLink.icon size={18} className="sm:ml-5" />
                        <p className="max-sm:hidden">{carouselSliderLink.name}</p>
                        {pathname === carouselSliderLink.href && <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                    </Link>
                    {/* Deals of the Day Link */}
                    <Link href={dealsLink.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === dealsLink.href && 'bg-slate-100 sm:text-slate-600'}`}>
                        <dealsLink.icon size={18} className="sm:ml-5" />
                        <p className="max-sm:hidden">{dealsLink.name}</p>
                        {pathname === dealsLink.href && <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                    </Link>
                </div>
            </div>
            <div className="mb-6 flex flex-col items-center">
                {/* Desktop: full button, Mobile: icon only */}
                <button
                    className="w-44 px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-blue-600 hover:text-white transition max-sm:hidden"
                    onClick={() => setShowSettings(true)}
                >
                    Settings
                </button>
                <button
                    className="sm:hidden p-2 rounded-full bg-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white transition"
                    aria-label="Settings"
                    onClick={() => setShowSettings(true)}
                >
                    {/* Lucide settings icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.94-2.34a1 1 0 0 0 .26-1.09l-1.43-2.49a1 1 0 0 1 0-.94l1.43-2.49a1 1 0 0 0-.26-1.09l-2.12-2.12a1 1 0 0 0-1.09-.26l-2.49 1.43a1 1 0 0 1-.94 0l-2.49-1.43a1 1 0 0 0-1.09.26l-2.12 2.12a1 1 0 0 0-.26 1.09l1.43 2.49a1 1 0 0 1 0 .94l-1.43 2.49a1 1 0 0 0 .26 1.09l2.12 2.12a1 1 0 0 0 1.09.26l2.49-1.43a1 1 0 0 1 .94 0l2.49 1.43a1 1 0 0 0 1.09-.26l2.12-2.12z" />
                    </svg>
                </button>
            </div>
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95" style={{backdropFilter: 'blur(2px)'}}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-0 relative flex flex-col">
                        <button onClick={() => setShowSettings(false)} className="absolute top-3 right-4 text-2xl text-slate-400 hover:text-slate-700">&times;</button>
                        <SimpleSettingsModal />
                    </div>
                </div>
            )}
        </div>
    )
}


function SimpleSettingsModal() {
        // Invite user state
        const [inviteOpen, setInviteOpen] = useState(false);
        const [inviteEmail, setInviteEmail] = useState("");
        const [inviteStatus, setInviteStatus] = useState("");
    // Use storeInfo for seller details, fallback to user if needed
    const { user, getToken } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [image, setImage] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // Populate fields when user is loaded or changes
    useEffect(() => {
        setName(user?.displayName || user?.name || "");
        setEmail(user?.email || "");
        setImage(user?.photoURL || user?.image || "");
    }, [user]);

    // Live preview for uploaded image, fallback to current or first letter avatar
    let imagePreview = null;
    if (imageFile) {
        imagePreview = URL.createObjectURL(imageFile);
    } else if (image) {
        imagePreview = image;
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        try {
            const token = await getToken();
            let imageUrl = image;
            if (imageFile) {
                // Upload image to server or imagekit (implement as needed)
                const formData = new FormData();
                formData.append("image", imageFile);
                const res = await axios.post("/api/store/profile/upload-image", formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                imageUrl = res.data.url;
            }
            await axios.post("/api/store/profile/update", { name, image: imageUrl, email }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Profile updated successfully!");
            setImage(imageUrl);
            setImageFile(null);
        } catch (err) {
            setMessage(err?.response?.data?.error || err.message);
        }
        setSaving(false);
    };

    return (
        <div className="flex flex-col gap-4 p-8">
            {/* Profile form */}
            <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 mb-4">
                <div className="relative w-24 h-24">
                    {imagePreview ? (
                        <img src={imagePreview} alt="Profile" className="w-24 h-24 rounded-full object-cover border shadow bg-slate-100" />
                    ) : (
                        <span className="w-24 h-24 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-4xl border shadow bg-slate-100 select-none">
                            {(name?.[0] || email?.[0] || 'U').toUpperCase()}
                        </span>
                    )}
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer shadow-lg" title="Upload image">
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                            if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                        }} />
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 16v-8m0 0l-3 3m3-3l3 3"/></svg>
                    </label>
                </div>
                <div className="text-center mt-2">
                    <div className="font-semibold text-lg">{name || "Your Name"}</div>
                    <div className="text-slate-500 text-sm">{email || "your@email.com"}</div>
                </div>
            </div>
            <label className="flex flex-col gap-1">
                Name
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="border p-2 rounded" required />
            </label>
            <label className="flex flex-col gap-1">
                Email
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded" required />
            </label>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-2" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
            </button>
            {message && <div className="text-green-600 mt-2 text-center">{message}</div>}
            </form>

            {/* Invite User Section */}
            <div className="mt-6">
                {!inviteOpen ? (
                    <button
                        type="button"
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded w-full"
                        onClick={() => setInviteOpen(true)}
                    >
                        Invite User
                    </button>
                ) : (
                    <form
                        onSubmit={async e => {
                            e.preventDefault();
                            setInviteStatus("");
                            try {
                                const token = await getToken();
                                await axios.post("/api/store/users/invite", { email: inviteEmail }, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                setInviteStatus("Invitation sent!");
                                setInviteEmail("");
                            } catch (err) {
                                setInviteStatus(err?.response?.data?.error || err.message);
                            }
                        }}
                        className="flex flex-col gap-2 mt-2"
                    >
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            placeholder="Enter user email"
                            className="border p-2 rounded"
                            required
                        />
                        <div className="flex gap-2">
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex-1">Send Invite</button>
                            <button type="button" className="bg-gray-200 px-4 py-2 rounded flex-1" onClick={() => { setInviteOpen(false); setInviteStatus(""); }}>Cancel</button>
                        </div>
                        {inviteStatus && <div className="text-center text-sm mt-1 text-green-600">{inviteStatus}</div>}
                    </form>
                )}
            </div>
        </div>
    );
}

function ProfileSettingsForm() {
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
    );
}

function ManageUsersPanel() {
    const { user, getToken } = useAuth();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [inviting, setInviting] = useState(false);
    const [users, setUsers] = useState([]); // Should be fetched from backend
    const [pending, setPending] = useState([]); // Pending invitations

    // Fetch users and pending invites on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = await getToken();
                const res = await axios.get("/api/store/users", { headers: { Authorization: `Bearer ${token}` } });
                setUsers(res.data.users || []);
                setPending(res.data.pending || []);
            } catch {}
        };
        fetchUsers();
    }, [getToken]);

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviting(true);
        setMessage("");
        try {
            const token = await getToken();
            await axios.post("/api/store/users/invite", { email }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Invitation sent! Pending approval.");
            setEmail("");
        } catch (err) {
            setMessage(err?.response?.data?.error || err.message);
        }
        setInviting(false);
    };

    const handleApprove = async (inviteId) => {
        try {
            const token = await getToken();
            await axios.post(`/api/store/users/approve`, { inviteId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("User approved!");
        } catch (err) {
            setMessage(err?.response?.data?.error || err.message);
        }
    };

    const handleDelete = async (userId) => {
        try {
            const token = await getToken();
            await axios.post(`/api/store/users/delete`, { userId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("User deleted!");
        } catch (err) {
            setMessage(err?.response?.data?.error || err.message);
        }
    };

    const handleMakeAdmin = async (userId) => {
        try {
            const token = await getToken();
            await axios.post(`/api/store/users/make-admin`, { userId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("User promoted to admin!");
        } catch (err) {
            setMessage(err?.response?.data?.error || err.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleInvite} className="flex flex-col gap-4 mb-6">
                <label className="flex flex-col gap-1">
                    Invite User by Email
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded" required />
                </label>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={inviting}>
                    {inviting ? "Inviting..." : "Send Invite"}
                </button>
                {message && <div className="text-green-600 mt-2">{message}</div>}
            </form>
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Pending Invitations</h3>
                <ul className="divide-y">
                    {pending.map(invite => (
                        <li key={invite.id} className="flex items-center justify-between py-2">
                            <span>{invite.email}</span>
                            <button onClick={() => handleApprove(invite.id)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">Approve</button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Current Users</h3>
                <ul className="divide-y">
                    {users.map(u => (
                        <li key={u.id} className="flex items-center justify-between py-2">
                            <span>{u.email} <span className="ml-2 text-xs text-slate-500">({u.role})</span></span>
                            <div className="flex gap-2">
                                {u.role !== "admin" && (
                                    <button onClick={() => handleMakeAdmin(u.id)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">Make Admin</button>
                                )}
                                <button onClick={() => handleDelete(u.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default StoreSidebar