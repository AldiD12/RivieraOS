import { Users, Wallet, TrendingUp, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManagerStaffLeaderboard() {
  // Mock data - replace with real API data
  const staff = [
    { id: 1, name: 'Andi', status: 'live', activeTables: 5, salesToday: 450.0, performance: 95 },
    { id: 2, name: 'Maria', status: 'live', activeTables: 3, salesToday: 380.0, performance: 80 },
    { id: 3, name: 'Luca', status: 'live', activeTables: 4, salesToday: 420.0, performance: 88 },
    { id: 4, name: 'Sofia', status: 'offline', activeTables: 0, salesToday: 290.0, performance: 61 },
    { id: 5, name: 'Marco', status: 'live', activeTables: 2, salesToday: 310.0, performance: 65 },
  ];

  const topSeller = Math.max(...staff.map((s) => s.salesToday));
  const totalSales = staff.reduce((sum, s) => sum + s.salesToday, 0);
  const activeTables = staff.reduce((sum, s) => sum + s.activeTables, 0);

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">
          Staff Leaderboard
        </h1>
        <p className="text-zinc-500 text-sm">Real-time performance tracking</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span className="text-zinc-500 text-sm uppercase tracking-widest">Total Sales</span>
          </div>
          <p className="text-4xl font-black text-white font-mono">€{totalSales.toFixed(0)}</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-zinc-500 text-sm uppercase tracking-widest">Active Staff</span>
          </div>
          <p className="text-4xl font-black text-white font-mono">
            {staff.filter((s) => s.status === 'live').length}
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-zinc-500 text-sm uppercase tracking-widest">Active Tables</span>
          </div>
          <p className="text-4xl font-black text-white font-mono">{activeTables}</p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800 bg-zinc-900">
          <div className="col-span-3 text-zinc-500 text-xs uppercase tracking-widest font-medium">
            Name
          </div>
          <div className="col-span-2 text-zinc-500 text-xs uppercase tracking-widest font-medium text-center">
            Status
          </div>
          <div className="col-span-2 text-zinc-500 text-xs uppercase tracking-widest font-medium text-center">
            Tables
          </div>
          <div className="col-span-2 text-zinc-500 text-xs uppercase tracking-widest font-medium text-right">
            Sales
          </div>
          <div className="col-span-3 text-zinc-500 text-xs uppercase tracking-widest font-medium">
            Performance
          </div>
        </div>

        {/* Table Rows */}
        {staff
          .sort((a, b) => b.salesToday - a.salesToday)
          .map((person, index) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors"
            >
              {/* Name */}
              <div className="col-span-3 flex items-center gap-2">
                <span className="text-white font-bold text-lg">{person.name}</span>
                {index === 0 && (
                  <span className="text-xs bg-emerald-500 text-black px-2 py-0.5 rounded font-bold">
                    TOP
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="col-span-2 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Circle
                    className={`w-3 h-3 ${
                      person.status === 'live'
                        ? 'fill-emerald-500 text-emerald-500'
                        : 'fill-zinc-600 text-zinc-600'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      person.status === 'live' ? 'text-emerald-400' : 'text-zinc-600'
                    }`}
                  >
                    {person.status === 'live' ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Active Tables */}
              <div className="col-span-2 flex items-center justify-center">
                <span className="text-white text-2xl font-black font-mono">
                  {person.activeTables}
                </span>
              </div>

              {/* Sales */}
              <div className="col-span-2 flex items-center justify-end">
                <span className="text-emerald-400 text-2xl font-black font-mono">
                  €{person.salesToday.toFixed(0)}
                </span>
              </div>

              {/* Performance Bar */}
              <div className="col-span-3 flex items-center">
                <div className="flex-1">
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${person.performance}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={`h-full ${
                        person.performance >= 80
                          ? 'bg-emerald-500'
                          : person.performance >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    />
                  </div>
                  <span className="text-zinc-500 text-xs mt-1 block font-mono">
                    {person.performance}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 text-center text-zinc-600 text-sm">
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
