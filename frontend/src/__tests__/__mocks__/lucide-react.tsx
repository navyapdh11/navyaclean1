import React from 'react';
const MockIcon = (props: any) => React.createElement('svg', { 'data-testid': 'icon', ...props });

const icons: Record<string, any> = {
  LayoutDashboard: MockIcon,
  Calendar: MockIcon,
  Users: MockIcon,
  UserCheck: MockIcon,
  Search: MockIcon,
  Filter: MockIcon,
  ChevronDown: MockIcon,
  ChevronUp: MockIcon,
  Eye: MockIcon,
  Edit: MockIcon,
  Trash2: MockIcon,
  Mail: MockIcon,
  Phone: MockIcon,
  MapPin: MockIcon,
  Menu: MockIcon,
  X: MockIcon,
  Bell: MockIcon,
  Download: MockIcon,
  UserPlus: MockIcon,
  Star: MockIcon,
  Clock: MockIcon,
  DollarSign: MockIcon,
  Loader2: MockIcon,
  CheckCircle: MockIcon,
  XCircle: MockIcon,
  Award: MockIcon,
  TrendingUp: MockIcon,
  MoreHorizontal: MockIcon,
  Plus: MockIcon,
};

module.exports = new Proxy(icons, {
  get: (target, prop) => {
    return target[prop as string] || MockIcon;
  },
});
export default MockIcon;
