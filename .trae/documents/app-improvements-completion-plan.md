# App Improvements Completion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the final task from the previous improvements plan by implementing chart visualizations for the admin dashboard using Recharts. This gives organizers actionable data insights on nominee votes and leads.

**Architecture:**
- **Chart Visualization:** Integrate `recharts` into the `ManageAward.tsx` dashboard. Add an "Analytics" tab that visualizes nominee votes (Bar Chart) and captured leads over time or by category.

**Tech Stack:** React, Tailwind CSS, Recharts

---

### Task 1: Add Chart Visualization to Dashboard

**Files:**
- Modify: `src/pages/ManageAward.tsx`

- [ ] **Step 1: Import Recharts Components**

```tsx
// In src/pages/ManageAward.tsx
// Add imports for Recharts at the top of the file
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
```
*(Note: Rename BarChart from recharts to `RechartsBarChart` if `BarChart` is already imported from `lucide-react`, or rename the lucide-react import).*

- [ ] **Step 2: Add Analytics Tab Navigation**

```tsx
// In the tabs navigation area (around line 416), add the Analytics tab button:
          <button
            onClick={() => setActiveTab('analytics')}
            className={`${
              activeTab === 'analytics'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#666666] hover:border-[#EAEAEA] hover:text-[#111111]'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center transition-colors`}
          >
            <BarChart className="h-4 w-4 mr-2" />
            Analytics
          </button>
```

- [ ] **Step 3: Prepare Chart Data**

```tsx
// Inside the ManageAward component, before the return statement, prepare the data:
  const topNomineesData = useMemo(() => {
    return [...nominees]
      .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
      .slice(0, 5)
      .map(n => ({ name: n.name, votes: n.voteCount || 0 }));
  }, [nominees]);

  const COLORS = ['#d97757', '#6a9bcc', '#788c5d', '#b0aea5', '#141413'];
```

- [ ] **Step 4: Render the Analytics Tab Content**

```tsx
// Inside the main content area (where activeTab conditions are checked), add:
        {activeTab === 'analytics' && (
          <div className="px-6 py-8">
            <h3 className="text-lg font-semibold text-anthropic-dark font-sans mb-6">Campaign Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Top Nominees Chart */}
              <div className="bg-white p-6 rounded-2xl border border-anthropic-lightGray shadow-sm">
                <h4 className="font-semibold text-anthropic-dark mb-4">Top Nominees by Votes</h4>
                {topNomineesData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={topNomineesData}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
                        <YAxis allowDecimals={false} />
                        <Tooltip cursor={{ fill: '#f5f5f5' }} />
                        <Bar dataKey="votes" fill="#d97757" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No vote data available yet.
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-white p-6 rounded-2xl border border-anthropic-lightGray shadow-sm flex flex-col justify-center">
                <h4 className="font-semibold text-anthropic-dark mb-6">Overview</h4>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Categories</p>
                    <p className="text-3xl font-semibold text-anthropic-dark">{categories.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Nominees</p>
                    <p className="text-3xl font-semibold text-anthropic-dark">{nominees.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Leads Captured</p>
                    <p className="text-3xl font-semibold text-anthropic-dark">{leads.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/ManageAward.tsx
git commit -m "feat: add analytics tab with recharts to manage award dashboard"
```