# Product Creation Validation Guide

## Allowed Values for Product Fields

### Required Fields

- **name**: String (2-100 characters)
- **description**: String (10-1000 characters)
- **category**: Must be one of: `['Vegetables', 'Fruits', 'Grains', 'Herbs', 'Seeds', 'Dairy', 'Other']`
- **price**: Number (positive float)
- **unit**: Must be one of: `['kg', 'gram', 'piece', 'dozen', 'box', 'bunch', 'liter', 'pack']`
- **quantity**: Number (positive float)
- **harvestDate**: ISO 8601 date string (e.g., "2025-07-06T05:21:40.788Z")

### Optional Fields

- **subcategory**: String (max 50 characters)
- **minOrderQuantity**: Number (positive float, default: 1)
- **maxOrderQuantity**: Number (positive float)
- **organic**: Boolean (true/false, default: false)
- **certifications**: Array of strings, each must be one of: `['Organic', 'GAP', 'HACCP', 'ISO', 'FSSAI', 'Other']`
- **qualityGrade**: Must be one of: `['Premium', 'Grade A', 'Grade B', 'Standard']` (default: 'Standard')
- **expiryDate**: ISO 8601 date string
- **shelfLife**: Integer (positive number, in days)
- **farmName**: String (max 100 characters)
- **farmLocation**: String (max 200 characters)
- **availableLocations**: Array of strings (each 1-100 characters)
- **deliveryRadius**: Number (positive float, default: 50)
- **deliveryTime**: Number (positive float, default: 24)
- **isFeatured**: Boolean (true/false, default: false)
- **isSeasonal**: Boolean (true/false, default: false)
- **tags**: Array of strings (each 1-50 characters)
- **searchKeywords**: Array of strings (each 1-50 characters)

## Example Valid Product Data

```json
{
  "name": "Fresh Organic Tomatoes",
  "description": "Fresh, organic tomatoes grown without pesticides. Perfect for salads and cooking.",
  "category": "Vegetables",
  "subcategory": "Tomatoes",
  "price": 80,
  "unit": "kg",
  "minOrderQuantity": 1,
  "maxOrderQuantity": 50,
  "quantity": 100,
  "organic": true,
  "certifications": ["Organic", "FSSAI"],
  "qualityGrade": "Premium",
  "harvestDate": "2025-07-06T05:21:40.788Z",
  "expiryDate": "2025-07-13T05:21:40.790Z",
  "shelfLife": 7,
  "farmName": "Test Farm",
  "farmLocation": "Mumbai, Maharashtra",
  "availableLocations": ["Mumbai", "Pune", "Thane"],
  "deliveryRadius": 100,
  "deliveryTime": 24,
  "isFeatured": false,
  "isSeasonal": false,
  "tags": ["organic", "fresh", "local"],
  "searchKeywords": ["tomatoes", "organic", "fresh vegetables"]
}
```

## Common Validation Errors

1. **Invalid certification**: Use only `['Organic', 'GAP', 'HACCP', 'ISO', 'FSSAI', 'Other']`
2. **Invalid category**: Use only `['Vegetables', 'Fruits', 'Grains', 'Herbs', 'Seeds', 'Dairy', 'Other']`
3. **Invalid unit**: Use only `['kg', 'gram', 'piece', 'dozen', 'box', 'bunch', 'liter', 'pack']`
4. **Invalid qualityGrade**: Use only `['Premium', 'Grade A', 'Grade B', 'Standard']`
5. **Invalid date format**: Use ISO 8601 format (e.g., "2025-07-06T05:21:40.788Z")
6. **Negative numbers**: All numeric fields must be positive
7. **String length**: Check min/max character limits for text fields
