export interface ScriptLineDetail {
  speaker: string;
  speakerJa: string;
  japanese: string;
  vietnamese: string;
  furiganaHtml?: string;
}

export interface ChoukaiQuestionDetail {
  id: string;
  questionJa: string;
  questionVi: string;
  scriptLines: ScriptLineDetail[];
  optionsAnalysis: {
    index: number;
    textJa: string;
    textVi: string;
    isCorrect: boolean;
    reason: string;
  }[];
  keyPoint: string;
}

export const CHOUKAI_EXPLANATION_DATABASE: Record<string, ChoukaiQuestionDetail> = {
  'n4_nl01_c36': {
    id: 'n4_nl01_c36',
    questionJa: '男の人と女の人が話しています。男の人はこれから何をしますか。',
    questionVi: 'Người nam và người nữ đang nói chuyện. Người nam từ bây giờ sẽ làm gì?',
    scriptLines: [
      {
        speaker: 'Nữ',
        speakerJa: '女',
        japanese: '山田さん、会議の準備、手伝ってくれませんか。',
        vietnamese: 'Anh Yamada, anh có thể phụ em chuẩn bị cho cuộc họp một tay được không ạ?'
      },
      {
        speaker: 'Nam',
        speakerJa: '男',
        japanese: 'いいですよ。何をしましょうか。',
        vietnamese: 'Được chứ. Tôi cần làm gì nào?'
      },
      {
        speaker: 'Nữ',
        speakerJa: '女',
        japanese: 'じゃあ、この資料を20部コピーしてきてください。私はお茶を入れておきますから。',
        vietnamese: 'Vậy thì, anh đi photo tài liệu này 20 bản giúp em nhé. Em sẽ đi pha trà trước.'
      },
      {
        speaker: 'Nam',
        speakerJa: '男',
        japanese: 'わかりました。すぐやってきます。',
        vietnamese: 'Tôi hiểu rồi. Tôi sẽ đi làm ngay đây.'
      }
    ],
    optionsAnalysis: [
      {
        index: 0,
        textJa: 'コピーをとる',
        textVi: 'Đi photo tài liệu',
        isCorrect: true,
        reason: 'Chính xác: Người nữ nhờ anh Yamada đi photo 20 bản tài liệu (この資料を20部コピーしてきてください) và anh nam nhận lời đi làm ngay (すぐやってきます).'
      },
      {
        index: 1,
        textJa: '資料を配る',
        textVi: 'Phát tài liệu',
        isCorrect: false,
        reason: 'Sai: Chưa đến lúc phát tài liệu vì cuộc họp chưa diễn ra, người nữ chỉ bảo photo (コピー).'
      },
      {
        index: 2,
        textJa: 'お茶を入れる',
        textVi: 'Pha trà',
        isCorrect: false,
        reason: 'Sai: Người nữ nói "私はお茶を入れておきます" (chính người nữ là người sẽ đi pha trà), không phải hành động của người nam.'
      },
      {
        index: 3,
        textJa: '部屋をそうじする',
        textVi: 'Dọn dẹp phòng',
        isCorrect: false,
        reason: 'Sai: Trong đoạn hội thoại hoàn toàn không nhắc đến việc dọn phòng.'
      }
    ],
    keyPoint: 'Từ khóa quyết định:「20部コピーしてきてください」(Hãy đi photo 20 bản giúp em).'
  },

  'n4_nl01_c37': {
    id: 'n4_nl01_c37',
    questionJa: '駅でアナウンスを聞いています。東京行きの電車は何番線から出ますか。',
    questionVi: 'Đang nghe thông báo ở nhà ga. Chuyến tàu đi Tokyo sẽ xuất phát từ đường ray số mấy?',
    scriptLines: [
      {
        speaker: 'Thông báo',
        speakerJa: 'アナウンス',
        japanese: 'まもなく2番線に、10時15分発、東京行きの快速電車がまいります。',
        vietnamese: 'Chuyến tàu nhanh đi Tokyo, khởi hành lúc 10 giờ 15 phút, sắp sửa tiến vào đường ray số 2.'
      },
      {
        speaker: 'Thông báo',
        speakerJa: 'アナウンス',
        japanese: '黄色い線の内側までお下がりください。',
        vietnamese: 'Xin quý khách vui lòng lùi lại phía sau vạch màu vàng.'
      },
      {
        speaker: 'Thông báo',
        speakerJa: 'アナウンス',
        japanese: 'なお、1番線は回送電車です。',
        vietnamese: 'Xin lưu ý, tàu ở đường ray số 1 là tàu chạy không đón khách (hồi tống).'
      }
    ],
    optionsAnalysis: [
      {
        index: 0,
        textJa: '1番線',
        textVi: 'Đường ray số 1',
        isCorrect: false,
        reason: 'Sai: Thông báo nêu rõ đường ray số 1 là tàu 回送電車 (tàu về ga không đón khách).'
      },
      {
        index: 1,
        textJa: '2番線',
        textVi: 'Đường ray số 2',
        isCorrect: true,
        reason: 'Chính xác: Thông báo phát rõ: "まもなく2番線に、東京行きの快速電車がまいります" -> Tàu đi Tokyo sẽ vào đường ray số 2.'
      },
      {
        index: 2,
        textJa: '3番線',
        textVi: 'Đường ray số 3',
        isCorrect: false,
        reason: 'Sai: Không được nhắc đến trong đoạn thông báo này.'
      },
      {
        index: 3,
        textJa: '4番線',
        textVi: 'Đường ray số 4',
        isCorrect: false,
        reason: 'Sai: Không được nhắc đến trong đoạn thông báo này.'
      }
    ],
    keyPoint: 'Từ khóa quyết định:「まもなく2番線に、東京行きの快速電車がまいります」(Tàu đi Tokyo ở đường số 2).'
  },

  'n4_nl01_c38': {
    id: 'n4_nl01_c38',
    questionJa: '病院で医者と患者が話しています。患者は薬をいつ飲みますか。',
    questionVi: 'Bác sĩ và bệnh nhân đang nói chuyện ở bệnh viện. Bệnh nhân uống thuốc vào lúc nào?',
    scriptLines: [
      {
        speaker: 'Bác sĩ',
        speakerJa: '医者',
        japanese: '風邪ですね。熱を下げる薬を出しておきます。',
        vietnamese: 'Bác bị cảm rồi nhé. Tôi sẽ kê thuốc hạ sốt cho bác.'
      },
      {
        speaker: 'Bệnh nhân',
        speakerJa: '患者',
        japanese: 'はい、どのように飲めばいいですか。',
        vietnamese: 'Vâng, tôi nên uống thuốc như thế nào ạ?'
      },
      {
        speaker: 'Bác sĩ',
        speakerJa: '医者',
        japanese: '1日2回、朝ご飯と晩ご飯の後に1錠ずつ飲んでください。お昼は飲まなくていいです。',
        vietnamese: 'Một ngày 2 lần, bác uống mỗi lần 1 viên sau bữa sáng và bữa tối nhé. Buổi trưa không cần uống đâu.'
      },
      {
        speaker: 'Bệnh nhân',
        speakerJa: '患者',
        japanese: 'わかりました。',
        vietnamese: 'Tôi hiểu rồi ạ.'
      }
    ],
    optionsAnalysis: [
      {
        index: 0,
        textJa: '朝と夜の食前',
        textVi: 'Trước bữa ăn sáng và tối',
        isCorrect: false,
        reason: 'Sai: Bác sĩ dặn uống sau bữa ăn (ご飯の後), không phải trước bữa ăn (食前).'
      },
      {
        index: 1,
        textJa: '毎食後の3回',
        textVi: 'Mỗi bữa ăn 3 lần/ngày',
        isCorrect: false,
        reason: 'Sai: Bác sĩ bảo 1 ngày 2 lần (1日2回), buổi trưa không cần uống (お昼は飲まなくていい).'
      },
      {
        index: 2,
        textJa: '朝と夜の食後',
        textVi: 'Sau bữa ăn sáng và tối',
        isCorrect: true,
        reason: 'Chính xác: Lời dặn "1日2回、朝ご飯と晩ご飯の後に" nghĩa là sau bữa sáng và bữa tối (朝と夜の食後).'
      },
      {
        index: 3,
        textJa: '寝る前だけ',
        textVi: 'Chỉ trước khi đi ngủ',
        isCorrect: false,
        reason: 'Sai: Bác sĩ không dặn uống trước khi đi ngủ.'
      }
    ],
    keyPoint: 'Từ khóa quyết định:「朝ご飯と晩ご飯の後に1錠ずつ」(Mỗi lần 1 viên sau bữa sáng và bữa tối).'
  },

  'n4_nl01_c39': {
    id: 'n4_nl01_c39',
    questionJa: '留学生と先生が話しています。留学生は明日何を持ってこなければなりませんか。',
    questionVi: 'Du học sinh và thầy giáo đang nói chuyện. Ngày mai du học sinh phải mang theo những gì?',
    scriptLines: [
      {
        speaker: 'Thầy giáo',
        speakerJa: '先生',
        japanese: '明日ビザの手続きに行きますから、忘れないでパスポートを持ってきてくださいね。',
        vietnamese: 'Ngày mai chúng ta sẽ đi làm thủ tục visa, vì thế em đừng quên mang hộ chiếu theo nhé.'
      },
      {
        speaker: 'Học sinh',
        speakerJa: '学生',
        japanese: 'はい、写真も必要ですか。',
        vietnamese: 'Vâng ạ, có cần mang ảnh theo không thầy?'
      },
      {
        speaker: 'Thầy giáo',
        speakerJa: '先生',
        japanese: 'ええ、2枚必要です。お金は明日はいりません。',
        vietnamese: 'Ừ, cần 2 tấm ảnh nhé. Còn tiền thì ngày mai không cần đâu.'
      },
      {
        speaker: 'Học sinh',
        speakerJa: '学生',
        japanese: 'はい、わかりました。',
        vietnamese: 'Vâng, em đã rõ rồi ạ.'
      }
    ],
    optionsAnalysis: [
      {
        index: 0,
        textJa: 'パスポートと写真',
        textVi: 'Hộ chiếu và ảnh thẻ',
        isCorrect: true,
        reason: 'Chính xác: Thầy dặn mang hộ chiếu (パスポート) và cần thêm 2 tấm ảnh (写真2枚). Tiền thì không cần (お金はいりません).'
      },
      {
        index: 1,
        textJa: '学生証とペン',
        textVi: 'Thẻ sinh viên và bút viết',
        isCorrect: false,
        reason: 'Sai: Trong bài không nhắc đến việc phải mang thẻ sinh viên và bút.'
      },
      {
        index: 2,
        textJa: '作文と辞書',
        textVi: 'Bài văn và từ điển',
        isCorrect: false,
        reason: 'Sai: Không liên quan đến thủ tục visa.'
      },
      {
        index: 3,
        textJa: '教科書とお金',
        textVi: 'Sách giáo khoa và tiền',
        isCorrect: false,
        reason: 'Sai: Thầy dặn rõ "お金はいりません" (tiền ngày mai không cần mang).'
      }
    ],
    keyPoint: 'Từ khóa quyết định:「パスポートを持ってきてください」「写真も2枚必要です」(Mang hộ chiếu và 2 tấm ảnh).'
  },

  'n4_nl01_c40': {
    id: 'n4_nl01_c40',
    questionJa: 'デパートで案内放送を聞いています。迷子の子どもは何色の服を着ていますか。',
    questionVi: 'Đang nghe loa phát thanh ở trung tâm thương mại. Đứa trẻ đi lạc đang mặc quần áo màu gì?',
    scriptLines: [
      {
        speaker: 'Phát thanh',
        speakerJa: 'アナウンス',
        japanese: 'お客様にお知らせいたします。4階のおもちゃ売り場にて、5歳の男の子がお連れ様をお待ちです。',
        vietnamese: 'Xin trân trọng thông báo tới quý khách hàng. Tại quầy đồ chơi tầng 4, một bé trai 5 tuổi đang chờ người nhà đến đón.'
      },
      {
        speaker: 'Phát thanh',
        speakerJa: 'アナウンス',
        japanese: '青いシャツに黒いズボンをはいています。',
        vietnamese: 'Cháu bé đang mặc áo sơ mi màu xanh dương và quần dài màu đen.'
      }
    ],
    optionsAnalysis: [
      {
        index: 0,
        textJa: '赤い服',
        textVi: 'Quần áo màu đỏ',
        isCorrect: false,
        reason: 'Sai: Không có màu đỏ.'
      },
      {
        index: 1,
        textJa: '青い服',
        textVi: 'Quần áo màu xanh dương',
        isCorrect: true,
        reason: 'Chính xác: Loa thông báo: "青いシャツに黒いズボン" (áo sơ mi xanh dương, quần đen) -> Áo màu xanh dương (青い服).'
      },
      {
        index: 2,
        textJa: '黄色い服',
        textVi: 'Quần áo màu vàng',
        isCorrect: false,
        reason: 'Sai: Không có màu vàng.'
      },
      {
        index: 3,
        textJa: '白い服',
        textVi: 'Quần áo màu trắng',
        isCorrect: false,
        reason: 'Sai: Không có màu trắng.'
      }
    ],
    keyPoint: 'Từ khóa quyết định:「青いシャツに黒いズボン」(Áo sơ mi xanh dương, quần đen).'
  }
};

export function getChoukaiDetail(questionId: string): ChoukaiQuestionDetail | undefined {
  return CHOUKAI_EXPLANATION_DATABASE[questionId];
}
