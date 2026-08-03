import { Link, Outlet, useLocation } from 'react-router-dom';

const TABS = [
  { path: '/admin/products', label: 'Productos e inventario' },
  { path: '/admin/reports', label: 'Reportes' },
  { path: '/admin/users', label: 'Usuarios y roles' },
];

export default function AdminDashboard() {
  const location = useLocation();
  return (
    <div className="page admin-page">
      <h1>Panel administrativo</h1>
      <nav className="admin-tabs">
        {TABS.map((tab) => (
          <Link key={tab.path} to={tab.path} className={location.pathname === tab.path ? 'is-active' : ''}>
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
