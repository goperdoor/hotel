import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, RefreshCw, Loader2, Download, Trash2 } from 'lucide-react';

/*
  OwnerAnalytics: client-side derived analytics using existing order list endpoint.
  Future enhancement: move heavy aggregations to dedicated server endpoints for performance.
*/

const COLORS = ['#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6','#0EA5E9','#EC4899'];

const OwnerAnalytics = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const [purging, setPurging] = useState(false);

  const loadOrders = async () => {
    if (!token) return;
    setLoading(true);
    try { const data = await orderApi.ownerList(token); setOrders(data); setError(null); setLastRefreshed(new Date()); }
    catch(e){ setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { loadOrders(); /* eslint-disable-next-line */ }, [token]);

  // Metrics derivation
  const metrics = useMemo(() => {
    if (!orders.length) return null;
    const statusCounts = orders.reduce((acc,o)=>{ acc[o.status]=(acc[o.status]||0)+1; return acc; },{});
    const totalRevenue = orders.filter(o=>['completed','paid'].includes(o.status)).reduce((sum,o)=> sum + (o.total||0),0);
    const byDayMap = {};
    orders.forEach(o=>{
      const d = new Date(o.createdAt || o.created_at || o.updatedAt);
      if (isNaN(d)) return;
      const key = d.toISOString().slice(0,10);
      if(!byDayMap[key]) byDayMap[key] = { date:key, orders:0, revenue:0 };
      byDayMap[key].orders += 1;
      if(['completed','paid'].includes(o.status)) byDayMap[key].revenue += (o.total||0);
    });
    const dailySeries = Object.values(byDayMap).sort((a,b)=> a.date.localeCompare(b.date));

    // top items (flatten order items)
    const itemMap = {};
    orders.forEach(o=>{
      (o.items||[]).forEach(it=>{
        const name = it.item?.name || 'Deleted Item';
        if(!itemMap[name]) itemMap[name] = { name, qty:0, revenue:0 };
        itemMap[name].qty += it.quantity;
        itemMap[name].revenue += (it.price * it.quantity);
      });
    });
    const topItems = Object.values(itemMap).sort((a,b)=> b.qty - a.qty).slice(0,7);

    // pie data for status distribution
    const pieData = Object.entries(statusCounts).map(([status,count])=>({ name: status, value: count }));

    return { statusCounts, totalRevenue, dailySeries, topItems, pieData };
  }, [orders]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2"><BarChart3 className="h-7 w-7 text-primary-600" />Analytics</h1>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-white p-2 rounded border">
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-wide text-gray-500">Start</label>
                <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="text-xs border rounded px-2 py-1" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-wide text-gray-500">End</label>
                <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="text-xs border rounded px-2 py-1" />
              </div>
            </div>
            <button onClick={loadOrders} disabled={loading} className="text-xs px-3 py-2 rounded border flex items-center gap-1 bg-white hover:bg-gray-50 disabled:opacity-50">
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}Refresh
            </button>
            <button
              disabled={exporting || !token}
              onClick={async ()=>{
                if(!token) return; setExporting(true);
                try {
                  const blob = await orderApi.exportRange(token,startDate||undefined,endDate||undefined);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  const stamp = new Date().toISOString().slice(0,10);
                  a.download = `orders_${startDate||'all'}_${endDate||'all'}_${stamp}.csv`;
                  document.body.appendChild(a); a.click(); a.remove();
                  URL.revokeObjectURL(url);
                } catch(e){ alert(e.message); }
                setExporting(false);
              }}
              className="text-xs px-3 py-2 rounded border flex items-center gap-1 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >{exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}Export CSV</button>
            <button
              disabled={purging || !token || (!startDate && !endDate)}
              onClick={async ()=>{
                if(!window.confirm(`Delete completed/paid/cancelled orders${startDate||endDate?` in range ${startDate||'..'} to ${endDate||'..'}`:''}? This cannot be undone.`)) return;
                setPurging(true);
                try {
                  const result = await orderApi.purgeRange(token,startDate||undefined,endDate||undefined);
                  alert(`Deleted ${result.deleted} orders`);
                  await loadOrders();
                } catch(e){ alert(e.message); }
                setPurging(false);
              }}
              className="text-xs px-3 py-2 rounded border flex items-center gap-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >{purging ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}Purge Range</button>
          </div>
        </div>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {lastRefreshed && <div className="text-[11px] text-gray-500">Last updated: {lastRefreshed.toLocaleTimeString()}</div>}

      {!loading && (!orders || orders.length===0) && (
        <div className="p-10 border rounded bg-white text-center text-sm text-gray-600">No orders yet. Data will appear once orders are placed.</div>
      )}

      {metrics && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded shadow">
              <p className="text-xs uppercase tracking-wide opacity-80">Total Revenue</p>
              <p className="text-2xl font-semibold mt-1">Rs {metrics.totalRevenue}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 rounded shadow">
              <p className="text-xs uppercase tracking-wide opacity-80">Total Orders</p>
              <p className="text-2xl font-semibold mt-1">{orders.length}</p>
            </div>
            <div className="bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white p-4 rounded shadow">
              <p className="text-xs uppercase tracking-wide opacity-80">Paid / Completed</p>
              <p className="text-2xl font-semibold mt-1">{(metrics.statusCounts.paid||0)+(metrics.statusCounts.completed||0)}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-white border rounded p-4 col-span-1 xl:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-indigo-600" />Daily Orders & Revenue</h2>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.dailySeries} margin={{ top:10, right:20, bottom:0, left:0 }}>
                    <XAxis dataKey="date" tick={{ fontSize:12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize:12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize:12 }} />
                    <Tooltip contentStyle={{ fontSize:'12px' }} />
                    <Legend wrapperStyle={{ fontSize:'12px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#6366F1" strokeWidth={2} dot={false} name="Orders" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={false} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white border rounded p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2"><PieChartIcon className="h-4 w-4 text-pink-600" />Status Distribution</h2>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={metrics.pieData} dataKey="value" nameKey="name" outerRadius={90} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%` }>
                      {metrics.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize:'12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border rounded p-4 flex flex-col">
              <h2 className="text-sm font-semibold mb-3">Top Items (Qty)</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.topItems} margin={{ top:10, right:20, left:0, bottom:0 }}>
                    <XAxis dataKey="name" tick={{ fontSize:11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize:12 }} />
                    <Tooltip contentStyle={{ fontSize:'12px' }} />
                    <Bar dataKey="qty" fill="#6366F1" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white border rounded p-4 flex flex-col">
              <h2 className="text-sm font-semibold mb-3">Top Items (Revenue)</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.topItems} margin={{ top:10, right:20, left:0, bottom:0 }}>
                    <XAxis dataKey="name" tick={{ fontSize:11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize:12 }} />
                    <Tooltip contentStyle={{ fontSize:'12px' }} />
                    <Bar dataKey="revenue" fill="#10B981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
      {loading && <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" />Loading data...</div>}
    </div>
  );
};

export default OwnerAnalytics;
