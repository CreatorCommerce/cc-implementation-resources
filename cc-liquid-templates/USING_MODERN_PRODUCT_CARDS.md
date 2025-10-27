# Using Modern Product Card Snippets with Drops Section

## Overview

The `drops-product-grid-ventana.liquid` section now has a flexible default product card that works out-of-the-box with any theme. However, if your theme uses modern product card snippets (like the one with `{{ children }}`), you'll need to adapt it slightly.

## The Default Product Card

The section now includes a clean, minimal default product card:

```liquid
<a href="{{ product.url }}" class="product-card-wrapper">
  <div class="product-card-image">
    <img src="{{ product.featured_image | image_url: width: 600 }}" alt="{{ product.title | escape }}" loading="lazy">
  </div>
  <div class="product-card-info">
    <h3 class="product-card-title">{{ product.title }}</h3>
    <div class="product-card-price">
      {{ product.price | money }}
    </div>
  </div>
</a>
```

### Features:
- ✅ Clean, minimal design
- ✅ Square product images (1:1 aspect ratio)
- ✅ Responsive
- ✅ Works with any Shopify theme
- ✅ Includes hover effect
- ✅ No dependencies on theme snippets

## Using Traditional Theme Snippets

For themes like Dawn, Debut, or Brooklyn, you can easily use their product card snippets:

### Dawn Theme:
```
render 'card-product', card_product: product, media_aspect_ratio: 'square', show_secondary_image: false, show_vendor: false, show_rating: false
```

### Debut Theme:
```
render 'product-card', product: product, grid_image_width: 600
```

### Brooklyn Theme:
```
render 'product-grid-item', product: product
```

## Using Modern Product Card Snippets (with `{{ children }}`)

If your theme uses a modern product card snippet that requires `{{ children }}` (like the one you provided), you have two options:

### Option 1: Create a Wrapper Snippet (Recommended)

Create a new snippet called `product-card-drops.liquid` in your theme:

```liquid
{% comment %}
  Wrapper for modern product-card snippet
  Used by drops-product-grid-ventana section
{% endcomment %}

{% liquid
  assign card_product = product
%}

{% render 'product-card', product: card_product, block: block %}
  {% render 'product-card-image', product: card_product %}
  {% render 'product-card-title', product: card_product %}
  {% render 'product-card-price', product: card_product %}
{% endrender %}
```

Then in the section settings, use:
```
render 'product-card-drops', product: product
```

### Option 2: Inline the Product Card HTML

Copy the relevant parts of your modern product card and paste them directly into the setting (without the `{{ children }}` part):

```liquid
<product-card class="product-card" data-product-variants-size="{{ product.variants.size }}">
  <a href="{{ product.url }}" class="layout-panel-flex layout-panel-flex--column product-card__link">
    <div class="product-card-image">
      <img src="{{ product.featured_image | image_url: width: 600 }}" alt="{{ product.title | escape }}" loading="lazy">
    </div>
    <div class="product-card-info">
      <h3>{{ product.title }}</h3>
      <div class="product-card-price">
        {{ product.price | money }}
      </div>
    </div>
  </a>
</product-card>
```

### Option 3: Simplified Modern Card (No Children)

If you just need the structure without the children blocks:

```liquid
<product-card class="product-card" data-product-variants-size="{{ product.variants.size }}">
  <a href="{{ product.url }}" class="product-card__link">
    {% if product.featured_image %}
      <img src="{{ product.featured_image | image_url: width: 600 }}" alt="{{ product.title | escape }}" loading="lazy" class="product-card__image">
    {% endif %}
    <div class="product-card__content">
      <h3 class="product-card__title">{{ product.title }}</h3>
      <span class="product-card__price">{{ product.price | money }}</span>
    </div>
  </a>
</product-card>
```

## Custom Styling

The default product card includes basic styling that can be overridden with the Custom CSS setting:

```css
#shopify-section-{{ section.id }} .product-card-wrapper {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  transition: transform 0.2s;
}

#shopify-section-{{ section.id }} .product-card-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

#shopify-section-{{ section.id }} .product-card-title {
  font-size: 16px;
  color: #333;
}

#shopify-section-{{ section.id }} .product-card-price {
  font-size: 18px;
  color: #000;
  font-weight: bold;
}
```

## Advanced Customization

### Add Product Vendor:
```liquid
<a href="{{ product.url }}" class="product-card-wrapper">
  <div class="product-card-image">
    <img src="{{ product.featured_image | image_url: width: 600 }}" alt="{{ product.title | escape }}" loading="lazy">
  </div>
  <div class="product-card-info">
    {% if product.vendor %}
      <p class="product-card-vendor">{{ product.vendor }}</p>
    {% endif %}
    <h3 class="product-card-title">{{ product.title }}</h3>
    <div class="product-card-price">
      {{ product.price | money }}
    </div>
  </div>
</a>
```

### Add Compare at Price:
```liquid
<div class="product-card-price">
  {% if product.compare_at_price > product.price %}
    <span class="product-card-price--sale">{{ product.price | money }}</span>
    <span class="product-card-price--compare">{{ product.compare_at_price | money }}</span>
  {% else %}
    {{ product.price | money }}
  {% endif %}
</div>
```

### Add Quick View Button:
```liquid
<a href="{{ product.url }}" class="product-card-wrapper">
  <div class="product-card-image">
    <img src="{{ product.featured_image | image_url: width: 600 }}" alt="{{ product.title | escape }}" loading="lazy">
    <button class="product-card-quick-view" data-product-id="{{ product.id }}">
      Quick View
    </button>
  </div>
  <div class="product-card-info">
    <h3 class="product-card-title">{{ product.title }}</h3>
    <div class="product-card-price">{{ product.price | money }}</div>
  </div>
</a>
```

## Testing

After customizing your product card, test:

- ✅ Product image displays correctly
- ✅ Product title shows
- ✅ Price displays in correct format
- ✅ Link goes to product page
- ✅ Responsive on mobile, tablet, desktop
- ✅ Works in grid layout (desktop/tablet)
- ✅ Works in carousel (mobile)
- ✅ Hover states work correctly
- ✅ Images load efficiently (lazy loading)

## Troubleshooting

### Images not showing:
- Check the image URL filter: `| image_url: width: 600`
- Ensure product has a featured image
- Verify image permissions in theme settings

### Styling not applying:
- Use the section ID prefix: `#shopify-section-{{ section.id }}`
- Check CSS specificity
- Add `!important` if needed for overrides

### Click not working:
- Verify product URL: `{{ product.url }}`
- Check for JavaScript conflicts
- Ensure link is not being blocked by overlays

## Best Practices

1. **Keep it Simple**: The simpler the product card, the faster it loads
2. **Use Lazy Loading**: Always include `loading="lazy"` on images
3. **Optimize Image Size**: Use appropriate width values (600-800px is usually enough)
4. **Test Across Devices**: Mobile carousel behavior differs from desktop grid
5. **Maintain Consistency**: Use the same card style across all drops
6. **Consider Performance**: Avoid heavy JavaScript or complex animations

## Summary

The default product card is designed to work universally, but you have complete flexibility to:
- Use your theme's existing product card snippet
- Create custom product cards with any HTML/CSS
- Add advanced features (quick view, swatches, etc.)
- Match your brand's design system

The key is using the `product` variable to access the product data, and keeping the code clean and performant! 🚀

