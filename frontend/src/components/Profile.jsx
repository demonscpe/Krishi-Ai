import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import adminImage from '../assets/agrorent/admin.jpg';
import farmerImage from '../assets/agrorent/farmer.jpg';
import vendorImage from '../assets/agrorent/vendor.jpg';
import customerImage from '../assets/agrorent/customer.jpg';

const roleDetails = {
  admin:    { image: adminImage,    quote: 'Empowering the system with efficiency and integrity.' },
  farmer:   { image: farmerImage,   quote: 'Cultivating the land, nurturing the future.' },
  vendor:   { image: vendorImage,   quote: 'Connecting products to people with passion.' },
  customer: { image: customerImage, quote: 'A satisfied customer is the best business strategy.' },
};

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white text-gray-800 outline-none focus:ring-2 focus:ring-green-500 transition-all";

const Profile = () => {
  const { currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login', { replace: true }); return; }

    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setFormData({ firstName: data.firstName || '', lastName: data.lastName || '', email: data.email || '' });
        } else {
          // Fallback to Firebase Auth data if Firestore doc missing
          const nameParts = (currentUser.displayName || '').split(' ');
          const fallback = { firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '', email: currentUser.email || '', role: 'farmer' };
          setUserData(fallback);
          setFormData({ firstName: fallback.firstName, lastName: fallback.lastName, email: fallback.email });
        }
      } catch (err) {
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser, isLoggedIn, navigate]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveMsg('');
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      // Keep Firebase Auth displayName in sync
      await updateProfile(auth.currentUser, {
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
      });
      setUserData((prev) => ({ ...prev, firstName: formData.firstName, lastName: formData.lastName }));
      setIsEditing(false);
      setSaveMsg('Profile updated!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-green-600 border-b-2" />
    </div>
  );

  if (error && !userData) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <p className="text-red-500 text-sm font-medium">{error}</p>
    </div>
  );

  const role = userData?.role || 'farmer';
  const roleInfo = roleDetails[role] || roleDetails.farmer;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2">Account</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3">Your Profile</h1>
          <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="relative h-32 overflow-hidden">
            <img src={roleInfo.image} alt={role} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-300">{role}</span>
              <p className="text-white text-xs italic opacity-80 max-w-xs">"{roleInfo.quote}"</p>
            </div>
          </div>

          <div className="p-7">
            {saveMsg && (
              <div className="mb-4 px-4 py-2 rounded-xl bg-[#E9F5EC] text-[#1F5E3E] border border-[#BFE0CB] text-sm font-medium">
                ✅ {saveMsg}
              </div>
            )}
            {error && (
              <div className="mb-4 px-4 py-2 rounded-xl bg-[#FDEDEA] text-[#B3401F] border border-[#F3CFC4] text-sm font-medium">
                {error}
              </div>
            )}

            <div className="flex items-center gap-4 mb-7">
              {userData?.photoURL || currentUser?.photoURL ? (
                <img src={userData?.photoURL || currentUser?.photoURL} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-green-200" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-2xl font-black text-green-700 border-2 border-green-200">
                  {userData?.firstName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-slate-800">{userData?.firstName} {userData?.lastName}</h2>
                <p className="text-sm text-slate-500">{userData?.email}</p>
              </div>
              <div className="ml-auto">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-xs font-bold border border-green-600 text-green-700 rounded-xl hover:bg-green-50 transition-all">
                    Edit Profile
                  </button>
                ) : (
                  <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-xs font-bold bg-green-700 text-white rounded-xl hover:bg-green-800 transition-all disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">First Name</label>
                    <input className={inputClass} value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Last Name</label>
                    <input className={inputClass} value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                  <input type="email" className={inputClass} value={formData.email} disabled title="Email cannot be changed here" />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed from profile.</p>
                </div>
                <button onClick={() => setIsEditing(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'First Name', value: userData?.firstName },
                  { label: 'Last Name',  value: userData?.lastName },
                  { label: 'Email',      value: userData?.email },
                  { label: 'Role',       value: userData?.role },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</span>
                    <span className="text-sm font-semibold text-slate-700">{value || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
