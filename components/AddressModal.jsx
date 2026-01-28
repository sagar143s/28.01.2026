'use client'
import { addAddress, fetchAddress } from "@/lib/features/address/addressSlice"

import axios from "axios"
import { XIcon } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { useDispatch } from "react-redux"

import { useAuth } from '@/lib/useAuth';

const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh" 
];
const keralaDistricts = [
    "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"
];

const AddressModal = ({ open, setShowAddressModal, onAddressAdded, initialAddress = null, isEdit = false, onAddressUpdated }) => {
    const { user, getToken } = useAuth()
    const dispatch = useDispatch()
    const phoneInputRef = useRef(null)

    const [address, setAddress] = useState({
        name: '',
        email: '',
        street: '',
        city: '',
        state: '',
        district: '',
        zip: '',
        country: 'India',
        phone: '',
        phoneCode: '+91',
        alternatePhone: '',
        alternatePhoneCode: '+91',
        id: null,
    })

    // Prefill when editing
    useEffect(() => {
        if (isEdit && initialAddress) {
            // Extract phone number without country code if present
            let phoneNumber = initialAddress.phone || '';
            // If phone starts with +, remove country code part
            if (phoneNumber.startsWith('+')) {
                // Remove country code (everything before the actual number)
                phoneNumber = phoneNumber.replace(/^\+\d+/, '').trim();
            }
            
            setAddress({
                id: initialAddress.id || initialAddress._id || null,
                name: initialAddress.name || '',
                email: initialAddress.email || '',
                street: initialAddress.street || '',
                city: initialAddress.city || '',
                state: initialAddress.state || '',
                district: initialAddress.district || '',
                zip: initialAddress.zip || '',
                country: initialAddress.country || 'India',
                phone: phoneNumber,
                phoneCode: initialAddress.phoneCode || '+91',
                alternatePhone: initialAddress.alternatePhone || '',
                alternatePhoneCode: initialAddress.alternatePhoneCode || initialAddress.phoneCode || '+91',
            })
        }
    }, [isEdit, initialAddress])

    const countries = [
        { name: 'India', code: '+91' },
        { name: 'United Arab Emirates', code: '+971' },
        { name: 'Saudi Arabia', code: '+966' },
        { name: 'Qatar', code: '+974' },
        { name: 'Kuwait', code: '+965' },
        { name: 'Bahrain', code: '+973' },
        { name: 'Oman', code: '+968' },
        { name: 'Pakistan', code: '+92' },
    ];

    const handleAddressChange = (e) => {
        const { name, value } = e.target
        if (name === 'country') {
            const selectedCountry = countries.find(c => c.name === value)
            setAddress({
                ...address,
                country: value,
                phoneCode: selectedCountry?.code || '+971',
                alternatePhoneCode: selectedCountry?.code || '+971'
            })
        } else {
            setAddress({
                ...address,
                [name]: value
            })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (!user || !user.uid) {
                toast.error('User not authenticated. Please sign in again.');
                return;
            }

            // Clean and validate phone number
            const cleanedPhone = address.phone.replace(/[^0-9]/g, '');
            const cleanedAlternate = (address.alternatePhone || '').replace(/[^0-9]/g, '');
            
            if (!cleanedPhone || cleanedPhone.length < 7 || cleanedPhone.length > 15) {
                toast.error('Phone number must be between 7 and 15 digits');
                return;
            }

            if (cleanedAlternate && (cleanedAlternate.length < 7 || cleanedAlternate.length > 15)) {
                toast.error('Alternate number must be between 7 and 15 digits');
                return;
            }
            
            const token = await getToken()
            
            // Prepare address data with userId from authenticated user
            const addressData = { ...address, userId: user.uid, phone: cleanedPhone };
            addressData.alternatePhone = cleanedAlternate || '';
            addressData.alternatePhoneCode = cleanedAlternate ? address.alternatePhoneCode || address.phoneCode : '';
            
            if (!addressData.zip || addressData.zip.trim() === '') {
                delete addressData.zip
            }
            // Remove district if not present or empty (to match Prisma schema)
            if (!addressData.district) {
                delete addressData.district;
            }
            if (!addressData.alternatePhone) {
                delete addressData.alternatePhone;
                delete addressData.alternatePhoneCode;
            }
            
            console.log('AddressModal - Sending address:', addressData);
            
            if (isEdit && addressData.id) {
                const { data } = await axios.put('/api/address', { id: addressData.id, address: addressData }, { headers: { Authorization: `Bearer ${token}` } })
                toast.success(data.message || 'Address updated')
                if (onAddressUpdated) {
                    onAddressUpdated(data.updated)
                }
            } else {
                const { data } = await axios.post('/api/address', {address: addressData}, {headers: { Authorization: `Bearer ${token}` } })
                dispatch(addAddress(data.newAddress))
                // Immediately refresh address list in Redux after adding
                dispatch(fetchAddress({ getToken }))
                toast.success(data.message)
                if (onAddressAdded) {
                    onAddressAdded(data.newAddress);
                }
            }
            setShowAddressModal(false)
            // Reset form state after save
            setAddress({
                name: '',
                email: '',
                street: '',
                city: '',
                state: '',
                district: '',
                zip: '',
                country: 'India',
                phone: '',
                phoneCode: '+91',
                alternatePhone: '',
                alternatePhoneCode: '+91',
                id: null,
            })
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.error || error?.response?.data?.message || error.message)
        }
    }

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit' : 'Add New'} <span className="text-blue-600">Address</span></h2>
                    <button type="button" onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                        <XIcon size={24} />
                    </button>
                </div>
                <form onSubmit={e => toast.promise(handleSubmit(e), { loading: 'Adding Address...' })} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                        <input 
                            name="name" 
                            onChange={handleAddressChange} 
                            value={address.name} 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                            type="text" 
                            placeholder="Enter your name" 
                            required 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                        <input 
                            name="email" 
                            onChange={handleAddressChange} 
                            value={address.email} 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                            type="email" 
                            placeholder="Email address" 
                            required 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                        <input 
                            name="street" 
                            onChange={handleAddressChange} 
                            value={address.street} 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                            type="text" 
                            placeholder="Street" 
                            required 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                            <input 
                                name="city" 
                                onChange={handleAddressChange} 
                                value={address.city} 
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                                type="text" 
                                placeholder="City" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                            <select
                                name="state"
                                onChange={handleAddressChange}
                                value={address.state}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                                required
                            >
                                <option value="">Select State</option>
                                {indianStates.map((state) => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {address.state === "Kerala" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">District</label>
                            <select
                                name="district"
                                onChange={handleAddressChange}
                                value={address.district}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                                required
                            >
                                <option value="">Select District</option>
                                {keralaDistricts.map((district) => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Zip/Postal Code (Optional)</label>
                        <input 
                            name="zip" 
                            onChange={handleAddressChange} 
                            value={address.zip} 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                            type="text" 
                            placeholder="Postal code" 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                        <select 
                            name="country" 
                            onChange={handleAddressChange} 
                            value={address.country} 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white" 
                            required
                        >
                            {countries.map((country) => (
                                <option key={country.name} value={country.name}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                        <div className="flex gap-2">
                            <select
                                name="phoneCode"
                                onChange={handleAddressChange}
                                value={address.phoneCode}
                                className="px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium min-w-[80px]"
                                required
                            >
                                {countries.map((country) => (
                                    <option key={country.code} value={country.code}>{country.code}</option>
                                ))}
                            </select>
                            <input 
                                key={address.id || 'new'}
                                ref={phoneInputRef}
                                name="phone" 
                                onChange={(e) => {
                                    // Only allow numbers
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    e.target.value = value;
                                    setAddress({
                                        ...address,
                                        phone: value
                                    });
                                }}
                                defaultValue={address.phone}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                                type="text"
                                inputMode="numeric"
                                placeholder="9876543210" 
                                required 
                                autoComplete="off"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Enter phone number without country code</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Alternate Phone (Optional)</label>
                        <div className="flex gap-2">
                            <select
                                name="alternatePhoneCode"
                                onChange={handleAddressChange}
                                value={address.alternatePhoneCode}
                                className="px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium min-w-[80px]"
                            >
                                {countries.map((country) => (
                                    <option key={country.code} value={country.code}>{country.code}</option>
                                ))}
                            </select>
                            <input
                                name="alternatePhone"
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    e.target.value = value;
                                    setAddress({
                                        ...address,
                                        alternatePhone: value
                                    });
                                }}
                                value={address.alternatePhone}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                type="text"
                                inputMode="numeric"
                                placeholder="Alternate contact number"
                                autoComplete="off"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Optional number we can reach if primary is unavailable.</p>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button 
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                        >
                            {isEdit ? 'SAVE CHANGES' : 'SAVE ADDRESS'}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setShowAddressModal(false)}
                            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-3 rounded-lg transition-colors"
                        >
                            CANCEL
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddressModal