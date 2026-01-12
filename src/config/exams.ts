import type { Exam, ExamCatalog } from '../types/questionBank';

export const EXAMS: Exam[] = [
  {
    id: 'dva-c02',
    code: 'DVA-C02',
    name: 'AWS Certified Developer – Associate',
    shortName: 'Developer Associate',
    description: 'Validate your ability to develop, deploy, and debug cloud-based applications using AWS.',
    category: 'associate',
    questionBankPath: '/question_bank.json',
    icon: '👨‍💻',
    color: 'orange',
  },
  // Future exams can be added here:
  // {
  //   id: 'saa-c03',
  //   code: 'SAA-C03',
  //   name: 'AWS Certified Solutions Architect – Associate',
  //   shortName: 'Solutions Architect Associate',
  //   description: 'Design and deploy scalable, highly available, and fault-tolerant systems on AWS.',
  //   category: 'associate',
  //   questionBankPath: '/question_banks/saa-c03.json',
  //   icon: '🏗️',
  //   color: 'blue',
  // },
];

export const EXAM_CATALOG: ExamCatalog = {
  exams: EXAMS,
  defaultExamId: 'dva-c02',
};

export function getExamById(id: string): Exam | undefined {
  return EXAMS.find(exam => exam.id === id);
}

export function getDefaultExam(): Exam {
  const defaultExam = getExamById(EXAM_CATALOG.defaultExamId);
  if (!defaultExam) {
    throw new Error(`Default exam with id "${EXAM_CATALOG.defaultExamId}" not found`);
  }
  return defaultExam;
}
