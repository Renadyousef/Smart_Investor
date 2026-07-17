import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Lock, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(accountNumber, password);
      navigate('/');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md bg-surface p-8 rounded-3xl shadow-2xl border border-gray-800/50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface mb-6">
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-white">تسجيل الدخول</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                className="appearance-none block w-full pr-10 pl-3 py-3 border border-gray-700 rounded-xl bg-surface text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                placeholder="رقم الحساب"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                className="appearance-none block w-full pr-10 pl-3 py-3 border border-gray-700 rounded-xl bg-surface text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl text-xl font-black text-white bg-gradient-to-r from-primary to-secondary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed shadow-none' : ''}`}
            >
              {loading ? 'جاري ...' : 'دخول'}
            </button>
          </div>

          <div className="text-center mt-4"> ليس لديك حساب؟
            <Link to="/signup" className="text-blue-400 underline hover:text-opacity-80 p-1">
               سجل الآن
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
