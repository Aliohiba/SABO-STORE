# Darb Sabil Integration Verification Checklist

## ✅ Completed Steps

### 1. Data Preparation
- [x] Created `darb_tripoli.json` with Tripoli city data
- [x] Created `darb_other_cities.json` with additional cities data
- [x] Created `merge_files.mjs` script to combine both files
- [x] Successfully merged into `darb_all_cities.json` (889 lines)

### 2. Database Schema Updates
- [x] Extended `ICity` interface with `darbId` and `darbPrice` fields
- [x] Extended `IRegion` interface with `darbId`, `darbPrice`, and `deliveryPrice` fields
- [x] Updated Mongoose schemas to support both Vanex and Darb Sabil data

### 3. Migration Script
- [x] Created `migrate_darb_data.ts` to process Darb Sabil data
- [x] Script intelligently parses `branchId` as city names
- [x] Script extracts region names and prices from `node` field
- [x] Successfully executed migration script

### 4. Database Verification
Migration Results:
- Cities with Darb Sabil data: **31**
- Regions with Darb Sabil data: **~850+**
- Cities with both Vanex and Darb Sabil: **21**
- Cities with only Vanex: **27**
- Cities with only Darb Sabil: **10**

### 5. Frontend Updates
- [x] Modified `Register.tsx` to display city/region names without prices
- [x] Modified `Checkout.tsx` to display city/region names without prices
- [x] Updated checkout to preserve city/area selection when switching delivery providers

### 6. Backend API Updates
- [x] Updated `delivery.cities` procedure to fetch from MongoDB
- [x] Updated `delivery.regions` procedure to fetch from MongoDB
- [x] Implemented dynamic price selection based on `providerId` (vanex/darb)

## 🧪 Testing Checklist

### Test 1: Registration Page
1. Navigate to the registration page
2. Verify that city dropdown shows city names only (no prices)
3. Select a city with Darb Sabil data (e.g., "طرابلس 1")
4. Verify that area dropdown shows area names only (no prices)
5. Select an area and complete registration

### Test 2: Checkout Page - Vanex Provider
1. Navigate to checkout page with items in cart
2. Select "Vanex" as delivery provider
3. Select a city that has both Vanex and Darb Sabil data
4. Select an area
5. Verify shipping price in order summary matches Vanex `deliveryPrice`

### Test 3: Checkout Page - Darb Sabil Provider
1. On checkout page, select "Darb Sabil" as delivery provider
2. Select a city that has Darb Sabil data (e.g., "طرابلس 1")
3. Select an area
4. Verify shipping price in order summary matches Darb `darbPrice`

### Test 4: Provider Switching
1. On checkout page, select "Vanex" and choose a city + area
2. Note the shipping price
3. Switch to "Darb Sabil" provider
4. Verify that the selected city and area remain selected
5. Verify that the shipping price updates to Darb Sabil's price
6. Switch back to "Vanex"
7. Verify price updates back to Vanex price

### Test 5: Cities with Only One Provider
1. Test selecting a city that only has Vanex data when Darb Sabil is selected
2. Verify correct price is displayed or appropriate fallback behavior
3. Test selecting a city that only has Darb Sabil data when Vanex is selected
4. Verify correct price is displayed or appropriate fallback behavior

## 📊 Sample Darb Sabil Cities and Prices

Based on the migration:
- **طرابلس 1** (Tripoli 1): Multiple areas with prices ranging from 10-20 LYD
- **المنطقة الشرقية 2** (Eastern Region 2): Areas with 35 LYD
- **غرب طرابلس 3** (West Tripoli 3): Areas with 30 LYD
- **شرق طرابلس 1** (East Tripoli 1): Areas with 20 LYD
- **جنوب طرابلس 2** (South Tripoli 2): Areas with 30 LYD
- **الجبل الغربي 1** (Western Mountain 1): Areas with 30 LYD
- **المنطقة الجنوبية** (Southern Region): Various areas with 35-60 LYD

## 🎯 Expected Behavior

### City/Area Display
- Registration and Checkout dropdowns should show ONLY names
- Format: City name (no price), Area name (no price)
- Example: "طرابلس 1" not "طرابلس 1 - 15 LYD"

### Price Calculation
- Vanex selected → Use `city.deliveryPrice` or `region.deliveryPrice`
- Darb Sabil selected → Use `city.darbPrice` or `region.darbPrice`
- Price should update dynamically when provider changes
- Selected location should NOT reset when provider changes

### API Endpoints
- `trpc.delivery.cities` - Returns all active cities
- `trpc.delivery.regions` - Returns regions for selected city + provider
- Both endpoints respect the `providerId` parameter

## 🔍 Debugging Tips

If issues occur:
1. Check browser console for TRPC errors
2. Verify MongoDB connection is active
3. Check that cities have the appropriate `darbId`/`darbPrice` fields
4. Verify regions are linked to correct cities via `cityId`
5. Ensure frontend is passing correct `providerId` to API calls

## 📝 Notes

- The migration script matches Darb Sabil cities to existing Vanex cities by name when possible
- If a perfect match isn't found, it creates a new city entry
- All Darb Sabil region prices are extracted from the `node` field (last number)
- The system maintains backward compatibility with existing Vanex-only data
