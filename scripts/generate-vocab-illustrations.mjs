import fs from 'node:fs/promises';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const iconTags = require('lucide-static/tags.json');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const iconDirectory = path.join(root, 'node_modules/lucide-static/icons');
const availableIcons = new Set(
  readdirSync(iconDirectory).filter(name => name.endsWith('.svg')).map(name => name.slice(0, -4)),
);
const iconBodyCache = new Map();
const readIconBody = iconName => {
  if (iconBodyCache.has(iconName)) return iconBodyCache.get(iconName);
  if (!availableIcons.has(iconName)) return null;
  const svg = readFileSync(path.join(iconDirectory, `${iconName}.svg`), 'utf8');
  const body = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '').trim();
  iconBodyCache.set(iconName, body);
  return body;
};
const outputDirectory = path.join(root, 'public/vocabulary-illustrations/n4');
const reportPath = path.join(root, 'scripts/vocab-illustration-map.json');
const vocabularyPath = path.join(root, 'src/data/tangoN4Vocab.ts');

const args = process.argv.slice(2);
const hasFlag = name => args.includes(name);
const optionValue = name => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
};

const dryRun = hasFlag('--dry-run');
const limit = Number(optionValue('--limit') || 0) || Infinity;
const requestedIds = optionValue('--ids')?.split(',').map(value => value.trim()).filter(Boolean) || null;

/** Words that should map to a specific icon when tags alone are ambiguous. */
const overrides = {
  salary: 'banknote', wages: 'banknote', bonus: 'gift', savings: 'piggy-bank',
  reception: 'concierge-bell', 'business card': 'contact', meeting: 'users',
  schedule: 'calendar-clock', plan: 'clipboard-list', promise: 'handshake',
  rule: 'scroll-text', accident: 'triangle-alert', traffic: 'traffic-cone',
  'traffic jam': 'car-front', station: 'train-front', train: 'train-front',
  bus: 'bus-front', 'bus stop': 'bus-front', airport: 'plane', flight: 'plane',
  'police officer': 'shield', 'police station': 'shield', 'post office': 'mail',
  'city hall': 'landmark', 'town hall': 'landmark', hospital: 'hospital',
  'convenience store': 'store', 'department store': 'store', supermarket: 'shopping-cart',
  restaurant: 'utensils', 'coffee shop': 'coffee', 'coffee': 'coffee',
  'hotel': 'bed-double', 'inn': 'bed-double', 'ryokan': 'bed-double',
  'resort': 'palmtree', 'beach': 'waves', 'sea': 'waves', 'mountain': 'mountain',
  'river': 'waves', 'park': 'trees', 'garden': 'flower-2', 'forest': 'trees',
  'weather': 'cloud-sun', 'rain': 'cloud-rain', 'snow': 'snowflake', 'wind': 'wind',
  'typhoon': 'tornado', 'earthquake': 'activity', 'fire': 'flame', 'light': 'lightbulb',
  'electricity': 'zap', 'water': 'droplets', 'gas': 'fuel', 'gasoline': 'fuel',
  'breakfast': 'egg-fried', 'lunch': 'utensils', 'dinner': 'utensils',
  'meal': 'utensils', 'food': 'utensils', 'rice': 'wheat', 'bread': 'croissant',
  'meat': 'beef', 'fish': 'fish', 'vegetable': 'carrot', 'fruit': 'apple',
  'tea': 'cup-soda', 'coffee': 'coffee', 'milk': 'milk', 'beer': 'beer',
  'sake': 'wine', 'wine': 'wine', 'sugar': 'candy', 'salt': 'flask-round',
  'sauce': 'flask-round', 'soy sauce': 'flask-round', 'soup': 'soup',
  'cake': 'cake-slice', 'sweets': 'candy', 'snack': 'cookie',
  'clothes': 'shirt', 'shirt': 'shirt', 'shoes': 'footprints', 'hat': 'hard-hat',
  'bag': 'briefcase', 'umbrella': 'umbrella', 'glasses': 'glasses',
  'watch': 'watch', 'clock': 'clock', 'time': 'clock', 'hour': 'clock',
  'money': 'banknote', 'price': 'tag', 'cheap': 'tag', 'expensive': 'tag',
  'receipt': 'receipt', 'change': 'coins', 'wallet': 'wallet', 'tax': 'percent',
  'work': 'briefcase', 'office': 'building-2', 'company': 'building-2',
  'job': 'briefcase', 'business': 'briefcase', 'meeting': 'users',
  'president': 'user-round', 'boss': 'user-round', 'manager': 'user-round',
  'senior': 'user-round', 'colleague': 'users', 'friend': 'users',
  'family': 'users', 'child': 'baby', 'baby': 'baby', 'person': 'user-round',
  'man': 'user-round', 'woman': 'user-round', 'teacher': 'graduation-cap',
  'student': 'graduation-cap', 'doctor': 'stethoscope', 'nurse': 'stethoscope',
  'police': 'shield', 'driver': 'car-front', 'guest': 'users', 'customer': 'users',
  'head': 'user-round', 'face': 'smile', 'eyes': 'eye', 'ear': 'ear',
  'hand': 'hand', 'finger': 'hand', 'foot': 'footprints', 'leg': 'footprints',
  'stomach': 'activity', 'teeth': 'activity', 'throat': 'activity',
  'hair': 'scissors', 'weight': 'scale', 'height': 'ruler', 'fever': 'thermometer',
  'medicine': 'pill', 'hospital': 'hospital', 'injury': 'bandage',
  'tired': 'battery-low', 'sleepy': 'moon', 'sleep': 'moon', 'dream': 'moon',
  'happy': 'smile', 'angry': 'angry', 'sad': 'frown', 'worried': 'frown',
  'surprised': 'smile-plus', 'afraid': 'ghost', 'glad': 'smile',
  'love': 'heart', 'like': 'heart', 'hate': 'heart-crack',
  'study': 'book-open', 'learn': 'book-open', 'teach': 'graduation-cap',
  'book': 'book', 'read': 'book-open', 'write': 'pencil', 'letter': 'mail',
  'paper': 'file-text', 'dictionary': 'book-a', 'word': 'book-a',
  'homework': 'notebook-pen', 'exam': 'clipboard-check', 'test': 'clipboard-check',
  'question': 'circle-help', 'answer': 'check', 'example': 'list',
  'language': 'languages', 'japanese': 'languages', 'english': 'languages',
  'translate': 'languages', 'meaning': 'book-a', 'grammar': 'book-a',
  'computer': 'laptop', 'phone': 'smartphone', 'television': 'tv',
  'camera': 'camera', 'radio': 'radio', 'music': 'music', 'movie': 'clapperboard',
  'picture': 'image', 'photograph': 'camera', 'game': 'gamepad-2',
  'internet': 'wifi', 'email': 'mail', 'website': 'globe',
  'key': 'key', 'door': 'door-open', 'window': 'app-window', 'room': 'door-open',
  'house': 'house', 'home': 'house', 'apartment': 'building', 'building': 'building-2',
  'kitchen': 'cooking-pot', 'bath': 'bath', 'toilet': 'toilet', 'bed': 'bed-double',
  'table': 'table', 'chair': 'armchair', 'desk': 'table', 'shelf': 'library',
  'garden': 'flower-2', 'tree': 'trees', 'flower': 'flower-2',
  'dog': 'dog', 'cat': 'cat', 'bird': 'bird', 'fish': 'fish', 'insect': 'bug',
  'animal': 'paw-print', 'pet': 'paw-print', 'horse': 'rabbit', 'rabbit': 'rabbit',
  'car': 'car-front', 'taxi': 'car-taxi-front', 'bicycle': 'bike', 'bike': 'bike',
  'motorcycle': 'bike', 'ship': 'ship', 'boat': 'ship', 'airplane': 'plane',
  'road': 'route', 'street': 'route', 'map': 'map', 'direction': 'compass',
  'left': 'arrow-left', 'right': 'arrow-right', 'up': 'arrow-up', 'down': 'arrow-down',
  'front': 'arrow-up', 'back': 'arrow-down', 'inside': 'arrow-right',
  'outside': 'arrow-left', 'near': 'map-pin', 'far': 'map-pin-off',
  'place': 'map-pin', 'corner': 'corner-down-right', 'middle': 'align-center',
  'between': 'align-horizontal-space-between', 'side': 'align-horizontal-justify-start',
  'start': 'play', 'begin': 'play', 'finish': 'flag', 'end': 'flag',
  'stop': 'square', 'continue': 'redo', 'return': 'undo', 'go': 'move-right',
  'come': 'move-left', 'walk': 'footprints', 'run': 'person-standing',
  'swim': 'waves', 'fly': 'plane', 'drive': 'car-front', 'ride': 'bike',
  'eat': 'utensils', 'drink': 'cup-soda', 'cook': 'cooking-pot', 'make': 'hammer',
  'buy': 'shopping-cart', 'sell': 'shopping-bag', 'pay': 'credit-card',
  'borrow': 'hand-coins', 'lend': 'hand-coins', 'give': 'hand-heart',
  'receive': 'inbox', 'send': 'send', 'bring': 'package', 'carry': 'package',
  'take': 'hand', 'hold': 'hand', 'put': 'package-open', 'place': 'map-pin',
  'open': 'lock-open', 'close': 'lock', 'push': 'arrow-right', 'pull': 'arrow-left',
  'throw': 'trash-2', 'drop': 'droplets', 'fall': 'trending-down',
  'cut': 'scissors', 'break': 'triangle-alert', 'fix': 'wrench', 'repair': 'wrench',
  'clean': 'sparkles', 'wash': 'shower-head', 'dry': 'wind', 'wear': 'shirt',
  'change': 'refresh-cw', 'turn': 'rotate-cw', 'move': 'move',
  'wait': 'hourglass', 'hurry': 'timer', 'late': 'alarm-clock', 'early': 'sunrise',
  'morning': 'sunrise', 'noon': 'sun', 'afternoon': 'sun', 'evening': 'sunset',
  'night': 'moon', 'today': 'calendar', 'tomorrow': 'calendar-plus',
  'yesterday': 'calendar-minus', 'week': 'calendar-days', 'month': 'calendar',
  'year': 'calendar', 'day': 'calendar', 'date': 'calendar-days',
  'spring': 'flower-2', 'summer': 'sun', 'autumn': 'leaf', 'winter': 'snowflake',
  'season': 'calendar-range', 'weekend': 'calendar-heart',
  'beginning': 'play', 'first': 'award', 'last': 'flag', 'next': 'skip-forward',
  'before': 'arrow-left', 'after': 'arrow-right', 'during': 'timer',
  'always': 'infinity', 'often': 'repeat', 'sometimes': 'shuffle', 'never': 'ban',
  'again': 'rotate-ccw', 'still': 'hourglass', 'already': 'check-check',
  'soon': 'timer', 'immediately': 'zap', 'gradually': 'trending-up',
  'suddenly': 'zap', 'slowly': 'snail', 'quickly': 'rabbit', 'together': 'users',
  'alone': 'user-round', 'everyone': 'users', 'someone': 'user-round',
  'nothing': 'circle-slash', 'something': 'box', 'everything': 'boxes',
  'big': 'maximize', 'small': 'minimize', 'long': 'move-horizontal',
  'short': 'move-vertical', 'tall': 'move-vertical', 'wide': 'move-horizontal',
  'thick': 'rectangle-horizontal', 'thin': 'minus', 'heavy': 'weight',
  'hot': 'thermometer-sun', 'cold': 'thermometer-snowflake',
  'warm': 'sun', 'cool': 'snowflake', 'new': 'sparkles', 'old': 'history',
  'good': 'thumbs-up', 'bad': 'thumbs-down', 'beautiful': 'sparkles',
  'clean': 'sparkles', 'dirty': 'trash-2', 'easy': 'smile', 'difficult': 'mountain',
  'important': 'star', 'famous': 'star', 'free': 'gift', 'busy': 'timer',
  'dangerous': 'triangle-alert', 'safe': 'shield-check', 'correct': 'check',
  'wrong': 'x', 'same': 'equal', 'different': 'git-compare',
  'enough': 'check-check', 'many': 'boxes', 'few': 'box', 'all': 'boxes',
  'some': 'box', 'more': 'plus', 'less': 'minus', 'half': 'pie-chart',
  'number': 'hash', 'count': 'calculator', 'increase': 'trending-up',
  'decrease': 'trending-down', 'grow': 'sprout', 'lose': 'trending-down',
  'win': 'trophy', 'success': 'trophy', 'fail': 'circle-x', 'try': 'target',
  'help': 'life-buoy', 'support': 'hand-heart', 'thank': 'heart-handshake',
  'apologize': 'hand-heart', 'greet': 'hand', 'meet': 'handshake',
  'invite': 'mail-plus', 'visit': 'map-pin', 'travel': 'plane', 'trip': 'luggage',
  'souvenir': 'gift', 'present': 'gift', 'gift': 'gift', 'party': 'party-popper',
  'wedding': 'heart', 'funeral': 'flower', 'ceremony': 'award',
  'news': 'newspaper', 'newspaper': 'newspaper', 'report': 'file-text',
  'document': 'file-text', 'form': 'clipboard-list', 'card': 'credit-card',
  'ticket': 'ticket', 'passport': 'book-user', 'license': 'id-card',
  'signature': 'pen-line', 'stamp': 'stamp', 'envelope': 'mail',
};

/** Second pass for domain vocabulary that Lucide tags do not cover directly. */
Object.assign(overrides, {
  'sales': 'chart-no-axes-combined', 'greeting': 'hand-heart',
  'opinion': 'message-square-quote', 'decided': 'check-check', 'decide': 'check-check',
  'decision': 'check-check', 'translation': 'languages', 'interpreting': 'languages',
  'interpret': 'languages', 'method': 'workflow', 'way of doing something': 'workflow',
  'get used to': 'repeat', 'go well': 'thumbs-up', 'working overtime': 'clock-plus',
  'overtime': 'clock-plus', 'impossible': 'circle-slash', 'civil servant': 'landmark',
  'lawyer': 'scale', 'guidebook': 'book-open', 'timetable': 'calendar-clock',
  'overseas': 'globe', 'scenery': 'image', 'fireworks': 'sparkles', 'apply': 'clipboard-plus',
  'reservation': 'calendar-check', 'preparations': 'list-checks', 'departing': 'plane-takeoff',
  'departure': 'plane-takeoff', 'stay': 'bed-double', 'spend': 'hourglass',
  'experience': 'award', 'postcard': 'mail', 'drunk': 'wine', 'get drunk': 'wine',
  'bitter': 'coffee', 'amount': 'scale', 'portion': 'scale', 'leave': 'log-out',
  'remain': 'archive', 'left over': 'archive', 'lid': 'circle', 'plate': 'circle',
  'cooked': 'flame', 'baked': 'flame', 'kettle': 'coffee', 'boil': 'flame',
  'chill': 'snowflake', 'throw away': 'trash', 'bargain': 'tag', 'register': 'calculator',
  'calculation': 'calculator', 'look for': 'search', 'sell well': 'shopping-bag',
  'japanese-made': 'badge-check', 'shrine': 'landmark', 'parking lot': 'square-parking',
  'basement': 'arrow-down-to-line', 'countryside': 'trees', 'suburbs': 'house',
  'dialect': 'languages', 'ask': 'message-circle-question-mark', 'blue sky': 'cloud-sun',
  'thunder': 'cloud-lightning', 'raincoat': 'umbrella', 'tsunami': 'waves-horizontal',
  'sky': 'cloud', 'atmosphere': 'wind', 'woods': 'trees', 'pond': 'waves-horizontal',
  'express': 'train-front', 'usage': 'mouse-pointer-click', 'crowded': 'users',
  'adult': 'user-round', 'operation': 'settings', 'get into an accident': 'triangle-alert',
  'bound': 'arrow-right', 'on the way to': 'route', 'kilometer': 'route',
  'population': 'users', 'hundred million': 'hash', 'trade': 'ship',
  'exporting': 'package', 'importing': 'truck', 'politics': 'landmark',
  'prime minister': 'user-round', 'culture': 'landmark', 'century': 'calendar',
  'international': 'globe', 'get to know': 'handshake', 'introduction': 'user-plus',
  'go well with': 'puzzle', 'consultation': 'messages-square', 'opposition': 'thumbs-down',
  'thanks': 'hand-heart', 'appreciation': 'heart', 'gratitude': 'heart-handshake',
  'restraint': 'hand', 'declining': 'hand', 'they': 'users', 'popular': 'star',
  'engagement': 'heart', 'lie': 'message-square-warning', 'obstacle': 'construction',
  'hindrance': 'construction', 'he': 'user-round', 'him': 'user-round',
  'boyfriend': 'user-round', 'her': 'user-round', 'she': 'user-round',
  'girlfriend': 'user-round', 'you': 'user-round', 'me': 'user-round',
  'relationship': 'heart-handshake', 'trouble': 'circle-alert',
  'forgotten item': 'package', 'missing': 'search-x', 'gone': 'search-x',
  'torn': 'scissors', 'thief': 'user-x', 'burglar': 'user-x', 'steal': 'hand-coins',
  'touch': 'hand', 'reason': 'circle-question-mark', 'cause': 'git-branch',
  'origin': 'git-branch', '110': 'phone-call', 'dislikable': 'thumbs-down',
  'manga': 'image', 'anime': 'image', 'illustration': 'image', 'dance': 'music',
  'contest': 'trophy', 'jogging': 'footprints', 'stretch': 'move',
  'cheering': 'megaphone', 'judo': 'medal', 'baseball': 'medal',
  'forehead': 'scan-face', 'chin': 'scan-face', 'jaw': 'scan-face',
  'facial hair': 'scan-face', 'lip': 'scan-face', 'neck': 'person-standing',
  'shoulder': 'person-standing', 'elbow': 'person-standing', 'knee': 'person-standing',
  'butt': 'person-standing', 'nail': 'hand', 'careful': 'shield-check',
  'get thirsty': 'cup-soda', 'condition': 'activity', 'feeling sick': 'thermometer',
  'examine': 'stethoscope', 'heal': 'heart-pulse', 'recover': 'heart-pulse',
  'hospitalization': 'hospital', 'kimono': 'shirt', 'sock': 'footprints',
  'underwear': 'shirt', 'glove': 'hand', 'sandals': 'footprints',
  'backpack': 'luggage', 'hairstyle': 'scissors', 'hair salon': 'scissors',
  'cute': 'heart', 'within': 'arrow-down-to-line', 'under': 'arrow-down-to-line',
  'both': 'git-compare', 'polite': 'hand-heart', 'courteous': 'hand-heart',
  'strange': 'circle-question-mark', 'sufficient': 'check-check',
  'satisfactory': 'check-check', 'skillful': 'star', 'scary': 'ghost',
  'fearful': 'ghost', 'amazing': 'sparkles', 'dreadful': 'triangle-alert',
  'magnificent': 'star', 'terrible': 'triangle-alert', 'shallow': 'move-down',
  'deep': 'move-up', 'rare': 'gem', 'uncommon': 'gem', 'changed': 'refresh-cw',
  'audible': 'ear', 'vacant': 'door-open', 'undone': 'unlink', 'keyword': 'key',
  'continued': 'arrow-right', 'keep': 'handshake', 'keep a promise': 'handshake',
  'explanation': 'message-square', 'participation': 'users', 'pray': 'sparkles',
  'lonely': 'user-round', 'cry': 'face-slightly-frowning', 'weep': 'face-slightly-frowning',
  'worry': 'circle-alert', 'unease': 'circle-alert', 'worrisome': 'circle-alert',
  'uneasy': 'circle-alert', 'boring': 'face-neutral', 'not interesting': 'face-neutral',
  'nervousness': 'activity', 'embarrassing': 'smile', 'shameful': 'smile',
  'get angry': 'face-angry', 'mood': 'smile', 'feeling': 'heart-pulse',
  'stress': 'zap', 'homesick': 'house', 'absolutely': 'check-check',
  'surely': 'check-check', 'certainly': 'check-check', 'be sure to': 'check-check',
  'tightly': 'grip', 'firmly': 'grip', 'strongly': 'grip', 'neatly': 'list-checks',
  'accurately': 'list-checks', 'properly': 'list-checks',
  'as much as possible': 'maximize', 'clearly': 'eye', 'fairly': 'equal',
  'quite': 'equal', 'rather': 'equal', 'largely': 'trending-up',
  'mostly': 'chart-no-axes-combined', 'usually': 'repeat', 'occasionally': 'shuffle',
  'at all': 'ban', 'not at all': 'ban', 'completely': 'check-check',
  'hardly': 'minus', 'not even a little': 'minus', 'finally': 'flag',
  'ultimately': 'flag', 'somehow': 'circle-question-mark',
  'seemingly': 'circle-question-mark', 'for example': 'list', 'direct': 'arrow-right',
  'especially': 'star', 'steadily': 'trending-up', 'rapidly': 'trending-up',
  'i see': 'lightbulb', 'as expected': 'check', 'how': 'circle-question-mark',
  'therefore': 'arrow-right', 'then': 'arrow-right', 'so': 'arrow-right',
  'also': 'plus', 'or': 'git-branch', 'besides': 'plus', 'however': 'git-branch',
  'but': 'git-branch', 'by the way': 'message-circle', 'if so': 'git-branch',
  'in such case': 'git-branch', 'just like that': 'copy', 'as is': 'copy',
  'the impossible': 'circle-slash', 'really': 'circle-question-mark',
  'file': 'file-text', 'input': 'text-cursor-input', 'permission': 'key-round',
  'request': 'message-circle-question-mark', 'ask for': 'message-circle-question-mark',
  'business trip': 'luggage', 'main office': 'building-2', 'software': 'folder-code',
  'technology': 'cpu', 'translation software': 'languages',
  'thanks to': 'hand-heart', 'take with': 'users', 'in trouble': 'circle-alert',
  'have trouble with': 'circle-alert', 'go missing': 'search-x',
  'get dirty': 'trash', 'make dirty': 'trash', 'come undone': 'unlink',
});

const stopwords = new Set(('a an the to of in on at for with and or but not no yes is are was were be been being ' +
  'do does did doing have has had having it its this that these those there here as by from into onto about over under ' +
  'again very too also just only even still already something someone nothing anything everything thing things one ones ' +
  'you your yours we our ours they their theirs he she his her him them i me my mine who whom which what when where why how ' +
  'some any many much more most less least few little other another such own same so than then thus can could may might ' +
  'will would shall should must ought used use using get got gotten make made making take taken taking give given giving ' +
  'go going went gone come coming came put putting keep kept let lets let\'s say says said tell told think thought know knew known ' +
  'want wanted need needed like liked look looked see seen saw feel felt become became leave left start started begin began ' +
  'seem seemed become becomes try tried use used something somebody someone somewhere anytime anyplace').split(/\s+/));

const partOfSpeechFallbacks = [
  { match: '動', icon: 'activity' },
  { match: '形容', icon: 'sparkles' },
  { match: '副', icon: 'move-right' },
  { match: '名', icon: 'box' },
];

const normalizeTokens = text => String(text || '')
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^a-z0-9\s-]/g, ' ')
  .split(/[\s-]+/)
  .map(token => token.trim())
  .filter(token => token.length >= 2 && !stopwords.has(token));

const tagIndex = new Map();
for (const [name, tags] of Object.entries(iconTags)) {
  for (const tag of tags) {
    const key = tag.toLowerCase();
    if (!tagIndex.has(key)) tagIndex.set(key, []);
    tagIndex.get(key).push(name);
  }
}

const iconNameWords = new Map();
for (const name of availableIcons) {
  iconNameWords.set(name, name.split('-'));
}

const overrideTokens = new Map();
for (const [phrase, icon] of Object.entries(overrides)) {
  const key = phrase.toLowerCase();
  if (!overrideTokens.has(key)) overrideTokens.set(key, icon);
}

const phraseList = [...overrideTokens.keys()].sort((left, right) => right.length - left.length);

/** Icons that read well in a small square card; used only to break ties. */
const preferredIcons = new Set(('book-open book utensils coffee cup-soda clock calendar calendar-days house building-2 ' +
  'user-round users briefcase banknote credit-card shopping-cart shopping-bag car-front train-front bus-front plane ship ' +
  'bike map-pin map sun moon cloud-sun cloud-rain snowflake thermometer thermometer-sun thermometer-snowflake ' +
  'heart hand-heart smile frown angry laugh sparkles star award trophy gift package box boxes file-text newspaper ' +
  'laptop smartphone camera tv music clapperboard image gamepad-2 wifi mail globe key door-open bed-double table ' +
  'armchair library trees flower-2 dog cat bird fish bug paw-print carrot apple beef croissant cake-slice candy ' +
  'cookie egg-fried soup flask-round wheat milk beer wine shirt footprints umbrella glasses watch scissors scale ' +
  'ruler pill bandage stethoscope graduation-cap notebook-pen pencil mail-plus send inbox check x triangle-alert ' +
  'life-buoy handshake move-right move-left arrow-right arrow-left arrow-up arrow-down refresh-cw rotate-cw play ' +
  'flag timer hourglass alarm-clock sunrise sunset activity trending-up trending-down plus minus hash calculator ' +
  'languages clipboard-list clipboard-check receipt tag coins wallet percent route compass luggage ticket id-card').split(/\s+/));

const normalizeSense = text => String(text || '')
  .toLowerCase()
  .replace(/\([^)]*\)/g, ' ')
  .replace(/^to\s+/, '')
  .replace(/^(be|being|a|an|the)\s+/, '')
  .replace(/[^a-z0-9\s-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const pickIcon = word => {
  const meaning = String(word.englishMeaning || '').toLowerCase();
  const example = String(word.englishExampleTranslation || '').toLowerCase();
  const cleanedMeaning = meaning.replace(/\([^)]*\)/g, ' ');

  // Whole-sense overrides are the most reliable signal; never read the example sentence here.
  const senses = new Set();
  for (const part of [cleanedMeaning, ...cleanedMeaning.split(/[,;|/]|\bor\b/)]) {
    const sense = normalizeSense(part);
    if (sense) senses.add(sense);
  }
  for (const sense of senses) {
    if (overrideTokens.has(sense)) return { icon: overrideTokens.get(sense), reason: `override:${sense}` };
  }

  // Multi-word phrases may appear inside a longer meaning, e.g. "working overtime".
  for (const phrase of phraseList) {
    if (!phrase.includes(' ')) continue;
    if (new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(cleanedMeaning)) {
      return { icon: overrideTokens.get(phrase), reason: `override:${phrase}` };
    }
  }

  const meaningTokens = new Set(normalizeTokens(cleanedMeaning));
  const exampleTokens = new Set(normalizeTokens(example));
  const scores = new Map();

  const addScore = (icon, amount) => scores.set(icon, (scores.get(icon) || 0) + amount);

  for (const token of meaningTokens) {
    for (const icon of tagIndex.get(token) || []) {
      const tagPosition = iconTags[icon].findIndex(tag => tag.toLowerCase() === token);
      addScore(icon, tagPosition === 0 ? 3.5 : tagPosition < 3 ? 3 : 2.5);
    }
    for (const [name, parts] of iconNameWords) {
      if (parts.includes(token)) addScore(name, 2);
    }
  }
  for (const token of exampleTokens) {
    if (meaningTokens.has(token)) continue;
    for (const icon of tagIndex.get(token) || []) addScore(icon, 0.6);
    for (const [name, parts] of iconNameWords) {
      if (parts.includes(token)) addScore(name, 0.4);
    }
  }
  for (const icon of scores.keys()) {
    if (preferredIcons.has(icon)) addScore(icon, 0.5);
  }

  let best = null;
  let bestScore = 0;
  for (const [icon, score] of scores) {
    if (score > bestScore || (score === bestScore && best && icon.length < best.length)) {
      best = icon;
      bestScore = score;
    }
  }

  if (best && bestScore >= 2.5) return { icon: best, reason: `score:${bestScore.toFixed(1)}` };

  const partOfSpeech = String(word.partOfSpeech || '');
  const fallback = partOfSpeechFallbacks.find(entry => partOfSpeech.includes(entry.match));
  return { icon: fallback?.icon || 'book-open', reason: 'fallback' };
};

const buildSvg = iconName => {
  const body = readIconBody(iconName) || readIconBody('book-open');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="288" height="288" viewBox="0 0 288 288">
  <rect width="288" height="288" fill="#ffffff" />
  <circle cx="144" cy="144" r="86" fill="#f5f5f4" />
  <g transform="translate(72 72) scale(6)" fill="none" stroke="#3f3f46" stroke-width="0.62" stroke-linecap="round" stroke-linejoin="round">${body}</g>
</svg>`;
};

const vocabularySource = await fs.readFile(vocabularyPath, 'utf8');
const words = JSON.parse(vocabularySource.slice(vocabularySource.indexOf('= [') + 2, vocabularySource.lastIndexOf(']') + 1));

await fs.mkdir(outputDirectory, { recursive: true });
const existingFiles = new Set(await fs.readdir(outputDirectory));
const isPresent = word => existingFiles.has(`${word.id}.webp`)
  || [...existingFiles].some(name => name.startsWith(`${word.id}-v`) && name.endsWith('.webp'));

let missing = words.filter(word => !isPresent(word));
if (requestedIds) {
  const wanted = new Set(requestedIds);
  missing = missing.filter(word => wanted.has(word.id));
}
missing = missing.slice(0, limit);

if (!missing.length) {
  console.log('All vocabulary items already have an illustration.');
  process.exit(0);
}

console.log(`Generating ${missing.length} illustration(s)${dryRun ? ' (dry run)' : ''}...`);

const report = [];
let generated = 0;

for (const word of missing) {
  const selection = pickIcon(word);
  report.push({
    id: word.id,
    word: word.kanji || word.hiragana,
    meaning: word.englishMeaning,
    example: word.englishExampleTranslation,
    icon: selection.icon,
    reason: selection.reason,
  });

  if (!dryRun) {
    const svg = buildSvg(selection.icon);
    const webp = await sharp(Buffer.from(svg)).webp({ quality: 84 }).toBuffer();
    await fs.writeFile(path.join(outputDirectory, `${word.id}.webp`), webp);
    generated += 1;
    if (generated % 50 === 0) console.log(`  ${generated}/${missing.length}`);
  }
}

await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');

const counts = report.reduce((accumulator, entry) => {
  const key = entry.reason.startsWith('fallback') ? 'fallback' : entry.reason.startsWith('override') ? 'override' : 'tag-match';
  accumulator[key] = (accumulator[key] || 0) + 1;
  return accumulator;
}, {});

console.log(`Done: ${generated} image(s) written.`);
console.log(`Selection sources: ${JSON.stringify(counts)}`);
console.log(`Mapping report: ${path.relative(root, reportPath)}`);

if (!dryRun && !hasFlag('--no-index')) {
  await import('./build-vocab-illustration-index.mjs');
}
