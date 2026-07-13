import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'superhero_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from products.models import Category, Product, ProductGallery, Review, Banner

User = get_user_model()

def seed_data():
    print("Seeding database...")
    
    # 1. Create Users
    if not User.objects.filter(email='admin@gmail.com').exists():
        admin = User.objects.create_superuser(
            email='admin@gmail.com',
            username='IronAdmin',
            password='admin123'
        )
        print("Admin user created: admin@gmail.com / admin123")
    else:
        print("Admin user already exists")

    if not User.objects.filter(email='customer@gmail.com').exists():
        customer = User.objects.create_user(
            email='customer@gmail.com',
            username='PeterParker',
            password='customer123',
            phone='+1 555-0199',
            address='20 Ingram St, Forest Hills',
            city='Queens, NY',
            zip_code='11375'
        )
        print("Customer user created: customer@gmail.com / customer123")
    else:
        customer = User.objects.get(email='customer@gmail.com')
        print("Customer user already exists")

    # 2. Create Categories
    categories_data = [
        {'name': 'Costumes', 'slug': 'costumes', 'description': 'Elite battle suits and stealth outfits.', 'image_url': 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?w=500'},
        {'name': 'Weapons', 'slug': 'weapons', 'description': 'Lethal blasters, hammers, and enchanted blades.', 'image_url': 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=500'},
        {'name': 'Accessories', 'slug': 'accessories', 'description': 'Utility belts, glowing rings, and reactor replicas.', 'image_url': 'https://images.unsplash.com/photo-1535666669445-e8c15cd2e7d8?w=500'},
        {'name': 'Helmets & Masks', 'slug': 'helmets-masks', 'description': 'Premium armors and expressions.', 'image_url': 'https://images.unsplash.com/photo-1608889174649-011830e6c69e?w=500'},
        {'name': 'Collectibles & Toys', 'slug': 'collectibles', 'description': 'Highly detailed action figures and artifacts.', 'image_url': 'https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?w=500'},
        {'name': 'Magic Items', 'slug': 'magic-items', 'description': 'Enchanted staffs, amulets, and magic cloaks.', 'image_url': 'https://images.unsplash.com/photo-1519074069444-1ba4e66631d4?w=500'},
    ]

    categories = {}
    for cat in categories_data:
        c, created = Category.objects.get_or_create(
            slug=cat['slug'],
            defaults={'name': cat['name'], 'description': cat['description'], 'image_url': cat['image_url']}
        )
        categories[cat['slug']] = c
        if created:
            print(f"Category '{c.name}' created.")

    # 3. Create Products
    products_data = [
        {
            'name': 'Spider-inspired Nano Battle Suit',
            'slug': 'spider-nano-battle-suit',
            'category': categories['costumes'],
            'description': 'Advanced nanotech armor suit offering enhanced agility, integrated web-shooters, and multi-spectral HUD. Complete with structural mesh design.',
            'price': 1299.99,
            'discount': 15,
            'stock': 12,
            'SKU': 'SH-SPDR-NANO',
            'image_url': 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?w=600',
        },
        {
            'name': 'Iron-inspired Mark-85 Armor Suit',
            'slug': 'iron-mark-85-armor',
            'category': categories['costumes'],
            'description': 'Full-body exo-armor with integrated Arc Reactor. Features flight thrusters, heavy repulsors, and a smart AI system interface.',
            'price': 4999.99,
            'discount': 10,
            'stock': 3,
            'SKU': 'SH-IRON-M85',
            'image_url': 'https://images.unsplash.com/photo-1608889174649-011830e6c69e?w=600',
        },
        {
            'name': 'Thunder Hero Storm-Hammer',
            'slug': 'thunder-hero-storm-hammer',
            'category': categories['weapons'],
            'description': 'Forged in the heart of a dying star. Channels cosmic lightning and storm-level drafts. Extremely heavy, worthy candidates only.',
            'price': 899.99,
            'discount': 20,
            'stock': 5,
            'SKU': 'SH-THNDR-HMR',
            'image_url': 'https://images.unsplash.com/photo-1613771404724-17c1e7a0008b?w=600',
        },
        {
            'name': 'Star Shield of Liberty',
            'slug': 'star-shield-liberty',
            'category': categories['weapons'],
            'description': 'Vibranium-alloy aerodynamic shield. Highly impact-resistant, bounces off solid targets, returns directly to throwing hand.',
            'price': 450.00,
            'discount': 5,
            'stock': 8,
            'SKU': 'SH-LIBTY-SHLD',
            'image_url': 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=600',
        },
        {
            'name': 'Bat-inspired Dark Knight Armor',
            'slug': 'bat-dark-knight-armor',
            'category': categories['costumes'],
            'description': 'Reinforced Kevlar composite carbon-fiber suit. Provides tactical stealth, gliding capabilities, and heavy ballistic protection.',
            'price': 2499.00,
            'discount': 0,
            'stock': 6,
            'SKU': 'SH-BAT-DK88',
            'image_url': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600',
        },
        {
            'name': 'Golden Wizard Staff of Light',
            'slug': 'golden-wizard-staff',
            'category': categories['magic-items'],
            'description': 'Infused with ancient cosmic light magic. Channels energy beams, creates shield domes, and lights dark environments.',
            'price': 349.99,
            'discount': 25,
            'stock': 15,
            'SKU': 'SH-WIZD-STF',
            'image_url': 'https://images.unsplash.com/photo-1519074069444-1ba4e66631d4?w=600',
        },
        {
            'name': 'Cosmic Emerald Power Ring',
            'slug': 'cosmic-emerald-ring',
            'category': categories['accessories'],
            'description': 'Creates solid light constructs limited only by the bearer\'s willpower. Automatically charges from the lantern generator.',
            'price': 150.00,
            'discount': 10,
            'stock': 20,
            'SKU': 'SH-GLNT-RNG',
            'image_url': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
        },
        {
            'name': 'Cosmic Gauntlet Replica',
            'slug': 'cosmic-gauntlet-replica',
            'category': categories['accessories'],
            'description': 'Stunning gold-finished gauntlet replica featuring slot-in glowing power crystals. Emits sound and light pulses.',
            'price': 799.00,
            'discount': 30,
            'stock': 2,
            'SKU': 'SH-COSM-GNT',
            'image_url': 'https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?w=600',
        },
        {
            'name': 'Cybernetic Arc Reactor Replica',
            'slug': 'arc-reactor-replica',
            'category': categories['accessories'],
            'description': 'Proof that the hero has a heart. High-intensity LED desk model with stand, runs on USB power.',
            'price': 99.99,
            'discount': 0,
            'stock': 50,
            'SKU': 'SH-ARC-REAC',
            'image_url': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
        },
        {
            'name': 'Mystic Amulet of Agamotto',
            'slug': 'mystic-amulet-agamotto',
            'category': categories['magic-items'],
            'description': 'Contains the magic eye of time. Suspended on a premium bronze chain. Eye opens via mechanical gears.',
            'price': 299.99,
            'discount': 15,
            'stock': 0, # Out of stock item for testing!
            'SKU': 'SH-AMLT-TIME',
            'image_url': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',
        },
        {
            'name': 'Cyberpunk Stealth Hero Helmet',
            'slug': 'stealth-hero-helmet',
            'category': categories['helmets-masks'],
            'description': 'Full-face helmet with tinted visor, wireless Bluetooth intercom, and neon-blue light highlights.',
            'price': 189.99,
            'discount': 12,
            'stock': 4, # Low stock item for testing!
            'SKU': 'SH-STLTH-HLM',
            'image_url': 'https://images.unsplash.com/photo-1575844012737-3ca266456a5c?w=600',
        },
        {
            'name': 'Levitation Crimson Cloak',
            'slug': 'levitation-crimson-cloak',
            'category': categories['magic-items'],
            'description': 'Self-moving high-collared red cloak. Responds to vocal instructions, floats gently, and matches magical wear.',
            'price': 199.99,
            'discount': 5,
            'stock': 14,
            'SKU': 'SH-CRIM-CLOK',
            'image_url': 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600',
        }
    ]

    for prod in products_data:
        p, created = Product.objects.get_or_create(
            slug=prod['slug'],
            defaults={
                'name': prod['name'],
                'category': prod['category'],
                'description': prod['description'],
                'price': prod['price'],
                'discount': prod['discount'],
                'stock': prod['stock'],
                'SKU': prod['SKU'],
                'image_url': prod['image_url'],
            }
        )
        if created:
            print(f"Product '{p.name}' created.")
            
            # Seed gallery
            ProductGallery.objects.create(product=p, image_url=p.image_url)
            ProductGallery.objects.create(product=p, image_url='https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600')
            
            # Seed a review
            Review.objects.create(
                product=p,
                user=customer,
                rating=5,
                comment=f"Absolutely amazing! The detail on the {p.name} is outstanding. Highly recommend!"
            )
            # Update rating
            p.rating = 5.00
            p.save()

    # 4. Create Banners
    banners_data = [
        {
            'title': 'Unleash Your Inner Hero!',
            'subtitle': 'Premium Multiverse Gear for Champions',
            'banner_type': 'hero_vault',
            'button_text': 'Shop Now',
            'link_url': '/shop',
            'is_active': True,
        },
        {
            'title': 'Avengers Assemble',
            'subtitle': 'Equip with official Stark Tech & Asgardian weaponry',
            'banner_type': 'avengers',
            'button_text': 'View Weapons',
            'link_url': '/shop?category=weapons',
            'is_active': True,
        }
    ]

    for banner in banners_data:
        b, created = Banner.objects.get_or_create(
            title=banner['title'],
            defaults={
                'subtitle': banner['subtitle'],
                'banner_type': banner['banner_type'],
                'button_text': banner['button_text'],
                'link_url': banner['link_url'],
                'is_active': banner['is_active'],
            }
        )
        if created:
            print(f"Banner '{b.title}' created.")
            
    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_data()
