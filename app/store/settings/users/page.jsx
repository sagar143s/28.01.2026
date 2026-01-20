"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";
import axios from "axios";

export default function ManageStoreUsers() {
  const { user, getToken } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [inviting, setInviting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = await getToken();
      const response = await axios.get('/api/store/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
      setPendingInvites(response.data.pending || []);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    setMessage("");
    setError("");
    try {
      const token = await getToken();
      const response = await axios.post('/api/store/users/invite', { email }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Show success message with invite link if available
      if (response.data.inviteUrl) {
        setMessage(`Invitation sent! Share this link: ${response.data.inviteUrl}`);
      } else if (response.data.warning) {
        setMessage(`${response.data.message}. ${response.data.warning}`);
      } else {
        setMessage("Invitation sent successfully!");
      }
      
      setEmail("");
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    }
    setInviting(false);
  };

  const handleDelete = async (userEmail) => {
    if (!confirm(`Are you sure you want to remove ${userEmail}?`)) return;
    try {
      const token = await getToken();
      await axios.post('/api/store/users/delete', { userEmail }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setMessage("User removed successfully");
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    }
  };

  const handleToggleRole = async (userEmail, currentRole) => {
    const newRole = currentRole === "admin" ? "member" : "admin";
    try {
      const token = await getToken();
      await axios.post('/api/store/users/make-admin', { userEmail, role: newRole }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setMessage(`User role updated to ${newRole}`);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    }
  };

  const handleApprove = async (userEmail) => {
    try {
      const token = await getToken();
      await axios.post('/api/store/users/approve', { userEmail }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setMessage("User approved successfully");
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-56 bg-slate-50 border-r flex flex-col gap-2 p-6">
        <Link href="/store/settings" className="mb-2 px-4 py-2 rounded bg-slate-200 text-slate-700 text-center hover:bg-slate-300 transition">Settings</Link>
        <Link href="/store/settings/users" className="px-4 py-2 rounded bg-blue-600 text-white text-center hover:bg-blue-700 transition">Manage Users</Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-start mt-10">
        <div className="max-w-3xl w-full p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Manage Store Users</h2>
          
          {/* Invite Form */}
          <form onSubmit={handleInvite} className="flex flex-col gap-4 mb-6 p-4 bg-blue-50 rounded">
            <label className="flex flex-col gap-1">
              <span className="font-semibold">Invite User by Email</span>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="border p-2 rounded" 
                placeholder="user@example.com"
                required 
              />
            </label>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" 
              disabled={inviting}
            >
              {inviting ? "Sending..." : "Send Invite"}
            </button>
          </form>

          {/* Messages */}
          {message && (
            <div className="bg-green-50 border border-green-200 p-4 rounded mb-4">
              <p className="text-green-800 font-medium mb-2">✓ {message.split('Share this link:')[0]}</p>
              {message.includes('Share this link:') && (
                <div className="mt-2">
                  <input 
                    type="text" 
                    value={message.split('Share this link: ')[1]} 
                    readOnly 
                    className="w-full p-2 border rounded bg-white text-sm font-mono"
                    onClick={(e) => {
                      e.target.select();
                      navigator.clipboard.writeText(e.target.value);
                      alert('Link copied to clipboard!');
                    }}
                  />
                  <p className="text-xs text-green-600 mt-1">Click to copy invite link</p>
                </div>
              )}
            </div>
          )}
          {error && <div className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</div>}

          {/* Loading State */}
          {loading && <div className="text-center py-8">Loading users...</div>}

          {!loading && (
            <>
              {/* Pending Invites */}
              {pendingInvites.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      {pendingInvites.length}
                    </span>
                    Pending Invites
                  </h3>
                  <ul className="divide-y border rounded">
                    {pendingInvites.map(invite => (
                      <li key={invite.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                        <div>
                          <span className="font-medium">{invite.email}</span>
                          <span className="ml-3 text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">
                            {invite.status}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {invite.status === 'pending' && (
                            <button 
                              onClick={() => handleApprove(invite.email)} 
                              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                            >
                              Approve
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(invite.email)} 
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Active Users */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {users.length}
                  </span>
                  Active Users
                </h3>
                {users.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border rounded">
                    No active users yet. Invite team members above.
                  </div>
                ) : (
                  <ul className="divide-y border rounded">
                    {users.map(u => (
                      <li key={u.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                        <div>
                          <span className="font-medium">{u.email}</span>
                          <span className={`ml-3 text-xs px-2 py-1 rounded ${
                            u.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleToggleRole(u.email, u.role)} 
                            className={`px-3 py-1 text-white rounded text-sm ${
                              u.role === 'admin' 
                                ? 'bg-gray-500 hover:bg-gray-600' 
                                : 'bg-purple-500 hover:bg-purple-600'
                            }`}
                          >
                            {u.role === 'admin' ? 'Make Member' : 'Make Admin'}
                          </button>
                          <button 
                            onClick={() => handleDelete(u.email)} 
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
