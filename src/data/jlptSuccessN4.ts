import { DailyExam } from '../types';
import data from './jlptSuccessN4.json';

// Nguồn: JLPT N4 Tutor (github.com/gauravhq/jlptsuccess), CC BY 4.0 / CC BY-SA 4.0. Đề AI soạn, chưa duyệt — không phải đề thật.
export const JLPTSUCCESS_N4_EXAMS = data as unknown as DailyExam[];
