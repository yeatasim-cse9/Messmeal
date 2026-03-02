import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Bangla Unicode font — we'll use a base64-encoded Noto Sans Bengali
// For now, use default font with transliteration approach
// Future: embed a proper Bangla font

const englishToBangla = (str) => {
    if (str === null || str === undefined) return '';
    const banglaDigits = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return str.toString().replace(/[0-9]/g, match => banglaDigits[match]);
};

const formatNum = (n, decimals = false) => {
    const num = Number(n || 0);
    return decimals ? num.toFixed(2) : (num % 1 === 0 ? num.toString() : num.toFixed(2));
};

export function generateMonthlyReport({ monthLabel, memberStats, mealRate, totalMessFoodCost, totalDeposit, managerCashInHand, totalBakiExpense, totalUtilityCost, utilityPerMember, expenses, deposits, members }) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`Mess Hisab - ${monthLabel}`, pageWidth / 2, 18, { align: 'center' });

    // Summary Stats
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryData = [
        `Meal Rate: ${formatNum(mealRate, true)} Tk/meal`,
        `Total Food Cost: ${formatNum(totalMessFoodCost)} Tk`,
        `Total Deposit: ${formatNum(totalDeposit)} Tk`,
        `Cash in Hand: ${formatNum(managerCashInHand)} Tk`,
        `Baki (Due): ${formatNum(totalBakiExpense)} Tk`,
        `Utility/Member: ${formatNum(utilityPerMember)} Tk`,
    ];
    doc.text(summaryData.join('   |   '), pageWidth / 2, 26, { align: 'center' });

    // Member Summary Table
    const tableHead = [['Name', 'Total Meals', 'Food Cost', 'Utility', 'Total Deposit', 'Balance']];
    const tableBody = memberStats.map(s => [
        s.name,
        formatNum(s.totalMeals),
        `${formatNum(s.foodCost)} Tk`,
        `${formatNum(s.utilityCost)} Tk`,
        `${formatNum(s.totalContribution)} Tk`,
        `${s.balance >= 0 ? '+' : ''}${formatNum(s.balance)} Tk`
    ]);

    autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: 32,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        columnStyles: {
            0: { fontStyle: 'bold' },
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right', fontStyle: 'bold' },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
        didParseCell: function (data) {
            if (data.section === 'body' && data.column.index === 5) {
                const val = parseFloat(data.cell.raw);
                if (val < 0) {
                    data.cell.styles.textColor = [239, 68, 68];
                }
            }
        }
    });

    // Expense List (Page 2)
    if (expenses && expenses.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Expense Details', 14, 18);

        const expHead = [['Date', 'Description', 'Amount', 'Type', 'By']];
        const expBody = expenses.map(ex => {
            const isBaki = ex.type === 'baki';
            const isAdditional = ex.type === 'additional';
            const member = members?.find(m => m.id === ex.memberId);

            let byLabel = member?.name || '?';
            if (isBaki) byLabel = 'Shop';
            if (isAdditional) byLabel = 'Shared';

            let sourceLabel = 'Fund';
            if (isBaki) sourceLabel = 'Baki';
            else if (isAdditional) sourceLabel = 'Shared';
            else if (ex.fundSource === 'own') sourceLabel = 'Own Money';

            return [
                ex.date || '',
                ex.description || '',
                `${formatNum(ex.amount)} Tk`,
                sourceLabel,
                byLabel
            ];
        });

        autoTable(doc, {
            head: expHead,
            body: expBody,
            startY: 24,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 8.5 },
            columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 14, right: 14 },
        });
    }

    // Deposit List (same page or new)
    if (deposits && deposits.length > 0) {
        const currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 14 : 24;
        if (currentY > pageHeight - 40) doc.addPage();

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Deposit Details', 14, doc.lastAutoTable ? doc.lastAutoTable.finalY + 14 : 18);

        const depHead = [['Date', 'Member', 'Amount']];
        const depBody = deposits.map(dep => {
            const member = members?.find(m => m.id === dep.memberId);
            return [dep.date || '', member?.name || '?', `${formatNum(dep.amount)} Tk`];
        });

        autoTable(doc, {
            head: depHead,
            body: depBody,
            startY: (doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 24),
            theme: 'grid',
            headStyles: { fillColor: [26, 58, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 8.5 },
            columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 14, right: 14 },
        });
    }

    // Footer on all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150);
        doc.text(`Mess Hisab | Generated: ${new Date().toLocaleDateString()}`, 14, pageHeight - 8);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
    }

    // Save
    doc.save(`mess-report-${monthLabel.replace(/\s+/g, '-')}.pdf`);
}
