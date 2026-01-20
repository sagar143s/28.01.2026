import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

let debounceTimer = null

export const uploadCart = createAsyncThunk('cart/uploadCart', 
    async ({ getToken }, thunkAPI) => {
        try {
            const { cartItems } = thunkAPI.getState().cart;
            const token = await getToken();
            await axios.post('/api/cart', {cart: cartItems}, { headers: { Authorization: `Bearer ${token}` } })
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data)
        }
    }
)

export const fetchCart = createAsyncThunk('cart/fetchCart', 
    async ({ getToken }, thunkAPI) => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/cart', {headers: { Authorization: `Bearer ${token}` }})
            return data
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data)
        }
    }
)


const cartSlice = createSlice({
    name: 'cart',
    initialState: (() => {
        let saved = null;
        try {
            saved = JSON.parse(localStorage.getItem('cartState'));
        } catch {}
        return saved || { total: 0, cartItems: {} };
    })(),
    reducers: {
        rehydrateCart: (state) => {
            let saved = null;
            try {
                saved = JSON.parse(localStorage.getItem('cartState'));
            } catch {}
            if (saved) {
                state.cartItems = saved.cartItems || {};
                state.total = saved.total || 0;
            }
        },
        addToCart: (state, action) => {
            const { productId, price, variantOptions } = action.payload
            const existing = state.cartItems[productId]
            // support old number-only shape by normalising to object
            const currentQty = typeof existing === 'number' ? existing : existing?.quantity || 0
            const currentPrice = typeof existing === 'number' ? undefined : existing?.price
            const nextQty = currentQty + 1
            state.cartItems[productId] = { 
                quantity: nextQty, 
                price: price ?? currentPrice,
                ...(variantOptions ? { variantOptions } : {})
            }
            state.total += 1
            localStorage.setItem('cartState', JSON.stringify(state));
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload
            const existing = state.cartItems[productId]
            if (!existing) return
            const currentQty = typeof existing === 'number' ? existing : existing.quantity
            const nextQty = currentQty - 1
            if (nextQty <= 0) {
                delete state.cartItems[productId]
            } else {
                const price = typeof existing === 'number' ? undefined : existing.price
                state.cartItems[productId] = { quantity: nextQty, price }
            }
            state.total = Math.max(0, state.total - 1)
            localStorage.setItem('cartState', JSON.stringify(state));
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload
            const existing = state.cartItems[productId]
            const qty = typeof existing === 'number' ? existing : existing?.quantity || 0
            state.total = Math.max(0, state.total - qty)
            delete state.cartItems[productId]
            localStorage.setItem('cartState', JSON.stringify(state));
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
            localStorage.setItem('cartState', JSON.stringify(state));
        },
    },
    extraReducers: (builder)=>{
        builder.addCase(fetchCart.fulfilled, (state, action)=>{
            state.cartItems = action.payload.cart
            state.total = Object.values(action.payload.cart).reduce((acc, item)=>{
                if (typeof item === 'number') return acc + item
                return acc + (item?.quantity || 0)
            }, 0)
        })
    }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } = cartSlice.actions

export default cartSlice.reducer
