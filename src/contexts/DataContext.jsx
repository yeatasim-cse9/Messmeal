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
    const { members, loading: membersLoading, addMember, removeMember, updateMember } = useMembers(selectedMonth);
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
        // Split utilities into fixed and advance based on bill category type
        const fixedUtilities = Object.entries(utilities)
            .filter(([key]) => !key.startsWith('bazaar_') && !key.endsWith('_paid'))
            .filter(([key]) => {
                const cat = billCategories.find(c => c.id === key);
                return !cat || cat.billType !== 'advance'; // default to fixed
            })
            .reduce((sum, [_, val]) => sum + (Number(val) || 0), 0);

        const advanceUtilities = Object.entries(utilities)
            .filter(([key]) => !key.startsWith('bazaar_') && !key.endsWith('_paid'))
            .filter(([key]) => {
                const cat = billCategories.find(c => c.id === key);
                return cat && cat.billType === 'advance';
            })
            .reduce((sum, [_, val]) => sum + (Number(val) || 0), 0);

        const extraUtilities = fixedUtilities + advanceUtilities;

        // Calculate total of utilities paid from the mess fund
        const paidFromFundUtilities = Object.entries(utilities)
            .filter(([key]) => key.endsWith('_paid') && utilities[key] === true)
            .reduce((sum, [key]) => {
                const billKey = key.replace('_paid', '');
                return sum + (Number(utilities[billKey]) || 0);
            }, 0);

        const totalAdditionalExpense = expenses
            .filter(e => e.type === 'additional')
            .reduce((sum, e) => sum + Number(e.amount), 0);

        const totalUtilityCost = extraUtilities + totalAdditionalExpense;
        const additionalExpensePerMember = members.length > 0 ? totalAdditionalExpense / members.length : 0;

        const totalMessFoodCost = expenses
            .filter(e => e.type === 'regular')
            .reduce((sum, e) => sum + Number(e.amount), 0);

        const totalBakiExpense = expenses
            .filter(e => e.type === 'baki')
            .reduce((sum, e) => sum + Number(e.amount), 0);

        const totalDeposit = deposits.reduce((sum, e) => sum + Number(e.amount), 0);
        const totalHouseRent = members.reduce((sum, m) => sum + (Number(m.houseRent) || 0), 0);
        const mealRate = totalMeals > 0 ? (totalMessFoodCost + totalBakiExpense) / totalMeals : 0;
        const memberCount = members.length;

        // Billable = non-exempt members (will pay advance bills)
        const billableMembers = members.filter(m => !m.billExempt);
        const billableMemberCount = billableMembers.length;

        // Fixed bills → all members; Advance bills → only billable members
        const fixedUtilityPerMember = memberCount > 0 ? fixedUtilities / memberCount : 0;
        const advanceUtilityPerBillable = billableMemberCount > 0 ? advanceUtilities / billableMemberCount : 0;
        const utilityPerMember = memberCount > 0 ? totalUtilityCost / memberCount : 0;

        // Exempt members' house rent redistributed to billable members
        const exemptRent = members
            .filter(m => m.billExempt)
            .reduce((sum, m) => sum + (Number(m.houseRent) || 0), 0);
        const extraRentPerBillable = billableMemberCount > 0 ? exemptRent / billableMemberCount : 0;

        // Subtract all non-baki expenses that were paid from the mess fund
        const messFundExpenses = expenses
            .filter(e => e.type !== 'baki' && e.fundSource !== 'own')
            .reduce((sum, e) => sum + Number(e.amount), 0);
        const managerCashInHand = totalDeposit - messFundExpenses - paidFromFundUtilities;

        const stats = members.map(m => {
            const mMeals = mealsByMember[m.id] || 0;
            const mCost = mMeals * mealRate;

            // Exempt members pay 0 for advance bills and house rent
            const mHouseRent = m.billExempt ? 0 : (Number(m.houseRent) || 0) + extraRentPerBillable;
            const mUtilityCost = m.billExempt
                ? fixedUtilityPerMember + additionalExpensePerMember
                : fixedUtilityPerMember + advanceUtilityPerBillable + additionalExpensePerMember;

            const mDeposit = deposits
                .filter(d => d.memberId === m.id)
                .reduce((sum, d) => sum + Number(d.amount), 0);

            const mOwnExpense = expenses
                .filter(e => e.memberId === m.id && e.fundSource === 'own' && e.type !== 'baki')
                .reduce((sum, e) => sum + Number(e.amount), 0);

            const mTotalContribution = mDeposit + mOwnExpense;
            const balance = mTotalContribution - (mCost + mUtilityCost + mHouseRent);

            return {
                id: m.id,
                name: m.name,
                billExempt: m.billExempt || false,
                totalMeals: mMeals,
                foodCost: mCost,
                utilityCost: mUtilityCost,
                additionalExpense: additionalExpensePerMember,
                houseRent: mHouseRent,
                totalContribution: mTotalContribution,
                deposit: mDeposit,
                ownExpense: mOwnExpense,
                balance: balance
            };

        });

        return {
            totalMeals,
            totalMessFoodCost,
            totalBakiExpense,
            totalDeposit,
            totalHouseRent,
            mealRate,
            managerCashInHand,
            totalUtilityCost: extraUtilities,
            paidFromFundUtilities,
            totalAdditionalExpense,
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
        updateMember,
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
