import authSeller from "@/middlewares/authSeller";
import imagekit from "@/configs/imageKit";


export async function POST(request) {
    try {
        // Get userId from Authorization header (Firebase ID token)
        const authHeader = request.headers.get('authorization') || '';
        let userId = null;
        if (authHeader.startsWith('Bearer ')) {
            const token = authHeader.replace('Bearer ', '');
            // Decode Firebase token to get userId (sub)
            const base64Payload = token.split('.')[1];
            const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
            userId = payload.user_id || payload.sub || null;
        }
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const storeId = await authSeller(userId);
        if (!storeId) {
            return Response.json({ error: "Store not approved or not found" }, { status: 403 });
        }
        const formData = await request.formData();
        const image = formData.get('image');
        if (!image) {
            return Response.json({ error: "No image provided" }, { status: 400 });
        }
        // Convert file to buffer (same as product images)
        const buffer = Buffer.from(await image.arrayBuffer());
        // Upload to ImageKit
        const response = await imagekit.upload({
            file: buffer,
            fileName: `desc_${Date.now()}_${image.name}`,
            folder: "products/descriptions"
        });
        // Return transformed URL
        const url = imagekit.url({
            path: response.filePath,
            transformation: [
                { quality: "auto" },
                { format: "webp" },
                { width: "800" }
            ]
        });
        return Response.json({ 
            success: true, 
            url: url 
        });
    } catch (error) {
        console.error('Image upload error:', error);
        return Response.json({ 
            error: error.message || "Failed to upload image" 
        }, { status: 500 });
    }
}
