import { z } from 'zod';

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, '아이디는 3자 이상이어야 합니다.')
    .regex(/^[a-zA-Z0-9_]+$/, '영문, 숫자, 밑줄만 사용할 수 있습니다.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
  phoneNumber: z.string().min(8, '전화번호를 다시 확인해주세요.'),
});

export const loginSchema = z.object({
  username: z.string().min(1, '아이디를 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

export const profileUpdateSchema = z.object({
  displayName: z.string().max(60).optional(),
  bio: z.string().max(280).optional(),
  avatarUrl: z.string().url('올바른 URL이 아닙니다.').optional().or(z.literal('')),
  isFriendOnlyForMeetingRequests: z.boolean().optional(),
});

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, '댓글을 입력해주세요.')
    .max(240, '댓글은 240자까지 입력 가능합니다.'),
});

export const meetingProposalSchema = z.object({
  message: z.string().max(200).optional(),
});






