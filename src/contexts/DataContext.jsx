import React, { createContext, useContext, useState, useMemo } from 'react';
import {
    useMembers, useMeals, useExpenses, useDeposits, useUtilities, useSettings, getCurrentMonth
} from '../hooks/useFirestore';

const DataContext = createContext(null);

const getTodayString = () => new Date().toISOString().split('T')[0];
const getDaysInMonth = (monthStr) => {
    if (!monthStr) return 30;
    const [year, month] = monthStr.split('-');
    return new Date(year, month, 0).getDate();
};

export function DataProvider({ children }) {
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
    const [selectedDate, setSelectedDate] = useState(getTodayString());

    // Firestore hooks
    const { members, loading: membersLoading, addMember, removeMember } = useMembers(selectedMonth);
    const { meals, loading: mealsLoading, setMealValue } = useMeals(selectedMonth);
    const { expenses, loading: expensesLoading, addExpense, removeExpense } = useExpenses(selectedMonth);
    const { deposits, loading: depositsLoading, addDeposit, removeDeposit } = useDeposits(selectedMonth);
    const { utilities, loading: utilitiesLoading, setUtility } = useUtilities(selectedMonth);
    const { settings, loading: settingsLoading, updateSettings } = useSettings();

    const mealCategories = settings?.mealCategories || [];
    const billCategories = settings?.billCategories || [];

    // Derived Data Calculations
    const calculations = useMemo(() => {
        let totalMeals = 0;
        const mealsByMember = {};
        const memberFoodCost = {};
        const daysInCurrentMonth = getDaysInMonth(selectedMonth);

        // Calculate total meals and meals per member
        Object.values(meals).forEach(dayRecord => {
            Object.entries(dayRecord).forEach(([memberId, vals]) => {
                const dMeals = mealCategories.reduce((sum, cat) => sum + (Number(vals[cat.id]) || 0), 0);
                totalMeals += dMeals;
                if (!mealsByMember[memberId]) mealsByMember[memberId] = 0;
                mealsByMember[memberId] += dMeals;
            });
        });

        // Extract utility values safely
        const extraUtilities = Object.entries(utilities)
            .filter(([key]) => !key.startsWith('bazaar_'))
            .reduce((sum, [_, val]) => sum + (Number(val) || 0), 0);

        const totalAdditionalExpense = expenses
            .filter(e => e.type === 'additional')
            .reduce((sum, e) => sum + Number(e.amount), 0);

        const totalUtilityCost = extraUtilities + totalAdditionalExpense;

        const totalMessFoodCost = expenses
            .filter(e => e.type === 'regular')
            .reduce((sum, e) => sum + Number(e.amount), 0);

        const totalBakiExpense = expenses
            .filter(e => e.type === 'baki')
            .reduce((sum, e) => sum + Number(e.amount), 0);

        const totalDeposit = deposits.reduce((sum, e) => sum + Number(e.amount), 0);
        const mealRate = totalMeals > 0 ? (totalMessFoodCost + totalBakiExpense) / totalMeals : 0;
        const memberCount = members.length;
        const utilityPerMember = memberCount > 0 ? totalUtilityCost / memberCount : 0;

        // Subtract all non-baki expenses (regular + additional) from total deposit
        const allNonBakiExpenses = expenses
            .filter(e => e.type !== 'baki')
            .reduce((sum, e) => sum + Number(e.amount), 0);
        const managerCashInHand = totalDeposit - allNonBakiExpenses;

        const stats = members.map(m => {
            const mMeals = mealsByMember[m.id] || 0;
            const mCost = mMeals * mealRate;

            const mDeposit = deposits
                .filter(d => d.memberId === m.id)
                .reduce((sum, d) => sum + Number(d.amount), 0);

            const mOwnExpense = expenses
                .filter(e => e.memberId === m.id && e.fundSource === 'own' && e.type !== 'baki')
                .reduce((sum, e) => sum + Number(e.amount), 0);

            const mTotalContribution = mDeposit + mOwnExpense;
            const balance = mTotalContribution - (mCost + utilityPerMember);

            return {
                id: m.id,
                name: m.name,
                totalMeals: mMeals,
                foodCost: mCost,
                utilityCost: utilityPerMember,
                totalContribution: mTotalContribution,
                balance: balance
            };
        });

        return {
            totalMeals,
            totalMessFoodCost,
            totalBakiExpense,
            totalDeposit,
            mealRate,
            managerCashInHand,
            totalUtilityCost: extraUtilities,
            utilityPerMember,
            memberStats: stats,
            daysInCurrentMonth
        };
    }, [meals, expenses, deposits, members, utilities, mealCategories, selectedMonth]);

    const loading = membersLoading || mealsLoading || expensesLoading || depositsLoading || utilitiesLoading || settingsLoading;

    const value = {
        selectedMonth,
        setSelectedMonth,
        selectedDate,
        setSelectedDate,
        members,
        addMember,
        removeMember,
        meals,
        setMealValue,
        expenses,
        addExpense,
        removeExpense,
        deposits,
        addDeposit,
        removeDeposit,
        utilities,
        setUtility,
        settings,
        updateSettings,
        mealCategories,
        billCategories,
        ...calculations,
        loading
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}
