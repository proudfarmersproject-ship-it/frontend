import { useAuthStore } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const UserProfile = ({ mobile = false }) => {
  const navigate = useNavigate();
  const { user, isRegistered, logout } = useAuthStore();

  const handleLogin = () => {
    navigate('/login', { state: { from: window.location.pathname } });
  };

  const handleRegister = () => {
    navigate('/register', { state: { from: window.location.pathname } });
  };

  if (!isRegistered || !user) {
    return (
      <div className={`flex ${mobile ? 'flex-col gap-2' : 'items-center gap-3'}`}>
        <button
          onClick={handleLogin}
          className={`text-gray-700 hover:text-green-600 font-medium transition-colors ${
            mobile ? 'w-full flex items-center gap-3 py-2.5 px-3 hover:bg-gray-50 rounded-md' : 'px-4 py-2'
          }`}
        >
          {mobile && <User className="w-5 h-5" />}
          <span>Sign In</span>
        </button>
        <button
          onClick={handleRegister}
          className={`bg-green-600 text-white font-medium hover:bg-green-700 transition-colors ${
            mobile ? 'w-full py-2.5 px-3 rounded-md' : 'px-4 py-2 rounded-lg'
          }`}
        >
          Register
        </button>
      </div>
    );
  }

  if (mobile) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <button
            onClick={() => {
              navigate('/account');
              window.location.reload(); // Close mobile menu
            }}
            className="w-full text-left py-2 px-3 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Account
          </button>
          
          <button
            onClick={() => {
              navigate('/orders');
              window.location.reload();
            }}
            className="w-full text-left py-2 px-3 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Orders
          </button>
          
          <button
            onClick={() => {
              navigate('/wishlist');
              window.location.reload();
            }}
            className="w-full text-left py-2 px-3 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Wishlist
          </button>
          
          <button
            onClick={logout}
            className="w-full text-left py-2 px-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium hidden md:inline">{user.name}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {/* User Info */}
        <div className="p-4 border-b">
          <p className="font-semibold text-gray-900 truncate">{user.name}</p>
          <p className="text-sm text-gray-600 truncate">{user.email}</p>
          {user.role && (
            <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          )}
        </div>
        
        {/* Menu Items */}
        <div className="p-2">
          <button
            onClick={() => navigate('/account')}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Account
          </button>
          
          <button
            onClick={() => navigate('/orders')}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Orders
          </button>
          
          <button
            onClick={() => navigate('/wishlist')}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Wishlist
          </button>
          
          <div className="border-t border-gray-100 my-1"></div>
          
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;