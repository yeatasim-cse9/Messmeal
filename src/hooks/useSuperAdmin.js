import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, query, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export function useSuperAdmin() {
    const { isSuperAdmin } = useAuth();
    const [messes, setMesses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isSuperAdmin) {
            setLoading(false);
            return;
        }

        const ref = collection(db, 'messes');
        const unsub = onSnapshot(ref,
            (snap) => {
                setMesses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLoading(false);
            },
            (err) => {
                console.error('Messes listener error:', err);
                setLoading(false);
            }
        );

        return () => unsub();
    }, [isSuperAdmin]);

    const createMess = async (messId, messData) => {
        if (!isSuperAdmin) return;
        await setDoc(doc(db, 'messes', messId), {
            ...messData,
            createdAt: new Date().toISOString()
        });
    };

    const updateMessStatus = async (messId, isActive) => {
        if (!isSuperAdmin) return;
        await updateDoc(doc(db, 'messes', messId), { isActive });
    };

    const updateMess = async (messId, messData) => {
        if (!isSuperAdmin) return;
        await updateDoc(doc(db, 'messes', messId), messData);
    };

    const deleteMess = async (messId) => {
        if (!isSuperAdmin) return;
        await deleteDoc(doc(db, 'messes', messId));
    };

    return { messes, loading, createMess, updateMessStatus, updateMess, deleteMess };
}
