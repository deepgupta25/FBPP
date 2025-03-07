// File: pages/admin/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';
import PerformanceOverview from '../../components/admin/PerformanceOverview';
import TeamSummary from '../../components/admin/TeamSummary';
import DealsOverview from '../../components/admin/DealsOverview';
import RecentActivities from '../../components/admin/RecentActivities';
import { verifyAdminAccess } from '../../utils/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      // Verify the user has admin access
      const hasAccess = await verifyAdminAccess();
      
      if (!hasAccess) {
        router.push('/dashboard');
        return;
      }

      // Fetch admin dashboard data
      try {
        // This would be replaced with your actual API call
        const response = await fetch('/api/admin/dashboard', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin dashboard data');
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [router]);

  // Mock data for demonstration
  const mockDashboardData = {
    partnerInfo: {
      name: 'TechNova Solutions',
      tier: 'Gold',
      flytCredits: 12500,
      teamSize: 8
    },
    performanceMetrics: {
      monthlyRevenue: '$34,750',
      monthlyChange: '+12.5%',
      activeDeals: 23,
      dealsChange: '+3',
      conversionRate: '28%',
      conversionChange: '+2.5%',
      teamEfficiency: '87%',
      efficiencyChange: '+5%'
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full border-t-indigo-600 animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  // Use mock data for now
  const data = mockDashboardData;

  return (
    <AdminLayout>
      <Head>
        <title>Partner Portal | Admin Dashboard</title>
      </Head>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard - {data.partnerInfo.name}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {data.partnerInfo.tier} Partner • {data.partnerInfo.flytCredits.toLocaleString()} FlytCredits
              </p>
            </div>
            <div className="mt-4 flex space-x-3 sm:mt-0">
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Purchase Credits
              </button>
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Download Reports
              </button>
            </div>
          </div>
        </div>

        <PerformanceOverview metrics={data.performanceMetrics} />
        
        <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
          <TeamSummary />
          <DealsOverview />
        </div>
        
        <div className="mt-6">
          <RecentActivities />
        </div>
      </div>
    </AdminLayout>
  );
}

// File: utils/auth.js
export async function verifyAdminAccess() {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    
    // This would be replaced with your actual API call
    const response = await fetch('/api/auth/verify-admin', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.isAdmin === true;
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return false;
  }
}

// File: components/admin/AdminLayout.js
import { useState, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Dialog, Transition } from '@headlessui/react';
import { 
  HomeIcon, UsersIcon, BriefcaseIcon, UserGroupIcon, 
  DocumentTextIcon, CurrencyDollarIcon, ChartBarIcon, 
  GiftIcon, CogIcon, XIcon, MenuIcon 
} from '@heroicons/react/outline';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Team Management', href: '/admin/team', icon: UsersIcon },
    { name: 'Deal Management', href: '/admin/deals', icon: BriefcaseIcon },
    { name: 'Lead Management', href: '/admin/leads', icon: UserGroupIcon },
    { name: 'Resources', href: '/admin/resources', icon: DocumentTextIcon },
    { name: 'FlytCredits', href: '/admin/credits', icon: CurrencyDollarIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Rewards', href: '/admin/rewards', icon: GiftIcon },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon },
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-40 flex md:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex flex-col flex-1 w-full max-w-xs pt-5 pb-4 bg-white">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 pt-2 -mr-12">
                  <button
                    type="button"
                    className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XIcon className="w-6 h-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex items-center flex-shrink-0 px-4">
                <img className="w-auto h-8" src="/logo.svg" alt="FlytBase Logo" />
                <span className="ml-2 text-xl font-bold text-indigo-700">Admin</span>
              </div>
              <div className="flex-1 h-0 mt-5 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <a
                        className={`${
                          router.pathname === item.href || (item.href !== '/admin' && router.pathname.startsWith(item.href))
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                      >
                        <item.icon
                          className={`${
                            router.pathname === item.href || (item.href !== '/admin' && router.pathname.startsWith(item.href))
                              ? 'text-indigo-600'
                              : 'text-gray-400 group-hover:text-gray-500'
                          } mr-4 flex-shrink-0 h-6 w-6`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <img className="w-auto h-8" src="/logo.svg" alt="FlytBase Logo" />
            <span className="ml-2 text-xl font-bold text-indigo-700">Admin</span>
          </div>
          <div className="flex flex-col flex-grow mt-5">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`${
                      router.pathname === item.href || (item.href !== '/admin' && router.pathname.startsWith(item.href))
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${
                        router.pathname === item.href || (item.href !== '/admin' && router.pathname.startsWith(item.href))
                          ? 'text-indigo-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
            <div className="px-4 mt-auto">
              <Link href="/dashboard">
                <a className="flex items-center w-full px-4 py-2 mb-4 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Switch to User View
                </a>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        <div className="flex flex-col flex-1">
          <div className="sticky top-0 z-10 flex flex-shrink-0 h-16 bg-white shadow md:hidden">
            <button
              type="button"
              className="px-4 text-gray-500 border-r border-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="w-6 h-6" aria-hidden="true" />
            </button>
            <div className="flex justify-between flex-1 px-4">
              <div className="flex flex-1">
                <div className="flex items-center flex-shrink-0">
                  <img className="w-auto h-8" src="/logo.svg" alt="FlytBase Logo" />
                  <span className="ml-2 text-xl font-bold text-indigo-700">Admin</span>
                </div>
              </div>
            </div>
          </div>

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

// File: components/admin/PerformanceOverview.js
export default function PerformanceOverview({ metrics }) {
  const stats = [
    { name: 'Monthly Revenue', value: metrics.monthlyRevenue, change: metrics.monthlyChange, trend: metrics.monthlyChange.startsWith('+') ? 'up' : 'down' },
    { name: 'Active Deals', value: metrics.activeDeals, change: metrics.dealsChange, trend: metrics.dealsChange.startsWith('+') ? 'up' : 'down' },
    { name: 'Conversion Rate', value: metrics.conversionRate, change: metrics.conversionChange, trend: metrics.conversionChange.startsWith('+') ? 'up' : 'down' },
    { name: 'Team Efficiency', value: metrics.teamEfficiency, change: metrics.efficiencyChange, trend: metrics.efficiencyChange.startsWith('+') ? 'up' : 'down' },
  ];

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900">Performance Overview</h2>
      <dl className="grid grid-cols-1 gap-5 mt-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="px-4 py-5 overflow-hidden bg-white rounded-lg shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
            <dd className={`mt-2 text-sm font-medium ${
              stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// File: components/admin/TeamSummary.js
import Link from 'next/link';

export default function TeamSummary() {
  // Mock team data
  const teamMembers = [
    { id: 1, name: 'Sarah Johnson', role: 'Senior Sales Rep', deals: 8, revenue: '$58,200', performance: 'high' },
    { id: 2, name: 'Michael Chen', role: 'Account Executive', deals: 5, revenue: '$42,500', performance: 'medium' },
    { id: 3, name: 'Emily Rodriguez', role: 'Sales Rep', deals: 3, revenue: '$21,300', performance: 'medium' },
    { id: 4, name: 'David Kim', role: 'Sales Rep', deals: 2, revenue: '$12,800', performance: 'low' },
  ];

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Team Summary</h2>
          <Link href="/admin/team">
            <a className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View All
            </a>
          </Link>
        </div>
      </div>
      <div className="px-4 pb-5 sm:p-0">
        <div className="border-t border-gray-200 divide-y divide-gray-200">
          {teamMembers.map((member) => (
            <div key={member.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{member.deals} Deals</p>
                    <p className="text-sm text-gray-500">{member.revenue}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceColor(member.performance)}`}>
                    {member.performance.charAt(0).toUpperCase() + member.performance.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-4 border-t border-gray-200 sm:px-6">
        <Link href="/admin/team/add">
          <a className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            + Add Team Member
          </a>
        </Link>
      </div>
    </div>
  );
}

// File: components/admin/DealsOverview.js
import Link from 'next/link';

export default function DealsOverview() {
  // Mock deal stage data
  const dealStages = [
    { name: 'Discovery', count: 7, value: '$62,400' },
    { name: 'Proposal', count: 9, value: '$87,200' },
    { name: 'Negotiation', count: 5, value: '$53,500' },
    { name: 'Closed Won', count: 12, value: '$128,900' },
    { name: 'Closed Lost', count: 8, value: '$76,300' },
  ];

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Deals Overview</h2>
          <Link href="/admin/deals">
            <a className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View All
            </a>
          </Link>
        </div>
      </div>
      <div className="px-4 pb-5 sm:p-0">
        <div className="border-t border-gray-200 divide-y divide-gray-200">
          {dealStages.map((stage) => (
            <div key={stage.name} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{stage.name}</p>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{stage.count} Deals</p>
                  <p className="text-sm text-gray-500">{stage.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-4 border-t border-gray-200 sm:px-6">
        <div className="flex space-x-4">
          <Link href="/admin/deals/create">
            <a className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              + Add Deal
            </a>
          </Link>
          <Link href="/admin/deals/pipeline">
            <a className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View Pipeline
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

// File: components/admin/RecentActivities.js
import Link from 'next/link';

export default function RecentActivities() {
  // Mock activity data
  const activities = [
    { id: 1, user: 'Sarah Johnson', action: 'closed a deal with', target: 'Acme Corp', value: '$24,000', time: '2 hours ago' },
    { id: 2, user: 'Michael Chen', action: 'updated status for', target: 'TechStart Inc', value: 'To Negotiation', time: '3 hours ago' },
    { id: 3, user: 'Admin', action: 'added new resources', target: 'Q1 Product Roadmap', value: '', time: '5 hours ago' },
    { id: 4, user: 'Emily Rodriguez', action: 'converted lead to deal', target: 'Global Industries', value: '$36,750', time: '1 day ago' },
    { id: 5, user: 'David Kim', action: 'earned a reward', target: '$50 voucher', value: '', time: '2 days ago' },
  ];

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
      </div>
      <div className="px-4 pt-2 pb-5">
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                      <span className="font-medium">{activity.target}</span>
                      {activity.value && ` (${activity.value})`}
                    </p>
                  </div>
                  <div className="text-sm text-right text-gray-500 whitespace-nowrap">
                    {activity.time}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="px-4 py-4 border-t border-gray-200 sm:px-6">
        <Link href="/admin/activities">
          <a className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            View all activities <span aria-hidden="true">&rarr;</span>
          </a>
        </Link>
      </div>
    </div>
  );
}

// File: pages/admin/team/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../components/admin/AdminLayout';
import { PlusIcon, SearchIcon, AdjustmentsIcon } from '@heroicons/react/outline';

export default function TeamManagement() {
  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    // Fetch team data
    const fetchTeam = async () => {
      try {
        // This would be replaced with your actual API call
        const response = await fetch('/api/admin/team', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch team data');
        }

        const data = await response.json();
        setTeam(data.team || []);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, []);

  // Mock team data
  const mockTeam = [
    { 
      id: 1, 
      name: 'Sarah Johnson', 
      role: 'Senior Sales Rep', 
      email: 'sarah.j@technova.com',
      phone: '(555) 123-4567',
      deals: { active: 8, closed: 24 }, 
      revenue: { current: '$58,200', total: '$387,500' }, 
      joinedAt: '2021-03-15T00:00:00Z',
      performance: 'high',
      avatar: '/avatars/sarah.jpg'
    },
    { 
      id: 2, 
      name: 'Michael Chen', 
      role: 'Account Executive', 
      email: 'michael.c@technova.com',
      phone: '(555) 234-5678',
      deals: { active: 5, closed: 18 }, 
      revenue: { current: '$42,500', total: '$276,300' },
      joinedAt: '2021-06-22T00:00:00Z',
      performance: 'medium',
      avatar: '/avatars/michael.jpg'
    },
    { 
      id: 3, 
      name: 'Emily Rodriguez', 
      role: 'Sales Rep', 
      email: 'emily.r@technova.com',
      phone: '(555) 345-6789',
      deals: { active: 3, closed: 12 }, 
      revenue: { current: '$21,300', total: '$157,800' },
      joinedAt: '2022-01-10T00:00:00Z',
      performance: 'medium',
      avatar: '/avatars/emily.jpg'
    },
    { 
      id: 4, 
      name: 'David Kim', 
      role: 'Sales Rep', 
      email: 'david.k@technova.com',
      phone: '(555) 456-7890',
      deals: { active: 2, closed: 8 }, 
      revenue: { current: '$12,800', total: '$86,200' },
      joinedAt: '2022-04-05T00:00:00Z',
      performance: 'low',
      avatar: '/avatars/david.jpg'
    },
    {
      id: 5,
      name: 'Jessica Wong',
      role: 'Sales Manager',
      email: 'jessica.w@technova.com',
      phone: '(555) 567-8901',
      deals: { active: 4, closed: 32 },
      revenue: { current: '$47,500', total: '$452,800' },
      joinedAt: '2020-09-18T00:00:00Z',
      performance: 'high',
      avatar: '/avatars/jessica.jpg'
    }
  ];

  // Use mock data for now
  const displayTeam = mockTeam;

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'high': return 'bg-green-100 text-green