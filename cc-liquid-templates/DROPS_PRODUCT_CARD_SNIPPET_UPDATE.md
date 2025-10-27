# Product Card Snippet Feature - Update Summary

## ✅ Added Customizable Product Card Snippet

The `drops-product-grid-ventana.liquid` section now includes a flexible product card snippet setting that allows users to customize how products are rendered using their theme's product card snippet.

## What Was Added

### 1. **New Schema Setting: "Product Card Snippet"**

Added a new `liquid` type input in the schema (lines 962-973):

```json
{
  "type": "header",
  "content": "Product Card",
  "info": "Customize how product cards are rendered in the grid"
},
{
  "type": "liquid",
  "id": "product_card_snippet",
  "label": "Product card snippet",
  "default": "render 'card-product', card_product: product, media_aspect_ratio: 'square', image_shape: 'default', show_secondary_image: false, show_vendor: false, show_rating: false",
  "info": "Liquid code to render each product card. Use 'product' as the variable name. You can customize parameters to match your theme's product card snippet. Example: render 'product-card', card_product: product, show_vendor: true (do not include {% %} tags)"
}
```

### 2. **Updated Product Rendering Logic**

Modified the product card rendering code (lines 600-609) to use the customizable snippet:

```liquid
{%- if card_product -%}
  {%- assign product = card_product -%}
  <div class="cc-product-card">
    {%- if section.settings.product_card_snippet != blank -%}
      {{ section.settings.product_card_snippet }}
    {%- else -%}
      {% render 'card-product', card_product: product, media_aspect_ratio: 'square', image_shape: 'default', show_secondary_image: false, show_vendor: false, show_rating: false %}
    {%- endif -%}
  </div>
{%- endif -%}
```

## How It Works

### **Variable Assignment:**
The current product is assigned to a variable named `product` so users can reference it in their custom snippet:
```liquid
assign product = card_product
```

### **Dynamic Rendering:**
The snippet from the setting is rendered dynamically. Since it's a `liquid` type input, the content is automatically executed as Liquid code:
```liquid
{{ section.settings.product_card_snippet }}
```

### **Fallback Default:**
If the setting is blank, it falls back to a sensible default:
```liquid
{%- if section.settings.product_card_snippet != blank -%}
  {{ section.settings.product_card_snippet }}
{%- else -%}
  {% render 'card-product', card_product: product, ... %}
{%- endif -%}
```

## Usage Examples

**Important:** Enter code **without** `{% %}` or `{{ }}` tags. The `liquid` input type automatically executes the content as Liquid code.

### **Example 1: Standard Dawn Theme**
```liquid
render 'card-product', card_product: product, media_aspect_ratio: 'square', show_secondary_image: false
```

### **Example 2: Custom Theme with Different Snippet Name**
```liquid
render 'product-card', product: product, image_ratio: 'portrait', show_vendor: true
```

### **Example 3: Product Card with Quick Add**
```liquid
render 'card-product', card_product: product, show_quick_add: true, show_rating: true
```

### **Example 4: Minimal Product Card**
```liquid
render 'product-card-minimal', product: product
```

### **Example 5: Custom HTML/Liquid**
```
<div class="custom-card">
  <a href="{{ product.url }}">
    <img src="{{ product.featured_image | image_url: width: 400 }}" alt="{{ product.title | escape }}">
    <h3>{{ product.title }}</h3>
    <p>{{ product.price | money }}</p>
  </a>
</div>
```

**Note:** For custom HTML/Liquid (Example 5), you can use `{{ }}` for output tags within the content.

## Benefits

### ✅ **Theme Compatibility**
- Works with any Shopify theme's product card snippet
- No need to modify code for different themes
- Supports custom snippets and parameters

### ✅ **Flexibility**
- Users can customize product card appearance per section instance
- Easy to switch between different card styles
- Can hardcode specific parameters as needed

### ✅ **No Breaking Changes**
- Default value matches previous hardcoded behavior
- Existing sections continue to work without modification
- Backward compatible with all themes

### ✅ **Developer-Friendly**
- Clear documentation in info text
- Simple variable naming convention (`product`)
- Fallback to sensible default if blank

## Schema Organization

The new setting is organized under its own category:

1. **📄 The Creator Drops Section** - Description
2. **🔧 Before Building** - Setup instructions
3. **🧪 For Testing** - Testing workflow
4. **📝 Content & Text** - Text settings (7 settings)
5. **🎴 Product Card** - Product card snippet (1 setting) **← NEW!**
6. **🎨 Design & Styling** - Layout & colors (5 settings)
7. **✨ Custom CSS** - CSS overrides (1 setting)

## File Details

- **File:** `drops-product-grid-ventana.liquid`
- **Size:** 37.5 KB
- **Lines:** 1,039
- **No Linter Errors:** ✅

## Testing Checklist

Before deploying:
- [ ] Test with default product card snippet
- [ ] Test with custom snippet code
- [ ] Verify `product` variable is accessible
- [ ] Test with different theme snippets (`card-product`, `product-card`, etc.)
- [ ] Test with custom parameters (show_vendor, show_rating, etc.)
- [ ] Verify fallback works when setting is blank
- [ ] Test product card rendering on desktop
- [ ] Test product card rendering on tablet
- [ ] Test product card rendering on mobile carousel
- [ ] Verify no breaking changes to existing sections

## Common Theme Snippet Names

Different themes use different snippet names. Here are some common ones:

| Theme | Snippet Name | Example Usage (without tags) |
|-------|-------------|------------------------------|
| Dawn (Shopify) | `card-product` | `render 'card-product', card_product: product` |
| Debut | `product-card` | `render 'product-card', product: product` |
| Brooklyn | `product-grid-item` | `render 'product-grid-item', product: product` |
| Narrative | `product-card` | `render 'product-card', product_card_product: product` |
| Custom | Various | Check theme documentation |

Users can now easily adapt the section to any theme by updating the snippet name and parameters! 🎉

