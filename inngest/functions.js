import {inngest} from './client'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Coupon from '@/models/Coupon'

// Inngest Function to save user data to a database
export const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-create'},
 
    async ({ event }) => {
        await connectDB();
        const {data} = event
        await User.create({
            _id: data.id,
            email: data.email_addresses[0].email_address,
            name: `${data.first_name} ${data.last_name}`,
            image: data.image_url,
        })
    }
)

// Inngest Function to update user data in database 
export const syncUserUpdation = inngest.createFunction(
    {id: 'sync-user-update'},

    async ({ event }) => {
        await connectDB();
        const { data } = event
        await User.findByIdAndUpdate(data.id, {
            email: data.email_addresses[0].email_address,
            name: `${data.first_name} ${data.last_name}`,
            image: data.image_url,
        })
    }
)

// Inngest Function to delete user from database
export const syncUserDeletion = inngest.createFunction(
    {id: 'sync-user-delete'},
 
    async ({ event }) => {
        await connectDB();
        const { data } = event
        await User.findByIdAndDelete(data.id)
    }
)

// Inngest Function to delete coupon on expiry
export const deleteCouponOnExpiry = inngest.createFunction(
    {id: 'delete-coupon-on-expiry'},
    { event: 'app/coupon.expired' },
    async ({ event, step }) => {
        const { data } = event
        const expiryDate = new Date(data.expires_at)
        await step.sleepUntil('wait-for-expiry', expiryDate)

        await step.run('delete-coupon-from-database', async () => {
            await connectDB();
            await Coupon.findOneAndDelete({ code: data.code })
        })
    }
)