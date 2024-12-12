import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  bgColor: string;
}

const MetricCard = ({ label, value, subtext, bgColor }: MetricCardProps) => (
  <div className={`p-8 rounded-lg ${bgColor} `}>
    <div className="flex flex-col h-full justify-between">
      <h3 className="text-sm font-medium text-gray-700">{label}</h3>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <p className={`text-sm ${
          subtext.startsWith('+') ? 'text-green-700' : 
          subtext.startsWith('-') ? 'text-teal-700' : 
          'text-gray-700'
        }`}>
          {subtext}
        </p>
      </div>
    </div>
  </div>
);

const data = [
  { name: 'Metrics 1', value: 80 },
  { name: 'Metrics 2', value: 60 },
  { name: 'Metrics 3', value: 40 },
  { name: 'Metrics 4', value: 60 },
  { name: 'Metrics 5', value: 45 },
  { name: 'Metrics 6', value: 65 },
  { name: 'Metrics 7', value: 45 }
];

const COLORS = [
  "#115E59",  // Teal
  "#F59E0B",  // Orange
  "#FEF3C7",  // Cream
  "#115E59",  // Teal
  "#F59E0B",  // Orange
  "#FEF3C7",  // Cream
  "#115E59"   // Teal
];

export function PerformanceMetrics() {
  return (
    <section className="bg-white p-16 rounded-lg ">
      <div className='py-8'>
          <h2 className="text-3xl font-semibold text-center mb-2 max-w-[400px] mx-auto">
            Assistant Performance Metrics
          </h2>
          <p className="text-center text-gray-600 mb-8">Track assistant efficiency</p>

      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="Task Completion Rate"
          value="85%"
          subtext="+5%"
          bgColor="bg-[#FEF3C7]"  // Cream
        />
        <MetricCard
          label="Interaction Time"
          value="12 mins"
          subtext="-2 mins"
          bgColor="bg-teal-700"  // Teal
        />
        <MetricCard
          label="Error Rate"
          value="2.5%"
          subtext="-1%"
          bgColor="bg-amber-500"  // Orange
        />
      </div>

      <div className="mt-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 pt-4">
            <h3 className="font-medium">Performance Comparison</h3>
            <div className="text-gray-600">Values</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={data} 
              margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
              barCategoryGap={40}
            >
              <CartesianGrid 
                horizontal={true} 
                vertical={false}
                stroke="#E5E7EB"
                strokeOpacity={0.5}
                horizontalPoints={[50, 100, 150, 200, 250]}
              />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={false}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={false}
              />
              <Bar 
                dataKey="value"
                maxBarSize={60}
                radius={[0, 0, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="text-right text-gray-600 px-4 pb-4">Metrics</div>
        </div>
      </div>
    </section>
  );
} 