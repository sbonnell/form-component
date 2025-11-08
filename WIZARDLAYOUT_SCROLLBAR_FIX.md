# WizardLayout Scrollbar Fix

## Problem
The wizard step indicator was showing unwanted horizontal scrollbars when the form was resized smaller because:
- The `ol` element had `min-w-min` preventing it from shrinking below natural width
- Step items weren't configured to shrink properly
- Step labels had fixed widths preventing flexible shrinking
- Container had `overflow-x-auto` allowing scrollbars

## Solution
Updated the step indicator to properly shrink and adapt to smaller container widths without showing scrollbars.

## Key Changes

### Step Indicator Container
**Before:**
```html
<div className="@container mb-4 @md:mb-6 @lg:mb-8 overflow-x-auto">
  <ol className="flex items-center min-w-min gap-1 @md:gap-2 @lg:gap-4">
```

**After:**
```html
<div className="@container mb-4 @md:mb-6 @lg:mb-8 w-full overflow-hidden">
  <ol className="flex items-center gap-1 @md:gap-2 @lg:gap-4 w-full">
```

#### Changes:
- Removed `min-w-min` from `ol` to allow proper shrinking
- Added `w-full` to `ol` to take full container width
- Changed `overflow-x-auto` to `overflow-hidden` to prevent scrollbars
- Added `w-full` to container div for proper width calculation

### Step List Items
**Before:**
```html
className={`relative flex items-center ${
  index !== steps.length - 1 ? '@lg:flex-1' : ''
}`}
```

**After:**
```html
className={`relative flex items-center flex-shrink-0 @md:flex-shrink min-w-0 ${
  index !== steps.length - 1 ? '@lg:flex-1 @lg:flex-shrink' : ''
}`}
```

#### Improvements:
- **flex-shrink-0** - Prevents circle from shrinking on mobile
- **@md:flex-shrink** - Allows shrinking at @md: and above
- **min-w-0** - Allows proper shrinking below default size
- **@lg:flex-1 @lg:flex-shrink** - Full flex behavior at @lg: breakpoint

### Step Label Container
**Before:**
```html
<span className="ml-1 @sm:ml-2 @md:ml-3 @lg:ml-4 min-w-0 hidden @sm:block">
```

**After:**
```html
<span className="ml-1 @sm:ml-2 @md:ml-3 @lg:ml-4 min-w-0 hidden @sm:flex flex-col flex-shrink">
```

#### Changes:
- Changed `block` to `flex flex-col` to enable flexible shrinking
- Added `flex-shrink` to allow label to shrink as needed
- Maintained `min-w-0` for proper text truncation

### Step Title & Description
**Before:**
```html
className="block text-xs @sm:text-xs @md:text-sm font-medium truncate"
```

**After:**
```html
className="block text-xs @sm:text-xs @md:text-sm font-medium truncate leading-tight"
```

#### Additions:
- Added `leading-tight` to reduce vertical space at all sizes
- Maintains text truncation at all breakpoints

## How It Works Now

### Responsive Shrinking
1. **Very small (256-384px):** Circle stays 24px (flex-shrink-0), labels hidden
2. **Tablet (384-576px):** Circle 24-32px, labels shown but can shrink (flex-shrink), text truncates
3. **Large (576-672px):** Smooth transition, labels remain visible
4. **Desktop (672px+):** Full flex-1 distribution, no shrinking needed

### Text Handling
- **Truncation:** `truncate` class prevents text overflow
- **Min-width:** `min-w-0` allows proper truncation
- **Flex column:** Parent uses `flex-col` for vertical layout
- **Leading tight:** Reduces line height to save vertical space

## Removed Features
- ❌ `overflow-x-auto` - No more horizontal scrolling
- ❌ `min-w-min` - Allows proper container shrinking
- ❌ Fixed width layout - Now fully flexible

## Maintained Features
- ✅ Responsive breakpoints (@sm:, @md:, @lg:)
- ✅ Step indicators (circles, numbers, icons)
- ✅ Connector lines (@lg: and above)
- ✅ Error/completion states
- ✅ Text truncation for small containers
- ✅ Keyboard accessibility

## Visual Behavior

| Container Width | Result |
|-----------------|--------|
| 256-384px | Only circles visible, no scrollbar, labels hidden |
| 384-448px | Circles + abbreviated labels, text truncates, no scrollbar |
| 448-576px | Circles + labels, graceful truncation, no scrollbar |
| 576-672px | Circles + full labels, reduced spacing, no scrollbar |
| 672px+ | Full layout with connectors, no scrollbar |

## Benefits

✅ **No scrollbars** - Forms stay clean at all sizes
✅ **Proper flex shrinking** - Items resize proportionally
✅ **Text truncation** - Content remains readable
✅ **Full container width** - No wasted space
✅ **Smooth transitions** - Responsive at all breakpoints
✅ **Better UX** - No surprising horizontal scrolling
