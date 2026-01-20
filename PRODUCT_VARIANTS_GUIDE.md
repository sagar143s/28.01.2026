# Product Variants and Bulk Pricing Guide

## Overview
Your product pages now support:
1. **Short Description** - A one-liner that appears below the product name
2. **Color Variants with Images** - Display different colors with product images and prices
3. **Bulk Pricing Bundles** - Offer discounts for buying multiple quantities (Buy 1, Bundle of 2, Bundle of 3, etc.)

---

## Adding Products with Variants

### Dashboard Location
Go to: **Store Dashboard → Add Product**

### 1. Short Description
- Fill in the "Short Description" field below the product name
- This is a brief one-liner that helps customers understand the product quickly
- Example: "Premium quality, fast delivery, 100% authentic"

### 2. Color Variants (with Images)

#### Enable Variants
1. Check the box: ☑️ "This product has variants (e.g., size/color)"
2. DO NOT check "Enable Bulk Bundles" if you want size/color variants

#### Add Variant Rows
For each color variant, fill in:
- **Color**: Name of the color (e.g., "Black", "White", "Blue")
- **Image URL**: Direct link to the product image for this color
  - Upload image to ImageKit or use any image URL
  - Example: `https://ik.imagekit.io/yourstore/product-black.jpg`
- **Size**: Optional size (e.g., "M", "L", "XL")
- **Price**: Price for this specific variant
- **MRP**: Original price (for showing discount)
- **Stock**: Available quantity

#### Example Variant Setup:
```
Color: Black  | Image: https://...black.jpg | Size: - | Price: 129 | MRP: 250 | Stock: 10
Color: White  | Image: https://...white.jpg | Size: - | Price: 129 | MRP: 250 | Stock: 15
```

### 3. Bulk Pricing Bundles

#### Enable Bulk Bundles
1. Check the box: ☑️ "Enable Bulk Bundles"
2. This automatically enables variants

#### Configure Bundle Options
The form provides 3 default rows, but you can customize:

| Label | Qty | Price | MRP | Stock | Tag |
|-------|-----|-------|-----|-------|-----|
| Buy 1 | 1 | 89.99 | 250.00 | 100 | (none) |
| Bundle of 2 | 2 | 169.00 | 500.00 | 50 | MOST_POPULAR |
| Bundle of 3 | 3 | 225.00 | 750.00 | 30 | BEST_VALUE |

**Tag Options:**
- `MOST_POPULAR` - Shows red badge "MOST POPULAR"
- `BEST_VALUE` - Shows green badge "BEST VALUE"
- `(none)` - No badge

#### How Savings Are Calculated
- Savings = (MRP × Qty) - Price
- Example: Bundle of 2
  - MRP per item: ₹ 250
  - Total MRP: ₹ 500
  - Bundle Price: ₹ 169
  - **You Save: ₹ 331**

---

## Product Page Display

### Short Description
Appears directly below the product name in gray text

### Color Variants Display
- Shows square thumbnails with product images
- Each variant shows:
  - Product image (if provided)
  - Color name
  - Price (if different from base price)
  - Stock status (In Stock / Out of Stock)
- Selected color has red border with ring effect

### Bulk Pricing Display
Shows at the top of variants section with:
- Header: "BUNDLE AND SAVE MORE!"
- Each bundle option shows:
  - Bundle label (Buy 1, Bundle of 2, etc.)
  - Subtitle (e.g., "Perfect for you & a friend")
  - Savings amount in red
  - Price and crossed-out MRP
  - Selection radio button
- MOST_POPULAR badge appears at top-right of the option

---

## Database Schema Updates

### New Fields Added to Product Model:
```prisma
model Product {
  // ... existing fields ...
  shortDescription String?           // One-liner description
  hasBulkPricing   Boolean @default(false)
  bulkPricing      Json    @default("[]")
}
```

### Variant JSON Structure

#### Color Variants:
```json
[
  {
    "options": {
      "color": "Black",
      "image": "https://...",
      "size": "M"
    },
    "price": 129,
    "mrp": 250,
    "stock": 10
  }
]
```

#### Bulk Bundles:
```json
[
  {
    "options": {
      "title": "Buy 1",
      "bundleQty": 1
    },
    "price": 89.99,
    "mrp": 250,
    "stock": 100,
    "tag": ""
  },
  {
    "options": {
      "title": "Bundle of 2",
      "bundleQty": 2,
      "tag": "MOST_POPULAR"
    },
    "price": 169.00,
    "mrp": 500,
    "stock": 50,
    "tag": "MOST_POPULAR"
  }
]
```

---

## Tips & Best Practices

### For Color Variants:
1. **Use high-quality images** - Each color should have its own clear product image
2. **Consistent naming** - Use standard color names (Black, White, Blue, not "Dark Night")
3. **Set realistic stock** - Update stock levels regularly
4. **Price differences** - If all colors are same price, use the base product price

### For Bulk Pricing:
1. **Calculate savings carefully** - Make sure the bundle price shows real savings
2. **Use tags strategically** - Only tag 1-2 options as MOST_POPULAR or BEST_VALUE
3. **Progressive discounts** - Bundle of 3 should have better per-unit price than Bundle of 2
4. **Stock management** - Consider bundle stock vs individual item stock

### Mobile Optimization:
- All variant displays are fully responsive
- Touch-friendly buttons and selections
- Horizontal scrolling for many color options
- Clear visual feedback for selections

---

## Testing Your Setup

1. **Add a test product** with variants in the dashboard
2. **View the product page** to see how variants display
3. **Test selection** - Click different colors/bundles
4. **Check pricing** - Verify price updates correctly
5. **Add to cart** - Ensure selected variant is added correctly

---

## Need Help?

- Check that variant JSON is properly formatted in database
- Ensure image URLs are publicly accessible
- Verify stock levels are > 0 for available variants
- Check browser console for any JavaScript errors
