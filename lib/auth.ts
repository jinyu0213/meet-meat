import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { addDays, isBefore } from 'date-fns';
import { prisma } from './prisma';

const SESSION_COOKIE = 'meeting_session';
const SESSION_TTL_DAYS = 14;

const getSessionCookie = () => cookies().get(SESSION_COOKIE)?.value ?? null;

export const getCurrentUser = cache(async () => {
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
});

export const requireUser = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  return user;
};

export const createSession = async (userId: string) => {
  const token = crypto.randomUUID();
  const expiresAt = addDays(new Date(), SESSION_TTL_DAYS);
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
};

export const destroySession = async () => {
  const token = getSessionCookie();
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  cookies().delete(SESSION_COOKIE);
};

