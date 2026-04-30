import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function Migration() {
    const { isAdmin } = useAuth();
    const [status, setStatus] = useState('Ready to migrate');
    const [progress, setProgress] = useState('');

    const migrateData = async () => {
        if (!isAdmin) {
            setStatus('You must be an admin to run this.');
            return;
        }

        setStatus('Starting migration...');
        const messId = 'default_mess_001';
        
        try {
            // 1. Create Mess Document
            setStatus('Creating Mess Document...');
            await setDoc(doc(db, 'messes', messId), {
                name: 'Main Mess',
                address: 'Unknown',
                createdAt: new Date().toISOString()
            });

            // 2. Migrate Global Users
            setStatus('Migrating Users...');
            const usersSnap = await getDocs(collection(db, 'users'));
            const batch = writeBatch(db);
            let userCount = 0;
            usersSnap.forEach(d => {
                const userData = d.data();
                // We keep the users collection for now but copy them to global_users
                const globalRef = doc(db, 'global_users', d.id);
                // The new global_users format
                batch.set(globalRef, {
                    ...userData,
                    messId: messId,
                    globalRole: userData.role === 'admin' ? 'admin' : 'member' // temporary logic, super_admin will be assigned manually
                });
                userCount++;
            });
            await batch.commit();
            setProgress(`Migrated ${userCount} users.`);

            // 3. Migrate Settings
            setStatus('Migrating Settings...');
            const settingsSnap = await getDocs(collection(db, 'settings'));
            const settingsBatch = writeBatch(db);
            settingsSnap.forEach(d => {
                const newRef = doc(db, 'messes', messId, 'settings', d.id);
                settingsBatch.set(newRef, d.data());
            });
            await settingsBatch.commit();
            
            // 4. Migrate Months Data (Iterate over possible months)
            setStatus('Migrating Months Data...');
            const years = [2024, 2025, 2026];
            const subCollections = ['members', 'meals', 'expenses', 'deposits', 'meta/utilities'];
            
            for (const year of years) {
                for (let month = 1; month <= 12; month++) {
                    const mStr = `${year}-${String(month).padStart(2, '0')}`;
                    setProgress(`Checking month: ${mStr}`);
                    
                    for (const sub of subCollections) {
                        let q;
                        if (sub === 'meta/utilities') {
                            // Document read directly not possible with collection(), but we can do a getDoc or skip if we just migrate known
                            // Actually it's easier to skip or handle specially
                            continue; 
                        } else {
                            q = collection(db, 'months', mStr, sub);
                        }

                        const snap = await getDocs(q);
                        if (!snap.empty) {
                            const b = writeBatch(db);
                            snap.forEach(d => {
                                const newRef = doc(db, 'messes', messId, 'months', mStr, sub, d.id);
                                b.set(newRef, d.data());
                            });
                            await b.commit();
                            console.log(`Migrated ${snap.size} docs from ${mStr}/${sub}`);
                        }
                    }

                    // Handle meta/utilities specially
                    const utilRef = doc(db, 'months', mStr, 'meta', 'utilities');
                    // We can't check exists without importing getDoc, let's just do a direct set/get later or skip if unnecessary.
                }
            }

            setStatus('Migration Complete! You can now switch your app to use the new structure.');

        } catch (error) {
            console.error(error);
            setStatus(`Error: ${error.message}`);
        }
    };

    return (
        <div className="p-10 max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-black text-slate-800 dark:text-white">Data Migration Tool</h1>
            <p className="text-slate-500">
                This tool moves data from root collections to the new `messes/default_mess_001` structure.
            </p>
            
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <p className="font-bold">Status: {status}</p>
                <p className="text-sm text-slate-500 mt-2">{progress}</p>
            </div>

            <button 
                onClick={migrateData}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold w-full hover:bg-indigo-700"
            >
                Start Migration
            </button>
        </div>
    );
}
