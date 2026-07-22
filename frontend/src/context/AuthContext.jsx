import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signup = async (email, password, firstName, lastName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: `${firstName} ${lastName}`.trim() });
    // Save user to Firestore
    await setDoc(doc(db, "users", result.user.uid), {
      firstName,
      lastName,
      email,
      role: "farmer",
      photoURL: "",
      createdAt: serverTimestamp(),
    });
    return result;
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    // Save to Firestore only if first time
    const ref = doc(db, "users", result.user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const nameParts = (result.user.displayName || "").split(" ");
      await setDoc(ref, {
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: result.user.email,
        role: "farmer",
        photoURL: result.user.photoURL || "",
        createdAt: serverTimestamp(),
      });
    }
    return result;
  };

  const logout = () => signOut(auth);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const userData = currentUser
    ? {
        id: currentUser.uid,
        email: currentUser.email,
        name: currentUser.displayName,
        username: currentUser.displayName || currentUser.email,
        picture: currentUser.photoURL,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!currentUser,
        isAuthLoading,
        userData,
        currentUser,
        login,
        signup,
        loginWithGoogle,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
