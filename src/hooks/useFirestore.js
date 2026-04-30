import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
    collection, doc, setDoc, addDoc, deleteDoc,
    onSnapshot, query, orderBy, getDoc, updateDoc, where
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const getCurrentMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// --- Members ---
export function useMembers(month) {
    const { userProfile } = useAuth();
    const messId = userProfile?.messId;
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!messId) return;
        const m = month || getCurrentMonth();
        const ref = collection(db, 'messes', messId, 'months', m, 'members');
        const q = query(ref, orderBy('order', 'asc'));
        const unsub = onSnapshot(q,
            (snap) => { setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
            (err) => { console.error('Members listener error:', err); setLoading(false); }
        );
        return () => unsub();
    }, [month, messId]);

    const addMember = async (name, month_) => {
        if (!messId) return;
        const m = month_ || getCurrentMonth();
        await addDoc(collection(db, 'messes', messId, 'months', m, 'members'), { name, order: members.length, createdAt: new Date().toISOString() });
    };
    const removeMember = async (memberId, month_) => {
        if (!messId) return;
        await deleteDoc(doc(db, 'messes', messId, 'months', month_ || getCurrentMonth(), 'members', memberId));
    };
    const updateMember = async (memberId, data, month_) => {
        if (!messId) return;
        await updateDoc(doc(db, 'messes', messId, 'months', month_ || getCurrentMonth(), 'members', memberId), data);
    };

    return { members, loading, addMember, removeMember, updateMember };
}

// --- Meals ---
export function useMeals(month) {
    const { userProfile } = useAuth();
    const messId = userProfile?.messId;
    const [meals, setMeals] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!messId) return;
        const m = month || getCurrentMonth();
        const ref = collection(db, 'messes', messId, 'months', m, 'meals');
        const unsub = onSnapshot(ref,
            (snap) => {
                const data = {};
                snap.docs.forEach(d => {
                    const entry = d.data();
                    if (!data[entry.date]) data[entry.date] = {};
                    data[entry.date][entry.memberId] = { ...entry.values, _docId: d.id };
                });
                setMeals(data);
                setLoading(false);
            },
            (err) => { console.error('Meals listener error:', err); setLoading(false); }
        );
        return () => unsub();
    }, [month, messId]);

    const setMealValue = async (date, memberId, type, value, month_) => {
        if (!messId) return;
        const m = month_ || getCurrentMonth();
        const docId = `${date}_${memberId}`;
        const ref = doc(db, 'messes', messId, 'months', m, 'meals', docId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            await updateDoc(ref, { values: { ...snap.data().values, [type]: value } });
        } else {
            await setDoc(ref, { date, memberId, values: { [type]: value } });
        }
    };

    const setBulkMeals = async (dates, memberId, value, month_) => {
        if (!messId) return;
        const m = month_ || getCurrentMonth();
        // updates is a map of date -> { [catId]: value }
        for (const { date, type } of dates) {
            const docId = `${date}_${memberId}`;
            const ref = doc(db, 'messes', messId, 'months', m, 'meals', docId);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                await updateDoc(ref, { values: { ...snap.data().values, [type]: value } });
            } else {
                await setDoc(ref, { date, memberId, values: { [type]: value } });
            }
        }
    };

    return { meals, loading, setMealValue, setBulkMeals };
}

// --- Expenses ---
export function useExpenses(month) {
    const { userProfile } = useAuth();
    const messId = userProfile?.messId;
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!messId) return;
        const m = month || getCurrentMonth();
        const ref = collection(db, 'messes', messId, 'months', m, 'expenses');
        const q = query(ref, orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q,
            (snap) => { setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
            (err) => { console.error('Expenses listener error:', err); setLoading(false); }
        );
        return () => unsub();
    }, [month, messId]);

    const addExpense = async (expense, month_) => {
        if (!messId) return;
        await addDoc(collection(db, 'messes', messId, 'months', month_ || getCurrentMonth(), 'expenses'), { ...expense, createdAt: new Date().toISOString() });
    };
    const removeExpense = async (expenseId, month_) => {
        if (!messId) return;
        await deleteDoc(doc(db, 'messes', messId, 'months', month_ || getCurrentMonth(), 'expenses', expenseId));
    };
    const updateExpense = async (expenseId, data, month_) => {
        if (!messId) return;
        await updateDoc(doc(db, 'messes', messId, 'months', month_ || getCurrentMonth(), 'expenses', expenseId), data);
    };

    return { expenses, loading, addExpense, removeExpense, updateExpense };
}

// --- Deposits ---
export function useDeposits(month) {
    const { userProfile } = useAuth();
    const messId = userProfile?.messId;
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!messId) return;
        const m = month || getCurrentMonth();
        const ref = collection(db, 'messes', messId, 'months', m, 'deposits');
        const q = query(ref, orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q,
            (snap) => { setDeposits(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
            (err) => { console.error('Deposits listener error:', err); setLoading(false); }
        );
        return () => unsub();
    }, [month, messId]);

    const addDeposit = async (deposit, month_) => {
        if (!messId) return;
        await addDoc(collection(db, 'messes', messId, 'months', month_ || getCurrentMonth(), 'deposits'), { ...deposit, createdAt: new Date().toISOString() });
    };
    const removeDeposit = async (depositId, month_) => {
        if (!messId) return;
        await deleteDoc(doc(db, 'messes', messId, 'months', month_ || getCurrentMonth(), 'deposits', depositId));
    };

    return { deposits, loading, addDeposit, removeDeposit };
}

// --- Utilities ---
export function useUtilities(month) {
    const { userProfile } = useAuth();
    const messId = userProfile?.messId;
    const [utilities, setUtilitiesState] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!messId) return;
        const m = month || getCurrentMonth();
        const ref = doc(db, 'messes', messId, 'months', m, 'meta', 'utilities');
        const unsub = onSnapshot(ref,
            (snap) => { setUtilitiesState(snap.exists() ? snap.data() : {}); setLoading(false); },
            (err) => { console.error('Utilities listener error:', err); setLoading(false); }
        );
        return () => unsub();
    }, [month, messId]);

    const setUtility = async (type, value, month_) => {
        if (!messId) return;
        const m = month_ || getCurrentMonth();
        const ref = doc(db, 'messes', messId, 'months', m, 'meta', 'utilities');
        await setDoc(ref, { [type]: value }, { merge: true });
    };

    return { utilities, loading, setUtility };
}

// --- Settings ---
const defaultSettings = {
    mealCategories: [
        { id: 'b', label: 'সকাল', color: 'slate', lockTime: '08:00' },
        { id: 'l', label: 'দুপুর', color: 'slate', lockTime: '09:00' },
        { id: 'i', label: 'ইফতার', color: 'indigo', lockTime: '14:00' },
        { id: 'd', label: 'রাত', color: 'slate', lockTime: '16:00' },
        { id: 's', label: 'সেহরী', color: 'emerald', lockTime: '00:00' },
        { id: 'g', label: 'গেস্ট মিল', color: 'amber', lockTime: '22:00' },
    ],
    billCategories: [
        { id: 'water', label: 'পানির বিল', icon: 'Droplets' },
        { id: 'electricity', label: 'বিদ্যুৎ বিল', icon: 'Zap' },
        { id: 'internet', label: 'ইন্টারনেট', icon: 'Wifi' },
        { id: 'fridge', label: 'ফ্রিজ বিল', icon: 'Snowflake' },
    ]
};

export function useSettings() {
    const { userProfile } = useAuth();
    const messId = userProfile?.messId;
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!messId) return;
        const ref = doc(db, 'messes', messId, 'settings', 'config');
        const unsub = onSnapshot(ref,
            (snap) => {
                if (snap.exists()) {
                    setSettings(snap.data());
                } else {
                    // Try to initialize with defaults
                    setDoc(ref, defaultSettings).catch(() => { });
                }
                setLoading(false);
            },
            (err) => {
                console.error('Settings listener error:', err);
                // Use defaults even if Firestore fails
                setSettings(defaultSettings);
                setLoading(false);
            }
        );
        return () => unsub();
    }, [messId]);

    const updateSettings = async (newSettings) => {
        if (!messId) return;
        await setDoc(doc(db, 'messes', messId, 'settings', 'config'), newSettings, { merge: true });
    };

    return { settings, loading, updateSettings };
}

// --- Users (Auth Profiles) ---
export function useUsers() {
    const { userProfile } = useAuth();
    const messId = userProfile?.messId;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!messId) return;
        const ref = collection(db, 'global_users');
        const q = query(ref, where('messId', '==', messId));
        const unsub = onSnapshot(q,
            (snap) => { setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
            (err) => { console.error('Users listener error:', err); setLoading(false); }
        );
        return () => unsub();
    }, [messId]);

    const updateUserRole = async (uid, role) => {
        await updateDoc(doc(db, 'global_users', uid), { role });
    };

    const deleteUserRecord = async (uid) => {
        await deleteDoc(doc(db, 'global_users', uid));
    };

    return { users, loading, updateUserRole, deleteUserRecord };
}

export { getCurrentMonth };
