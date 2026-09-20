import { motion } from 'motion/react';
import { TrendingUp, Scale, BarChart3, Target, Trophy } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const volumeData = [
  { name: 'Mon', thisWeek: 12000, lastWeek: 11000, bestWeek: 15000 },
  { name: 'Tue', thisWeek: 15000, lastWeek: 13000, bestWeek: 18000 },
  { name: 'Wed', thisWeek: 0, lastWeek: 16000, bestWeek: 17000 },
  { name: 'Thu', thisWeek: 18000, lastWeek: 0, bestWeek: 19000 },
  { name: 'Fri', thisWeek: 14000, lastWeek: 15000, bestWeek: 16000 },
  { name: 'Sat', thisWeek: 0, lastWeek: 12000, bestWeek: 14000 },
  { name: 'Sun', thisWeek: 0, lastWeek: 0, bestWeek: 0 },
];

const strengthData = [
  { week: 'W1', weight: 60 },
  { week: 'W2', weight: 62.5 },
  { week: 'W3', weight: 62.5 },
  { week: 'W4', weight: 65 },
  { week: 'W5', weight: 65 },
  { week: 'W6', weight: 67.5 },
  { week: 'W7', weight: 67.5 },
  { week: 'W8', weight: 70 },
  { week: 'W9', weight: 70 },
  { week: 'W10', weight: 72.5 },
  { week: 'W11', weight: 72.5 },
  { week: 'W12', weight: 75 },
];

const weightData = [
  { week: 'W1', weight: 82 },
  { week: 'W2', weight: 81.5 },
  { week: 'W3', weight: 81 },
  { week: 'W4', weight: 80.2 },
  { week: 'W5', weight: 79.8 },
  { week: 'W6', weight: 79.5 },
  { week: 'W7', weight: 78.9 },
  { week: 'W8', weight: 78.4 },
];

const rpeData = [
  { name: 'RPE 6-7', value: 15, color: '#10B981' },
  { name: 'RPE 7-8', value: 40, color: '#EAB308' },
  { name: 'RPE 8-9', value: 35, color: '#F97316' },
  { name: 'RPE 9-10', value: 10, color: '#EF4444' },
];

const stats = [
  { label: 'Total Volume', value: '847,200 kg', icon: BarChart3 },
  { label: 'Sessions', value: '47', icon: Target },
  { label: 'Avg RPE', value: '7.8', icon: TrendingUp },
  { label: 'PR Count', value: '12', icon: Trophy },
];

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    whileHover={{ scale: 1.01 }}
    className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 ${className}`}
  >
    {children}
  </motion.div>
);

export const PerformanceDashboard = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="mb-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent"
          >
            Performance Lab
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 mt-2 font-mono text-sm"
          >
            Your training data, visualized.
          </motion.p>
        </header>

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Streak Counter */}
          <Card className="col-span-1 md:col-span-1 flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                textShadow: [
                  "0 0 10px rgba(255,51,102,0.5)",
                  "0 0 20px rgba(255,51,102,0.8)",
                  "0 0 10px rgba(255,51,102,0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-2 flex items-center justify-center relative"
            >
              🔥
            </motion.div>
            <div className="text-4xl font-bold font-display text-white mt-4">12</div>
            <div className="text-zinc-400 font-mono text-sm uppercase tracking-wider mt-1">Day Streak</div>
            <div className="text-zinc-500 text-xs mt-4 bg-white/5 rounded-full px-3 py-1">
              Your longest: 21 days
            </div>
          </Card>

          {/* Quick Stats Grid */}
          <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} className="flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#7000FF]/20 rounded-lg">
                      <Icon className="w-5 h-5 text-[#7000FF]" />
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-400 font-mono text-xs uppercase tracking-wider mb-1">
                      {stat.label}
                    </div>
                    <div className="text-2xl font-bold font-display">
                      {stat.value}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Weekly Volume */}
          <Card className="h-[400px]">
            <h3 className="text-lg font-display font-semibold mb-6">Weekly Volume Comparison</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717A" tick={{ fill: '#71717A', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#71717A" tick={{ fill: '#71717A', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0F', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                  <Bar dataKey="thisWeek" name="This Week" fill="#7000FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lastWeek" name="Last Week" fill="#00F0FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bestWeek" name="Best Week" fill="#52525B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Strength Progression */}
          <Card className="h-[400px]">
            <h3 className="text-lg font-display font-semibold mb-6">Strength Progression (Bench)</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={strengthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStrength" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#7000FF" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={1}/>
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="week" stroke="#71717A" tick={{ fill: '#71717A', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#71717A" tick={{ fill: '#71717A', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0F', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="url(#colorStrength)" 
                    strokeWidth={3}
                    dot={{ fill: '#0A0A0F', stroke: '#00F0FF', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#00F0FF' }}
                    style={{ filter: 'url(#glow)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Body Weight Trend */}
          <Card className="h-[400px]">
            <h3 className="text-lg font-display font-semibold mb-6 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#00F0FF]" />
              Body Weight Trend
            </h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="week" stroke="#71717A" tick={{ fill: '#71717A', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#71717A" tick={{ fill: '#71717A', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0F', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* RPE Distribution */}
          <Card className="h-[400px]">
            <h3 className="text-lg font-display font-semibold mb-6">RPE Distribution</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rpeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {rpeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0F', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any) => [`${value}%`, 'Percentage']}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
