import Link from 'next/link';
import { FiShoppingBag, FiUsers, FiFileText, FiInfo, FiTruck, FiStar, FiPackage, FiGrid, FiTag } from 'react-icons/fi';

export const metadata = {
  title: 'Sitemap - QuickFynd',
  description: 'Browse all pages and sections of QuickFynd',
};

export default function SitemapPage() {
  const sitemapSections = [
    {
      title: 'Shop',
      icon: FiShoppingBag,
      links: [
        { text: 'All Products', path: '/products' },
        { text: 'Fast Delivery', path: '/fast-delivery' },
        { text: 'Top Selling', path: '/top-selling' },
        { text: 'New Arrivals', path: '/new' },
        { text: 'Categories', path: '/categories' },
        { text: 'Best Selling', path: '/best-selling' },
      ]
    },
    {
      title: 'Categories',
      icon: FiTag,
      links: [
        { text: 'Trending & Featured', path: '/shop?category=trending-featured' },
        { text: "Men's Fashion", path: '/shop?category=men-s-fashion' },
        { text: "Women's Fashion", path: '/shop?category=women-s-fashion' },
        { text: 'Kids', path: '/shop?category=kids' },
        { text: 'Electronics', path: '/shop?category=electronics' },
        { text: 'Mobile Accessories', path: '/shop?category=mobile-accessories' },
        { text: 'Home & Kitchen', path: '/shop?category=home-kitchen' },
        { text: 'Beauty', path: '/shop?category=beauty' },
        { text: 'Car Essentials', path: '/shop?category=car-essentials' },
      ]
    },
    {
      title: 'Customer Care',
      icon: FiUsers,
      links: [
        { text: 'Track Order', path: '/track-order' },
        { text: 'My Orders', path: '/orders' },
        { text: 'My Profile', path: '/profile' },
        { text: 'My Wishlist', path: '/wishlist' },
        { text: 'FAQ', path: '/faq' },
        { text: 'Support', path: '/support' },
        { text: 'Help Center', path: '/help' },
      ]
    },
    {
      title: 'Legal & Information',
      icon: FiFileText,
      links: [
        { text: 'Cancellation & Refunds', path: '/cancellation-and-refunds' },
        { text: 'Terms and Conditions', path: '/terms-and-conditions' },
        { text: 'Shipping Policy', path: '/shipping-policy' },
        { text: 'Privacy Policy', path: '/privacy-policy' },
        { text: 'Contact Us', path: '/contact-us' },
      ]
    },
    {
      title: 'About QuickFynd',
      icon: FiInfo,
      links: [
        { text: 'About Us', path: '/about' },
        { text: 'Create Your Store', path: '/create-store' },
        { text: 'Become a Seller', path: '/seller' },
        { text: 'Careers', path: '/careers' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-[1450px] mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FiGrid className="w-8 h-8" />
            <h1 className="text-4xl md:text-5xl font-bold">Sitemap</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-2xl">
            Find all pages and sections of QuickFynd in one place. Navigate easily to any part of our platform.
          </p>
        </div>
      </div>

      {/* Sitemap Content */}
      <div className="max-w-[1450px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sitemapSections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <section.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">{section.title}</h2>
              </div>

              {/* Links */}
              <ul className="space-y-3">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link 
                      href={link.path}
                      className="text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all inline-flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 transition-colors"></span>
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">Need Help Finding Something?</h3>
          <p className="text-slate-600 mb-6">
            Can't find what you're looking for? Our support team is here to help you navigate QuickFynd.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/support"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Contact Support
            </Link>
            <Link 
              href="/help"
              className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              Help Center
            </Link>
          </div>
        </div>

        {/* Browse History Link */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2 group"
          >
            <span>← Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
