'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FolderIcon, ShoppingBagIcon, ChevronRightIcon } from 'lucide-react'

export default function CategoriesPage() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/store/categories')
            const data = await res.json()
            if (data.categories) {
                setCategories(data.categories)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setLoading(false)
        }
    }

    // Get only parent categories
    const parentCategories = categories.filter(cat => !cat.parentId)

    if (loading) {
        return (
            <div className="bg-gray-50 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8 min-h-[60vh]">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Shop by Category</h1>
                    <p className="text-gray-600 mt-2">Browse our wide selection of products</p>
                </div>

                {/* Categories */}
                {parentCategories.length > 0 ? (
                    <div className="space-y-8">
                        {parentCategories.map(parent => (
                            <div key={parent.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                {/* Parent Category Header */}
                                <Link
                                    href={`/products?category=${encodeURIComponent(parent.name)}`}
                                    className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-50 to-white hover:from-orange-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        {parent.image ? (
                                            <img
                                                src={parent.image}
                                                alt={parent.name}
                                                className="w-20 h-20 object-cover rounded-lg shadow-md"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <FolderIcon size={40} className="text-orange-500" />
                                            </div>
                                        )}
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                                {parent.name}
                                            </h2>
                                            {parent.description && (
                                                <p className="text-gray-600 mt-1">{parent.description}</p>
                                            )}
                                            {parent.children && parent.children.length > 0 && (
                                                <p className="text-sm text-gray-500 mt-2">
                                                    {parent.children.length} subcategories
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRightIcon size={24} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                                </Link>

                                {/* Subcategories Grid */}
                                {parent.children && parent.children.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6 bg-gray-50">
                                        {parent.children.map(child => (
                                            <Link
                                                key={child.id}
                                                href={`/products?category=${encodeURIComponent(child.name)}`}
                                                className="group bg-white border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all hover:-translate-y-1"
                                            >
                                                <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                                                    {child.image ? (
                                                        <img
                                                            src={child.image}
                                                            alt={child.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <FolderIcon size={32} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <h3 className="font-semibold text-gray-900 text-sm text-center group-hover:text-orange-500 transition-colors line-clamp-2">
                                                    {child.name}
                                                </h3>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                        <ShoppingBagIcon size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-2xl text-gray-400 mb-2">No categories available</p>
                        <p className="text-gray-500">Categories will appear here once they are added</p>
                    </div>
                )}
            </div>
        </div>
    )
}
