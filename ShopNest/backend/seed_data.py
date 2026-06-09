import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shopnest.settings')
django.setup()

from django.contrib.auth.models import User, Group
from products.models import Category, Product

# ── Admin ──
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@shopnest.com', 'admin1234')
    print("✅ Superuser: admin / admin1234")
else:
    print("ℹ️  Admin already exists")

# ── Seller Group ──
seller_group, _ = Group.objects.get_or_create(name='Seller')

# ── Demo Seller Account ──
if not User.objects.filter(username='seller@shopnest.com').exists():
    seller = User.objects.create_user(
        username='seller@shopnest.com',
        email='seller@shopnest.com',
        password='seller1234',
        first_name='Demo',
        last_name='Seller'
    )
    seller.groups.add(seller_group)
    print("✅ Demo Seller: seller@shopnest.com / seller1234")
else:
    seller = User.objects.get(username='seller@shopnest.com')
    print("ℹ️  Seller already exists")

# ── Categories ──
cats = {}
for name in ['Bags','Electronics','Accessories','Clothing','Home','Kitchen','Sports','Beauty','Books','Toys','Footwear','Stationery']:
    obj, _ = Category.objects.get_or_create(name=name)
    cats[name] = obj
print(f"✅ {len(cats)} categories ready")

# ── Products ──
admin_user = User.objects.get(username='admin')

PRODUCTS = [
    # Original 12 — ShopNest owned, approved
    dict(name='Vintage Leather Backpack',            category='Bags',         price=3499, old_price=4999, emoji='🎒', badge='Sale', rating=5, stock=12, sku='BAG-001', description='Hand-stitched full-grain leather backpack with laptop compartment and antique brass hardware. Perfect for the modern professional.', seller=admin_user, is_approved=True),
    dict(name='Wireless Noise-Cancelling Headphones',category='Electronics',  price=8999, old_price=None, emoji='🎧', badge='New',  rating=5, stock=8,  sku='ELC-042', description='40-hour battery life with adaptive ANC. Premium 40mm drivers deliver audiophile-grade sound in a lightweight design.', seller=admin_user, is_approved=True),
    dict(name='Minimalist Ceramic Watch',            category='Accessories',  price=5499, old_price=6999, emoji='⌚', badge='Sale', rating=4, stock=5,  sku='ACC-018', description='Swiss quartz movement in a scratch-resistant ceramic case. Sapphire crystal glass. Water resistant to 50m.', seller=admin_user, is_approved=True),
    dict(name='Organic Cotton Kurta Set',            category='Clothing',     price=1899, old_price=None, emoji='👘', badge='New',  rating=5, stock=20, sku='CLO-077', description='100% GOTS-certified organic cotton. Handblock printed using traditional Rajasthani techniques. Includes kurta and palazzo.', seller=admin_user, is_approved=True),
    dict(name='Smart Fitness Tracker',               category='Electronics',  price=4299, old_price=5499, emoji='📱', badge='Sale', rating=4, stock=15, sku='ELC-033', description='24/7 heart rate + SpO2 monitoring, 7-day battery, 5ATM water resistance. Built-in GPS.', seller=admin_user, is_approved=True),
    dict(name='Handwoven Jute Table Runner',         category='Home',         price=649,  old_price=None, emoji='🏡', badge='',    rating=4, stock=30, sku='HOM-009', description='Artisan-crafted using natural jute fibers. 180 × 35 cm.', seller=admin_user, is_approved=True),
    dict(name='Cold Brew Coffee Kit',                category='Kitchen',      price=1299, old_price=1799, emoji='☕', badge='Sale', rating=5, stock=18, sku='KIT-021', description='BPA-free glass tower with stainless steel filter. Makes 1L per batch.', seller=admin_user, is_approved=True),
    dict(name='Leather Wallet — Slim',               category='Accessories',  price=999,  old_price=None, emoji='👜', badge='',    rating=4, stock=25, sku='ACC-003', description='RFID-blocking full-grain leather. 6 card slots and central cash pocket.', seller=admin_user, is_approved=True),
    dict(name='Scented Soy Candle Set',              category='Home',         price=799,  old_price=999,  emoji='🕯️',badge='New',  rating=5, stock=22, sku='HOM-034', description='3 hand-poured soy candles: Sandalwood & Amber, Jasmine & Vanilla, Sea Salt & Fig. 40hr burn each.', seller=admin_user, is_approved=True),
    dict(name='Yoga Mat — Premium Cork',             category='Sports',       price=2199, old_price=2799, emoji='🧘', badge='Sale', rating=4, stock=10, sku='SPT-007', description='Natural cork surface with TPE foam base. Non-slip even when wet. 5mm thick.', seller=admin_user, is_approved=True),
    dict(name='Rattan Pendant Light',                category='Home',         price=3299, old_price=None, emoji='💡', badge='New',  rating=5, stock=7,  sku='HOM-055', description='Handwoven natural rattan shade with antique brass socket. E27 fitting. Shade ⌀45cm.', seller=admin_user, is_approved=True),
    dict(name='Bamboo Cutting Board Set',            category='Kitchen',      price=1099, old_price=1399, emoji='🔪', badge='Sale', rating=4, stock=35, sku='KIT-014', description='Set of 3 sustainably sourced bamboo boards with juice grooves and rubber non-slip feet.', seller=admin_user, is_approved=True),

    # New 20 products — from Demo Seller, approved
    dict(name='Rose Gold Bluetooth Speaker',         category='Electronics',  price=2799, old_price=3499, emoji='🔊', badge='Sale', rating=4, stock=20, sku='ELC-081', description='360° surround sound with 12hr battery. IPX5 waterproof. Pairs instantly via Bluetooth 5.0.', seller=seller, is_approved=True),
    dict(name='Boho Macramé Wall Hanging',           category='Home',         price=1199, old_price=None, emoji='🪢', badge='New',  rating=5, stock=15, sku='HOM-072', description='Handcrafted by artisans using 100% natural cotton rope. 60 × 90 cm. Adds bohemian warmth to any room.', seller=seller, is_approved=True),
    dict(name='Stainless Steel Water Bottle 1L',     category='Sports',       price=699,  old_price=899,  emoji='🍶', badge='Sale', rating=5, stock=50, sku='SPT-022', description='Double-wall vacuum insulation keeps drinks cold 24hrs, hot 12hrs. BPA-free, leak-proof lid.', seller=seller, is_approved=True),
    dict(name='Handmade Ceramic Mug Set',            category='Kitchen',      price=1499, old_price=None, emoji='🍵', badge='New',  rating=5, stock=18, sku='KIT-039', description='Set of 4 wheel-thrown stoneware mugs. Microwave and dishwasher safe. Each mug is unique.', seller=seller, is_approved=True),
    dict(name='Men\'s Linen Shirt',                  category='Clothing',     price=1299, old_price=1699, emoji='👔', badge='Sale', rating=4, stock=30, sku='CLO-043', description='100% pure linen. Breathable and perfect for summers. Available in S, M, L, XL.', seller=seller, is_approved=True),
    dict(name='Wooden Sunglasses',                   category='Accessories',  price=1899, old_price=None, emoji='🕶️', badge='New', rating=4, stock=12, sku='ACC-056', description='Lightweight bamboo frames with UV400 polarised lenses. Comes in a handcrafted wooden case.', seller=seller, is_approved=True),
    dict(name='Ayurvedic Face Serum',                category='Beauty',       price=899,  old_price=1199, emoji='✨', badge='Sale', rating=5, stock=40, sku='BEA-011', description='Vitamin C + Turmeric formula. Brightens skin tone in 2 weeks. Paraben-free, dermatologically tested.', seller=seller, is_approved=True),
    dict(name='Sketch & Watercolor Kit',             category='Stationery',   price=1599, old_price=None, emoji='🎨', badge='New',  rating=5, stock=22, sku='STA-007', description='48-colour watercolor pan set with 12 sketch pencils and 5 brushes. Ideal for beginners and artists.', seller=seller, is_approved=True),
    dict(name='Kids Building Blocks 200pc',          category='Toys',         price=1199, old_price=1499, emoji='🧱', badge='Sale', rating=5, stock=25, sku='TOY-034', description='200 piece classic building blocks in 8 colours. BPA-free plastic. Develops creativity and motor skills.', seller=seller, is_approved=True),
    dict(name='Leather Ankle Boots',                 category='Footwear',     price=3999, old_price=5499, emoji='👢', badge='Sale', rating=4, stock=10, sku='FOO-019', description='Full-grain leather upper with memory foam insole. Block heel 4cm. Sizes 36–42.', seller=seller, is_approved=True),
    dict(name='Atomic Habits — James Clear',         category='Books',        price=499,  old_price=699,  emoji='📚', badge='Sale', rating=5, stock=60, sku='BOK-003', description='The #1 bestseller on building good habits and breaking bad ones. Paperback edition.', seller=seller, is_approved=True),
    dict(name='Portable Laptop Stand',               category='Electronics',  price=1599, old_price=None, emoji='💻', badge='New',  rating=4, stock=30, sku='ELC-094', description='Aluminium foldable stand. Adjustable to 6 angles. Fits laptops 11–17 inch. 500g lightweight.', seller=seller, is_approved=True),
    dict(name='Women\'s Running Shoes',              category='Footwear',     price=2499, old_price=3299, emoji='👟', badge='Sale', rating=4, stock=20, sku='FOO-031', description='Breathable mesh upper with cushioned EVA sole. Lightweight at 220g. Sizes 36–42.', seller=seller, is_approved=True),
    dict(name='Neem Wood Comb Set',                  category='Beauty',       price=349,  old_price=None, emoji='🪮', badge='New',  rating=4, stock=80, sku='BEA-028', description='Set of 3 handcrafted neem wood combs. Anti-static, anti-bacterial. Good for scalp health.', seller=seller, is_approved=True),
    dict(name='Brass Pooja Thali Set',               category='Home',         price=2199, old_price=2799, emoji='🪔', badge='Sale', rating=5, stock=14, sku='HOM-088', description='Pure brass thali with diya, incense holder and bell. Diameter 30cm. Traditional craftsmanship.', seller=seller, is_approved=True),
    dict(name='Reusable Grocery Bag Set 5pc',        category='Bags',         price=399,  old_price=None, emoji='🛍️', badge='New', rating=4, stock=100, sku='BAG-047', description='Set of 5 foldable cotton mesh bags. Washable and durable. Holds up to 10kg each.', seller=seller, is_approved=True),
    dict(name='Wooden Chess Set',                    category='Toys',         price=1799, old_price=2299, emoji='♟️', badge='Sale', rating=5, stock=16, sku='TOY-051', description='Handcrafted sheesham wood board with weighted pieces. Board folds for storage. Includes rules booklet.', seller=seller, is_approved=True),
    dict(name='Herbal Green Tea 100g',               category='Kitchen',      price=299,  old_price=None, emoji='🍃', badge='New',  rating=4, stock=90, sku='KIT-062', description='Single-origin Darjeeling green tea. First flush. Rich in antioxidants. Makes ~50 cups.', seller=seller, is_approved=True),
    dict(name='Silk Scrunchie Set 6pc',              category='Accessories',  price=599,  old_price=799,  emoji='💝', badge='Sale', rating=5, stock=45, sku='ACC-071', description='100% mulberry silk. Gentle on hair, reduces breakage. 6 colours: black, blush, ivory, teal, red, gold.', seller=seller, is_approved=True),
    dict(name='Gym Resistance Band Set',             category='Sports',       price=799,  old_price=None, emoji='💪', badge='New',  rating=4, stock=55, sku='SPT-045', description='Set of 5 bands with resistance levels 10–50 lbs. Latex-free. Includes carry bag and exercise guide.', seller=seller, is_approved=True),
]

created = 0
for p in PRODUCTS:
    cat_name   = p.pop('category')
    is_approved= p.pop('is_approved')
    sel        = p.pop('seller')
    _, was_new = Product.objects.get_or_create(
        sku=p['sku'],
        defaults={**p, 'category': cats[cat_name], 'seller': sel, 'is_approved': is_approved}
    )
    if was_new:
        created += 1
    else:
        # Update existing to set is_approved=True
        Product.objects.filter(sku=p['sku']).update(is_approved=True)

print(f"✅ {created} new products created | {len(PRODUCTS)-created} already existed (updated to approved)")
print(f"✅ Total live products: {Product.objects.filter(is_approved=True).count()}")
