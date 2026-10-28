import { DailyExam } from '../types';
import success from './jlptSuccessN4.json';
import ozaq from './ozaqN4.json';

// Nguồn bên thứ ba, đều là đề tự soạn (không phải đề thật), chưa duyệt:
// - JLPT N4 Tutor (github.com/gauravhq/jlptsuccess), CC BY 4.0 / CC BY-SA 4.0
// - ozaq99/JLPT_exam, README cho phép đăng lại ("ALLOW PUBLISH ON ANOTHER WEBSITE, APP")
// - jlpt-daily (VJHOHOHO), LISENSE.txt cho phép dùng lại (đã gộp trong jlptSuccessN4.json)
export const JLPTSUCCESS_N4_EXAMS = [...(success as unknown as DailyExam[]), ...(ozaq as unknown as DailyExam[])];
