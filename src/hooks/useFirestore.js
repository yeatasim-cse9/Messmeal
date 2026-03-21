import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
    collection, doc, setDoc, addDoc, deleteDoc,
    onSnapshot, query, orderBy, getDoc, updateDoc
} from 'firebase/firestore';

const getCurrentMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// --- Members ---
export function useMembers(month) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const m = month || getCurrentMonth();
        const ref = collection(db, 'months', m, 'members');
        const q = query(ref, orderBy('order', 'asc'));
        const unsub = onSnapshot(q,
            (snap) => { setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
            (err) => { console.error('Members listener error:', err); setLoading(false); }
        );
        return () => unsub();
    }, [month]);

    const addMember = async (name, month_) => {
        const m = month_ || getCurrentMonth();
        await addDoc(collection(db, 'months', m, 'members'), { name, order: members.length, createdAt: new Date().toISOString() });
    };
    const removeMember = async (memberId, month_) => {
        await deleteDoc(doc(db, 'months', month_ || getCurrentMonth(), 'members', memberId));
    };
    const updateMember = async (memberId, data, month_) => {
        await updateDoc(doc(db, 'months', month_ || getCurrentMonth(), 'members', memberId), data);
    };

    return { members, loading, addMember, removeMember, updateMember };
}

// --- Meals ---
export function useMeals(month) {
    const [meals, setMeals] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const m = month || getCurrentMonth();
        const ref = collection(db, 'months', m, 'meals');
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
    }, [month]);

    const setMealValue = async (date, memberId, type, value, month_) => {
        const m = month_ || getCurrentMonth();
        const docId = `${date}_${memberId}`;
        const ref = doc(db, 'months', m, 'meals', docId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            await updateDoc(ref, { values: { ...snap.data().values, [type]: value } });
        } else {
            await setDoc(ref, { date, memberId, values: { [type]: value } });
        }
    };

    return { meals, loading, setMealValue };
}

// --- Expenses ---
export function useExpenses(month) {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const m = month || getCurrentMonth();
        const ref = collection(db, 'months', m, 'expenses');
        const q = query(ref, orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q,
            (snap) => { setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
            (err) => { console.error('Expenses listener error:', err); setLoading(false); }
        );
        return () => unsub();
    }, [month]);

    const addExpense = async (expense, month_) => {
        await addDoc(collection(db, 'months', month_ || getCurrentMonth(), 'expenses'), { ...expense, createdAt: new Date().toISOString() });
    };
    const removeExpense = async (expenseId, month_) => {
        await deleteDoc(doc(db, 'months', month_ || getCurrentMonth(), 'expenses', expenseId));
    };

    return { expenses, loading, addExpense, removeExpense };
}

// --- Deposits ---
export function useDeposits(month) {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const m = month || getCurrentMonth();
        const ref = collection(db, 'months', m, 'deposits');
        const q = query(ref, orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q,
            (snap) => { setDeposits(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
            (err) => { console.error('Deposits listener error:', err); setLoading(false); }
        );
        return () => unsub();
    }, [month]);

    const addDeposit = async (deposit, month_) => {
        await addDoc(collection(db, 'months', month_ || getCurrentMonth(), 'deposits'), { ...deposit, createdAt: new Date().toISOString() });
    };
    const removeDeposit = async (depositId, month_) => {
        await deleteDoc(doc(db, 'months', month_ || getCurrentMonth(), 'deposits', depositId));
    };

    return { deposits, loading, addDeposit, removeDeposit };
}

// --- Utilities ---
export function useUtilities(month) {
    const [utilities, setUtilitiesState] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const m = month || getCurrentMonth();
        const ref = doc(db, 'months', m, 'meta', 'utilities');
        const unsub = onSnapshot(ref,
            (snap) => { setUtilitiesState(snap.exists() ? snap.data() : {}); setLoading(false); },
            (err) => { console.error('Utilities listener error:', err); setLoading(false); }
        );
        return () => unsub();
    }, [month]);

    const setUtility = async (type, value, month_) => {
        const m = month_ || getCurrentMonth();
        const ref = doc(db, 'months', m, 'meta', 'utilities');
        await setDoc(ref, { [type]: value }, { merge: true });
    };

    return { utilities, loading, setUtility };
}

// --- Settings ---
const defaultSettings = {
    mealCategories: [
        { id: 'b', label: 'সকাল', color: 'slate' },
        { id: 'l', label: 'দুপুর', color: 'slate' },
        { id: 'i', label: 'ইফতার', color: 'indigo' },
        { id: 'd', label: 'রাত', color: 'slate' },
        { id: 's', label: 'সেহরী', color: 'emerald' },
        { id: 'g', label: 'গেস্ট মিল', color: 'amber' },
    ],
    billCategories: [
        { id: 'water', label: 'পানির বিল', icon: 'Droplets' },
        { id: 'electricity', label: 'বিদ্যুৎ বিল', icon: 'Zap' },
        { id: 'internet', label: 'ইন্টারনেট', icon: 'Wifi' },
        { id: 'fridge', label: 'ফ্রিজ বিল', icon: 'Snowflake' },
    ]
};

export function useSettings() {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ref = doc(db, 'settings', 'config');
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
    }, []);

    const updateSettings = async (newSettings) => {
        await setDoc(doc(db, 'settings', 'config'), newSettings, { merge: true });
    };

    return { settings, loading, updateSettings };
}

// --- Users (Auth Profiles) ---
export function useUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ref = collection(db, 'users');
        const unsub = onSnapshot(ref,
            (snap) => { setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
            (err) => { console.error('Users listener error:', err); setLoading(false); }
        );
        return () => unsub();
    }, []);

    const updateUserRole = async (uid, role) => {
        await updateDoc(doc(db, 'users', uid), { role });
    };

    const deleteUserRecord = async (uid) => {
        await deleteDoc(doc(db, 'users', uid));
    };

    return { users, loading, updateUserRole, deleteUserRecord };
}

export { getCurrentMonth };
