import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Use centralized loginWithToken so app state updates consistently
      loginWithToken(token);
      navigate('/profile', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6 lg:p-12">
      <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Logging you in...</h1>
        <p className="text-gray-500">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
