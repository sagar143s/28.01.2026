import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './features/cart/cartSlice'
import productReducer from './features/product/productSlice'
import addressReducer from './features/address/addressSlice'
import ratingReducer from './features/rating/ratingSlice'

export const makeStore = () => configureStore({
    reducer: {
        cart: cartReducer,
        product: productReducer,
        address: addressReducer,
        rating: ratingReducer,
    },
    // No need to add thunk manually; it's included by default
});