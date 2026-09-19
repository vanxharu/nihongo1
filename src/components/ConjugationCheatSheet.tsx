import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, X } from 'lucide-react';

interface ConjugationCheatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConjugationCheatSheet({ isOpen, onClose }: ConjugationCheatSheetProps) {
  const [cheatSheetActiveTab, setCheatSheetActiveTab] = useState<'v1' | 'v2' | 'v3' | 'adj'>('v1');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#020617]/90 flex items-center justify-center p-4 backdrop-blur-xs select-none"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="bg-[#0B0F19] border border-[#1F2937] rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
          >
            {/* Header inside modal */}
            <div className="p-5 border-b border-[#1F2937] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase block">SỔ TAY NGỮ PHÁP NHANH</span>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" /> Bảng Chia Thể Động Từ & Tính Từ
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs controller in Modal */}
            <div className="bg-[#111827] px-5 py-2.5 flex flex-wrap gap-2 border-b border-[#1F2937]">
              <button
                onClick={() => setCheatSheetActiveTab('v1')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  cheatSheetActiveTab === 'v1' 
                    ? 'bg-sky-500 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Động từ Nhóm I (五段)
              </button>
              <button
                onClick={() => setCheatSheetActiveTab('v2')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  cheatSheetActiveTab === 'v2' 
                    ? 'bg-sky-500 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Động từ Nhóm II (一段)
              </button>
              <button
                onClick={() => setCheatSheetActiveTab('v3')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  cheatSheetActiveTab === 'v3' 
                    ? 'bg-sky-500 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Động từ Nhóm III (不規則)
              </button>
              <button
                onClick={() => setCheatSheetActiveTab('adj')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  cheatSheetActiveTab === 'adj' 
                    ? 'bg-sky-500 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Bảng chia Tính từ
              </button>
            </div>

            {/* Scrollable table grid content */}
            <div className="p-6 overflow-y-auto max-h-[55vh] text-xs">
              {cheatSheetActiveTab === 'v1' && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-xs italic">
                    Động từ nhóm 1 là các động từ tận cùng bằng cột <strong>u</strong>. Khi chia, âm cuối đổi theo hàng chữ tương ứng.
                  </p>
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full border-collapse text-left text-slate-300 sm:min-w-[500px]">
                      <thead>
                        <tr className="border-b border-[#1F2937] text-slate-400 font-bold">
                          <th className="py-2.5 pr-4">Từ gốc (Từ điển)</th>
                          <th className="py-2.5 pr-4">Thể ます (Lịch sự)</th>
                          <th className="py-2.5 pr-4">Thể て (Hành động)</th>
                          <th className="py-2.5 pr-4">Thể ない (Phủ định)</th>
                          <th className="py-2.5 pr-4">Thể khả năng (Có thể)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1F2937]/50 font-sans font-semibold">
                        <tr>
                          <td className="py-3 font-black text-white">買う (kau - Mua)</td>
                          <td className="py-3 text-sky-400">買います</td>
                          <td className="py-3 text-emerald-400">買って</td>
                          <td className="py-3 text-rose-400">買わない</td>
                          <td className="py-3 text-amber-400">買える</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-black text-white">書く (kaku - Viết)</td>
                          <td className="py-3 text-sky-400">書きます</td>
                          <td className="py-3 text-emerald-400">書いて</td>
                          <td className="py-3 text-rose-400">書かない</td>
                          <td className="py-3 text-amber-400">書ける</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-black text-white">話す (hanasu - Nói)</td>
                          <td className="py-3 text-sky-400">話します</td>
                          <td className="py-3 text-emerald-400">話して</td>
                          <td className="py-3 text-rose-400">話さない</td>
                          <td className="py-3 text-amber-400">話せる</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-black text-white">死ぬ (shinu - Chết)</td>
                          <td className="py-3 text-sky-400">死iにます</td>
                          <td className="py-3 text-emerald-400">死iんで</td>
                          <td className="py-3 text-rose-400">死iなない</td>
                          <td className="py-3 text-amber-400">死iねる</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {cheatSheetActiveTab === 'v2' && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-xs italic">
                    Động từ nhóm 2 có tận cùng hàng <strong>i</strong> hoặc hàng <strong>e</strong> trước đuôi <strong>る</strong>. Chia đơn giản bằng cách bỏ <strong>る</strong>.
                  </p>
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full border-collapse text-left text-slate-300 sm:min-w-[500px]">
                      <thead>
                        <tr className="border-b border-[#1F2937] text-slate-400 font-bold">
                          <th className="py-2.5 pr-4">Từ gốc (Từ điển)</th>
                          <th className="py-2.5 pr-4">Thể ます (Lịch sự)</th>
                          <th className="py-2.5 pr-4">Thể て (Hành động)</th>
                          <th className="py-2.5 pr-4">Thể ない (Phủ định)</th>
                          <th className="py-2.5 pr-4">Thể khả năng (Có thể)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1F2937]/50 font-sans font-semibold">
                        <tr>
                          <td className="py-3 font-black text-white">食べる (taberu - Ăn)</td>
                          <td className="py-3 text-sky-400">食べます</td>
                          <td className="py-3 text-emerald-400">食べて</td>
                          <td className="py-3 text-rose-400">食べない</td>
                          <td className="py-3 text-amber-400">食べられる</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-black text-white">見る (miru - Nhìn, Xem)</td>
                          <td className="py-3 text-sky-400">見ます</td>
                          <td className="py-3 text-emerald-400">見て</td>
                          <td className="py-3 text-rose-400">見ない</td>
                          <td className="py-3 text-amber-400">見られる</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-black text-white">起きる (okiru - Thức dậy)</td>
                          <td className="py-3 text-sky-400">起きます</td>
                          <td className="py-3 text-emerald-400">起きて</td>
                          <td className="py-3 text-rose-400">起きない</td>
                          <td className="py-3 text-amber-400">起きられる</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {cheatSheetActiveTab === 'v3' && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-xs italic">
                    Động từ bất quy tắc chỉ gồm hai động từ duy nhất dưới đây. Cần học thuộc lòng cấu trúc.
                  </p>
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full border-collapse text-left text-slate-300 sm:min-w-[500px]">
                      <thead>
                        <tr className="border-b border-[#1F2937] text-slate-400 font-bold">
                          <th className="py-2.5 pr-4">Từ gốc (Từ điển)</th>
                          <th className="py-2.5 pr-4">Thể ます (Lịch sự)</th>
                          <th className="py-2.5 pr-4">Thể て (Hành động)</th>
                          <th className="py-2.5 pr-4">Thể ない (Phủ định)</th>
                          <th className="py-2.5 pr-4">Thể khả năng (Có thể)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1F2937]/50 font-sans font-semibold">
                        <tr>
                          <td className="py-3 font-black text-white">する (suru - Làm)</td>
                          <td className="py-3 text-sky-400">します</td>
                          <td className="py-3 text-emerald-400">して</td>
                          <td className="py-3 text-rose-400">しない</td>
                          <td className="py-3 text-amber-400">できる</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-black text-white">来る (kuru - Đến)</td>
                          <td className="py-3 text-sky-400">来ます (kimasu)</td>
                          <td className="py-3 text-emerald-400">来て (kite)</td>
                          <td className="py-3 text-rose-400">来ない (konai)</td>
                          <td className="py-3 text-amber-400">来られる</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {cheatSheetActiveTab === 'adj' && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-xs italic">
                    Tính từ gồm đuôi <strong>い</strong> và đuôi <strong>な</strong>. Quy tắc chia thời/phủ định khác biệt.
                  </p>
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full border-collapse text-left text-slate-300 sm:min-w-[500px]">
                      <thead>
                        <tr className="border-b border-[#1F2937] text-slate-400 font-bold">
                          <th className="py-2.5 pr-4">Tính từ</th>
                          <th className="py-2.5 pr-4">Khẳng định hiện tại</th>
                          <th className="py-2.5 pr-4">Phủ định hiện tại</th>
                          <th className="py-2.5 pr-4">Khẳng định quá khứ</th>
                          <th className="py-2.5 pr-4">Phủ định quá khứ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1F2937]/50 font-sans font-semibold">
                        <tr>
                          <td className="py-3 font-black text-white">寒い (samui - Lạnh [I])</td>
                          <td className="py-3 text-sky-400">寒いです</td>
                          <td className="py-3 text-rose-400">寒くないです</td>
                          <td className="py-3 text-emerald-400">寒かったです</td>
                          <td className="py-3 text-amber-400">寒くなかったです</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-black text-white">簡単 (kantan - Dễ [Na])</td>
                          <td className="py-3 text-sky-400">簡単です</td>
                          <td className="py-3 text-rose-400">簡単mじゃありません</td>
                          <td className="py-3 text-emerald-400">簡単でした</td>
                          <td className="py-3 text-amber-400">簡単じゃありませんでした</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer button inside modal */}
            <div className="p-4 bg-[#111827] border-t border-[#1F2937] flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl cursor-pointer transition-colors text-xs"
              >
                Đóng tra cứu
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
