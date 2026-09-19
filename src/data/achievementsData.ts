import { AchievementCharacter } from '../components/achievements/AchievementMascotIcon';

export type AchievementCategory = 
  | 'onboarding' 
  | 'streak' 
  | 'vocab' 
  | 'kanji' 
  | 'grammar' 
  | 'practice' 
  | 'milestone';

export interface AchievementItem {
  id: string;
  number: number;
  title: string;
  description: string;
  character: AchievementCharacter;
  category: AchievementCategory;
  categoryName: string;
  unlockedByDefault?: boolean;
  rewardXp?: number;
}

export const TOTAL_ACHIEVEMENTS_COUNT = 100;

export const ACHIEVEMENTS_LIST: AchievementItem[] = [
  // ==========================================
  // KHỞI ĐẦU & THÓI QUEN (1 - 15)
  // ==========================================
  {
    id: 'ach_welcome',
    number: 1,
    title: 'Chào mừng bạn!',
    description: 'Bắt đầu hành trình chinh phục tiếng Nhật với ứng dụng',
    character: 'shiba-welcome',
    category: 'onboarding',
    categoryName: 'Khởi đầu',
    unlockedByDefault: true,
    rewardXp: 20,
  },
  {
    id: 'ach_regular',
    number: 2,
    title: 'Khách quen',
    description: 'Đăng nhập và học tập liên tục trong 2 ngày',
    character: 'shiba-regular',
    category: 'streak',
    categoryName: 'Thói quen',
    unlockedByDefault: true,
    rewardXp: 30,
  },
  {
    id: 'ach_early_bird',
    number: 3,
    title: 'Chim dậy sớm',
    description: 'Hoàn thành bài học trước 7 giờ sáng',
    character: 'daruma-early',
    category: 'streak',
    categoryName: 'Thói quen',
    rewardXp: 50,
  },
  {
    id: 'ach_night_owl',
    number: 4,
    title: 'Cú đêm',
    description: 'Học tập chăm chỉ sau 23 giờ đêm',
    character: 'owl-night',
    category: 'streak',
    categoryName: 'Thói quen',
    rewardXp: 50,
  },
  {
    id: 'ach_streak_3',
    number: 5,
    title: 'Ba ngày kiên định',
    description: 'Duy trì chuỗi học tập (Streak) 3 ngày liên tiếp',
    character: 'shiba-fire',
    category: 'streak',
    categoryName: 'Thói quen',
    rewardXp: 40,
  },
  {
    id: 'ach_steady_steps',
    number: 6,
    title: 'Bước chân đều đặn',
    description: 'Duy trì chuỗi học tập (Streak) 7 ngày liên tiếp',
    character: 'daruma-steady',
    category: 'streak',
    categoryName: 'Thói quen',
    rewardXp: 80,
  },
  {
    id: 'ach_streak_14',
    number: 7,
    title: 'Hai tuần bền bỉ',
    description: 'Duy trì chuỗi học tập 14 ngày không ngắt quãng',
    character: 'shiba-fire',
    category: 'streak',
    categoryName: 'Thói quen',
    rewardXp: 120,
  },
  {
    id: 'ach_streak_21',
    number: 8,
    title: 'Thói quen vững vàng',
    description: 'Đạt mốc 21 ngày hình thành thói quen vàng',
    character: 'daruma-gold',
    category: 'streak',
    categoryName: 'Thói quen',
    rewardXp: 160,
  },
  {
    id: 'ach_streak_30',
    number: 9,
    title: 'Một tháng kiên cường',
    description: 'Duy trì ngọn lửa học tập suốt 30 ngày',
    character: 'shiba-fire',
    category: 'streak',
    categoryName: 'Thói quen',
    rewardXp: 200,
  },
  {
    id: 'ach_streak_60',
    number: 10,
    title: 'Chinh phục 60 ngày',
    description: 'Chuỗi học tập thần tốc 60 ngày liên tục',
    character: 'shiba-crown',
    category: 'streak',
    categoryName: 'Thói quen',
    rewardXp: 350,
  },
  {
    id: 'ach_streak_100',
    number: 11,
    title: 'Bách nhật tinh thông',
    description: 'Chinh phục cột mốc thế kỷ: 100 ngày liên tục',
    character: 'shiba-trophy',
    category: 'streak',
    categoryName: 'Thói quen',
    rewardXp: 500,
  },
  {
    id: 'ach_streak_freeze',
    number: 12,
    title: 'Bùa hộ mệnh',
    description: 'Sở hữu hoặc sử dụng vật phẩm bảo vệ chuỗi Streak',
    character: 'maneki-neko',
    category: 'streak',
    categoryName: 'Thói quen',
    rewardXp: 30,
  },
  {
    id: 'ach_weekend_warrior',
    number: 13,
    title: 'Chiến binh cuối tuần',
    description: 'Học tập hăng say vào cả Thứ 7 và Chủ Nhật',
    character: 'shiba-jump',
    category: 'streak',
    categoryName: 'Thói quen',
    rewardXp: 50,
  },
  {
    id: 'ach_noon_learner',
    number: 14,
    title: 'Năng lượng giờ trưa',
    description: 'Tranh thủ học tập từ 11:30 đến 13:00',
    character: 'shiba-study',
    category: 'streak',
    categoryName: 'Thói quen',
    rewardXp: 40,
  },
  {
    id: 'ach_daily_goal_5',
    number: 15,
    title: 'Kỷ luật thép',
    description: 'Hoàn thành 100% mục tiêu ngày trong 5 ngày liên tiếp',
    character: 'samurai-shiba',
    category: 'streak',
    categoryName: 'Thói quen',
    rewardXp: 90,
  },

  // ==========================================
  // TỪ VỰNG & FLASHCARD (16 - 33)
  // ==========================================
  {
    id: 'ach_flip_cards',
    number: 16,
    title: 'Cún lật thẻ',
    description: 'Ôn tập 20 thẻ từ vựng với tính năng Flashcard',
    character: 'shiba-cards',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 40,
  },
  {
    id: 'ach_vocab_10',
    number: 17,
    title: 'Vốn từ mở lối',
    description: 'Thuộc và làm chủ 10 từ vựng đầu tiên',
    character: 'shiba-start',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 30,
  },
  {
    id: 'ach_vocab_50',
    number: 18,
    title: 'Túi từ đầy dần',
    description: 'Học xong 50 từ vựng tiếng Nhật hữu ích',
    character: 'shiba-study',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 60,
  },
  {
    id: 'ach_vocab_100',
    number: 19,
    title: 'Trăm từ căn bản',
    description: 'Chinh phục mốc 100 từ vựng sơ cấp',
    character: 'shiba-five',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 100,
  },
  {
    id: 'ach_vocab_250',
    number: 20,
    title: 'Nhà sưu tầm từ vựng',
    description: 'Tích lũy 250 từ vựng tiếng Nhật phong phú',
    character: 'shiba-notebook',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 180,
  },
  {
    id: 'ach_vocab_500',
    number: 21,
    title: 'Bách khoa từ điển',
    description: 'Chinh phục 500 từ vựng chuẩn khung JLPT',
    character: 'shiba-crown',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 300,
  },
  {
    id: 'ach_vocab_1000',
    number: 22,
    title: 'Đại cao thủ từ vựng',
    description: 'Vượt mốc 1,000 từ vựng thành thạo',
    character: 'shiba-master',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 500,
  },
  {
    id: 'ach_srs_master_1',
    number: 23,
    title: 'Nắm chắc như in',
    description: 'Đưa 1 từ vựng lên cấp độ ghi nhớ dài hạn (Mastered)',
    character: 'shiba-return',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 35,
  },
  {
    id: 'ach_srs_master_25',
    number: 24,
    title: 'Bậc thầy ghi nhớ',
    description: 'Chuyển 25 từ vựng vào bộ nhớ vĩnh viễn (Mastered)',
    character: 'shiba-diamond',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 120,
  },
  {
    id: 'ach_srs_master_100',
    number: 25,
    title: 'Trí nhớ siêu phàm',
    description: '100 từ vựng đạt cấp độ hoàn toàn không quên',
    character: 'shiba-trophy',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 250,
  },
  {
    id: 'ach_notebook_first',
    number: 26,
    title: 'Sổ tay đầu tiên',
    description: 'Lưu từ vựng yêu thích đầu tiên vào Sổ tay ghi nhớ',
    character: 'shiba-notebook',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 25,
  },
  {
    id: 'ach_notebook_20',
    number: 27,
    title: 'Kho từ cá nhân',
    description: 'Lưu trữ hơn 20 từ vựng vào Sổ tay riêng',
    character: 'shiba-notebook',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 60,
  },
  {
    id: 'ach_notebook_folder',
    number: 28,
    title: 'Ngăn nắp trật tự',
    description: 'Phân loại từ vựng theo thư mục chuyên đề',
    character: 'shiba-study',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 45,
  },
  {
    id: 'ach_flashcard_speed',
    number: 29,
    title: 'Phản xạ tia chớp',
    description: 'Hoàn thành lượt ôn 10 thẻ Flashcard trong 30 giây',
    character: 'shiba-speed',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 70,
  },
  {
    id: 'ach_tango_learner',
    number: 30,
    title: 'Chọn lọc Tango',
    description: 'Học bài từ giáo trình từ vựng Tango 2000',
    character: 'shiba-study',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 50,
  },
  {
    id: 'ach_minna_learner',
    number: 31,
    title: 'Cùng học Minna',
    description: 'Học bài từ vựng theo giáo trình Minna no Nihongo',
    character: 'shiba-welcome',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 50,
  },
  {
    id: 'ach_vocab_perfect',
    number: 32,
    title: 'Tuyệt đối không sai',
    description: 'Làm bài kiểm tra từ vựng đạt tỉ lệ đúng 100%',
    character: 'daruma-gold',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 80,
  },
  {
    id: 'ach_vocab_review_spree',
    number: 33,
    title: 'Cơn sốt ôn từ',
    description: 'Ôn tập lại hơn 50 từ vựng trong một ngày',
    character: 'shiba-fire',
    category: 'vocab',
    categoryName: 'Từ vựng',
    rewardXp: 100,
  },

  // ==========================================
  // HÁN TỰ & KANJI (34 - 49)
  // ==========================================
  {
    id: 'ach_kanji_first',
    number: 34,
    title: 'Nét bút đầu tiên',
    description: 'Học và viết đúng chữ Kanji đầu tiên',
    character: 'shiba-kanji',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 30,
  },
  {
    id: 'ach_kanji_10',
    number: 35,
    title: 'Thập tự nhập môn',
    description: 'Nắm vững 10 chữ Hán tự cơ bản',
    character: 'shiba-kanji',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 50,
  },
  {
    id: 'ach_kanji_30',
    number: 36,
    title: 'Tam thập Hán tự',
    description: 'Chinh phục 30 chữ Hán thường gặp',
    character: 'shiba-kanji',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 80,
  },
  {
    id: 'ach_kanji_50',
    number: 37,
    title: 'Nửa trăm chữ Hán',
    description: 'Hoàn thành ghi nhớ 50 chữ Hán tự',
    character: 'shiba-kanji',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 120,
  },
  {
    id: 'ach_kanji_100',
    number: 38,
    title: 'Bách tự Hán học',
    description: 'Đạt mốc 100 chữ Kanji N5 trọn vẹn',
    character: 'shiba-crown',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 200,
  },
  {
    id: 'ach_kanji_200',
    number: 39,
    title: 'Song bách Hán tự',
    description: 'Chinh phục 200 chữ Kanji cấp độ N4',
    character: 'shiba-trophy',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 300,
  },
  {
    id: 'ach_kanji_stroke',
    number: 40,
    title: 'Nét bút chuẩn xác',
    description: 'Viết đúng 100% thứ tự nét vẽ của chữ Kanji',
    character: 'samurai-shiba',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 60,
  },
  {
    id: 'ach_kanji_radicals',
    number: 41,
    title: 'Giải mã bộ thủ',
    description: 'Nhận diện và hiểu ý nghĩa của 5 bộ thủ cơ bản',
    character: 'ninja-shiba',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 50,
  },
  {
    id: 'ach_kanji_onyomi',
    number: 42,
    title: 'Âm On thuần thục',
    description: 'Đoán đúng âm Hán-Nhật (Onyomi) của 10 chữ Kanji',
    character: 'shiba-study',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 60,
  },
  {
    id: 'ach_kanji_kunyomi',
    number: 43,
    title: 'Âm Kun tự nhiên',
    description: 'Đoán đúng âm thuần Nhật (Kunyomi) của 10 chữ Kanji',
    character: 'shiba-study',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 60,
  },
  {
    id: 'ach_kanji_hanviet',
    number: 44,
    title: 'Thuần thục Hán Việt',
    description: 'Ghi nhớ đúng âm Hán Việt của 20 từ Kanji',
    character: 'shiba-kanji',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 70,
  },
  {
    id: 'ach_kanji_n5_clear',
    number: 45,
    title: 'Tốt nghiệp Kanji N5',
    description: 'Hoàn thành toàn bộ lộ trình Hán tự sơ cấp N5',
    character: 'shiba-crown',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 250,
  },
  {
    id: 'ach_kanji_n4_clear',
    number: 46,
    title: 'Chinh phục Kanji N4',
    description: 'Hoàn thành toàn bộ lộ trình Hán tự N4',
    character: 'shiba-master',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 350,
  },
  {
    id: 'ach_kanji_drawing_streak',
    number: 47,
    title: 'Nét mực liên hoàn',
    description: 'Vẽ chuẩn xác 10 chữ Kanji liên tiếp không sai nét',
    character: 'samurai-shiba',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 90,
  },
  {
    id: 'ach_kanji_compound',
    number: 48,
    title: 'Từ ghép tinh thông',
    description: 'Học và thuộc 30 từ ghép Hán tự (Jukugo)',
    character: 'shiba-notebook',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 80,
  },
  {
    id: 'ach_kanji_detective',
    number: 49,
    title: 'Thám tử chữ Hán',
    description: 'Phân biệt đúng 5 cặp chữ Kanji có nét tương đồng dễ nhầm',
    character: 'ninja-shiba',
    category: 'kanji',
    categoryName: 'Hán tự',
    rewardXp: 75,
  },

  // ==========================================
  // NGỮ PHÁP & CẤU TRÚC (50 - 66)
  // ==========================================
  {
    id: 'ach_shiba_study',
    number: 50,
    title: 'Shiba học tập',
    description: 'Hoàn thành 3 bài học lý thuyết hoặc ngữ pháp',
    character: 'shiba-study',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 40,
  },
  {
    id: 'ach_five_lessons',
    number: 51,
    title: 'Năm bài đầu tay',
    description: 'Hoàn thành trọn vẹn 5 bài học đầu tiên',
    character: 'shiba-five',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 60,
  },
  {
    id: 'ach_grammar_10',
    number: 52,
    title: 'Nắm chắc 10 mẫu câu',
    description: 'Học và hiểu rõ 10 cấu trúc ngữ pháp cơ bản',
    character: 'shiba-grammar',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 50,
  },
  {
    id: 'ach_grammar_25',
    number: 53,
    title: 'Nền móng vững chắc',
    description: 'Chinh phục 25 mẫu ngữ pháp thông dụng',
    character: 'shiba-grammar',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 100,
  },
  {
    id: 'ach_grammar_50',
    number: 54,
    title: 'Bán bách cấu trúc',
    description: 'Nắm vững 50 mẫu ngữ pháp thiết yếu',
    character: 'shiba-grammar',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 180,
  },
  {
    id: 'ach_grammar_n5_full',
    number: 55,
    title: 'Chuyên gia Ngữ pháp N5',
    description: 'Hoàn thành trọn vẹn toàn bộ các điểm ngữ pháp N5',
    character: 'shiba-crown',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 250,
  },
  {
    id: 'ach_grammar_n4_full',
    number: 56,
    title: 'Vượt vũ môn Ngữ pháp N4',
    description: 'Chinh phục toàn bộ cấu trúc ngữ pháp cấp độ N4',
    character: 'shiba-master',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 350,
  },
  {
    id: 'ach_grammar_formation',
    number: 57,
    title: 'Bậc thầy chia thì',
    description: 'Thuần thục quy tắc chia thể động từ Te, Ta, Nai, Từ điển',
    character: 'samurai-shiba',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 80,
  },
  {
    id: 'ach_grammar_particles',
    number: 58,
    title: 'Bậc thầy trợ từ',
    description: 'Làm đúng 15 câu trắc nghiệm trợ từ は, が, を, に, で',
    character: 'shiba-study',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 70,
  },
  {
    id: 'ach_grammar_keigo',
    number: 59,
    title: 'Nhã nhặn lịch thiệp',
    description: 'Làm quen và hoàn thành bài học về Kính ngữ tiếng Nhật',
    character: 'shiba-sakura',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 90,
  },
  {
    id: 'ach_grammar_comparison',
    number: 60,
    title: 'Mắt thần phân tích',
    description: 'Đọc và đối chiếu 3 cặp mẫu câu tương đồng dễ nhầm',
    character: 'ninja-shiba',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 60,
  },
  {
    id: 'ach_grammar_order',
    number: 61,
    title: 'Xếp câu thần tốc',
    description: 'Làm đúng 5 câu dạng bài sắp xếp từ điền dấu sao ★',
    character: 'shiba-speed',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 80,
  },
  {
    id: 'ach_grammar_theory',
    number: 62,
    title: 'Đọc kỹ hiểu sâu',
    description: 'Đọc trọn vẹn phần giải thích ngữ cảnh của một bài học',
    character: 'shiba-reading',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 30,
  },
  {
    id: 'ach_grammar_practice_10',
    number: 63,
    title: 'Luyện câu nhuần nhuyễn',
    description: 'Thực hành 10 bài tập trắc nghiệm chọn đáp án ngữ pháp',
    character: 'shiba-quiz',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 50,
  },
  {
    id: 'ach_grammar_practice_50',
    number: 64,
    title: 'Đấu sĩ cấu trúc',
    description: 'Thực hành thành công 50 câu bài tập ngữ pháp',
    character: 'samurai-shiba',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 120,
  },
  {
    id: 'ach_grammar_no_mistake',
    number: 65,
    title: 'Ngữ pháp không tì vết',
    description: 'Đạt điểm tối đa trong một bài kiểm tra ngữ pháp 10 câu',
    character: 'daruma-gold',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 90,
  },
  {
    id: 'ach_shiba_return',
    number: 66,
    title: 'Shiba trở lại',
    description: 'Ôn tập lại các điểm ngữ pháp đã học từ tuần trước',
    character: 'shiba-return',
    category: 'grammar',
    categoryName: 'Ngữ pháp',
    rewardXp: 40,
  },

  // ==========================================
  // LUYỆN TẬP, MINI TEST & THI THỬ (67 - 84)
  // ==========================================
  {
    id: 'ach_shiba_start',
    number: 67,
    title: 'Shiba mở đầu',
    description: 'Hoàn thành bài học đầu tiên trong lộ trình',
    character: 'shiba-start',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 30,
  },
  {
    id: 'ach_quiz_start',
    number: 68,
    title: 'Khởi động quiz',
    description: 'Tham gia và hoàn thành 1 bài kiểm tra trắc nghiệm',
    character: 'shiba-quiz',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 35,
  },
  {
    id: 'ach_mini_test_3',
    number: 69,
    title: 'Ba bài khởi động',
    description: 'Hoàn thành 3 bài Mini Test định kỳ trong lộ trình',
    character: 'shiba-quiz',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 60,
  },
  {
    id: 'ach_mini_test_7',
    number: 70,
    title: 'Tuần đầu trọn vẹn',
    description: 'Vượt qua bài Mini Test tổng kết tuần đầu tiên (Ngày 7)',
    character: 'daruma-steady',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 80,
  },
  {
    id: 'ach_mini_test_15',
    number: 71,
    title: 'Nửa chặng đường Mini Test',
    description: 'Chinh phục 15 bài Mini Test trong hành trình',
    character: 'shiba-jump',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 150,
  },
  {
    id: 'ach_mini_test_30',
    number: 72,
    title: 'Chiến binh 30 ngày',
    description: 'Vượt qua bài kiểm tra ngày 30 của lộ trình học',
    character: 'shiba-crown',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 220,
  },
  {
    id: 'ach_mini_test_60',
    number: 73,
    title: 'Về đích lộ trình 60 ngày',
    description: 'Hoàn thành trọn vẹn toàn bộ 60 ngày của lộ trình N4',
    character: 'shiba-trophy',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 400,
  },
  {
    id: 'ach_exam_first',
    number: 74,
    title: 'Thử lửa phòng thi',
    description: 'Làm trọn vẹn 1 đề thi thử JLPT đầu tiên',
    character: 'shiba-exam',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 100,
  },
  {
    id: 'ach_exam_pass',
    number: 75,
    title: 'Cầm chắc tấm vé',
    description: 'Đạt điểm đỗ (Pass) trong một đề thi thử JLPT chính thức',
    character: 'daruma-gold',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 180,
  },
  {
    id: 'ach_exam_high_score',
    number: 76,
    title: 'Thủ khoa tương lai',
    description: 'Đạt trên 85% tổng số điểm trong đề thi thử JLPT',
    character: 'shiba-crown',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 260,
  },
  {
    id: 'ach_exam_perfect',
    number: 77,
    title: 'Điểm số tuyệt đối',
    description: 'Đạt điểm tối đa 60/60 điểm ở một phần thi kiến thức JLPT',
    character: 'shiba-diamond',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 350,
  },
  {
    id: 'ach_exam_speed',
    number: 78,
    title: 'Tốc độ gió lốc',
    description: 'Hoàn thành bài thi thử trước khi hết 50% thời gian',
    character: 'shiba-speed',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 90,
  },
  {
    id: 'ach_audio_listen_1',
    number: 79,
    title: 'Đôi tai thính',
    description: 'Nghe và trả lời đúng 1 bài luyện nghe hiểu âm thanh',
    character: 'shiba-listening',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 40,
  },
  {
    id: 'ach_audio_listen_10',
    number: 80,
    title: 'Thính giác chuẩn Nhật',
    description: 'Hoàn thành 10 bài luyện nghe hiểu âm thanh tiếng Nhật',
    character: 'shiba-listening',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 100,
  },
  {
    id: 'ach_shadowing_first',
    number: 81,
    title: 'Cất tiếng bản xứ',
    description: 'Luyện nói và ghi âm bài Shadowing đầu tiên',
    character: 'shiba-welcome',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 45,
  },
  {
    id: 'ach_shadowing_90',
    number: 82,
    title: 'Phát âm chuẩn mực',
    description: 'Đạt trên 90% độ chính xác trong một bài tập Shadowing',
    character: 'shiba-diamond',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 110,
  },
  {
    id: 'ach_reading_short',
    number: 83,
    title: 'Đọc hiểu đoạn ngắn',
    description: 'Đọc và trả lời đúng trọn vẹn câu hỏi bài đọc hiểu ngắn',
    character: 'shiba-reading',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 50,
  },
  {
    id: 'ach_reading_medium',
    number: 84,
    title: 'Đọc hiểu đoạn trung',
    description: 'Chinh phục bài đọc hiểu đoạn trung cấp độ N4/N3',
    character: 'shiba-reading',
    category: 'practice',
    categoryName: 'Luyện tập',
    rewardXp: 90,
  },

  // ==========================================
  // KINH NGHIỆM, CẤP ĐỘ & DANH HIỆU (85 - 100)
  // ==========================================
  {
    id: 'ach_small_jump',
    number: 85,
    title: 'Cú nhảy nhỏ',
    description: 'Đạt mốc 100 điểm kinh nghiệm (XP) đầu tiên',
    character: 'shiba-jump',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 30,
  },
  {
    id: 'ach_xp_500',
    number: 86,
    title: 'Tích lũy vững chắc',
    description: 'Chạm mốc 500 điểm kinh nghiệm (XP)',
    character: 'shiba-study',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 60,
  },
  {
    id: 'ach_xp_1000',
    number: 87,
    title: 'Ngàn sao tỏa sáng',
    description: 'Chinh phục cột mốc 1,000 điểm kinh nghiệm (XP)',
    character: 'shiba-diamond',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 120,
  },
  {
    id: 'ach_xp_2500',
    number: 88,
    title: 'Cột mốc đáng nể',
    description: 'Đạt mốc 2,500 điểm kinh nghiệm (XP)',
    character: 'daruma-gold',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 200,
  },
  {
    id: 'ach_xp_5000',
    number: 89,
    title: 'Cao thủ tiếng Nhật',
    description: 'Vượt mốc 5,000 điểm kinh nghiệm danh giá',
    character: 'shiba-crown',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 350,
  },
  {
    id: 'ach_xp_10000',
    number: 90,
    title: 'Huyền thoại học viện',
    description: 'Đạt 10,000 XP - Khẳng định vị thế người học xuất sắc',
    character: 'shiba-trophy',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 600,
  },
  {
    id: 'ach_level_5',
    number: 91,
    title: 'Cấp độ 5',
    description: 'Tài khoản người dùng thăng tiến lên Cấp độ 5',
    character: 'shiba-regular',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 50,
  },
  {
    id: 'ach_level_10',
    number: 92,
    title: 'Cấp độ 10',
    description: 'Tài khoản người dùng thăng tiến lên Cấp độ 10',
    character: 'daruma-steady',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 100,
  },
  {
    id: 'ach_level_20',
    number: 93,
    title: 'Đẳng cấp kỳ cựu',
    description: 'Vươn đến Cấp độ 20 trong hệ thống',
    character: 'shiba-crown',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 200,
  },
  {
    id: 'ach_league_bronze',
    number: 94,
    title: 'Giải Đồng khởi tranh',
    description: 'Góp mặt tranh tài trong bảng xếp hạng giải Đồng',
    character: 'shiba-welcome',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 30,
  },
  {
    id: 'ach_league_silver',
    number: 95,
    title: 'Thăng hạng Bạc',
    description: 'Vươn lên và trụ hạng thành công ở giải Bạc',
    character: 'shiba-jump',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 70,
  },
  {
    id: 'ach_league_gold',
    number: 96,
    title: 'Vinh quang giải Vàng',
    description: 'Bước chân vào giải Vàng cùng các đối thủ mạnh',
    character: 'daruma-gold',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 150,
  },
  {
    id: 'ach_league_diamond',
    number: 97,
    title: 'Vương miện Kim Cương',
    description: 'Chạm tay vào giải đấu cao quý nhất: Giải Kim Cương',
    character: 'shiba-diamond',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 300,
  },
  {
    id: 'ach_leaderboard_top3',
    number: 98,
    title: 'Bục vinh quang',
    description: 'Lọt vào Top 3 người dẫn đầu bảng xếp hạng tuần',
    character: 'shiba-crown',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 250,
  },
  {
    id: 'ach_badge_collector_50',
    number: 99,
    title: 'Sưu tầm gia thành tựu',
    description: 'Mở khóa thành công 50 thành tựu trong bộ sưu tập',
    character: 'shiba-trophy',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 400,
  },
  {
    id: 'ach_master_century',
    number: 100,
    title: 'Trăm điều kỳ diệu',
    description: 'Mở khóa trọn vẹn toàn bộ 100 thành tựu danh giá của ứng dụng',
    character: 'shiba-master',
    category: 'milestone',
    categoryName: 'Cấp độ & XP',
    rewardXp: 1000,
  },
];

/**
 * Calculates dynamically unlocked achievement IDs based on UserProfile state
 */
export function calculateUnlockedAchievements(userProfile?: any): Set<string> {
  const set = new Set<string>();

  // 1. Default first two unlocked as on initial start
  set.add('ach_welcome');
  set.add('ach_regular');

  if (!userProfile) return set;

  // 2. Explicit unlocked badges stored on user profile
  (userProfile.unlockedBadges || []).forEach(b => set.add(b));

  const streak = userProfile.streak || 0;
  const xp = userProfile.xp || 0;
  const level = userProfile.level || Math.floor(xp / 150) + 1;
  const completedLessons = userProfile.completedLessons || [];
  const lessonsCount = completedLessons.length;
  const testResults = userProfile.dailyTestResults || [];
  const testsCount = testResults.length;
  const savedCount = (userProfile.savedVocab || []).length + (userProfile.savedWords || []).length;
  const vocabCount = Object.keys(userProfile.vocabStatus || {}).length + savedCount;
  const kanjiCount = Object.keys(userProfile.kanjiStatus || {}).length;
  const grammarCount = Object.keys(userProfile.grammarStatus || {}).length;
  const roadmapCurrentDay = userProfile.studyRoadmap?.currentDay || 1;
  const roadmapCompletedDays = (userProfile.studyRoadmap?.completedDays || []).length;
  const studyDaysCount = (userProfile.studyDays || []).length;

  // STREAKS
  if (streak >= 3) set.add('ach_streak_3');
  if (streak >= 7) set.add('ach_steady_steps');
  if (streak >= 14) set.add('ach_streak_14');
  if (streak >= 21) set.add('ach_streak_21');
  if (streak >= 30) set.add('ach_streak_30');
  if (streak >= 60) set.add('ach_streak_60');
  if (streak >= 100) set.add('ach_streak_100');
  if (streak >= 2 || studyDaysCount >= 2) set.add('ach_weekend_warrior');
  if (streak >= 5) set.add('ach_daily_goal_5');

  // TIME OF DAY (Simulated/actual check)
  const currentHour = new Date().getHours();
  if (currentHour < 7) set.add('ach_early_bird');
  if (currentHour >= 23) set.add('ach_night_owl');
  if (currentHour >= 11 && currentHour <= 13) set.add('ach_noon_learner');

  // VOCABULARY & FLASHCARDS
  if (vocabCount >= 10 || lessonsCount >= 1) set.add('ach_vocab_10');
  if (vocabCount >= 20 || savedCount >= 5) set.add('ach_flip_cards');
  if (vocabCount >= 50) set.add('ach_vocab_50');
  if (vocabCount >= 100) set.add('ach_vocab_100');
  if (vocabCount >= 250) set.add('ach_vocab_250');
  if (vocabCount >= 500) set.add('ach_vocab_500');
  if (vocabCount >= 1000) set.add('ach_vocab_1000');
  if (savedCount >= 1) set.add('ach_notebook_first');
  if (savedCount >= 20) set.add('ach_notebook_20');
  if (savedCount >= 5) set.add('ach_notebook_folder');
  if (vocabCount >= 15) {
    set.add('ach_srs_master_1');
    set.add('ach_tango_learner');
    set.add('ach_minna_learner');
  }
  if (vocabCount >= 25) set.add('ach_srs_master_25');
  if (vocabCount >= 100) set.add('ach_srs_master_100');
  if (vocabCount >= 30) set.add('ach_flashcard_speed');
  if (vocabCount >= 50) set.add('ach_vocab_review_spree');

  // KANJI
  if (kanjiCount >= 1 || lessonsCount >= 1) set.add('ach_kanji_first');
  if (kanjiCount >= 10 || lessonsCount >= 3) set.add('ach_kanji_10');
  if (kanjiCount >= 30) set.add('ach_kanji_30');
  if (kanjiCount >= 50) set.add('ach_kanji_50');
  if (kanjiCount >= 100) set.add('ach_kanji_100');
  if (kanjiCount >= 200) set.add('ach_kanji_200');
  if (kanjiCount >= 5) {
    set.add('ach_kanji_stroke');
    set.add('ach_kanji_radicals');
  }
  if (kanjiCount >= 10) {
    set.add('ach_kanji_onyomi');
    set.add('ach_kanji_kunyomi');
    set.add('ach_kanji_hanviet');
  }
  if (kanjiCount >= 80) set.add('ach_kanji_n5_clear');
  if (kanjiCount >= 160) set.add('ach_kanji_n4_clear');
  if (kanjiCount >= 15) set.add('ach_kanji_drawing_streak');
  if (kanjiCount >= 30) set.add('ach_kanji_compound');
  if (kanjiCount >= 20) set.add('ach_kanji_detective');

  // GRAMMAR
  if (lessonsCount >= 1) set.add('ach_shiba_start');
  if (lessonsCount >= 3) set.add('ach_shiba_study');
  if (lessonsCount >= 5) set.add('ach_five_lessons');
  if (grammarCount >= 10 || lessonsCount >= 5) set.add('ach_grammar_10');
  if (grammarCount >= 25 || lessonsCount >= 12) set.add('ach_grammar_25');
  if (grammarCount >= 50 || lessonsCount >= 25) set.add('ach_grammar_50');
  if (grammarCount >= 40 || lessonsCount >= 20) set.add('ach_grammar_n5_full');
  if (grammarCount >= 80 || lessonsCount >= 40) set.add('ach_grammar_n4_full');
  if (grammarCount >= 5 || lessonsCount >= 2) {
    set.add('ach_grammar_theory');
    set.add('ach_grammar_formation');
    set.add('ach_grammar_particles');
  }
  if (grammarCount >= 15) {
    set.add('ach_grammar_comparison');
    set.add('ach_grammar_order');
    set.add('ach_grammar_keigo');
    set.add('ach_shiba_return');
  }
  if (grammarCount >= 20) set.add('ach_grammar_practice_10');
  if (grammarCount >= 50) set.add('ach_grammar_practice_50');
  if (grammarCount >= 10) set.add('ach_grammar_no_mistake');

  // PRACTICE & MINI TESTS
  if (testsCount >= 1 || roadmapCurrentDay > 1) set.add('ach_quiz_start');
  if (testsCount >= 3 || roadmapCurrentDay >= 3) set.add('ach_mini_test_3');
  if (testsCount >= 7 || roadmapCurrentDay >= 7 || roadmapCompletedDays >= 7) set.add('ach_mini_test_7');
  if (testsCount >= 15 || roadmapCurrentDay >= 15 || roadmapCompletedDays >= 15) set.add('ach_mini_test_15');
  if (roadmapCurrentDay >= 30 || roadmapCompletedDays >= 30) set.add('ach_mini_test_30');
  if (roadmapCurrentDay >= 60 || roadmapCompletedDays >= 60) set.add('ach_mini_test_60');
  if (testsCount >= 1) {
    set.add('ach_exam_first');
    set.add('ach_audio_listen_1');
    set.add('ach_reading_short');
  }
  if (testsCount >= 5) {
    set.add('ach_exam_pass');
    set.add('ach_audio_listen_10');
    set.add('ach_shadowing_first');
    set.add('ach_reading_medium');
  }
  if (testsCount >= 10) {
    set.add('ach_exam_high_score');
    set.add('ach_exam_perfect');
    set.add('ach_exam_speed');
    set.add('ach_shadowing_90');
    set.add('ach_vocab_perfect');
  }

  // XP, LEVELS & LEAGUES
  if (xp >= 100) set.add('ach_small_jump');
  if (xp >= 500) set.add('ach_xp_500');
  if (xp >= 1000) set.add('ach_xp_1000');
  if (xp >= 2500) set.add('ach_xp_2500');
  if (xp >= 5000) set.add('ach_xp_5000');
  if (xp >= 10000) set.add('ach_xp_10000');

  if (level >= 5) set.add('ach_level_5');
  if (level >= 10) set.add('ach_level_10');
  if (level >= 20) set.add('ach_level_20');

  // LEAGUE
  set.add('ach_league_bronze');
  const tier = userProfile.leagueTier || 'bronze';
  if (tier === 'silver' || tier === 'gold' || tier === 'diamond' || xp >= 500) set.add('ach_league_silver');
  if (tier === 'gold' || tier === 'diamond' || xp >= 1500) set.add('ach_league_gold');
  if (tier === 'diamond' || xp >= 3500) set.add('ach_league_diamond');
  if (xp >= 800) set.add('ach_leaderboard_top3');

  // META BADGES (50 & 100)
  if (set.size >= 50) set.add('ach_badge_collector_50');
  if (set.size >= 99) set.add('ach_master_century');

  return set;
}
