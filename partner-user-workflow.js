// File: pages/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LoginForm from '../components/auth/LoginForm';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsLoggedIn(true);
      router.push('/dashboard');
    }
  }, [router]);

  const handleSuccessfulLogin = () => {
    setIsLoggedIn(true);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Partner Portal | Login</title>
        <meta name="description" content="FlytBase Partner Portal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Partner Portal</h1>
            <p className="mt-2 text-gray-600">Sign in to access your account</p>
          </div>
          <LoginForm onSuccessfulLogin={handleSuccessfulLogin} />
        </div>
      </main>
    </div>
  );
}

// File: components/auth/LoginForm.js
import { useState } from 'react';

export default function LoginForm({ onSuccessfulLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // This would be replaced with your actual authentication API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      // Store the token in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      // Call the success callback
      onSuccessfulLogin();
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember_me"
            name="remember_me"
            type="checkbox"
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="remember_me" className="block ml-2 text-sm text-gray-900">
            Remember me
          </label>
        </div>
        <div className="text-sm">
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
            Forgot your password?
          </a>
        </div>
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
}

// File: pages/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import DashboardStats from '../components/dashboard/DashboardStats';
import ActionCenter from '../components/dashboard/ActionCenter';
import RecentActivity from '../components/dashboard/RecentActivity';

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const storedUserData = localStorage.getItem('user_data');
    
    if (!token) {
      router.push('/');
      return;
    }

    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // This would be replaced with your actual API call
        const response = await fetch('/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        // Update state with the fetched data
        // For now we'll just set isLoading to false
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full border-t-indigo-600 animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Partner Portal | Dashboard</title>
      </Head>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {userData?.firstName || 'Partner'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening with your deals and activities today.
          </p>
        </div>

        <DashboardStats />
        
        <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActionCenter />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </Layout>
  );
}

// File: components/layout/Layout.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  HomeIcon, BriefcaseIcon, UserGroupIcon, DocumentTextIcon, 
  GiftIcon, QuestionMarkCircleIcon, CogIcon, MenuIcon, XIcon 
} from '@heroicons/react/outline';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'My Deals', href: '/deals', icon: BriefcaseIcon },
    { name: 'My Leads', href: '/leads', icon: UserGroupIcon },
    { name: 'Resources', href: '/resources', icon: DocumentTextIcon },
    { name: 'My Rewards', href: '/rewards', icon: GiftIcon },
    { name: 'Help & Support', href: '/support', icon: QuestionMarkCircleIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? '' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex flex-col flex-1 w-full max-w-xs pt-5 pb-4 bg-white">
          <div className="absolute top-0 right-0 pt-2 mr-2">
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 ml-1 rounded-md"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XIcon className="w-6 h-6 text-gray-500" aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center flex-shrink-0 px-4">
            <img className="w-auto h-8" src="/logo.svg" alt="FlytBase Logo" />
          </div>
          <div className="flex-1 h-0 mt-5 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`${
                      router.pathname === item.href
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${
                        router.pathname === item.href
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
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <img className="w-auto h-8" src="/logo.svg" alt="FlytBase Logo" />
          </div>
          <div className="flex flex-col flex-grow mt-5">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`${
                      router.pathname === item.href
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${
                        router.pathname === item.href
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
            <div className="p-4 mt-auto">
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

// File: components/dashboard/DashboardStats.js
export default function DashboardStats() {
  // This would be data fetched from your API
  const stats = [
    { name: 'Revenue Generated', value: '$24,500', change: '+12.5%', trend: 'up' },
    { name: 'Active Deals', value: '7', change: '+2', trend: 'up' },
    { name: 'Rewards Earned', value: '$350', change: '+$50', trend: 'up' },
    { name: 'Conversion Rate', value: '24%', change: '-2%', trend: 'down' },
  ];

  return (
    <div>
      <dl className="grid grid-cols-1 gap-5 mt-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="px-4 py-5 overflow-hidden bg-white rounded-lg shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{item.value}</dd>
            <dd className={`mt-2 text-sm font-medium ${
              item.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {item.change}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// File: components/dashboard/ActionCenter.js
import Link from 'next/link';

export default function ActionCenter() {
  // Quick action data
  const quickActions = [
    { name: 'Create Deal', href: '/deals/new', description: 'Add a new opportunity' },
    { name: 'Update Deal', href: '/deals', description: 'Modify existing deals' },
    { name: 'Generate Code', href: '/activation', description: 'Create a new activation code' },
    { name: 'Access Resources', href: '/resources', description: 'Browse sales materials' },
  ];

  // Pending tasks data
  const pendingTasks = [
    { id: 1, name: 'Update status for Acme Corp deal', priority: 'High', dueDate: 'Today' },
    { id: 2, name: 'Follow up with TechStart lead', priority: 'Medium', dueDate: 'Tomorrow' },
    { id: 3, name: 'Complete product training', priority: 'Low', dueDate: 'Next week' },
  ];

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">Action Center</h2>
        
        {/* Quick Actions */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4 mt-2 sm:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.name} href={action.href}>
                <a className="flex flex-col items-center p-3 text-center rounded-md hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">{action.name}</span>
                  <span className="mt-1 text-xs text-gray-500">{action.description}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Pending Tasks */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500">Pending Tasks</h3>
          <ul className="mt-2 divide-y divide-gray-200">
            {pendingTasks.map((task) => (
              <li key={task.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{task.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'High' 
                        ? 'bg-red-100 text-red-800' 
                        : task.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">{task.dueDate}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// File: components/dashboard/RecentActivity.js
export default function RecentActivity() {
  // Recent activity data
  const activities = [
    { id: 1, type: 'deal_update', title: 'Deal status updated', description: 'Acme Corp moved to Negotiation', time: '2 hours ago' },
    { id: 2, type: 'new_resource', title: 'New resource available', description: 'Q1 Product Roadmap', time: '1 day ago' },
    { id: 3, type: 'reward_earned', title: 'Reward earned', description: '$50 voucher for deal closure', time: '3 days ago' },
    { id: 4, type: 'lead_assigned', title: 'New lead assigned', description: 'TechStart is interested in our service', time: '1 week ago' },
  ];

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="flow-root mt-4">
          <ul className="-my-5 divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                    <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                  </div>
                  <div className="text-sm text-right text-gray-500 whitespace-nowrap">
                    {activity.time}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6">
          <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            View all activity <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// File: pages/deals/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import { PlusIcon, FilterIcon, SearchIcon } from '@heroicons/react/outline';

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // Fetch deals data
    const fetchDeals = async () => {
      try {
        // This would be replaced with your actual API call
        const response = await fetch('/api/deals', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch deals');
        }

        const data = await response.json();
        setDeals(data.deals || []);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // For demo purposes, using mock data
  const mockDeals = [
    {
      id: 1,
      customer: 'Acme Corporation',
      value: '$24,000',
      stage: 'Negotiation',
      probability: 75,
      updatedAt: '2023-06-15T14:30:00Z',
    },
    {
      id: 2,
      customer: 'TechStart Inc.',
      value: '$12,500',
      stage: 'Proposal',
      probability: 50,
      updatedAt: '2023-06-14T09:15:00Z',
    },
    {
      id: 3,
      customer: 'Global Industries',
      value: '$36,750',
      stage: 'Discovery',
      probability: 25,
      updatedAt: '2023-06-13T16:45:00Z',
    },
    {
      id: 4,
      customer: 'Innovate Solutions',
      value: '$18,300',
      stage: 'Closed Won',
      probability: 100,
      updatedAt: '2023-06-10T11:20:00Z',
    },
    {
      id: 5,
      customer: 'NextGen Systems',
      value: '$9,800',
      stage: 'Closed Lost',
      probability: 0,
      updatedAt: '2023-06-08T10:00:00Z',
    },
  ];

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Discovery':
        return 'bg-blue-100 text-blue-800';
      case 'Proposal':
        return 'bg-yellow-100 text-yellow-800';
      case 'Negotiation':
        return 'bg-purple-100 text-purple-800';
      case 'Closed Won':
        return 'bg-green-100 text-green-800';
      case 'Closed Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterDeals = (deals) => {
    if (activeFilter === 'all') return deals;
    if (activeFilter === 'won') return deals.filter(deal => deal.stage === 'Closed Won');
    if (activeFilter === 'lost') return deals.filter(deal => deal.stage === 'Closed Lost');
    if (activeFilter === 'active') return deals.filter(deal => 
      !['Closed Won', 'Closed Lost'].includes(deal.stage)
    );
    return deals;
  };

  return (
    <Layout>
      <Head>
        <title>Partner Portal | My Deals</title>
      </Head>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Deals</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and track your sales opportunities
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href="/deals/new">
              <a className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <PlusIcon className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
                New Deal
              </a>
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeFilter === 'all' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Deals
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeFilter === 'active' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveFilter('won')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeFilter === 'won' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Won
              </button>
              <button
                onClick={() => setActiveFilter('lost')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeFilter === 'lost' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Lost
              </button>
            </div>
            <div className="mt-3 sm:mt-0">
              <div className="flex items-center">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="