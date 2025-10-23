# Design Guidelines: NGX Metrics Dashboard

## Design Approach
**Reference-Based + Custom System**: Dark theme dashboard inspired by modern analytics platforms (Linear, Vercel Analytics) with NGX's signature neon green branding creating a distinct, tech-forward identity for vehicle dealership metrics.

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**
- Background Primary: `217 12% 7%` (--bg-primary: #0B0E17)
- Background Secondary: `225 18% 11%` (--bg-secondary: #141824)  
- Background Tertiary: `225 14% 16%` (--bg-tertiary: #1E2330)
- Brand Green: `83 100% 53%` (--brand-green: #A3FF12)
- Brand Green Glow: `83 100% 53% / 30%` (rgba(163, 255, 18, 0.3))

**Text Colors**
- Primary: `0 0% 100%` (white)
- Secondary: `0 0% 100% / 70%` 
- Tertiary: `0 0% 100% / 40%`

**Status Colors**
- Success: `158 64% 52%` (#10B981)
- Warning: `38 92% 50%` (#F59E0B)
- Error: `0 72% 51%` (#EF4444)

### B. Typography
- **Font Family**: Inter (Google Fonts)
- **Scale**:
  - H1: text-[32px] font-bold leading-tight
  - H2: text-2xl font-semibold
  - Body: text-sm font-normal
  - Metrics Display: text-[28px] font-bold
  - Labels: text-xs font-medium uppercase tracking-wide

### C. Layout System
**Spacing Units**: Use Tailwind spacing scale focusing on 4, 6, 8, 12, 16, 24 units
- Card padding: p-6
- Section spacing: space-y-8 or space-y-6
- Grid gaps: gap-6 (desktop), gap-4 (mobile)
- Container: max-w-7xl mx-auto px-4

### D. Component Library

**Cards**
```
- Base: bg-[#141824] border border-white/10 rounded-xl p-6
- Hover: hover:border-[#A3FF12]/20 transition-all duration-300
- Shadow: Optional subtle glow on hover
```

**Metric Cards (4-column grid on desktop)**
```
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Content: Large metric value + label + secondary metric
- Icon: Optional top-left accent icon in brand green
```

**Buttons**
```
Primary: 
- bg-gradient-to-r from-[#A3FF12] to-[#7BC90D]
- text-[#0B0E17] px-6 py-3 rounded-lg font-semibold
- shadow-[0_0_20px_rgba(163,255,18,0.3)]
- hover:shadow-[0_0_30px_rgba(163,255,18,0.3)] hover:-translate-y-0.5

Secondary:
- bg-[#1E2330] border border-white/10 
- text-white px-6 py-3 rounded-lg
- hover:border-[#A3FF12]/40
```

**Tables**
```
- Header: bg-[#1E2330] text-white/70 text-xs uppercase tracking-wide
- Rows: border-b border-white/5 hover:bg-white/5
- Cells: py-4 px-6
- Badges: Rounded-full px-3 py-1 text-xs
  - Green (CTR >2%): bg-[#10B981]/20 text-[#10B981]
  - Yellow (CTR 1-2%): bg-[#F59E0B]/20 text-[#F59E0B]
  - Red (CTR <1%): bg-[#EF4444]/20 text-[#EF4444]
```

**Charts (Recharts)**
```
- Background: transparent
- Grid lines: stroke-white/10
- Line/Bar color: #A3FF12 with gradient fill
- Tooltip: bg-[#1E2330] border border-white/20 rounded-lg p-3
- Axis labels: fill-white/50 fontSize-12
```

**Insights Card**
```
- bg-gradient-to-br from-[#A3FF12]/10 to-transparent
- border-l-4 border-[#A3FF12]
- Icons: ✅ (success), 💡 (opportunity), ⚠️ (warning)
- List items with icon + text, space-y-3
```

**Dropdown/Select**
```
- bg-[#1E2330] border border-white/10 rounded-lg px-4 py-2
- Focus: ring-2 ring-[#A3FF12]/50
- Options: bg-[#141824] hover:bg-[#1E2330]
```

### E. Page-Specific Layouts

**Client Dashboard (/[slug])**
1. **Header**: Sticky top, bg-[#0B0E17]/95 backdrop-blur-sm, flex justify-between items-center, py-4 px-6
2. **Hero Metrics**: 4-column grid of metric cards below header
3. **Insights Card**: Full-width below metrics, mb-8
4. **Charts Section**: 2-column grid (lg:grid-cols-2) with evolution chart (left) and performance chart (right)
5. **Table Section**: Full-width with search bar, responsive horizontal scroll on mobile
6. **Footer**: Minimal, text-white/40, text-sm, "Última atualização" timestamp

**Admin Panel (/ngx/admin)**
1. **Header**: NGX branding + "Novo Cliente" button (right-aligned)
2. **Client Cards**: Grid grid-cols-1 md:grid-cols-2 gap-6
3. **Each Card**: Client name, slug, metrics row, "Ver Dashboard" button

## Visual Effects
- **Glow Effects**: Use sparingly on primary buttons and brand elements only
- **Transitions**: duration-300 for all hover states
- **No Animations**: Minimal motion - focus on data clarity

## Responsive Strategy
- Mobile: Single column, sticky header, horizontal scroll tables
- Tablet: 2-column grids where applicable
- Desktop: Full 4-column layouts, max-width containers

## Images
**No hero images required** - This is a data-focused dashboard. Use:
- Client logos (placeholder if missing): max-h-10, object-contain
- Chart placeholders during loading: skeleton components in bg-white/5