/**
 * Central routing configuration and utilities for NihonGo!
 */

export interface NavRouteItem {
  id: string;
  path: string;
  label: string;
  shortLabel?: string;
  title: string;
}

export const APP_ROUTES = {
  HOME: '/',
  BUNPO: '/bunpo',
  KANJI: '/kanji',
  TANGO: '/tango',
  CHO: '/cho',
  JLPT: '/jlpt',
  ROADMAP: '/lo-trinh',
  READING: '/doc-hieu',
  STUDY_BOOKS: '/sach',
  CHAT_AI: '/chat-ai',
  COMMUNITY: '/cong-dong',
  NOTEBOOK: '/so-tay',
  ACHIEVEMENTS: '/thanh-tich',
  PROGRESS: '/xep-hang',
  DICTIONARY: '/tu-dien',
  LESSONS: '/bai-hoc',
  HANDWRITING: '/luyen-viet',
  PROFILE: '/tai-khoan',
  SETTINGS: '/cai-dat',
  ADMIN: '/admin'
} as const;

export const TAB_TO_ROUTE_MAP: Record<string, string> = {
  practice: APP_ROUTES.HOME,
  grammar: APP_ROUTES.BUNPO,
  kanji: APP_ROUTES.KANJI,
  vocabulary: APP_ROUTES.TANGO,
  listening: APP_ROUTES.CHO,
  exam: APP_ROUTES.JLPT,
  'daily-exam': APP_ROUTES.JLPT,
  'jlpt-exam': APP_ROUTES.JLPT,
  roadmap: APP_ROUTES.ROADMAP,
  reading: APP_ROUTES.READING,
  'study-books': APP_ROUTES.STUDY_BOOKS,
  'japanese-chat': APP_ROUTES.CHAT_AI,
  kaiwa: APP_ROUTES.COMMUNITY,
  notebook: APP_ROUTES.NOTEBOOK,
  achievements: APP_ROUTES.ACHIEVEMENTS,
  progress: APP_ROUTES.PROGRESS,
  dictionary: APP_ROUTES.DICTIONARY,
  lessons: APP_ROUTES.LESSONS,
  handwriting: APP_ROUTES.HANDWRITING,
  profile: APP_ROUTES.PROFILE,
  settings: APP_ROUTES.SETTINGS,
  admin: APP_ROUTES.ADMIN,
};

export const ROUTE_TO_TAB_MAP: Record<string, string> = {
  '/': 'practice',
  '/bunpo': 'grammar',
  '/kanji': 'kanji',
  '/tango': 'vocabulary',
  '/cho': 'listening',
  '/jlpt': 'exam',
  '/lo-trinh': 'roadmap',
  '/roadmap': 'roadmap',
  '/doc-hieu': 'reading',
  '/reading': 'reading',
  '/sach': 'study-books',
  '/study-books': 'study-books',
  '/chat-ai': 'japanese-chat',
  '/japanese-chat': 'japanese-chat',
  '/cong-dong': 'kaiwa',
  '/kaiwa': 'kaiwa',
  '/so-tay': 'notebook',
  '/notebook': 'notebook',
  '/thanh-tich': 'achievements',
  '/achievements': 'achievements',
  '/xep-hang': 'progress',
  '/progress': 'progress',
  '/tien-do': 'progress',
  '/tu-dien': 'dictionary',
  '/dictionary': 'dictionary',
  '/bai-hoc': 'lessons',
  '/lessons': 'lessons',
  '/luyen-viet': 'handwriting',
  '/handwriting': 'handwriting',
  '/tai-khoan': 'profile',
  '/profile': 'profile',
  '/cai-dat': 'settings',
  '/settings': 'settings',
  '/admin': 'admin',
};

/**
 * Determine the active tab id based on the current pathname
 */
export function getTabFromPathname(pathname: string): string {
  const cleanPath = pathname.split('?')[0].replace(/\/$/, '') || '/';

  // Direct match
  if (ROUTE_TO_TAB_MAP[cleanPath]) {
    return ROUTE_TO_TAB_MAP[cleanPath];
  }

  // Prefix matching
  if (cleanPath.startsWith('/bunpo') || cleanPath.startsWith('/grammar')) return 'grammar';
  if (cleanPath.startsWith('/kanji')) return 'kanji';
  if (cleanPath.startsWith('/tango') || cleanPath.startsWith('/vocabulary')) return 'vocabulary';
  if (cleanPath.startsWith('/cho') || cleanPath.startsWith('/listening')) return 'listening';
  
  if (cleanPath.startsWith('/jlpt')) {
    if (cleanPath.includes('/listening')) return 'listening';
    if (cleanPath.includes('/grammar')) return 'grammar';
    if (cleanPath.includes('/kanji')) return 'kanji';
    if (cleanPath.includes('/reading')) return 'reading';
    return 'exam';
  }

  if (cleanPath.startsWith('/lo-trinh') || cleanPath.startsWith('/roadmap')) return 'roadmap';
  if (cleanPath.startsWith('/doc-hieu') || cleanPath.startsWith('/reading')) return 'reading';
  if (cleanPath.startsWith('/sach') || cleanPath.startsWith('/study-books')) return 'study-books';
  if (cleanPath.startsWith('/chat-ai') || cleanPath.startsWith('/japanese-chat')) return 'japanese-chat';
  if (cleanPath.startsWith('/cong-dong') || cleanPath.startsWith('/kaiwa')) return 'kaiwa';
  if (cleanPath.startsWith('/so-tay') || cleanPath.startsWith('/notebook')) return 'notebook';
  if (cleanPath.startsWith('/thanh-tich') || cleanPath.startsWith('/achievements')) return 'achievements';
  if (cleanPath.startsWith('/xep-hang') || cleanPath.startsWith('/progress') || cleanPath.startsWith('/tien-do')) return 'progress';
  if (cleanPath.startsWith('/tu-dien') || cleanPath.startsWith('/dictionary')) return 'dictionary';
  if (cleanPath.startsWith('/bai-hoc') || cleanPath.startsWith('/lessons')) return 'lessons';
  if (cleanPath.startsWith('/luyen-viet') || cleanPath.startsWith('/handwriting')) return 'handwriting';
  if (cleanPath.startsWith('/tai-khoan') || cleanPath.startsWith('/profile')) return 'profile';
  if (cleanPath.startsWith('/cai-dat') || cleanPath.startsWith('/settings')) return 'profile';
  if (cleanPath.startsWith('/admin')) return 'admin';

  return 'practice';
}

/**
 * Get the descriptive page title for browser tab and header
 */
export function getRoutePageTitle(pathname: string): { title: string; subtitle?: string } {
  const cleanPath = pathname.split('?')[0].replace(/\/$/, '') || '/';

  if (cleanPath === '/') {
    return { title: 'Trung tâm Luyện tập', subtitle: 'Luyện tập tổng hợp hàng ngày' };
  }
  if (cleanPath.startsWith('/bunpo')) {
    return { title: 'Ngữ pháp (文法)', subtitle: 'Ngữ pháp Minna & JLPT đầy đủ' };
  }
  if (cleanPath.startsWith('/kanji')) {
    return { title: 'Hán tự (漢字)', subtitle: 'Tra cứu & luyện nhớ Kanji theo cấp độ' };
  }
  if (cleanPath.startsWith('/tango')) {
    return { title: 'Từ vựng (単語)', subtitle: 'Từ vựng cốt lõi kèm âm thanh & flashcard' };
  }
  if (cleanPath.startsWith('/cho')) {
    return { title: 'JLPT Listening (聴解)', subtitle: 'Luyện nghe đề thi thật trên YouTube' };
  }
  if (cleanPath.startsWith('/jlpt')) {
    if (cleanPath.includes('/listening')) {
      const match = cleanPath.match(/\/jlpt\/([a-z0-9]+)\/listening/i);
      const level = match ? match[1].toUpperCase() : '';
      return { title: `JLPT ${level} Listening`, subtitle: 'Đề thi nghe JLPT chuẩn định dạng' };
    }
    const match = cleanPath.match(/\/jlpt\/([a-z0-9]+)/i);
    const level = match ? match[1].toUpperCase() : '';
    return { title: `Luyện thi JLPT ${level}`.trim(), subtitle: 'Đề thi thử & luyện tập phản xạ' };
  }
  if (cleanPath.startsWith('/lo-trinh')) {
    return { title: 'Lộ trình JLPT', subtitle: 'Lộ trình từ N5 đến N1 bài bản' };
  }
  if (cleanPath.startsWith('/doc-hieu')) {
    return { title: 'Đọc hiểu & Tin tức (読解)', subtitle: 'Luyện đọc bài báo & hội thoại' };
  }
  if (cleanPath.startsWith('/sach')) {
    return { title: 'Sách ôn thi JLPT', subtitle: 'Giáo trình & sách ôn luyện chuẩn' };
  }
  if (cleanPath.startsWith('/chat-ai')) {
    return { title: 'Chat AI Tiếng Nhật', subtitle: 'Luyện giao tiếp cùng gia sư AI' };
  }
  if (cleanPath.startsWith('/cong-dong')) {
    return { title: 'Cộng đồng & Hội thoại', subtitle: 'Giao lưu học tập cùng cộng đồng' };
  }
  if (cleanPath.startsWith('/so-tay')) {
    return { title: 'Sổ tay từ vựng', subtitle: 'Từ vựng đã lưu & Flashcard cá nhân' };
  }
  if (cleanPath.startsWith('/thanh-tich')) {
    return { title: 'Thành tựu', subtitle: 'Huy hiệu và cột mốc học tập đã mở khóa' };
  }
  if (cleanPath.startsWith('/xep-hang')) {
    return { title: 'Bảng xếp hạng & Tiến độ', subtitle: 'Thống kê XP, Streak và cấp độ' };
  }
  if (cleanPath.startsWith('/tu-dien')) {
    return { title: 'Từ điển Jisho', subtitle: 'Tra cứu từ vựng, kanji & ngữ pháp' };
  }
  if (cleanPath.startsWith('/bai-hoc')) {
    return { title: 'Bài học Minna & JLPT', subtitle: 'Khung bài giảng chuẩn theo giáo trình' };
  }
  if (cleanPath.startsWith('/luyen-viet')) {
    return { title: 'Luyện viết chữ & Chấm điểm AI', subtitle: 'Luyện nét viết Kanji & Kana' };
  }
  if (cleanPath.startsWith('/tai-khoan') || cleanPath.startsWith('/cai-dat')) {
    return { title: 'Tài khoản & Cài đặt', subtitle: 'Thông tin cá nhân & cài đặt ứng dụng' };
  }
  if (cleanPath.startsWith('/admin')) {
    return { title: 'Quản trị hệ thống', subtitle: 'Bảng điều khiển quản trị viên' };
  }

  return { title: 'Học tiếng Nhật', subtitle: 'Ứng dụng học tiếng Nhật NihonGo!' };
}
