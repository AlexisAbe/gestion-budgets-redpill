
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  BarChart3, 
  Users, 
  Settings, 
  HelpCircle, 
  LayoutDashboard 
} from 'lucide-react';

const links = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Campagnes',
    href: '/campaigns',
    icon: BarChart3,
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: Users,
  },
  {
    name: 'Paramètres',
    href: '/settings',
    icon: Settings,
  },
  {
    name: 'Aide',
    href: '/help',
    icon: HelpCircle,
  },
];

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className={cn('pb-12', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Menu
          </h2>
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                  currentPath === link.href || 
                  (currentPath.startsWith(link.href) && link.href !== '/') || 
                  (link.href === '/' && currentPath === '/') 
                    ? 'bg-accent text-accent-foreground' 
                    : 'transparent'
                )}
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
