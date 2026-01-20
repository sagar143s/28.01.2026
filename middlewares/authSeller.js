import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Store from '@/models/Store';

const authSeller = async (userId) => {
    try {
        if (!userId) {
            console.log('[authSeller] No userId provided');
            return false;
        }
        await connectDB();
        
        // Look for store directly by userId (Firebase UID)
        const store = await Store.findOne({ userId: userId }).lean();
        console.log('[authSeller] Store found:', store ? `Yes (${store._id})` : 'No');
        console.log('[authSeller] Store status:', store?.status);
        
        if (store && store.status === 'approved') {
            return store._id.toString();
        }
        
        return false;
    } catch (error) {
        console.log('[authSeller] Error:', error);
        return false;
    }
}

export default authSeller