# Fix Plan - Soil, Disease, Nursery, Mobile Responsive & Dropdowns

## Step 1: Fix Navbar.jsx
- [x] Unify `dropdowns` and `dropdownsEnd` into single `allDropdowns` array
- [x] Include Disease and Nursery as dropdowns in the unified array
- [x] Remove duplicate standalone Disease & Nursery entries from mobile menu
- [x] Fix inconsistent menu ordering (desktop vs mobile)

## Step 2: Fix MainContent.jsx
- [x] Add missing routes for nursery sub-pages (`/nursery/search`, `/nursery/orders`, etc.)
- [x] Add missing route for `/disease/report`
- [x] Fix `/soil/quality` path routing
- [x] Add placeholder components for nursery sub-pages

## Step 3: Create Missing Components
- [x] NurserySearch.jsx (placeholder)
- [x] NurseryOrders.jsx (placeholder)
- [x] NurseryInventory.jsx (placeholder)
- [x] NurseryDashboard.jsx (placeholder)
- [x] NurseryProfile.jsx (placeholder)
- [x] DiseaseReport.jsx (placeholder)

## Step 4: Mobile Responsiveness
- [x] Add responsive padding/grid fixes to SoilHub, DiseaseHub, NurseryHub
- [x] Fix hero section spacing on small screens

## Step 5: Soil Quality Path Fix
- [x] Add proper `/soil/quality` route pointing to SoilQuality component
