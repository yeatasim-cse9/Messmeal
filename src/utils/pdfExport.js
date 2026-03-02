import html2pdf from 'html2pdf.js';

const formatNum = (n, decimals = false) => {
    const num = Number(n || 0);
    return decimals ? num.toFixed(2) : (num % 1 === 0 ? num.toString() : num.toFixed(2));
};

const toBanglaNum = (str) => {
    if (str === null || str === undefined) return '';
    const d = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return str.toString().replace(/[0-9]/g, m => d[m]);
};

const fmt = (amount) => {
    if (!amount || isNaN(amount)) return '০ ৳';
    const num = Number(amount);
    const s = num % 1 === 0 ? num.toString() : num.toFixed(2);
    return `${toBanglaNum(s)} ৳`;
};

export function generateMonthlyReport({ monthLabel, memberStats, mealRate, totalMessFoodCost, totalDeposit, managerCashInHand, totalBakiExpense, totalUtilityCost, utilityPerMember, expenses, deposits, members }) {

    // Build member rows
    const memberRows = memberStats.map(s => `
        <tr>
            <td style="padding:10px 14px; font-weight:700; color:#0f172a;">${s.name}</td>
            <td style="padding:10px 14px; text-align:center;">${toBanglaNum(s.totalMeals)}</td>
            <td style="padding:10px 14px; text-align:right;">${fmt(s.foodCost)}</td>
            <td style="padding:10px 14px; text-align:right;">${fmt(s.utilityCost)}</td>
            <td style="padding:10px 14px; text-align:right;">${fmt(s.totalContribution)}</td>
            <td style="padding:10px 14px; text-align:right; font-weight:800; font-size:15px; color:${s.balance >= 0 ? '#0f172a' : '#ef4444'};">
                ${s.balance >= 0 ? '+ ' : '- '}${fmt(Math.abs(s.balance))}
            </td>
        </tr>
    `).join('');

    // Build expense rows
    const expenseRows = (expenses || []).map(ex => {
        const member = members?.find(m => m.id === ex.memberId);
        const isBaki = ex.type === 'baki';
        const isAdditional = ex.type === 'additional';
        let byLabel = member?.name || '?';
        if (isBaki) byLabel = 'দোকান';
        if (isAdditional) byLabel = 'সবার মাঝে ভাগ';
        return `
            <tr>
                <td style="padding:8px 12px;">${toBanglaNum(ex.date || '')}</td>
                <td style="padding:8px 12px;">${ex.description || ''}</td>
                <td style="padding:8px 12px; text-align:right; font-weight:700;">${fmt(ex.amount)}</td>
                <td style="padding:8px 12px;">${isBaki ? 'বাকি' : isAdditional ? 'অতিরিক্ত' : ex.fundSource === 'own' ? 'নিজের টাকা' : 'ফান্ড'}</td>
                <td style="padding:8px 12px;">${byLabel}</td>
            </tr>
        `;
    }).join('');

    // Build deposit rows
    const depositRows = (deposits || []).map(dep => {
        const member = members?.find(m => m.id === dep.memberId);
        return `
            <tr>
                <td style="padding:8px 12px;">${toBanglaNum(dep.date || '')}</td>
                <td style="padding:8px 12px; font-weight:600;">${member?.name || '?'}</td>
                <td style="padding:8px 12px; text-align:right; font-weight:700;">${fmt(dep.amount)}</td>
            </tr>
        `;
    }).join('');

    const html = `
    <div style="font-family: 'Noto Sans Bengali', 'Segoe UI', Tahoma, sans-serif; color:#1e293b; padding:20px;">
        <!-- Header -->
        <div style="text-align:center; margin-bottom:24px;">
            <h1 style="font-size:28px; font-weight:900; color:#0f172a; margin:0;">মেস হিসাব</h1>
            <p style="font-size:14px; color:#64748b; margin:6px 0 0;">${monthLabel}</p>
        </div>

        <!-- Summary Cards -->
        <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:28px; justify-content:center;">
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 18px; text-align:center; min-width:120px;">
                <div style="font-size:11px; color:#94a3b8; font-weight:600;">মিল রেট</div>
                <div style="font-size:18px; font-weight:800; color:#0f172a;">${fmt(mealRate)}</div>
            </div>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 18px; text-align:center; min-width:120px;">
                <div style="font-size:11px; color:#94a3b8; font-weight:600;">মোট খাবার খরচ</div>
                <div style="font-size:18px; font-weight:800; color:#0f172a;">${fmt(totalMessFoodCost)}</div>
            </div>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 18px; text-align:center; min-width:120px;">
                <div style="font-size:11px; color:#94a3b8; font-weight:600;">মোট জমা</div>
                <div style="font-size:18px; font-weight:800; color:#059669;">${fmt(totalDeposit)}</div>
            </div>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 18px; text-align:center; min-width:120px;">
                <div style="font-size:11px; color:#94a3b8; font-weight:600;">ক্যাশ ইন হ্যান্ড</div>
                <div style="font-size:18px; font-weight:800; color:#0f172a;">${fmt(managerCashInHand)}</div>
            </div>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 18px; text-align:center; min-width:120px;">
                <div style="font-size:11px; color:#94a3b8; font-weight:600;">বাকি</div>
                <div style="font-size:18px; font-weight:800; color:#ef4444;">${fmt(totalBakiExpense)}</div>
            </div>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 18px; text-align:center; min-width:120px;">
                <div style="font-size:11px; color:#94a3b8; font-weight:600;">মেম্বার প্রতি বিল</div>
                <div style="font-size:18px; font-weight:800; color:#0f172a;">${fmt(utilityPerMember)}</div>
            </div>
        </div>

        <!-- Member Summary Table -->
        <h2 style="font-size:18px; font-weight:800; color:#0f172a; margin-bottom:12px; border-bottom:2px solid #e2e8f0; padding-bottom:8px;">📊 ফাইনাল রিপোর্ট</h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom:32px; font-size:13px;">
            <thead>
                <tr style="background:#0f172a; color:white;">
                    <th style="padding:10px 14px; text-align:left; font-weight:700;">মেম্বারের নাম</th>
                    <th style="padding:10px 14px; text-align:center; font-weight:700;">মিল</th>
                    <th style="padding:10px 14px; text-align:right; font-weight:700;">খাবার খরচ</th>
                    <th style="padding:10px 14px; text-align:right; font-weight:700;">ফিক্সড বিল</th>
                    <th style="padding:10px 14px; text-align:right; font-weight:700;">মোট জমা</th>
                    <th style="padding:10px 14px; text-align:right; font-weight:700;">ব্যালেন্স</th>
                </tr>
            </thead>
            <tbody>
                ${memberRows}
            </tbody>
        </table>

        ${expenses && expenses.length > 0 ? `
        <!-- Expense Details -->
        <h2 style="font-size:18px; font-weight:800; color:#0f172a; margin-bottom:12px; border-bottom:2px solid #e2e8f0; padding-bottom:8px;">🛒 খরচের বিবরণ</h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom:32px; font-size:12px;">
            <thead>
                <tr style="background:#0f172a; color:white;">
                    <th style="padding:8px 12px; text-align:left;">তারিখ</th>
                    <th style="padding:8px 12px; text-align:left;">বিবরণ</th>
                    <th style="padding:8px 12px; text-align:right;">টাকা</th>
                    <th style="padding:8px 12px; text-align:left;">ধরন</th>
                    <th style="padding:8px 12px; text-align:left;">কে করেছে</th>
                </tr>
            </thead>
            <tbody>${expenseRows}</tbody>
        </table>
        ` : ''}

        ${deposits && deposits.length > 0 ? `
        <!-- Deposit Details -->
        <h2 style="font-size:18px; font-weight:800; color:#1a3a2a; margin-bottom:12px; border-bottom:2px solid #d1fae5; padding-bottom:8px;">💰 জমার বিবরণ</h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom:32px; font-size:12px;">
            <thead>
                <tr style="background:#1a3a2a; color:white;">
                    <th style="padding:8px 12px; text-align:left;">তারিখ</th>
                    <th style="padding:8px 12px; text-align:left;">মেম্বার</th>
                    <th style="padding:8px 12px; text-align:right;">টাকা</th>
                </tr>
            </thead>
            <tbody>${depositRows}</tbody>
        </table>
        ` : ''}

        <!-- Footer -->
        <div style="text-align:center; color:#94a3b8; font-size:10px; margin-top:20px; border-top:1px solid #e2e8f0; padding-top:10px;">
            মেস হিসাব | তৈরি: ${new Date().toLocaleDateString('bn-BD')} | ${monthLabel}
        </div>
    </div>
    `;
    const opt = {
        margin: [8, 8, 8, 8],
        filename: `mess-hisab-${monthLabel.replace(/[,\s]+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(html, 'string').save().catch((err) => {
        console.error('PDF generation failed:', err);
    });
}
