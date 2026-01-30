// Promotional Email Templates
// Each template has an attractive design with the specified title/theme

export const promotionalTemplates = [
  {
    id: 'buy-now-pay-later',
    subject: 'Buy Now, Pay Later – Don\'t Miss Out',
    title: 'Buy Now, Pay Later',
    subtitle: 'Don\'t Miss Out',
    emoji: '💳',
    color: '#8b5cf6',
    content: 'Shop now and pay at your convenience. Flexible payment options available on all your favorite products!',
    cta: 'Start Shopping',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">💳</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Buy Now, Pay Later</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Don't Miss Out</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Shop now and pay at your convenience. Flexible payment options available on all your favorite products!
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #8b5cf6; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">
              Start Shopping
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'price-dropped',
    subject: 'Price Dropped on Popular Picks ⏬',
    title: 'Price Dropped',
    subtitle: 'Popular Picks',
    emoji: '⏬',
    color: '#ef4444',
    content: 'Your favorite products just got more affordable! Check out these amazing price drops.',
    cta: 'View Deals',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">⏬</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Price Dropped</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Popular Picks</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Your favorite products just got more affordable! Check out these amazing price drops.
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #ef4444; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);">
              View Deals
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'limited-time-deals',
    subject: 'Hurry! Limited-Time Deals Live',
    title: 'Limited-Time Deals',
    subtitle: 'Hurry!',
    emoji: '⚡',
    color: '#f59e0b',
    content: 'These exclusive deals won\'t last long. Shop now before they\'re gone!',
    cta: 'Shop Now',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">⚡</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Hurry! Limited-Time Deals</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Shop Before They're Gone</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            These exclusive deals won't last long. Shop now before they're gone!
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #f59e0b; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);">
              Shop Now
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'trending-now',
    subject: 'Trending Now on Quickfynd 🔥',
    title: 'Trending Now',
    subtitle: 'on Quickfynd',
    emoji: '🔥',
    color: '#ec4899',
    content: 'See what everyone\'s buying! These hot products are flying off the shelves.',
    cta: 'See Trending',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">🔥</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Trending Now</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">on Quickfynd</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            See what everyone's buying! These hot products are flying off the shelves.
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #ec4899; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(236, 72, 153, 0.3);">
              See Trending
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'wishlist-cheaper',
    subject: 'Your Wishlist Just Got Cheaper',
    title: 'Your Wishlist',
    subtitle: 'Just Got Cheaper',
    emoji: '💝',
    color: '#f43f5e',
    content: 'Great news! Products you love are now at better prices. Time to treat yourself!',
    cta: 'Check Wishlist',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">💝</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Your Wishlist Just Got Cheaper</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Time to Treat Yourself!</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Great news! Products you love are now at better prices. Time to treat yourself!
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #f43f5e; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(244, 63, 94, 0.3);">
              Check Wishlist
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'selling-fast',
    subject: 'Selling Fast! Grab It Before It\'s Gone',
    title: 'Selling Fast!',
    subtitle: 'Grab It Before It\'s Gone',
    emoji: '⚠️',
    color: '#dc2626',
    content: 'Limited stock alert! These popular items are selling out quickly.',
    cta: 'Shop Now',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">⚠️</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Selling Fast!</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Grab It Before It's Gone</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Limited stock alert! These popular items are selling out quickly.
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
              Shop Now
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'best-finds',
    subject: 'Today\'s Best Finds Are Waiting',
    title: 'Today\'s Best Finds',
    subtitle: 'Are Waiting',
    emoji: '✨',
    color: '#06b6d4',
    content: 'Discover today\'s handpicked selection of amazing products just for you!',
    cta: 'Discover Now',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">✨</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Today's Best Finds</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Are Waiting</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Discover today's handpicked selection of amazing products just for you!
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #06b6d4; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(6, 182, 212, 0.3);">
              Discover Now
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'flash-deals',
    subject: 'Flash Deals Ending Soon ⏰',
    title: 'Flash Deals',
    subtitle: 'Ending Soon',
    emoji: '⏰',
    color: '#ea580c',
    content: 'Time is running out! Grab these incredible flash deals before they expire.',
    cta: 'Grab Deals',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">⏰</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Flash Deals Ending Soon</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Time is Running Out!</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Time is running out! Grab these incredible flash deals before they expire.
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.3);">
              Grab Deals
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'smart-buys',
    subject: 'Smart Buys at Better Prices',
    title: 'Smart Buys',
    subtitle: 'at Better Prices',
    emoji: '🧠',
    color: '#3b82f6',
    content: 'Shop smart, save more! Quality products at unbeatable prices.',
    cta: 'Shop Smart',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">🧠</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Smart Buys at Better Prices</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Shop Smart, Save More</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Shop smart, save more! Quality products at unbeatable prices.
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
              Shop Smart
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'popular-products',
    subject: 'Popular Products, Better Value',
    title: 'Popular Products',
    subtitle: 'Better Value',
    emoji: '⭐',
    color: '#10b981',
    content: 'Everyone loves these products - and for good reason! Get the best value today.',
    cta: 'View Popular',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">⭐</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Popular Products, Better Value</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Everyone Loves These!</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Everyone loves these products - and for good reason! Get the best value today.
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #10b981; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
              View Popular
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'last-chance',
    subject: 'Last Chance to Save on Top Picks',
    title: 'Last Chance',
    subtitle: 'to Save on Top Picks',
    emoji: '🎯',
    color: '#7c3aed',
    content: 'Final opportunity to snag these bestsellers at amazing prices!',
    cta: 'Save Now',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">🎯</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Last Chance to Save</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">on Top Picks</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Final opportunity to snag these bestsellers at amazing prices!
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #7c3aed; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3);">
              Save Now
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'daily-essentials',
    subject: 'Prices Slashed on Daily Essentials',
    title: 'Prices Slashed',
    subtitle: 'on Daily Essentials',
    emoji: '🛒',
    color: '#0d9488',
    content: 'Stock up on everyday essentials at incredible prices. Your wallet will thank you!',
    cta: 'Shop Essentials',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">🛒</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Prices Slashed</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">on Daily Essentials</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Stock up on everyday essentials at incredible prices. Your wallet will thank you!
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #0d9488; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(13, 148, 136, 0.3);">
              Shop Essentials
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'dont-wait',
    subject: 'Don\'t Wait – Deals Won\'t Last',
    title: 'Don\'t Wait',
    subtitle: 'Deals Won\'t Last',
    emoji: '⚡',
    color: '#f97316',
    content: 'Act now! These amazing deals are disappearing fast.',
    cta: 'Shop Now',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">⚡</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Don't Wait – Deals Won't Last</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Act Now!</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Act now! These amazing deals are disappearing fast.
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #f97316; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3);">
              Shop Now
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'more-value',
    subject: 'More Value. Less Waiting. Shop Now',
    title: 'More Value. Less Waiting.',
    subtitle: 'Shop Now',
    emoji: '🚀',
    color: '#8b5cf6',
    content: 'Fast delivery, great prices, amazing products. What more could you want?',
    cta: 'Start Shopping',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">🚀</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">More Value. Less Waiting.</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Shop Now</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Fast delivery, great prices, amazing products. What more could you want?
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #8b5cf6; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">
              Start Shopping
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'new-deals',
    subject: 'New Deals Just Dropped 🚀',
    title: 'New Deals',
    subtitle: 'Just Dropped',
    emoji: '🚀',
    color: '#14b8a6',
    content: 'Fresh deals just arrived! Be the first to discover them.',
    cta: 'Explore Deals',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">🚀</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">New Deals Just Dropped</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Be the First to Discover</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Fresh deals just arrived! Be the first to discover them.
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #14b8a6; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(20, 184, 166, 0.3);">
              Explore Deals
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'shop-smart',
    subject: 'Why Pay More? Shop Smart Today',
    title: 'Why Pay More?',
    subtitle: 'Shop Smart Today',
    emoji: '💡',
    color: '#eab308',
    content: 'Smart shoppers choose Quickfynd. Get more for less!',
    cta: 'Shop Smart',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">💡</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Why Pay More?</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Shop Smart Today</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Smart shoppers choose Quickfynd. Get more for less!
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #eab308; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(234, 179, 8, 0.3);">
              Shop Smart
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'almost-sold-out',
    subject: 'Almost Sold Out – Act Fast',
    title: 'Almost Sold Out',
    subtitle: 'Act Fast',
    emoji: '⏳',
    color: '#dc2626',
    content: 'Stock running low! Don\'t miss out on these popular items.',
    cta: 'Shop Now',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">⏳</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Almost Sold Out</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Act Fast</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Stock running low! Don't miss out on these popular items.
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
              Shop Now
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'smart-buy',
    subject: 'Your Next Smart Buy Is Here',
    title: 'Your Next Smart Buy',
    subtitle: 'Is Here',
    emoji: '🎁',
    color: '#6366f1',
    content: 'Discover products picked just for you at unbeatable prices!',
    cta: 'See Products',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">🎁</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Your Next Smart Buy Is Here</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Picked Just for You</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Discover products picked just for you at unbeatable prices!
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #6366f1; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);">
              See Products
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'limited-stock',
    subject: 'Best Deals, Limited Stock',
    title: 'Best Deals',
    subtitle: 'Limited Stock',
    emoji: '📦',
    color: '#f59e0b',
    content: 'These deals won\'t be around for long. Grab them while you can!',
    cta: 'Shop Deals',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">📦</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Best Deals, Limited Stock</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Grab Them While You Can</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            These deals won't be around for long. Grab them while you can!
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #f59e0b; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);">
              Shop Deals
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  },
  {
    id: 'love-quickfynd',
    subject: 'Quickfynd Finds You\'ll Love ❤️',
    title: 'Quickfynd Finds',
    subtitle: 'You\'ll Love',
    emoji: '❤️',
    color: '#f43f5e',
    content: 'Handpicked products we know you\'ll love. Start browsing!',
    cta: 'Browse Now',
    template: (products = []) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 42px; margin: 0 0 10px 0;">❤️</h1>
          <h2 style="margin: 0; font-size: 28px; font-weight: 700;">Quickfynd Finds You'll Love</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Handpicked Just for You</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Handpicked products we know you'll love. Start browsing!
          </p>
          ${generateProductGrid(products)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}" style="display: inline-block; background: #f43f5e; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(244, 63, 94, 0.3);">
              Browse Now
            </a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `
  }
];

// Helper function to generate product grid
function generateProductGrid(products = []) {
  if (!products || products.length === 0) {
    return `
      <div style="text-align: center; padding: 20px; background: #ffffff; border-radius: 8px; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 14px;">Visit our store to discover amazing deals!</p>
      </div>
    `;
  }

  const currency = '₹';
  
  return `
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0;">
      ${products.slice(0, 4).map(product => {
        const hasImage = product.image && (product.image.startsWith('http') || product.image.includes('/'));
        const imageUrl = hasImage ? product.image : 'https://via.placeholder.com/200?text=Product';
        const salePrice = product.price || product.salePrice || 0;
        const originalPrice = product.originalPrice || 0;
        const discountPercent = originalPrice && salePrice < originalPrice 
          ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
          : null;
        
        return `
          <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
            <div style="position: relative;">
              <img src="${imageUrl}" alt="${product.name || 'Product'}" style="width: 100%; height: 160px; object-fit: cover; background: #f3f4f6;"/>
              ${discountPercent ? `
                <div style="position: absolute; top: 8px; right: 8px; background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 700;">
                  ${discountPercent}% OFF
                </div>
              ` : ''}
            </div>
            <div style="padding: 12px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #111827; line-height: 1.3; min-height: 28px;">${product.name || 'Product'}</h3>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px; font-weight: 700; color: #059669;">${currency}${Math.floor(salePrice)}</span>
                ${originalPrice && originalPrice > salePrice ? `
                  <span style="font-size: 13px; color: #9ca3af; text-decoration: line-through;">
                    ${currency}${Math.floor(originalPrice)}
                  </span>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Footer component
function getFooter() {
  return `
    <div style="background: #111827; padding: 32px 30px; text-align: center; color: #9ca3af;">
      <div style="margin-bottom: 16px;">
        <span style="font-size: 28px; font-weight: 700; color: #ffffff; text-decoration: none; display: inline-block;">QuickFynd</span>
      </div>
      <p style="margin: 0 0 8px 0; font-size: 14px;">© ${new Date().getFullYear()} Quickfynd. All rights reserved.</p>
      <p style="margin: 0; font-size: 12px;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}/help" style="color: #9ca3af; text-decoration: none;">Help Center</a> | 
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://quickfynd.com'}/about-us" style="color: #9ca3af; text-decoration: none;">About Us</a>
      </p>
    </div>
  `;
}

// Get a random template
export function getRandomTemplate() {
  const randomIndex = Math.floor(Math.random() * promotionalTemplates.length);
  return promotionalTemplates[randomIndex];
}

// Get template by ID
export function getTemplateById(id) {
  return promotionalTemplates.find(template => template.id === id);
}

// Get all template IDs
export function getAllTemplateIds() {
  return promotionalTemplates.map(t => t.id);
}
