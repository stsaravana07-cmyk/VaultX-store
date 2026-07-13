from django.db import models
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    banner_url = models.CharField(max_length=500, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.IntegerField(default=0) # discount percentage (0 to 100)
    stock = models.IntegerField(default=0)
    SKU = models.CharField(max_length=50, unique=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    image_url = models.CharField(max_length=500, blank=True, null=True) # main display image
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def final_price(self):
        if self.discount > 0:
            from decimal import Decimal
            discount_amount = self.price * (Decimal(self.discount) / Decimal(100))
            return round(self.price - discount_amount, 2)
        return self.price

class ProductGallery(models.Model):
    product = models.ForeignKey(Product, related_name='gallery', on_delete=models.CASCADE)
    image_url = models.CharField(max_length=500)

    class Meta:
        verbose_name_plural = "Product Galleries"

    def __str__(self):
        return f"{self.product.name} Gallery Image"

class Review(models.Model):
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5) # 1 to 5 stars
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.rating} stars)"


class Banner(models.Model):
    BANNER_TYPES = (
        ('hero_vault', 'Hero Vault Preset (Spider-Man & Iron Man)'),
        ('avengers', 'Avengers Assemble Preset'),
        ('custom', 'Custom URL Image'),
    )
    title = models.CharField(max_length=200, default="Unleash Your Inner Hero!")
    subtitle = models.CharField(max_length=500, blank=True, null=True)
    banner_type = models.CharField(max_length=50, choices=BANNER_TYPES, default='hero_vault')
    image_url = models.CharField(max_length=500, blank=True, null=True, help_text="Paste your custom banner image URL here")
    button_text = models.CharField(max_length=100, default="Shop Now")
    link_url = models.CharField(max_length=200, default="/shop")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_banner_type_display()})"


class HeroAvatar(models.Model):
    hero_id = models.CharField(max_length=50, unique=True, help_text="e.g., ironman, spiderman")
    name = models.CharField(max_length=100)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    video_url = models.CharField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    theme_color = models.CharField(max_length=50, default="#8b5cf6")
    audio_cue = models.CharField(max_length=200, default="System interface initialized. Systems online.")
    product_slugs = models.CharField(max_length=1000, blank=True, null=True, help_text="Comma-separated product slugs to feature in this portal")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
