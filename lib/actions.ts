'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { prisma } from './prisma';
import {
  signupSchema,
  loginSchema,
  commentSchema,
  meetingProposalSchema,
  profileUpdateSchema,
} from './validators';
import {
  AVAILABILITY_STATUS,
  FRIENDSHIP_STATUS,
  MESSAGE_TYPE,
  PHONE_VERIFICATION_CODE,
  PROPOSAL_STATUS,
} from './constants';
import { createSession, destroySession, getCurrentUser } from './auth';
import { ensureDate, formatDateKey } from './date';

export type ActionState = {
  error?: string;
  success?: string;
};

const pendingCookieKey = 'pending_verification_user';

export const signupAction = async (_: ActionState, formData: FormData): Promise<ActionState> => {
  const parsed = signupSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
    phoneNumber: formData.get('phoneNumber'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { username, password, phoneNumber } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { error: '이미 사용 중인 아이디입니다.' };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      phoneNumber,
    },
  });

  cookies().set(pendingCookieKey, user.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });

  redirect('/auth/verify-phone');
};

export const verifyPhoneAction = async (_: ActionState, formData: FormData): Promise<ActionState> => {
  const token = cookies().get(pendingCookieKey)?.value;
  if (!token) {
    return { error: '검증 대상 사용자를 찾을 수 없습니다.' };
  }

  const code = formData.get('code');
  if (code !== PHONE_VERIFICATION_CODE) {
    return { error: '인증 코드가 올바르지 않습니다.' };
  }

  const user = await prisma.user.update({
    where: { id: token },
    data: { isPhoneVerified: true },
  });

  cookies().delete(pendingCookieKey);
  await createSession(user.id);
  redirect('/feed');
};

export const loginAction = async (_: ActionState, formData: FormData): Promise<ActionState> => {
  const parsed = loginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { username, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return { error: '아이디 혹은 비밀번호가 올바르지 않습니다.' };
  }

  if (!user.isPhoneVerified) {
    return { error: '휴대폰 인증 후 로그인할 수 있습니다.' };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return { error: '아이디 혹은 비밀번호가 올바르지 않습니다.' };
  }

  await createSession(user.id);
  redirect('/feed');
};

export const logoutAction = async () => {
  await destroySession();
  redirect('/');
};

export const updateProfileAction = async (formData: FormData) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const parsed = profileUpdateSchema.safeParse({
    displayName: formData.get('displayName') || undefined,
    bio: formData.get('bio') || undefined,
    avatarUrl: formData.get('avatarUrl') || undefined,
    isFriendOnlyForMeetingRequests: formData.get('isFriendOnlyForMeetingRequests') === 'on',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  await prisma.user.update({
    where: { id: user.id },
    data: {
      displayName: data.displayName ?? null,
      bio: data.bio ?? null,
      avatarUrl: data.avatarUrl || null,
      isFriendOnlyForMeetingRequests: !!data.isFriendOnlyForMeetingRequests,
    },
  });

  revalidatePath('/settings/profile');
  revalidatePath(`/profile/${user.username}`);
  return { success: '프로필이 업데이트되었습니다.' };
};

const ensureOwner = async (username: string) => {
  const user = await getCurrentUser();
  if (!user || user.username !== username) {
    throw new Error('권한이 없습니다.');
  }
  return user;
};

export const upsertDayEntryAction = async (formData: FormData) => {
  const username = String(formData.get('username') ?? '');
  const status = String(formData.get('status') ?? '');
  const note = (formData.get('personalNote') as string) ?? '';
  const dateValue = String(formData.get('date') ?? '');

  const user = await ensureOwner(username);
  if (!Object.values(AVAILABILITY_STATUS).includes(status)) {
    throw new Error('잘못된 상태값입니다.');
  }

  const date = ensureDate(dateValue);
  await prisma.dayEntry.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date,
      },
    },
    update: {
      availabilityStatus: status,
      personalNote: note || null,
    },
    create: {
      userId: user.id,
      date,
      availabilityStatus: status,
      personalNote: note || null,
    },
  });

  revalidatePath(`/profile/${username}`);
  revalidatePath('/feed');
};

export const addDayCommentAction = async (formData: FormData) => {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const username = String(formData.get('username') ?? '');
  const dateValue = String(formData.get('date') ?? '');
  const parsed = commentSchema.safeParse({
    content: formData.get('content'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const date = ensureDate(dateValue);
  const targetUser = await prisma.user.findUnique({ where: { username } });
  if (!targetUser) {
    throw new Error('대상을 찾을 수 없습니다.');
  }

  const dayEntry = await prisma.dayEntry.upsert({
    where: {
      userId_date: {
        userId: targetUser.id,
        date,
      },
    },
    update: {},
    create: {
      userId: targetUser.id,
      date,
      availabilityStatus: AVAILABILITY_STATUS.NONE,
    },
  });

  await prisma.dayComment.create({
    data: {
      dayEntryId: dayEntry.id,
      authorId: user.id,
      content: parsed.data.content,
    },
  });

  revalidatePath(`/profile/${username}`);
};

const ensureFriendship = async (viewerId: string, profileId: string) => {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: viewerId, receiverId: profileId },
        { requesterId: profileId, receiverId: viewerId },
      ],
      status: FRIENDSHIP_STATUS.ACCEPTED,
    },
  });
  return Boolean(friendship);
};

const ensureConversation = async (userId: string, otherUserId: string) => {
  const [first, second] = [userId, otherUserId].sort();
  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { userAId: first, userBId: second },
        { userAId: second, userBId: first },
      ],
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userAId: first,
        userBId: second,
      },
    });
  }

  return conversation;
};

export const proposeMeetingAction = async (formData: FormData) => {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const username = String(formData.get('username') ?? '');
  const dateValue = String(formData.get('date') ?? '');
  const parsed = meetingProposalSchema.safeParse({
    message: formData.get('message') || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const receiver = await prisma.user.findUnique({ where: { username } });
  if (!receiver) {
    throw new Error('대상을 찾을 수 없습니다.');
  }
  if (receiver.id === user.id) {
    return { error: '본인에게는 제안할 수 없습니다.' };
  }

  if (receiver.isFriendOnlyForMeetingRequests) {
    const isFriend = await ensureFriendship(user.id, receiver.id);
    if (!isFriend) {
      return { error: '친구만 약속을 제안할 수 있습니다.' };
    }
  }

  const date = ensureDate(dateValue);
  const dayEntry = await prisma.dayEntry.upsert({
    where: {
      userId_date: { userId: receiver.id, date },
    },
    update: {},
    create: {
      userId: receiver.id,
      date,
      availabilityStatus: AVAILABILITY_STATUS.NONE,
    },
  });

  const proposal = await prisma.meetingProposal.create({
    data: {
      proposerId: user.id,
      receiverId: receiver.id,
      dayEntryId: dayEntry.id,
      message: parsed.data.message ?? null,
    },
  });

  const conversation = await ensureConversation(user.id, receiver.id);
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: user.id,
      content: `${user.username}님이 ${formatDateKey(date)} 약속을 제안했습니다.`,
      messageType: MESSAGE_TYPE.MEETING_PROPOSAL,
      relatedMeetingProposalId: proposal.id,
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date() },
  });

  revalidatePath(`/profile/${receiver.username}`);
  revalidatePath('/messages');
  revalidatePath('/feed');
};

export const respondMeetingProposalAction = async (formData: FormData) => {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const proposalId = String(formData.get('proposalId') ?? '');
  const nextStatus = String(formData.get('status') ?? '');

  const proposal = await prisma.meetingProposal.findUnique({
    where: { id: proposalId },
    include: { dayEntry: true, receiver: true, proposer: true },
  });

  if (!proposal) {
    throw new Error('제안을 찾을 수 없습니다.');
  }

  const isReceiver = proposal.receiverId === user.id;
  const isProposer = proposal.proposerId === user.id;

  if (nextStatus === PROPOSAL_STATUS.CANCELLED && !isProposer) {
    throw new Error('취소 권한이 없습니다.');
  }

  if (
    [PROPOSAL_STATUS.ACCEPTED, PROPOSAL_STATUS.DECLINED].includes(nextStatus) &&
    !isReceiver
  ) {
    throw new Error('응답 권한이 없습니다.');
  }

  let statusToApply = nextStatus;
  if (!Object.values(PROPOSAL_STATUS).includes(statusToApply)) {
    throw new Error('잘못된 상태입니다.');
  }

  await prisma.meetingProposal.update({
    where: { id: proposalId },
    data: {
      status: statusToApply,
      respondedAt: new Date(),
    },
  });

  const conversation = await ensureConversation(proposal.proposerId, proposal.receiverId);
  let systemMessage = '';

  if (statusToApply === PROPOSAL_STATUS.ACCEPTED) {
    await prisma.dayEntry.update({
      where: { id: proposal.dayEntryId },
      data: { availabilityStatus: AVAILABILITY_STATUS.BUSY },
    });

    await prisma.dayEntry.upsert({
      where: {
        userId_date: {
          userId: proposal.proposerId,
          date: proposal.dayEntry.date,
        },
      },
      update: {
        availabilityStatus: AVAILABILITY_STATUS.BUSY,
      },
      create: {
        userId: proposal.proposerId,
        date: proposal.dayEntry.date,
        availabilityStatus: AVAILABILITY_STATUS.BUSY,
      },
    });

    systemMessage = `${user.username}님이 ${formatDateKey(proposal.dayEntry.date)} 약속을 수락했습니다.`;
  } else if (statusToApply === PROPOSAL_STATUS.DECLINED) {
    systemMessage = `${user.username}님이 약속을 거절했습니다.`;
  } else if (statusToApply === PROPOSAL_STATUS.CANCELLED) {
    systemMessage = `${user.username}님이 약속 제안을 취소했습니다.`;
  }

  if (systemMessage) {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        content: systemMessage,
        messageType: MESSAGE_TYPE.SYSTEM,
        relatedMeetingProposalId: proposal.id,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });
  }

  revalidatePath('/messages');
  revalidatePath(`/profile/${proposal.receiver.username}`);
  revalidatePath(`/profile/${proposal.proposer.username}`);
  revalidatePath('/feed');
};

export const sendMessageAction = async (formData: FormData) => {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const conversationId = String(formData.get('conversationId') ?? '');
  const content = String(formData.get('content') ?? '').trim();
  if (!content) {
    return;
  }

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) {
    throw new Error('대화를 찾을 수 없습니다.');
  }

  if (![conversation.userAId, conversation.userBId].includes(user.id)) {
    throw new Error('대화에 참여할 수 없습니다.');
  }

  await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      content,
      messageType: MESSAGE_TYPE.TEXT,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  revalidatePath('/messages');
};

export const sendFriendRequestAction = async (formData: FormData) => {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const targetUsername = String(formData.get('targetUsername') ?? '');
  const target = await prisma.user.findUnique({ where: { username: targetUsername } });
  if (!target) {
    return { error: '사용자를 찾을 수 없습니다.' };
  }
  if (target.id === user.id) {
    return { error: '자기 자신에게 요청할 수 없습니다.' };
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: user.id, receiverId: target.id },
        { requesterId: target.id, receiverId: user.id },
      ],
    },
  });

  if (existing) {
    if (existing.status === FRIENDSHIP_STATUS.PENDING) {
      return { error: '이미 친구 요청을 보냈습니다.' };
    }
    if (existing.status === FRIENDSHIP_STATUS.ACCEPTED) {
      return { error: '이미 친구입니다.' };
    }

    await prisma.friendship.update({
      where: { id: existing.id },
      data: {
        requesterId: user.id,
        receiverId: target.id,
        status: FRIENDSHIP_STATUS.PENDING,
      },
    });
  } else {
    await prisma.friendship.create({
      data: {
        requesterId: user.id,
        receiverId: target.id,
      },
    });
  }

  revalidatePath('/friends');
  return { success: '친구 요청을 보냈습니다.' };
};

export const respondFriendRequestAction = async (formData: FormData) => {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const friendshipId = String(formData.get('friendshipId') ?? '');
  const action = String(formData.get('action') ?? '');

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship) {
    throw new Error('요청을 찾을 수 없습니다.');
  }

  if (friendship.receiverId !== user.id) {
    throw new Error('처리 권한이 없습니다.');
  }

  if (action === 'accept') {
    await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: FRIENDSHIP_STATUS.ACCEPTED },
    });
  } else if (action === 'reject') {
    await prisma.friendship.delete({ where: { id: friendship.id } });
  }

  revalidatePath('/friends');
  revalidatePath(`/profile/${user.username}`);
};

