'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPinIcon, GlobeIcon, Smartphone, Clock } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import CustomerLocationMap from './CustomerLocationMap';
import LocationCharts from './LocationCharts';

export default function CustomerLocationAnalytics() {
  const { getToken } = useAuth();
  const [locations, setLocations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchLocationData();
    const intervalId = setInterval(() => {
      fetchLocationData();
    }, 25000);

    return () => clearInterval(intervalId);
  }, [filter]);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(
        `/api/store/customer-locations?filter=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLocations(response.data.locations || []);
      setSummary(response.data.summary || {});
    } catch (error) {
      console.error('Error fetching location data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading location analytics...</div>;
  }

  return (
    <div className="w-full space-y-6 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customer Location Analytics</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Map Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Live Visitor Map</h3>
        <CustomerLocationMap locations={locations} />
      </div>

      {/* Charts Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Location Analytics Charts</h3>
        <LocationCharts summary={summary} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={GlobeIcon}
          title="Top Country"
          value={summary?.topCountry || 'N/A'}
          subtitle={`${summary?.countryCount || 0} visits`}
          color="blue"
        />
        <SummaryCard
          icon={MapPinIcon}
          title="Top City"
          value={summary?.topCity || 'N/A'}
          subtitle={`${summary?.cityCount || 0} visits`}
          color="green"
        />
        <SummaryCard
          icon={Smartphone}
          title="Top Device"
          value={summary?.topDevice || 'N/A'}
          subtitle={`${summary?.deviceCount || 0} visits`}
          color="purple"
        />
        <SummaryCard
          icon={Clock}
          title="Total Visits"
          value={summary?.totalVisits || 0}
          subtitle="Unique locations"
          color="orange"
        />
      </div>

      {/* Location Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Visits by Country</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {summary?.byCountry?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{item.country}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(item.count / (summary?.totalVisits || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Device */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Visits by Device</h3>
          <div className="space-y-2">
            {summary?.byDevice?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{item.deviceType}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-green-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(item.count / (summary?.totalVisits || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Customer Visits</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Location</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Device</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Browser</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">IP Address</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Time</th>
              </tr>
            </thead>
            <tbody>
              {locations.slice(0, showAll ? locations.length : 10).map((loc, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {loc.userEmail || 'Guest'}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {loc.city}, {loc.state}, {loc.country}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{loc.deviceType}</td>
                  <td className="px-4 py-3 text-gray-700">{loc.browser}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{loc.ip}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(loc.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {locations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No location data available for this period
          </div>
        )}
        {locations.length > 10 && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showAll ? 'Show Less' : `Show More (${locations.length - 10} more)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon: IconComponent, title, value, subtitle, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]} space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        {IconComponent && <IconComponent className="w-5 h-5" />}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-gray-600">{subtitle}</p>
    </div>
  );
}
