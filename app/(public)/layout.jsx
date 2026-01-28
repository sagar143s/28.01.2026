
'use client'
import MobileBottomNav from "@/components/MobileBottomNav";
import GuestOrderLinker from "@/components/GuestOrderLinker";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { fetchProducts } from "@/lib/features/product/productSlice";



function PublicLayoutAuthed({ children }) {
    const dispatch = useDispatch();
    const { cartItems } = useSelector((state) => state.cart);
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const isCheckout = pathname === '/checkout';

    useEffect(() => { 
        // Defer product fetch to allow critical content to load first
        const timer = setTimeout(() => {
            dispatch(fetchProducts({})); 
        }, 100);
        return () => clearTimeout(timer);
    }, [dispatch]);

    return (
        <div className="flex flex-col min-h-screen">
            <GuestOrderLinker />
            {/* <Banner />/ */}
            <main className={`flex-1 ${isHomePage ? 'pb-8' : 'pb-20'} lg:pb-0`}>{children}</main>
            {!isHomePage && !isCheckout && <MobileBottomNav />}
        </div>
    );
}

export default function PublicLayout(props) {
    return <PublicLayoutAuthed {...props} />;
}
