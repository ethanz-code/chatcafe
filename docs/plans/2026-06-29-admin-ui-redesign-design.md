# Admin UI Redesign: Usage Statistics Page & Full Admin Refresh

## Context

The admin panel (based on Soybean Admin + Vue 3 + NaiveUI + ECharts) needs a comprehensive UI redesign. Starting with the Usage Statistics page (`/usage`) as a pilot, then rolling out to all admin pages.

**Tech stack:** Vue 3, Vite 5, TypeScript, NaiveUI, UnoCSS, ECharts, Pinia, Vue Router

## Approach: Custom Dashboard Component Library (方案 B)

Build a reusable dashboard component set with enhanced data visualizations. Extract common patterns into shared components, then apply across all admin pages.

## Page Architecture

### Usage Statistics Page Layout

```
PageHeader (title + time filter)
├── KPI Row 1 (4 cards): 今日调用 / 活跃用户 / 今日Token / 累计调用
├── KPI Row 2 (4 cards): 本周调用 / 本月调用 / 累计Token / 累计费用
├── Trend Chart (full width): 每日用量趋势 with dataZoom
├── Model Distribution (2-col split)
│   ├── Left: Horizontal bar chart (by calls)
│   ├── Right: Donut chart (token %)
│   └── Bottom: Detail data table
└── User Ranking (full width)
    └── Rank table + progress bars + pagination
```

## Component Library

### `UsageStatCard.vue`
- Props: `label`, `value`, `icon`, `trend?`, `sparklineData?`
- Icon (top-right), trend indicator (up/down green/red), mini sparkline
- Large formatted number, hover shows exact value

### `UsageTrendChart.vue`
- ECharts wrapper with `useResizeObserver`
- Area-filled bar chart (calls) + smooth line (tokens/1000)
- Dual Y-axes, `dataZoom` slider, enhanced tooltip (date/calls/tokens/cost)
- Loads trend data; `days` prop (7/30/90) via NSelect in header

### `ModelDistChart.vue`
- Horizontal bar chart, sorted by calls descending
- Color-coded by model

### `ModelDonutChart.vue`
- Ring chart showing token distribution by model
- Legend: model name + percentage
- Center text: total tokens

### `UserRankTable.vue`
- Rank column (#1/2/3 with gold/silver/bronze badge, rest plain)
- phoneNumber mask: `138****5678`
- Usage progress bar relative to top user
- Row hover highlight
- Pagination at bottom

### `PageHeader.vue`
- Page title (left) + action slot (right, for time filter etc.)

## Component Tree

```
PageHeader
├── UsageStatCard (x8)
├── UsageTrendChart
├── ModelDistChart ─── ModelDonutChart
├── NDataTable (model detail)
└── UserRankTable
    └── NPagination
```

## Data Flow

```
onMounted → Promise.all([
  fetchUsageOverview(),    → 8 stat cards
  fetchUsageByModel(30),   → model chart + donut + table
  fetchUsageByUser(30,1),  → user rank table
  fetchUsageTrends(30)     → trend chart (reactive via watch)
])

User actions:
- trendDays change → reload fetchUsageTrends
- user page/pageSize change → reload fetchUsageByUser
```

## File Structure

```
admin/src/
├── components/
│   └── usage/
│       ├── UsageStatCard.vue
│       ├── UsageTrendChart.vue
│       ├── ModelDistChart.vue
│       ├── ModelDonutChart.vue
│       ├── UserRankTable.vue
│       └── PageHeader.vue
└── views/
    └── usage/
        └── index.vue          ← refactored, uses above components
```

## API Types (unchanged)

```typescript
UsageOverview { total, today, week, month }
ModelUsage { model, calls, totalTokens, promptTokens, completionTokens, cost }
UserUsage { userId, phoneNumber, name, calls, totalTokens, cost, lastUsed }
DailyTrend { date, calls, tokens, cost }
```

## Color Palette (NaiveUI theme overrides)

- Primary: `#409EFF` → `#6366f1` (indigo)
- Success: `#67C23A`
- Warning: `#E6A23C`
- Error: `#F56C6C`
- Card bg: `#fff`
- Page bg: `#f5f7fa`
- Border radius: `8px`
- Card shadow: `0 1px 3px rgba(0,0,0,0.06)`

## Rollout Plan (Phased)

1. **Phase 1**: Usage statistics page component extraction + redesign
2. **Phase 2**: Apply components to User Service pages (user, dialog, feedback, promotion, check-in, task reward)
3. **Phase 3**: Recharge system (goods, order)
4. **Phase 4**: AI Chat pages (model, hot issues, assistant)
5. **Phase 5**: Home/Config page
