import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth, db, authSecondary } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    const profileRef = doc(db, 'global_users', firebaseUser.uid);
                    const profileSnap = await getDoc(profileRef);
                    if (profileSnap.exists()) {
                        const data = profileSnap.data();
                        let messName = 'Unknown Mess';
                        if (data.messId) {
                            try {
                                const messSnap = await getDoc(doc(db, 'messes', data.messId));
                                if (messSnap.exists()) {
                                    messName = messSnap.data().name;
                                }
                            } catch (e) {}
                        }
                        setUserProfile({ ...data, messName });
                    } else {
                        const newProfile = {
                            name: firebaseUser.email.split('@')[0],
                            email: firebaseUser.email,
                            role: 'viewer',
                            globalRole: 'member',
                            messId: 'default_mess_001',
                            messName: 'Main Mess',
                            createdAt: new Date().toISOString()
                        };
                        await setDoc(profileRef, newProfile);
                        setUserProfile(newProfile);
                    }
                } catch (err) {
                    console.error('Profile fetch/create error:', err);
                    // Fallback profile so app doesn't get stuck
                    setUserProfile({
                        name: firebaseUser.email.split('@')[0],
                        email: firebaseUser.email,
                        role: 'viewer'
                    });
                }
            } else {
                setUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email, password, name) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const newProfile = {
            name: name || email.split('@')[0],
            email: email,
            role: 'viewer',
            globalRole: 'member',
            messId: 'default_mess_001',
            createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'global_users', cred.user.uid), newProfile);
        setUserProfile(newProfile);
        return cred;
    };

    const loginWithGoogle = async () => {
        const cred = await signInWithPopup(auth, googleProvider);
        // Profile will be auto-created by onAuthStateChanged handler
        return cred;
    };

    const logout = async () => {
        await signOut(auth);
    };

    const createUserByAdmin = async (email, password, name, targetMessId = null, targetRole = 'viewer') => {
        // Use secondary auth to create user without logging current admin out
        const cred = await createUserWithEmailAndPassword(authSecondary, email, password);
        const newProfile = {
            name: name || email.split('@')[0],
            email: email,
            role: targetRole,
            globalRole: 'member',
            messId: targetMessId || userProfile?.messId || 'default_mess_001',
            createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'global_users', cred.user.uid), newProfile);
        // Force logout of the secondary app immediately
        await signOut(authSecondary);
        return cred;
    };

    const isAdmin = userProfile?.role === 'admin';
    const isSuperAdmin = userProfile?.globalRole === 'super_admin';

    const value = {
        user,
        userProfile,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        isAdmin,
        isSuperAdmin,
        createUserByAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
