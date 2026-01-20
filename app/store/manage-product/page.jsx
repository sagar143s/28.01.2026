
'use client'
import { useAuth } from '@/lib/useAuth';

export const dynamic = 'force-dynamic'
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { fetchProducts as fetchProductsAction } from "@/lib/features/product/productSlice"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"

import axios from "axios"
import ProductForm from "../add-product/page"



export default function StoreManageProducts() {
    const dispatch = useDispatch();

    const { user, getToken } = useAuth();

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [editingProduct, setEditingProduct] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [categoryMap, setCategoryMap] = useState({}) // Map of category ID to name

    const fetchStoreProducts = async () => {
        try {
             const token = await getToken()
             const { data } = await axios.get('/api/store/product', {headers: { Authorization: `Bearer ${token}` } })
             setProducts(data.products.sort((a, b)=> new Date(b.createdAt) - new Date(a.createdAt)))
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    // Fetch all categories to map IDs to names
    const fetchCategories = async () => {
        try {
            const { data } = await axios.get('/api/store/categories')
            const map = {}
            data.categories?.forEach(cat => {
                map[cat._id] = cat.name
            })
            setCategoryMap(map)
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const toggleStock = async (productId) => {
        try {
            const token = await getToken()
            const { data } = await axios.post('/api/store/stock-toggle',{ productId }, {headers: { Authorization: `Bearer ${token}` } })
            setProducts(prevProducts => prevProducts.map(product =>  product._id === productId ? {...product, inStock: !product.inStock} : product))

            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const toggleFastDelivery = async (productId) => {
        try {
            const token = await getToken()
            const { data } = await axios.post('/api/store/fast-delivery-toggle', { productId }, {headers: { Authorization: `Bearer ${token}` } })
            setProducts(prevProducts => prevProducts.map(product => 
                product._id === productId ? {...product, fastDelivery: !product.fastDelivery} : product
            ))
            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const handleEdit = (product) => {
        console.log('Editing product:', product)
        console.log('  - product.category:', product.category)
        console.log('  - product.categories:', product.categories)
        console.log('  - categories is array?', Array.isArray(product.categories))
        setEditingProduct(product)
        setShowEditModal(true)
    }

    const handleDelete = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return
        
        try {
            const token = await getToken()
            await axios.delete(`/api/store/product?productId=${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setProducts(prevProducts => prevProducts.filter(p => p._id !== productId))
            toast.success('Product deleted successfully')
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const handleUpdateSuccess = (updatedProduct) => {
        setProducts(prevProducts => prevProducts.map(p => 
            p._id === updatedProduct._id ? updatedProduct : p
        ))
        setShowEditModal(false)
        setEditingProduct(null)
        // Refresh global Redux product list so frontend always uses latest slug
        dispatch(fetchProductsAction({}));
    }

    useEffect(() => {
        if(user){
            fetchStoreProducts()
            fetchCategories()
        }  
    }, [user])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5">Manage <span className="text-slate-800 font-medium">Products</span></h1>
            <table className="w-full max-w-5xl text-left  ring ring-slate-200  rounded overflow-hidden text-sm">
                <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 hidden lg:table-cell">SKU</th>
                        <th className="px-4 py-3 hidden md:table-cell">Categories</th>
                        <th className="px-4 py-3 hidden md:table-cell">Description</th>
                        <th className="px-4 py-3 hidden md:table-cell">MRP</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3 hidden sm:table-cell">Fast Delivery</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-slate-700">
                    {products.map((product) => (
                        <tr key={product._id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="flex gap-2 items-center">
                                    <Image width={40} height={40} className='p-1 shadow rounded cursor-pointer' src={product.images[0]} alt="" />
                                    {product.name}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{product.sku || '-'}</td>
                            <td className="px-4 py-3 hidden md:table-cell">
                                {product.categories && product.categories.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {product.categories.map((catId, idx) => (
                                            <span key={idx} className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                                {categoryMap[catId] || catId}
                                            </span>
                                        ))}
                                    </div>
                                ) : product.category ? (
                                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                        {categoryMap[product.category] || product.category}
                                    </span>
                                ) : (
                                    <span className="text-slate-400">-</span>
                                )}
                            </td>
                            <td className="px-4 py-3 max-w-md text-slate-600 hidden md:table-cell truncate">
                                {product.description?.replace(/<[^>]*>/g, ' ').trim().substring(0, 100)}...
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">{currency} {product.mrp.toLocaleString()}</td>
                            <td className="px-4 py-3">{currency} {product.price.toLocaleString()}</td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        onChange={() => toast.promise(toggleFastDelivery(product._id), { loading: "Updating..." })} 
                                        checked={product.fastDelivery || false} 
                                    />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                </label>
                            </td>
                            <td className="px-4 py-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" onChange={() => toast.promise(toggleStock(product._id), { loading: "Updating..." })} checked={product.inStock} />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                </label>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleEdit(product)}
                                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(product._id)}
                                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showEditModal && (
                <ProductForm 
                    product={editingProduct}
                    onClose={() => {
                        setShowEditModal(false)
                        setEditingProduct(null)
                    }}
                    onSubmitSuccess={handleUpdateSuccess}
                />
            )}
        </>
    )
}