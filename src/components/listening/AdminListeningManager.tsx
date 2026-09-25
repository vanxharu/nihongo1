import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Search, 
  Youtube, 
  AlertTriangle, 
  ExternalLink, 
  Clock, 
  RefreshCw,
  Video
} from 'lucide-react';
import { YouTubeListeningVideo, JLPTLevel, YouTubeListeningCategory } from '../../types';
import { extractYouTubeVideoId } from '../../utils/youtubeUtils';
import { DEFAULT_YOUTUBE_LISTENING_VIDEOS } from '../../data/youtubeListeningSeedData';
import { AdminTimestampMappingModal } from './AdminTimestampMappingModal';

export const AdminListeningManager: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeListeningVideo[]>(DEFAULT_YOUTUBE_LISTENING_VIDEOS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingVideo, setEditingVideo] = useState<YouTubeListeningVideo | null>(null);
  const [mappingVideo, setMappingVideo] = useState<YouTubeListeningVideo | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCode, setFormCode] = useState<string>('');
  const [formUrl, setFormUrl] = useState<string>('');
  const [formVideoId, setFormVideoId] = useState<string>('');
  const [formLevel, setFormLevel] = useState<JLPTLevel>('N4');
  const [formCategory, setFormCategory] = useState<YouTubeListeningCategory>('Listening Practice');
  const [formSource, setFormSource] = useState<string>('');
  const [formSourceUrl, setFormSourceUrl] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formDuration, setFormDuration] = useState<string>('');
  const [formThumbnail, setFormThumbnail] = useState<string>('');
  const [formHasAnswers, setFormHasAnswers] = useState<boolean>(true);
  const [formStatus, setFormStatus] = useState<'active' | 'hidden'>('active');

  // URL parsing feedback
  const [urlWarning, setUrlWarning] = useState<string>('');
  const [isFetchingInfo, setIsFetchingInfo] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');

  // Fetch videos from server
  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/listening/videos');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.videos)) {
        setVideos(data.videos);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // When user inputs YouTube URL, automatically extract Video ID and check format
  const handleUrlChange = (val: string) => {
    setFormUrl(val);
    setUrlWarning('');

    const parsed = extractYouTubeVideoId(val);
    if (parsed.isValid && parsed.videoId) {
      setFormVideoId(parsed.videoId);
      if (!formThumbnail) {
        setFormThumbnail(`https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`);
      }
      if (parsed.isShorts) {
        setUrlWarning('Cảnh báo: Đây là định dạng YouTube Shorts. Nên sử dụng video tiêu chuẩn 16:9 cho đề thi nghe JLPT.');
      }
    } else if (val.trim() && !parsed.isValid) {
      setUrlWarning(parsed.error || 'Đường dẫn YouTube chưa đúng định dạng.');
    }
  };

  // Auto fetch title & author via oEmbed
  const handleAutoFetchInfo = async () => {
    const targetId = formVideoId || extractYouTubeVideoId(formUrl).videoId;
    if (!targetId) {
      setUrlWarning('Vui lòng nhập URL hoặc Video ID YouTube trước.');
      return;
    }

    setIsFetchingInfo(true);
    setUrlWarning('');
    try {
      const res = await fetch(`/api/listening/youtube-info?videoId=${targetId}`);
      const data = await res.json();
      if (data && data.success && data.info) {
        if (!formTitle) setFormTitle(data.info.title || '');
        if (!formSource) setFormSource(data.info.author || '');
        if (!formSourceUrl && data.info.authorUrl) setFormSourceUrl(data.info.authorUrl);
        setFormThumbnail(`https://img.youtube.com/vi/${targetId}/hqdefault.jpg`);
        if (data.info.isShorts) {
          setUrlWarning('Cảnh báo: Video này ở dạng YouTube Shorts.');
        }
      } else {
        setUrlWarning(data.error || 'Không thể lấy thông tin video từ YouTube.');
      }
    } catch {
      setUrlWarning('Lỗi kết nối khi lấy thông tin từ YouTube.');
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const openCreateModal = () => {
    setEditingVideo(null);
    setFormTitle('');
    setFormCode(`N4 Listening 0${videos.filter(v => v.level === 'N4').length + 1}`);
    setFormUrl('');
    setFormVideoId('');
    setFormLevel('N4');
    setFormCategory('Listening Practice');
    setFormSource('');
    setFormSourceUrl('');
    setFormDescription('Bài luyện thi nghe hiểu tiếng Nhật có kèm đáp án và hướng dẫn giải.');
    setFormDuration('35:00');
    setFormThumbnail('');
    setFormHasAnswers(true);
    setFormStatus('active');
    setUrlWarning('');
    setSaveError('');
    setIsModalOpen(true);
  };

  const openEditModal = (v: YouTubeListeningVideo) => {
    setEditingVideo(v);
    setFormTitle(v.title);
    setFormCode(v.code || '');
    setFormUrl(v.youtube_url);
    setFormVideoId(v.youtube_video_id);
    setFormLevel(v.level);
    setFormCategory(v.category);
    setFormSource(v.source);
    setFormSourceUrl(v.source_url || '');
    setFormDescription(v.description);
    setFormDuration(v.duration || '');
    setFormThumbnail(v.thumbnail || '');
    setFormHasAnswers(v.has_answers);
    setFormStatus(v.status);
    setUrlWarning('');
    setSaveError('');
    setIsModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');

    const parsed = extractYouTubeVideoId(formVideoId || formUrl);
    if (!parsed.videoId) {
      setSaveError('Vui lòng cung cấp URL YouTube hoặc ID video hợp lệ (11 ký tự).');
      return;
    }

    if (!formTitle.trim()) {
      setSaveError('Vui lòng nhập tiêu đề bài nghe.');
      return;
    }

    const videoPayload: Partial<YouTubeListeningVideo> = {
      id: editingVideo ? editingVideo.id : `${formLevel.toLowerCase()}-listening-${Date.now()}`,
      title: formTitle.trim(),
      code: formCode.trim() || undefined,
      youtube_url: `https://www.youtube.com/watch?v=${parsed.videoId}`,
      youtube_video_id: parsed.videoId,
      level: formLevel,
      category: formCategory,
      source: formSource.trim() || 'YouTube Creator',
      source_url: formSourceUrl.trim() || undefined,
      description: formDescription.trim(),
      duration: formDuration.trim() || undefined,
      thumbnail: formThumbnail.trim() || `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`,
      has_answers: formHasAnswers,
      status: formStatus
    };

    try {
      const res = await fetch('/api/listening/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoPayload)
      });
      const data = await res.json();
      if (data && data.success) {
        setIsModalOpen(false);
        fetchVideos();
      } else {
        setSaveError(data.error || 'Lỗi khi lưu video bài nghe.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Lỗi kết nối máy chủ.');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa video này khỏi danh sách luyện nghe?')) return;
    try {
      const res = await fetch(`/api/listening/videos/${videoId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data && data.success) {
        setVideos(prev => prev.filter(v => v.id !== videoId));
      }
    } catch {
      alert('Không thể xóa video lúc này.');
    }
  };

  const handleToggleStatus = async (video: YouTubeListeningVideo) => {
    const newStatus = video.status === 'active' ? 'hidden' : 'active';
    try {
      const res = await fetch('/api/listening/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...video, status: newStatus })
      });
      const data = await res.json();
      if (data && data.success) {
        setVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: newStatus } : v));
      }
    } catch {}
  };

  // Filtered videos
  const displayedVideos = videos.filter(v => {
    if (levelFilter !== 'ALL' && v.level !== levelFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      return v.title.toLowerCase().includes(q) || 
             v.source.toLowerCase().includes(q) || 
             (v.code && v.code.toLowerCase().includes(q)) ||
             v.youtube_video_id.includes(q);
    }
    return true;
  });

  return (
    <div className="w-full space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-[#121927] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <Youtube className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>Quản lý Video Nghe JLPT (YouTube)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                {videos.length} videos
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Quản lý các bài luyện thi nghe JLPT nhúng trực tiếp từ YouTube cho các cấp độ N5 → N1.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchVideos}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm video mới</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-2xl bg-[#121927] border border-slate-800">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Tìm theo tên video, mã bài, ID YouTube, kênh..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="sm:col-span-4">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Tất cả cấp độ (N5 - N1)</option>
            <option value="N5">Cấp độ N5</option>
            <option value="N4">Cấp độ N4</option>
            <option value="N3">Cấp độ N3</option>
            <option value="N2">Cấp độ N2</option>
            <option value="N1">Cấp độ N1</option>
          </select>
        </div>
      </div>

      {/* Video Table List */}
      <div className="rounded-3xl bg-[#121927] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Video</th>
                <th className="py-3.5 px-3">Cấp độ</th>
                <th className="py-3.5 px-3">Loại bài</th>
                <th className="py-3.5 px-3">Nguồn</th>
                <th className="py-3.5 px-3">Thời lượng</th>
                <th className="py-3.5 px-3">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedVideos.map((video) => (
                <tr key={video.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3 min-w-[240px]">
                      <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-black shrink-0 border border-slate-700">
                        <img
                          src={video.thumbnail || `https://img.youtube.com/vi/${video.youtube_video_id}/hqdefault.jpg`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-white line-clamp-1">
                          {video.code ? `${video.code}: ` : ''}{video.title}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          ID: {video.youtube_video_id}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md font-extrabold text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {video.level}
                    </span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-slate-300 font-medium">
                      {video.category}
                    </span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-slate-400 truncate max-w-[120px] block">
                      {video.source}
                    </span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-300">
                    {video.duration || '--:--'}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(video)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        video.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {video.status === 'active' ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Hiển thị</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Đang ẩn</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Xem trên YouTube"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setMappingVideo(video)}
                        className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Ánh xạ Timestamp & Đề thi gốc"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ánh xạ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(video)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/20 cursor-pointer"
                        title="Xóa video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Video */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#121927] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-auto">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-400" />
                <span>{editingVideo ? 'Chỉnh sửa Video Luyện Nghe' : 'Thêm Video Luyện Nghe Mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {saveError && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* YouTube URL input with auto ID parsing */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Đường dẫn YouTube (URL hoặc Video ID) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={formUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAutoFetchInfo}
                    disabled={isFetchingInfo}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                    title="Lấy tự động thông tin tiêu đề và kênh từ YouTube"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingInfo ? 'animate-spin' : ''}`} />
                    <span>Lấy tin tự động</span>
                  </button>
                </div>
                {formVideoId && (
                  <p className="text-[11px] text-emerald-400 mt-1 font-mono">
                    ✓ Đã nhận diện ID: {formVideoId}
                  </p>
                )}
                {urlWarning && (
                  <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{urlWarning}</span>
                  </p>
                )}
              </div>

              {/* Title & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Tiêu đề video *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. N4 Listening 01 - JLPT Practice Test..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Mã bài (Code)
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. N4 Listening 01"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Level & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Cấp độ JLPT *
                  </label>
                  <select
                    value={formLevel}
                    onChange={(e: any) => setFormLevel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="N5">JLPT N5</option>
                    <option value="N4">JLPT N4</option>
                    <option value="N3">JLPT N3</option>
                    <option value="N2">JLPT N2</option>
                    <option value="N1">JLPT N1</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Phân loại bài nghe *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Listening Practice">Luyện tập nghe (Listening Practice)</option>
                    <option value="Sample Exam">Đề thi mẫu (Sample Exam)</option>
                    <option value="Mock Test">Thi thử mô phỏng (Mock Test)</option>
                    <option value="Official Sample">Đề mẫu chính thức (Official Sample)</option>
                    <option value="JLPT-style">Dạng đề JLPT</option>
                  </select>
                </div>
              </div>

              {/* Source & Source URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Nguồn / Kênh YouTube *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    placeholder="e.g. The Nihongo Nook, JLPT Test..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Thời lượng (mm:ss)
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 38:50"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Mô tả bài nghe
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Giới thiệu nội dung bài nghe, các Mondai có trong đề và hướng dẫn làm bài..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Flags: has_answers & status */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={formHasAnswers}
                    onChange={(e) => setFormHasAnswers(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-slate-800 border-slate-700"
                  />
                  <span>Video có đáp án (ở cuối video hoặc sau từng câu)</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Trạng thái:</span>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="py-1 px-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                  >
                    <option value="active">Hiển thị (Active)</option>
                    <option value="hidden">Ẩn (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingVideo ? 'Lưu thay đổi' : 'Thêm video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Timestamp & Exam Question Mapping Modal */}
      {mappingVideo && (
        <AdminTimestampMappingModal
          video={mappingVideo}
          onClose={() => setMappingVideo(null)}
          onSaved={() => {
            // Refetch videos or notification
          }}
        />
      )}
    </div>
  );
};
