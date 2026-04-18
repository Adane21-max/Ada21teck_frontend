import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/students', label: 'Students' },
    { path: '/admin/subjects', label: 'Subjects' },
    { path: '/admin/questions', label: 'Questions' },
    { path: '/admin/question-types', label: 'Quiz Types' },
    { path: '/admin/free-trial', label: 'Free Trial' },
    { path: '/admin/announcements', label: 'Announcements' },
    { path: '/admin/payments', label: 'Payments' },
  ];

  return (
    <div
      style={{
        width: '250px',
        height: '100vh',
        background: '#1e1e2f',
        color: '#fff',
        position: 'fixed',
        left: 0,
        top: 0,
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <h3 style={{ padding: '0 20px', marginBottom: '30px' }}>Ada21Tech Admin</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {menuItems.map((item) => (
            <li key={item.path} style={{ margin: '5px 0' }}>
              <Link
                to={item.path}
                style={{
                  display: 'block',
                  padding: '12px 20px',
                  color: '#fff',
                  textDecoration: 'none',
                  background: location.pathname === item.path ? '#3a3a5c' : 'transparent',
                  borderRadius: '0 25px 25px 0',
                  marginRight: '15px',
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout Button */}
      <div style={{ padding: '20px' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px',
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;