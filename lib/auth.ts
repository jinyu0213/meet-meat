import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { addDays, isBefore } from 'date-fns';
import { prisma } from './prisma';

const SESSION_COOKIE = 'meeting_session';
const SESSION_TTL_DAYS = 14;

const getSessionCookie = () => cookies().get(SESSION_COOKIE)?.value ?? null;

export const getCurrentUser = cache(async () => {
  try {
    const token = getSessionCookie();
    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      await destroySession();
      return null;
    }

    if (isBefore(session.expiresAt, new Date())) {
      await prisma.session.delete({ where: { token } });
      await destroySession();
      return null;
    }

    return session.user;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
});

export const requireUser = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  return user;
};

export const createSession = async (userId: string) => {
  // crypto.randomUUID() 대신 더 호환성 있는 방법 사용
  const token =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
  
  const expiresAt = addDays(new Date(), SESSION_TTL_DAYS);
  
  try {
    await prisma.session.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    cookies().set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: expiresAt,
    });
  } catch (error) {
    console.error('Session creation error:', error);
    throw new Error('세션 생성에 실패했습니다.');
  }
};

export const destroySession = async () => {
  const token = getSessionCookie();
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  cookies().delete(SESSION_COOKIE);
};

