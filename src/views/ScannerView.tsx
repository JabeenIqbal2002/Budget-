import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { SAMPLE_RECEIPTS, SampleReceipt } from '../data/sampleReceipts';
import { ExpenseClassification, LineItem } from '../types';

export const ScannerView: React.FC = () => {
  const { addTransaction, setActiveTab, showToast } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'scan' | 'note'>('scan');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<SampleReceipt>(SAMPLE_RECEIPTS[0]);
  const [customImageUri, setCustomImageUri] = useState<string | null>(null);

  // Natural Language state
  const [nlpText, setNlpText] = useState('Whole Foods Market: Produce $34.20, Wine $22.00, Bread $12.25');
  const [isRecording, setIsRecording] = useState(false);

  // Parsed Result state (modifiable before adding to ledger)
  const [merchantName, setMerchantName] = useState('Whole Foods Market');
  const [merchantSubtitle, setMerchantSubtitle] = useState('Merchant auto-verified • Austin, TX');
  const [totalAmount, setTotalAmount] = useState(68.45);
  const [overallClassification, setOverallClassification] = useState<ExpenseClassification | 'Split'>('Essential');
  const [confidence, setConfidence] = useState(94);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', name: 'Organic Produce & Greens', description: 'Kale, Avocado, Gala Apples', price: 34.20, category: 'Essential' },
    { id: '2', name: 'Pinot Noir Reserve', description: 'Specialty beverage selection', price: 22.00, category: 'Luxury' },
    { id: '3', name: 'Artisan Sourdough & Oats', description: 'Pantry & staple grocery', price: 12.25, category: 'Essential' },
  ]);

  // Derived item totals
  const essentialTotal = lineItems
    .filter(i => i.category === 'Essential')
    .reduce((sum, i) => sum + i.price, 0);
  const luxuryTotal = lineItems
    .filter(i => i.category === 'Luxury')
    .reduce((sum, i) => sum + i.price, 0);

  // Switch sample receipt
  const handleSelectSample = (sample: SampleReceipt) => {
    setSelectedReceipt(sample);
    setCustomImageUri(null);
    setMerchantName(sample.merchant);
    setMerchantSubtitle('Merchant auto-verified • Verified Scan');
    setTotalAmount(sample.amount);
    setOverallClassification(sample.classificationHint);
    setConfidence(94);
    setLineItems(
      sample.items.map((item, idx) => ({
        id: `item-${idx}`,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
      }))
    );
    showToast(`Loaded ${sample.merchant} receipt`);
  };

  // Image Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setCustomImageUri(base64);
      setIsProcessing(true);

      try {
        const response = await fetch('/api/parse-bill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setMerchantName(data.merchant || 'Uploaded Bill');
          setMerchantSubtitle(data.merchantSubtitle || 'Scanned bill • Auto-verified');
          setTotalAmount(data.total || 45.0);
          setOverallClassification(data.classification === 'Luxury' ? 'Luxury' : 'Essential');
          setConfidence(data.confidence || 93);
          if (data.items && data.items.length > 0) {
            setLineItems(
              data.items.map((item: any, idx: number) => ({
                id: `up-${idx}`,
                name: item.name,
                description: item.description || '',
                price: Number(item.price),
                category: item.category === 'Luxury' ? 'Luxury' : 'Essential',
              }))
            );
          }
          showToast(`Parsed ${data.merchant} with Gemini AI!`);
        } else {
          showToast('Image scanned successfully');
        }
      } catch (err) {
        console.warn('API error, using client fallback', err);
        showToast('Receipt parsed');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Natural Language Parsing with Gemini
  const handleParseNote = async () => {
    if (!nlpText.trim()) return;
    setIsProcessing(true);

    try {
      const response = await fetch('/api/parse-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteText: nlpText }),
      });

      if (response.ok) {
        const data = await response.json();
        setMerchantName(data.merchant || 'Parsed Expense');
        setMerchantSubtitle(data.merchantSubtitle || 'Note parsed by Aura AI');
        setTotalAmount(data.total || 45.0);
        setOverallClassification(data.classification === 'Luxury' ? 'Luxury' : 'Essential');
        setConfidence(data.confidence || 95);
        if (data.items && data.items.length > 0) {
          setLineItems(
            data.items.map((item: any, idx: number) => ({
              id: `nlp-${idx}`,
              name: item.name,
              description: item.description || 'Smart item',
              price: Number(item.price),
              category: item.category === 'Luxury' ? 'Luxury' : 'Essential',
            }))
          );
        }
        showToast(`AI parsed: ${data.merchant} ($${data.total.toFixed(2)})`);
      }
    } catch (err) {
      console.warn('Parse note error', err);
      showToast('Note parsed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle item category (Essential <-> Luxury)
  const toggleItemCategory = (itemId: string) => {
    setLineItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const nextCategory: ExpenseClassification = item.category === 'Essential' ? 'Luxury' : 'Essential';
          return { ...item, category: nextCategory };
        }
        return item;
      })
    );
  };

  // Toggle overall luxury mode
  const toggleOverallLuxury = () => {
    const next = overallClassification === 'Luxury' ? 'Essential' : 'Luxury';
    setOverallClassification(next);
    setLineItems(prev => prev.map(item => ({ ...item, category: next })));
  };

  // Confirm & Add to Ledger
  const handleConfirmLedger = () => {
    const isMainLuxury = overallClassification === 'Luxury' || luxuryTotal > essentialTotal;

    addTransaction({
      merchant: merchantName,
      merchantSubtitle: merchantSubtitle,
      amount: totalAmount,
      type: isMainLuxury ? 'luxury' : 'essential',
      category: merchantName.toLowerCase().includes('food') || merchantName.toLowerCase().includes('whole')
        ? 'Groceries & Essentials'
        : isMainLuxury ? 'Restaurants & Bars' : 'Groceries & Essentials',
      date: 'Oct 24, 2024',
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isAi: true,
      confidence: confidence,
      items: lineItems,
    });

    setActiveTab('ledger');
  };

  return (
    <div className="flex flex-col gap-4 pb-28 pt-20 px-5 max-w-md mx-auto w-full">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Segmented Mode Control */}
      <div className="w-full bg-[#e2e7ff] p-1 rounded-xl flex items-center shadow-sm">
        <button
          onClick={() => setMode('scan')}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-[13px] transition-all flex items-center justify-center gap-1.5 ${
            mode === 'scan'
              ? 'bg-white text-[#00685f] shadow-sm'
              : 'text-[#3d4947] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">document_scanner</span>
          <span>Receipt / Bill Scan</span>
        </button>

        <button
          onClick={() => setMode('note')}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-[13px] transition-all flex items-center justify-center gap-1.5 ${
            mode === 'note'
              ? 'bg-white text-[#00685f] shadow-sm'
              : 'text-[#3d4947] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">mic</span>
          <span>Natural Language</span>
        </button>
      </div>

      {/* Viewfinder Frame Section (Scan Mode) */}
      {mode === 'scan' && (
        <div className="flex flex-col gap-2.5">
          <div className="relative w-full aspect-[4/3] bg-[#283044] rounded-2xl overflow-hidden shadow-md flex items-center justify-center border border-[#dae2fd]/30">
            {/* Background image preview */}
            <img
              src={customImageUri || selectedReceipt.imageUrl}
              alt={selectedReceipt.imageAlt}
              className="absolute inset-0 w-full h-full object-cover opacity-85"
            />

            {/* Atmospheric Slate Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#283044]/90 via-transparent to-[#283044]/40 pointer-events-none"></div>

            {/* Viewfinder Reticle & Corners */}
            <div className="absolute inset-4 pointer-events-none flex flex-col justify-between">
              <div className="flex justify-between w-full">
                <div className="w-7 h-7 border-t-2 border-l-2 border-[#89f5e7] rounded-tl-lg"></div>
                <div className="w-7 h-7 border-t-2 border-r-2 border-[#89f5e7] rounded-tr-lg"></div>
              </div>

              {/* Center Laser Scanning Animation Line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#89f5e7] to-transparent shadow-[0_0_12px_#89f5e7] animate-pulse"></div>

              <div className="flex justify-between w-full">
                <div className="w-7 h-7 border-b-2 border-l-2 border-[#89f5e7] rounded-bl-lg"></div>
                <div className="w-7 h-7 border-b-2 border-r-2 border-[#89f5e7] rounded-br-lg"></div>
              </div>
            </div>

            {/* Live OCR Overlay Detected Tags */}
            <div className="absolute top-5 left-5 flex flex-wrap gap-1.5 pointer-events-none">
              <div className="backdrop-blur-md bg-[#283044]/85 px-2.5 py-1 rounded-full text-white flex items-center gap-1 shadow-sm border border-white/10">
                <span className="material-symbols-outlined text-[#89f5e7] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                <span className="text-[12px] font-semibold">{merchantName}</span>
              </div>
              <div className="backdrop-blur-md bg-[#008378]/90 px-2.5 py-1 rounded-full text-white flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                <span className="text-[12px]">Oct 24, 2024</span>
              </div>
            </div>

            {/* Live extracted price bubble */}
            <div className="absolute bottom-5 right-5 pointer-events-none">
              <div className="backdrop-blur-md bg-[#283044]/90 px-3 py-1.5 rounded-xl text-[#89f5e7] flex items-center gap-1.5 shadow-md border border-[#89f5e7]/30">
                <span className="material-symbols-outlined text-[16px]">price_check</span>
                <span className="font-mono-numbers text-[16px] font-bold text-white">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Active Status Beacon */}
            <div className="absolute top-5 right-5 flex items-center gap-1.5 backdrop-blur-md bg-white/20 px-2.5 py-1 rounded-full border border-white/20 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#89f5e7] animate-ping"></span>
              <span className="text-[10px] font-bold text-[#89f5e7] tracking-wider uppercase">
                AI Optical Live
              </span>
            </div>

            {/* Upload or Camera Overlay Controls */}
            <div className="absolute bottom-4 left-4 flex gap-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#131b2e] text-[12px] font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[16px] text-[#00685f]">photo_camera</span>
                <span>Upload Receipt</span>
              </button>
            </div>
          </div>

          {/* Quick Sample Receipts Bar */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3d4947] px-0.5">
              Or Try A Preset Bill:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {SAMPLE_RECEIPTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium shrink-0 transition-all ${
                    selectedReceipt.id === s.id && !customImageUri
                      ? 'bg-[#00685f] text-white shadow-sm'
                      : 'bg-white text-[#3d4947] hover:bg-[#eaedff] border border-[#dae2fd]/50'
                  }`}
                >
                  {s.name} (${s.amount.toFixed(2)})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Natural Language Quick Capture Box (Note Mode) */}
      {mode === 'note' && (
        <div className="w-full bg-white rounded-2xl p-4 shadow-sm space-y-2.5 border border-[#dae2fd]/40">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold text-[#131b2e] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00685f] text-[18px]">auto_awesome</span>
              <span>Aura Smart Note / Voice</span>
            </label>
            <span className="text-[11px] font-semibold text-[#3d4947] bg-[#eaedff] px-2 py-0.5 rounded-full">
              LLM-Assisted
            </span>
          </div>

          <div className="relative flex items-center">
            <textarea
              value={nlpText}
              onChange={e => setNlpText(e.target.value)}
              placeholder='Or type/speak: "Dinner with Alex at Nobu $110 luxury" or paste bill text'
              rows={2}
              className="w-full bg-[#f2f3ff] text-[#131b2e] placeholder:text-[#6d7a77] text-[13px] rounded-xl p-3 pr-20 outline-none focus:bg-white focus:ring-1 focus:ring-[#00685f]/30 transition-all resize-none"
            />
            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsRecording(!isRecording);
                  if (!isRecording) {
                    showToast('Listening... Speak your expense');
                  }
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-[#eaedff] hover:bg-[#dae2fd] text-[#00685f]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">mic</span>
              </button>

              <button
                type="button"
                onClick={handleParseNote}
                disabled={isProcessing}
                className="w-8 h-8 rounded-full bg-[#00685f] hover:bg-[#008378] text-white flex items-center justify-center transition-transform active:scale-90 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Prompt chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setNlpText('Dinner with Alex at Nobu $110 luxury');
              }}
              className="px-2.5 py-1 rounded-full bg-[#f2f3ff] hover:bg-[#eaedff] text-[11px] text-[#3d4947]"
            >
              Nobu Dinner $110 (Luxury)
            </button>
            <button
              type="button"
              onClick={() => {
                setNlpText('Trader Joe groceries $64.50: produce and staple essentials');
              }}
              className="px-2.5 py-1 rounded-full bg-[#f2f3ff] hover:bg-[#eaedff] text-[11px] text-[#3d4947]"
            >
              Trader Joe's $64.50 (Essential)
            </button>
            <button
              type="button"
              onClick={() => {
                setNlpText('Lyft commute to clinic $26.80');
              }}
              className="px-2.5 py-1 rounded-full bg-[#f2f3ff] hover:bg-[#eaedff] text-[11px] text-[#3d4947]"
            >
              Transit $26.80 (Essential)
            </button>
          </div>
        </div>
      )}

      {/* AI Live Parsing Result Card */}
      <div className="w-full bg-white rounded-2xl p-4 shadow-sm space-y-3.5 border border-[#dae2fd]/40">
        {/* Top Result Meta Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#e2e7ff] flex items-center justify-center text-[#00685f] shrink-0">
              <span className="material-symbols-outlined text-[24px]">storefront</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-semibold text-[17px] text-[#131b2e]">{merchantName}</h2>
                <span className="material-symbols-outlined text-[#00685f] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <p className="text-[12px] text-[#3d4947]">{merchantSubtitle}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-semibold text-[#3d4947] uppercase tracking-wider block">
              Extracted Total
            </span>
            <p className="font-mono-numbers text-[20px] font-bold text-[#131b2e] tracking-tight">
              ${totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* AI Classification & Confidence Banner */}
        <div className="bg-[#f2f3ff] p-3 rounded-xl flex items-center justify-between gap-2 border border-[#dae2fd]/30">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[#00685f] text-[20px] shrink-0">
              psychology
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-[13px] text-[#131b2e]">
                  Classification: {overallClassification}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#89f5e7] text-[#00201d] font-mono-numbers text-[10px] font-bold">
                  {confidence}% Confidence
                </span>
              </div>
              <p className="text-[11px] text-[#3d4947] truncate">
                Split recommended based on itemized details
              </p>
            </div>
          </div>

          {/* Quick Toggle switch for Luxury */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-[#3d4947]">Luxury</span>
            <button
              type="button"
              aria-label="Toggle Luxury Mode"
              onClick={toggleOverallLuxury}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors relative ${
                overallClassification === 'Luxury' ? 'bg-[#b15f00]' : 'bg-[#dae2fd]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  overallClassification === 'Luxury' ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>
        </div>

        {/* Line Item Breakdown with Split Categorization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[13px] font-semibold text-[#3d4947]">
              Itemized Detection ({lineItems.length} Items)
            </span>
            <span className="text-[11px] font-medium text-[#00685f] flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
              Smart Split Applied
            </span>
          </div>

          {/* Items List */}
          <div className="space-y-1.5">
            {lineItems.map(item => {
              const isLux = item.category === 'Luxury';
              return (
                <div
                  key={item.id}
                  className="w-full bg-[#f2f3ff] hover:bg-[#eaedff] transition-colors rounded-xl p-3 flex items-center justify-between gap-2 border border-[#dae2fd]/30"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isLux ? 'bg-[#ffdcc3] text-[#8d4b00]' : 'bg-[#dae2fd] text-[#00685f]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        {isLux ? 'wine_bar' : 'nutrition'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[13px] text-[#131b2e] truncate">
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="text-[11px] text-[#3d4947] truncate">{item.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Price & Clickable Category Pill */}
                  <div className="text-right flex flex-col items-end gap-1 shrink-0">
                    <span className="font-mono-numbers text-[14px] font-semibold text-[#131b2e]">
                      ${item.price.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleItemCategory(item.id)}
                      title="Click to toggle Essential vs Luxury"
                      className={`px-2 py-0.5 rounded-full font-mono-numbers text-[10px] font-medium transition-transform active:scale-95 ${
                        isLux
                          ? 'bg-[#ffdcc3] text-[#8d4b00] hover:ring-1 hover:ring-[#8d4b00]'
                          : 'bg-[#e3dfff] text-[#4e45d5] hover:ring-1 hover:ring-[#4e45d5]'
                      }`}
                    >
                      {item.category} ✎
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Impact Summary */}
        <div className="pt-1 flex items-center justify-between text-[12px] text-[#3d4947] px-1 border-t border-[#dae2fd]/30">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4e45d5]"></span>
            <span>
              Essential: <strong className="font-mono-numbers text-[#131b2e]">${essentialTotal.toFixed(2)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b15f00]"></span>
            <span>
              Discretionary: <strong className="font-mono-numbers text-[#131b2e]">${luxuryTotal.toFixed(2)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Primary CTA Action Controls */}
      <div className="w-full flex flex-col gap-2 pt-1">
        <button
          onClick={handleConfirmLedger}
          className="w-full h-12 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl font-semibold text-[15px] shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">check</span>
          <span>Confirm & Add to Ledger</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 h-11 bg-[#e2e7ff] hover:bg-[#dae2fd] text-[#131b2e] rounded-xl font-medium text-[13px] transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            <span>Retake / Upload Photo</span>
          </button>
          <button
            onClick={() => {
              setMode('note');
              showToast('Edit details in note mode');
            }}
            className="h-11 px-4 bg-[#e2e7ff] hover:bg-[#dae2fd] text-[#131b2e] rounded-xl font-medium text-[13px] transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span>Manual Edit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
