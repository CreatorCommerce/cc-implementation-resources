# Product Card Compatibility Guide

## Understanding the Modern Product Card Issue

The product card snippet you provided uses advanced Shopify 2.0 features that **cannot be used directly** in a dynamic product loop. Here's why:

### The Problem

The modern `product-card` snippet has these requirements:

1. **`{{ children }}` block content** - Requires passing nested block content
2. **`block.id`** - Expects a block context with ID
3. **`block.settings`** - Expects block-level settings
4. **`block.shopify_attributes`** - Expects Shopify block metadata

```liquid
{% comment %} This CANNOT be used with a simple render in a loop {% endcomment %}
<product-card {{ block.shopify_attributes }}>
  <a id="product-card-{{ block.id }}">
    {{ children }}  <!-- Expects block content -->
  </a>
</product-card>
```

### Why It Won't Work in Our Section

Our drops section renders products in a loop:

```liquid
{% for product in drop_products %}
  {% render 'product-card', product: product %}  <!-- ❌ No block context! -->
{% endfor %}
```

There's no `block` object in this context, and we can't pass `{{ children }}` content through a render tag in a loop.

## Solutions

### Option 1: Use the Default (Universal Product Card)

The section now includes a clean, minimal default that works everywhere:

```liquid
<a href="{{ product.url }}" class="product-card-link">
  <div class="product-card__image">
    <img src="{{ product.featured_image | image_url: width: 600 }}" alt="{{ product.title | escape }}" loading="lazy">
  </div>
  <div class="product-card__info">
    <h3 class="product-card__title">{{ product.title }}</h3>
    <div class="product-card__price">{{ product.price | money }}</div>
  </div>
</a>
```

**Benefits:**
- ✅ Works with any theme
- ✅ No dependencies
- ✅ Clean, responsive design
- ✅ Includes basic styling

### Option 2: Create a Simplified Wrapper Snippet

Create `snippets/product-card-drops.liquid`:

```liquid
{% comment %}
  Simplified version of your theme's product card for use in loops
  @param product - The product object
{% endcomment %}

<product-card class="product-card" data-product-variants-size="{{ product.variants.size }}">
  <a href="{{ product.url }}" class="product-card__link">
    <div class="product-card__image">
      {% if product.featured_image %}
        <img 
          src="{{ product.featured_image | image_url: width: 600 }}" 
          alt="{{ product.title | escape }}" 
          loading="lazy"
        >
      {% endif %}
    </div>
    
    <div class="product-card__content">
      <h3 class="product-card__title">{{ product.title }}</h3>
      
      <div class="product-card__price">
        {% if product.compare_at_price > product.price %}
          <span class="price-sale">{{ product.price | money }}</span>
          <span class="price-compare">{{ product.compare_at_price | money }}</span>
        {% else %}
          {{ product.price | money }}
        {% endif %}
      </div>
    </div>
  </a>
</product-card>
```

Then in the section setting:
```
render 'product-card-drops', product: product
```

### Option 3: Use Dawn Theme's Card-Product

If you're using Dawn or a Dawn-based theme, use the standard snippet:

```
render 'card-product', card_product: product, media_aspect_ratio: 'square', show_secondary_image: false, show_vendor: false, show_rating: false
```

### Option 4: Check for Other Theme Snippets

Your theme might have alternative product card snippets designed for loops:

Common names to look for:
- `product-card-grid`
- `product-card-collection`
- `product-grid-item`
- `product-list-item`
- `card-product` (Dawn)
- `product-thumbnail`

## Key Differences Explained

### Block-Based Product Cards (Modern)
```liquid
{% comment %} Used in sections with block structure {% endcomment %}
{% for block in section.blocks %}
  {% render 'product-card', product: block.settings.product, block: block %}
    {% comment %} Pass children content {% endcomment %}
    {% render 'product-image', product: product %}
    {% render 'product-title', product: product %}
  {% endrender %}
{% endfor %}
```

**Requires:**
- Block context (`block.id`, `block.settings`)
- Ability to pass child content
- Section/block architecture

### Loop-Based Product Cards (Standard)
```liquid
{% comment %} Used in dynamic loops {% endcomment %}
{% for product in collection.products %}
  {% render 'card-product', card_product: product %}
{% endfor %}
```

**Requires:**
- Only the product object
- Self-contained snippet
- No block context needed

## Adapting Your Modern Product Card

If you want to adapt your modern product card for use in loops, here's a template:

### Create `snippets/product-card-simple.liquid`:

```liquid
{% comment %}
  Simplified product card for dynamic loops
  Adapted from your theme's block-based product-card
  @param product - The product object
{% endcomment %}

{% liquid
  assign has_quick_add = false
  if settings.quick_add and product.available
    assign has_quick_add = true
  endif
%}

{%- if settings.transition_to_main_product -%}
  <product-card-link
    data-product-id="{{ product.id }}"
    data-product-transition="true"
  >
{%- endif -%}

<product-card 
  class="product-card" 
  data-product-variants-size="{{ product.variants.size }}"
>
  <a
    href="{{ product.url }}"
    class="layout-panel-flex layout-panel-flex--column product-card__link"
    style="--quick-add-display: {% if has_quick_add %}flex{% else %}none{% endif %};"
  >
    {%- comment -%} Product Image {%- endcomment -%}
    <div class="product-card__media">
      {% if product.featured_image %}
        <img 
          src="{{ product.featured_image | image_url: width: 600 }}" 
          srcset="
            {{ product.featured_image | image_url: width: 300 }} 300w,
            {{ product.featured_image | image_url: width: 600 }} 600w,
            {{ product.featured_image | image_url: width: 900 }} 900w
          "
          sizes="(min-width: 750px) calc((100vw - 10rem) / 4), calc(100vw - 3rem)"
          alt="{{ product.title | escape }}"
          loading="lazy"
          width="600"
          height="600"
        >
      {% else %}
        {{ 'product-1' | placeholder_svg_tag: 'placeholder-svg' }}
      {% endif %}
    </div>

    {%- comment -%} Product Info {%- endcomment -%}
    <div class="product-card__info">
      <h3 class="product-card__title">
        {{ product.title | escape }}
      </h3>

      <div class="product-card__price">
        {% if product.compare_at_price > product.price %}
          <span class="price price--on-sale">
            <span class="price-item price-item--sale">
              {{ product.price | money }}
            </span>
            <span class="price-item price-item--regular">
              {{ product.compare_at_price | money }}
            </span>
          </span>
        {% else %}
          <span class="price">
            {{ product.price | money }}
          </span>
        {% endif %}
      </div>

      {% if product.available == false %}
        <span class="product-card__badge badge badge--sold-out">
          {{ 'products.product.sold_out' | t }}
        </span>
      {% endif %}
    </div>
  </a>
</product-card>

{%- if settings.transition_to_main_product -%}
  </product-card-link>
{%- endif -%}
```

Then use it in the section:
```
render 'product-card-simple', product: product
```

## Testing Your Product Card

After setting up your product card, test:

1. ✅ **Product image displays** correctly
2. ✅ **Product title** shows properly
3. ✅ **Price** displays in correct format
4. ✅ **Sale prices** show when applicable
5. ✅ **Link** goes to correct product page
6. ✅ **Responsive** on mobile, tablet, desktop
7. ✅ **Grid layout** works (desktop/tablet)
8. ✅ **Carousel** works (mobile)
9. ✅ **Hover states** function correctly
10. ✅ **Sold out badge** appears when needed

## Summary

The modern block-based `product-card` snippet **cannot be used directly** in dynamic product loops because:

1. It requires `{{ children }}` block content
2. It expects `block.id` and `block.settings`
3. It's designed for section/block architecture, not loops

**Best Solutions:**
1. Use the provided default universal product card
2. Create a simplified wrapper snippet
3. Use your theme's loop-compatible product card snippet (like Dawn's `card-product`)

The section is now configured with a universal default that works everywhere! 🎉

