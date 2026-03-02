import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, X } from 'lucide-react';

const DialogContext = createContext(null);

export function useDialog() {
    return useContext(DialogContext);
}

export function DialogProvider({ children }) {
    const [dialog, setDialog] = useState(null);

    const closeDialog = () => {
        if (dialog?.resolve) {
            if (dialog.type === 'prompt') dialog.resolve(null);
            else dialog.resolve(false);
        }
        setDialog(null);
    };

    const confirmAction = (value = true) => {
        if (dialog?.resolve) dialog.resolve(value);
        setDialog(null);
    };

    const showAlert = useCallback((message, title = 'অ্যালার্ট') => {
        return new Promise((resolve) => {
            setDialog({ type: 'alert', message, title, resolve });
        });
    }, []);

    const showConfirm = useCallback((message, title = 'নিশ্চিতকরণ') => {
        return new Promise((resolve) => {
            setDialog({ type: 'confirm', message, title, resolve });
        });
    }, []);

    const showPrompt = useCallback((message, defaultValue = '', title = 'ইনপুট দিন') => {
        return new Promise((resolve) => {
            setDialog({ type: 'prompt', message, defaultValue, title, resolve });
        });
    }, []);

    return (
        <DialogContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
            {children}
            {dialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="p-6 sm:p-8">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {dialog.type === 'alert' && <AlertCircle className="text-rose-500" size={28} />}
                                    {dialog.type === 'confirm' && <HelpCircle className="text-blue-500" size={28} />}
                                    {dialog.type === 'prompt' && <CheckCircle2 className="text-emerald-500" size={28} />}
                                    <h3 className="text-xl font-bold text-slate-900">{dialog.title}</h3>
                                </div>
                                <button onClick={closeDialog} className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 bg-slate-50 hover:bg-slate-100 rounded-full">
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="text-slate-600 font-medium text-[15px] mb-6 whitespace-pre-wrap leading-relaxed">
                                {dialog.message}
                            </p>

                            {dialog.type === 'prompt' && (
                                <input
                                    type="text"
                                    id="prompt-input"
                                    defaultValue={dialog.defaultValue}
                                    className="w-full px-5 py-3.5 mb-6 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-bold text-slate-800 outline-none"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') confirmAction(e.target.value);
                                        if (e.key === 'Escape') closeDialog();
                                    }}
                                />
                            )}

                            <div className="flex items-center gap-3 justify-end mt-2">
                                {dialog.type !== 'alert' && (
                                    <button
                                        onClick={closeDialog}
                                        className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
                                    >
                                        বাতিল
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (dialog.type === 'prompt') {
                                            const val = document.getElementById('prompt-input').value;
                                            confirmAction(val);
                                        } else {
                                            confirmAction(true);
                                        }
                                    }}
                                    className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all ${dialog.type === 'alert' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' :
                                            dialog.type === 'prompt' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' :
                                                'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                                        }`}
                                >
                                    {dialog.type === 'alert' ? 'ঠিক আছে' : 'নিশ্চিত'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DialogContext.Provider>
    );
}
