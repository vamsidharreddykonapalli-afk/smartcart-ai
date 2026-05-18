import React, { useState, useEffect } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ReferenceArea, Line, ComposedChart, ReferenceLine
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch, FaStore, FaHistory, FaCheckCircle,
  FaArrowLeft, FaChartLine, FaInfoCircle, FaArrowUp, FaArrowDown, FaMinus
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";

/* ── Constants ──────────────────────────────────────────────────────────── */
const STORES = ["BigBasket", "Zepto", "Blinkit", "Instamart", "JioMart", "Swiggy", "Amazon Fresh"];
const STORE_COLORS = {
  "BigBasket":    "#4f46e5",
  "Zepto":        "#10b981",
  "Blinkit":      "#f59e0b",
  "Instamart":    "#ef4444",
  "JioMart":      "#3b82f6",
  "Swiggy":       "#8b5cf6",
  "Amazon Fresh": "#ec4899",
};

/* ── Custom Tooltip ─────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, historyData }) => {
  if (!active || !payload?.length) return null;
  const isForecast = historyData.find(d => d.date === label)?.isPrediction;

  return (
    <div style={{
      background: "white",
      borderRadius: "1.25rem",
      padding: "1rem 1.25rem",
      boxShadow: "0 20px 40px -8px rgba(0,0,0,0.15)",
      border: "1px solid #f1f5f9",
      minWidth: 180,
    }}>
      <p style={{ fontWeight: 900, fontSize: 13, color: "#64748b", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        {label}
        {isForecast && (
          <span style={{ background: "#6366f1", color: "white", borderRadius: 6, padding: "1px 7px", fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>
            FORECAST
          </span>
        )}
      </p>
      {payload.map(entry => (
        <div key={entry.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>{entry.name}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#0f172a" }}>₹{entry.value?.toFixed(0)}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Trend Icon ─────────────────────────────────────────────────────────── */
const TrendIcon = ({ slope }) => {
  if (slope > 0.1)  return <FaArrowUp  className="text-red-400"    style={{ fontSize: 11 }} />;
  if (slope < -0.1) return <FaArrowDown className="text-emerald-400" style={{ fontSize: 11 }} />;
  return <FaMinus className="text-slate-400" style={{ fontSize: 11 }} />;
};

/* ── R² Confidence Bar ──────────────────────────────────────────────────── */
const ConfidenceBar = ({ value }) => {
  const pct   = Math.round(value * 100);
  const color = pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 4, background: "#f1f5f9", borderRadius: 99 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 800, color, minWidth: 28 }}>{pct}%</span>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────────────────── */
const PriceInsights = () => {
  const navigate = useNavigate();
  const [searchTerm,     setSearchTerm]     = useState("Milk");
  const [historyData,    setHistoryData]    = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [productName,    setProductName]    = useState("");
  const [regressionMeta, setRegressionMeta] = useState({});
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");

  /* fetch ----------------------------------------------------------------- */
  const fetchData = async (term) => {
    setLoading(true);
    setError("");
    try {
      const [compRes, histRes, predRes] = await Promise.all([
        API.get(`/products/compare/${term}`),
        API.get(`/analytics/price-history/${term}`),
        API.get(`/analytics/price-prediction/${term}`),
      ]);

      setComparisonData(compRes.data.comparisons);
      setProductName(compRes.data.productName);
      setRegressionMeta(predRes.data.regressionMeta || {});

      // Tag history points, combine with forecast
      const history     = (histRes.data.history     || []).map(d => ({ ...d, isPrediction: false }));
      const predictions = (predRes.data.predictions || []).map(d => ({ ...d, isPrediction: true  }));
      setHistoryData([...history, ...predictions]);

    } catch (err) {
      console.error("Error fetching price insights", err);
      setError("Product not found or data unavailable. Try 'Milk', 'Banana', or 'Tomato'.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData("Milk"); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) fetchData(searchTerm);
  };

  /* helpers --------------------------------------------------------------- */
  const cheapest = comparisonData.length
    ? comparisonData.reduce((m, p) => p.price < m.price ? p : m, comparisonData[0])
    : null;

  const forecastStartDate = historyData.find(d => d.isPrediction)?.date;
  const forecastEndDate   = historyData[historyData.length - 1]?.date;

  // Only show stores that actually have data in the chart
  const activeStores = STORES.filter(s =>
    historyData.some(d => d[s] != null)
  );

  /* ── render -------------------------------------------------------------- */
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 p-6 sm:p-12 font-sans overflow-x-hidden">

        {/* Back */}
        <div className="max-w-7xl mx-auto mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to previous page
          </button>
        </div>

        {/* Header */}
        <header className="max-w-7xl mx-auto mb-12">
          <motion.h1
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4"
          >
            Price <span className="text-indigo-600">Insights.</span>
          </motion.h1>
          <p className="text-xl text-slate-500 font-medium max-w-xl italic">
            Real-time market prices + 7-day AI forecast powered by Linear Regression.
          </p>
        </header>

        {/* Search */}
        <div className="max-w-7xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search product (e.g. Milk, Banana, Tomato)…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white px-8 py-6 rounded-[2rem] shadow-2xl border-none text-xl font-bold text-slate-800 placeholder-slate-300 focus:ring-4 focus:ring-indigo-100 transition-all"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-4 rounded-2xl shadow-lg hover:scale-105 transition-transform"
            >
              <FaSearch className="h-6 w-6" />
            </button>
          </form>
          {error && <p className="mt-4 text-red-500 font-bold ml-4">{error}</p>}
        </div>

        {/* Content */}
        {loading ? (
          <div className="max-w-7xl mx-auto flex h-64 items-center justify-center font-black text-2xl animate-pulse text-indigo-600">
            Running Linear Regression…
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {productName && (
              <motion.div
                key={productName}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="max-w-7xl mx-auto space-y-10"
              >
                {/* Product Banner */}
                <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-indigo-200 font-black uppercase text-xs tracking-widest mb-2">Currently Analyzing</p>
                    <h2 className="text-5xl font-black tracking-tighter">{productName}</h2>
                    <p className="text-indigo-300 mt-2 text-sm font-semibold">
                      OLS Linear Regression · 7-day forecast · {activeStores.length} stores
                    </p>
                  </div>
                  {cheapest && (
                    <div className="mt-6 md:mt-0 bg-white/20 backdrop-blur-md rounded-[2rem] p-6 text-center border border-white/30 relative z-10">
                      <p className="text-indigo-100 font-black uppercase text-[10px] tracking-widest mb-1">Best Price Today</p>
                      <h3 className="text-4xl font-black tracking-tighter">₹{cheapest.price}</h3>
                      <p className="text-sm font-bold flex items-center justify-center mt-1">
                        at {cheapest.store} <FaCheckCircle className="ml-2 text-emerald-400" />
                      </p>
                    </div>
                  )}
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl opacity-50" />
                </div>

                {/* Chart + Regression Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                  {/* ── Chart ── */}
                  <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center uppercase italic">
                        <FaHistory className="mr-3 text-indigo-600" /> Market Trends &amp; Forecast
                      </h3>
                    </div>

                    {/* Legend: history vs forecast */}
                    <div className="flex items-center gap-6 mb-6 flex-wrap">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <div style={{ width: 24, height: 3, background: "#94a3b8", borderRadius: 2 }} />
                        Historical
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-500">
                        <div style={{ width: 24, height: 3, background: "#6366f1", borderRadius: 2, borderTop: "2px dashed #6366f1" }} />
                        AI Forecast (Linear Regression)
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <div style={{ width: 12, height: 12, background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 3 }} />
                        Forecast zone
                      </div>
                    </div>

                    <div className="h-[460px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="date"
                            axisLine={false} tickLine={false}
                            tick={{ fill: "#94a3b8", fontWeight: 700, fontSize: 11 }}
                            dy={10}
                            interval={3}
                          />
                          <YAxis
                            axisLine={false} tickLine={false}
                            tick={{ fill: "#94a3b8", fontWeight: 700, fontSize: 11 }}
                            dx={-8}
                            tickFormatter={v => `₹${v}`}
                          />
                          <Tooltip content={<CustomTooltip historyData={historyData} />} />
                          <Legend verticalAlign="bottom" height={40}
                            formatter={(value) => (
                              <span style={{ fontSize: 11, fontWeight: 700, color: STORE_COLORS[value] }}>
                                {value}
                              </span>
                            )}
                          />

                          {/* Forecast zone shading */}
                          {forecastStartDate && (
                            <ReferenceArea
                              x1={forecastStartDate}
                              x2={forecastEndDate}
                              fill="#eff6ff"
                              fillOpacity={0.8}
                              label={{ value: "← Forecast →", position: "insideTop", fontSize: 10, fontWeight: 700, fill: "#818cf8", dy: 6 }}
                            />
                          )}

                          {/* Today divider */}
                          {forecastStartDate && (
                            <ReferenceLine
                              x={forecastStartDate}
                              stroke="#6366f1"
                              strokeWidth={2}
                              strokeDasharray="6 3"
                            />
                          )}

                          {/* One line per store — dashed in forecast zone */}
                          {activeStores.map(store => (
                            <Line
                              key={store}
                              type="monotone"
                              dataKey={store}
                              stroke={STORE_COLORS[store]}
                              strokeWidth={3}
                              dot={(dotProps) => {
                                const d = historyData[dotProps.index];
                                return d?.isPrediction
                                  ? <circle key={dotProps.key} cx={dotProps.cx} cy={dotProps.cy} r={3} fill={STORE_COLORS[store]} fillOpacity={0.5} stroke="none" />
                                  : <circle key={dotProps.key} cx={dotProps.cx} cy={dotProps.cy} r={4} fill="#fff" stroke={STORE_COLORS[store]} strokeWidth={2} />;
                              }}
                              activeDot={{ r: 7, strokeWidth: 0 }}
                              connectNulls
                              strokeDasharray={(historyData.some(d => d.isPrediction))
                                ? undefined : undefined}
                            />
                          ))}
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                    {/* How it works note */}
                    <div className="mt-4 flex items-start gap-2 bg-indigo-50 rounded-2xl p-4">
                      <FaInfoCircle className="text-indigo-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-indigo-700 font-semibold leading-relaxed">
                        <strong>How it works:</strong> The forecast uses <strong>Ordinary Least Squares (OLS) Linear Regression</strong> on the past 14 days of daily average prices per store. The model fits a best-fit line (y = mx + b) and projects it 7 days forward, adding store-specific demand bias and bounded Gaussian noise for realism.
                      </p>
                    </div>
                  </div>

                  {/* ── Right Column: Comparison + Regression Stats ── */}
                  <div className="space-y-8">

                    {/* Market Comparison */}
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white">
                      <h3 className="text-xl font-black mb-6 tracking-tighter flex items-center uppercase italic text-indigo-400">
                        <FaStore className="mr-3" /> Today's Prices
                      </h3>
                      <div className="space-y-3">
                        {STORES.map(store => {
                          const storePrice = comparisonData.find(p => p.store === store);
                          const isCheapest = storePrice && cheapest && storePrice.price === cheapest.price;
                          return (
                            <div
                              key={store}
                              className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                                isCheapest ? "bg-emerald-500/20 border border-emerald-500/50" : "bg-white/5 border border-white/10"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STORE_COLORS[store] }} />
                                <span className="font-bold text-xs">{store}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-base font-black tracking-tight">
                                  {storePrice ? `₹${storePrice.price}` : "N/A"}
                                </p>
                                {isCheapest && <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Cheapest</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Regression Stats */}
                    {Object.keys(regressionMeta).length > 0 && (
                      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                        <h3 className="text-xl font-black mb-6 tracking-tighter flex items-center uppercase italic text-slate-800">
                          <FaChartLine className="mr-3 text-indigo-500" /> Regression Stats
                        </h3>
                        <div className="space-y-4">
                          {activeStores.filter(s => regressionMeta[s]).map(store => {
                            const meta = regressionMeta[store];
                            return (
                              <div key={store} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: STORE_COLORS[store] }} />
                                    <span className="text-xs font-bold text-slate-600">{store}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                    <TrendIcon slope={meta.slope} />
                                    <span>{meta.slope > 0 ? "+" : ""}{meta.slope}/day</span>
                                  </div>
                                </div>
                                <ConfidenceBar value={meta.rSquared} />
                                <p className="text-[10px] text-slate-400 font-semibold">
                                  R² confidence: {Math.round(meta.rSquared * 100)}%
                                </p>
                              </div>
                            );
                          })}
                        </div>
                        <p className="mt-4 text-[10px] text-slate-400 font-semibold leading-relaxed">
                          R² = 1 means perfect linear trend. Lower values indicate more price volatility.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Next Week Forecast Table ── */}
                {historyData.some(d => d.isPrediction) && (() => {
                  const forecastDays = historyData.filter(d => d.isPrediction);
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 overflow-x-auto"
                    >
                      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center uppercase italic">
                          <FaChartLine className="mr-3 text-indigo-500" />
                          Next Week Price Forecast
                          <span className="ml-3 bg-indigo-100 text-indigo-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                            OLS Linear Regression
                          </span>
                        </h3>
                        <p className="text-sm text-slate-400 font-semibold italic">
                          Predicted daily prices (₹) for {productName}
                        </p>
                      </div>

                      <table className="w-full min-w-[700px] border-collapse">
                        <thead>
                          <tr>
                            <th className="text-left py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                              Store
                            </th>
                            {forecastDays.map(d => (
                              <th key={d.date} className="py-3 px-4 text-center text-xs font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                {d.date}
                              </th>
                            ))}
                            <th className="py-3 px-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                              Trend
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeStores.map((store, si) => {
                            const storePrices = forecastDays.map(d => d[store]).filter(v => v != null);
                            if (!storePrices.length) return null;
                            const minPrice = Math.min(...storePrices);
                            const first    = storePrices[0];
                            const last     = storePrices[storePrices.length - 1];
                            const weekDiff = last - first;
                            const meta     = regressionMeta[store];

                            return (
                              <tr
                                key={store}
                                className={`border-t border-slate-50 transition-colors hover:bg-slate-50/80 ${si % 2 === 0 ? "" : "bg-slate-50/40"}`}
                              >
                                {/* Store name */}
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: STORE_COLORS[store] }} />
                                    <span className="font-black text-sm text-slate-700">{store}</span>
                                  </div>
                                </td>

                                {/* Daily prices */}
                                {forecastDays.map(d => {
                                  const price = d[store];
                                  const isCheapestDay = price != null &&
                                    Math.min(...activeStores.map(s => d[s] || Infinity)) === price;
                                  return (
                                    <td key={d.date} className="py-3 px-4 text-center">
                                      {price != null ? (
                                        <span className={`inline-block px-2.5 py-1 rounded-xl text-sm font-black ${
                                          isCheapestDay
                                            ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                                            : price === minPrice
                                            ? "text-slate-700"
                                            : "text-slate-500"
                                        }`}>
                                          ₹{price.toFixed(0)}
                                        </span>
                                      ) : (
                                        <span className="text-slate-300 text-xs">–</span>
                                      )}
                                    </td>
                                  );
                                })}

                                {/* Weekly trend */}
                                <td className="py-3 px-4 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <div className={`flex items-center gap-1 text-xs font-black ${
                                      weekDiff > 0 ? "text-red-500" : weekDiff < 0 ? "text-emerald-500" : "text-slate-400"
                                    }`}>
                                      {weekDiff > 0 ? <FaArrowUp /> : weekDiff < 0 ? <FaArrowDown /> : <FaMinus />}
                                      <span>{Math.abs(weekDiff).toFixed(0)}</span>
                                    </div>
                                    {meta && (
                                      <span className="text-[10px] text-slate-400 font-semibold">
                                        R²={Math.round(meta.rSquared * 100)}%
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Table legend */}
                      <div className="mt-5 flex flex-wrap items-center gap-5 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 font-black ring-1 ring-emerald-300 text-xs">₹xx</span>
                          Cheapest store that day
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <FaArrowUp className="text-red-400" /> Price rising this week
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <FaArrowDown className="text-emerald-400" /> Price falling this week
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          R² = model confidence (higher is better)
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </>
  );
};

export default PriceInsights;
