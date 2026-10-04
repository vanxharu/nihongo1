const tips = [
  { ja: '今日も一緒に日本語を学ぼう！', vi: 'Hôm nay cũng cùng học tiếng Nhật nhé!' },
  { ja: '少しずつで大丈夫。自分のペースで進もう！', vi: 'Từng chút một cũng được. Hãy tiến lên theo nhịp của bạn!' },
  { ja: '間違えても大丈夫。もう一度やってみよう！', vi: 'Sai cũng không sao. Hãy thử thêm lần nữa nhé!' },
  { ja: '今日は新しい言葉を一つ覚えよう！', vi: 'Hôm nay hãy nhớ thêm một từ mới nhé!' },
  { ja: '毎日の小さな一歩が、大きな力になるよ。', vi: 'Một bước nhỏ mỗi ngày sẽ tạo nên sức mạnh lớn.' },
  { ja: '声に出して読むと、もっと覚えやすいよ！', vi: 'Đọc thành tiếng sẽ giúp bạn nhớ dễ hơn đấy!' },
  { ja: '昨日の自分より、少しだけ前へ進もう！', vi: 'Hãy tiến thêm một chút so với chính mình hôm qua!' },
  { ja: '疲れたら休もう。また一緒に頑張ろうね！', vi: 'Mệt thì nghỉ nhé. Rồi chúng ta lại cùng cố gắng!' },
  { ja: '日本語で話す楽しさを、一緒に見つけよう！', vi: 'Cùng khám phá niềm vui khi nói tiếng Nhật nhé!' },
];

/** A shuffled daily rotation: stable all day and different on consecutive days. */
export function dailyShibaTip(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Ho_Chi_Minh', year:'numeric',month:'2-digit',day:'2-digit' }).formatToParts(date);
  const part = (type: string) => Number(parts.find(p => p.type === type)!.value);
  const day = Math.floor(Date.UTC(part('year'),part('month')-1,part('day')) / 86400000);
  return tips[(day * 7 + 3) % tips.length];
}
