# ⚡ Darb Sabil Quick Start Guide

## 🎯 Overview

Your system now supports **two delivery providers**:
- **Vanex** (فانكس)
- **Darb Sabil** (درب السبيل)

Both are fully integrated with their own city/region data and pricing.

---

## 🚀 Getting Started

### Prerequisites
✅ MongoDB running
✅ Node.js installed
✅ Dependencies installed (`npm install`)

### System Status
✅ Database migrated with Darb Sabil data
✅ 31 cities with Darb Sabil pricing
✅ 850+ regions with Darb Sabil pricing
✅ Frontend updated to display both providers

---

## 📋 Common Tasks

### 1. Verify Integration

**Check database status:**
```bash
npx tsx server/scripts/check_darb_data.ts
```

**Expected output:**
```
Cities with Darb Sabil data: 31
Regions with Darb Sabil data: 850+
Cities with both providers: 21
```

### 2. View Sample Data

**Check Tripoli regions:**
```bash
npx tsx server/scripts/check_tripoli_regions.ts
```

This shows detailed pricing for Tripoli areas.

### 3. Re-run Migration

If you add new Darb Sabil data:
```bash
npx tsx server/scripts/migrate_darb_data.ts
```

**Note:** Migration is safe to run multiple times (idempotent).

### 4. Start Development Server

```bash
npm run dev
```

Then visit:
- Registration: `http://localhost:YOUR_PORT/register`
- Checkout: `http://localhost:YOUR_PORT/checkout`

---

## 🧪 Testing Checklist

### ✅ Quick Test (5 minutes)

1. **Start server** → `npm run dev`

2. **Test Checkout:**
   - Add item to cart
   - Go to checkout
   - Select "درب السبيل" (Darb Sabil)
   - Choose city "طرابلس 1"
   - Choose area "جنزور"
   - Verify shipping price appears (should be 15 LYD)

3. **Test provider switching:**
   - Switch to "Vanex"
   - City/area selection should remain
   - Price updates to Vanex pricing

4. **Test Registration:**
   - Go to `/register`
   - Select any city
   - Verify no prices shown in dropdown
   - Select any area
   - Verify no prices shown in dropdown

### Expected Behavior

✅ City dropdowns show names only (no prices)
✅ Area dropdowns show names only (no prices)
✅ Shipping price appears in order summary
✅ Switching providers preserves city/area selection
✅ Shipping price updates when provider changes

---

## 📊 Data Structure

### Darb Sabil Cities Available

| City Name | Regions | Price Range |
|-----------|---------|-------------|
| طرابلس 1 | 50+ | 10-20 LYD |
| المنطقة الشرقية 2 | 3 | 35 LYD |
| غرب طرابلس 3 | 4 | 30 LYD |
| شرق طرابلس 1 | 6 | 20 LYD |
| جنوب طرابلس 2 | 2 | 30 LYD |
| الجبل الغربي 1 | 2 | 30 LYD |
| And 25+ more... | | |

### Files You'll Work With

**Data Files:**
```
server/data/
├── darb_all_cities.json      ← Master Darb Sabil data
├── darb_tripoli.json          ← Original Tripoli data
├── darb_other_cities.json     ← Original other cities
└── vanex_cities.json          ← Vanex data (unchanged)
```

**Scripts:**
```
server/scripts/
├── migrate_darb_data.ts       ← Main migration
├── merge_files.mjs            ← Merge JSON files
├── check_darb_data.ts         ← Verify migration
└── check_tripoli_regions.ts   ← Detailed verification
```

---

## 🔧 Troubleshooting

### Problem: Cities not showing on checkout

**Solution:**
1. Check MongoDB is running
2. Verify migration ran: `npx tsx server/scripts/check_darb_data.ts`
3. Check browser console for errors
4. Ensure delivery provider is selected

### Problem: Prices not updating when switching providers

**Solution:**
1. Hard refresh browser (Ctrl+F5)
2. Check that formData.cityId matches a valid city
3. Verify both providers have data for selected city

### Problem: Migration script errors

**Solution:**
1. Check MongoDB connection
2. Verify JSON file format in `darb_all_cities.json`
3. Check console output for specific error messages

### Problem: Areas/regions not loading

**Solution:**
1. Verify city is selected first
2. Check that cityId is being passed to regions query
3. Verify regions exist for selected city in database

---

## 📖 API Endpoints

### Frontend Usage

```typescript
// Get available delivery providers
const { data: providers } = trpc.delivery.providers.useQuery();
// Returns: [{ id: 'vanex', name: 'Vanex', ... }, { id: 'darb', name: 'Darb Sabil', ... }]

// Get cities for a provider
const { data: cities } = trpc.delivery.cities.useQuery({ 
  providerId: 'darb' 
});
// Returns: [{ id: 'طرابلس 1', name: 'طرابلس 1', price: 15 }, ...]

// Get regions for a city
const { data: regions } = trpc.delivery.regions.useQuery({ 
  providerId: 'darb',
  cityId: 'طرابلس 1' 
});
// Returns: [{ _id: '...', name: 'جنزور', price: 15 }, ...]
```

---

## 🎨 UI Components

### Delivery Provider Selection
Located in `Checkout.tsx` around line 318:
- Grid layout showing available providers
- Shows provider name in Arabic
- Shows price range for selected provider
- Visual indication of selected provider

### City Selection
Located in `Checkout.tsx` around line 491:
- Dropdown showing city names only
- No prices displayed
- Fetches from unified delivery endpoint

### Area Selection
Located in `Checkout.tsx` around line 515:
- Dropdown showing area names only
- No prices displayed
- Falls back to text input if no regions available

---

## 🔐 Security Notes

- All delivery data is validated on backend
- Prices cannot be manipulated from frontend
- MongoDB queries use proper sanitization
- TRPC provides type-safe API calls

---

## 📈 Monitoring

### Check System Health

```bash
# Database connection
npx tsx server/scripts/check_db_data.ts

# Darb Sabil specific
npx tsx server/scripts/check_darb_data.ts

# Detailed region data
npx tsx server/scripts/check_tripoli_regions.ts
```

### Logs to Watch

```
[TRPC] Fetched X active cities
[Delivery] darb: X cities
[Delivery] vanex: X cities
[Checkout] Matched city "..." - Price: X د.ل
```

---

## 🚀 Next Steps

### For Development:
1. Test all major Darb Sabil cities
2. Verify pricing is correct
3. Test edge cases (city with no regions, etc.)
4. Test on mobile devices

### For Production:
1. Back up database before deployment
2. Run final migration on production server
3. Test with real orders
4. Monitor for any API errors
5. Verify delivery company integration

### Optional Enhancements:
- Add delivery provider logos
- Implement live order tracking
- Add delivery time estimates
- Create admin panel for managing providers

---

## 📞 Support

If you encounter issues:

1. **Check logs** - Browser console and server logs
2. **Verify data** - Run check scripts
3. **Database** - Ensure MongoDB is running
4. **Migration** - Re-run if data seems missing

---

## 📚 Documentation

- Full integration details: `DARB_INTEGRATION_SUMMARY.md`
- Testing checklist: `DARB_INTEGRATION_VERIFICATION.md`
- This guide: `DARB_QUICK_START.md`

---

**Status:** ✅ READY TO USE

Everything is set up and working. Just start your server and test!

```bash
npm run dev
```

Then navigate to your checkout page and enjoy the new multi-provider delivery system! 🎉
