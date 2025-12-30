import Link from 'next/link';
import { format } from 'date-fns';

import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PROPOSAL_STATUS } from '@/lib/constants';

export default async function FeedPage() {
  const user = await requireUser();

  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ requesterId: user.id }, { receiverId: user.id }],
    },
  });

  const friendIds = friendships.map((f) => (f.requesterId === user.id ? f.receiverId : f.requesterId));
  const scopeIds = [user.id, ...friendIds];

  const [dayEntries, proposals] = await Promise.all([
    prisma.dayEntry.findMany({
      where: { userId: { in: scopeIds } },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: { user: true },
    }),
    prisma.meetingProposal.findMany({
      where: {
        OR: [{ proposerId: { in: scopeIds } }, { receiverId: { in: scopeIds } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        proposer: true,
        receiver: true,
        dayEntry: true,
      },
    }),
  ]);

  const activities = [
    ...dayEntries.map((entry) => ({
      type: 'DAY' as const,
      date: entry.updatedAt,
      description: `${entry.user.displayName ?? entry.user.username} 님이 ${format(entry.date, 'yyyy-MM-dd')} 상태를 ${
        entry.availabilityStatus
      }로 설정했어요.`,
      link: `/profile/${entry.user.username}?date=${format(entry.date, 'yyyy-MM-dd')}`,
    })),
    ...proposals.map((proposal) => ({
      type: 'PROPOSAL' as const,
      date: proposal.createdAt,
      description:
        proposal.status === PROPOSAL_STATUS.ACCEPTED
          ? `${proposal.proposer.displayName ?? proposal.proposer.username} 님과 ${
              proposal.receiver.displayName ?? proposal.receiver.username
            } 님이 ${format(proposal.dayEntry.date, 'yyyy-MM-dd')} 약속을 확정했어요.`
          : `${proposal.proposer.displayName ?? proposal.proposer.username} 님이 ${
              proposal.receiver.displayName ?? proposal.receiver.username
            } 님에게 약속을 제안했어요.`,
      link: `/profile/${proposal.receiver.username}?date=${format(proposal.dayEntry.date, 'yyyy-MM-dd')}`,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold text-white">최근 소식</h1>
        <p className="mt-2 text-sm text-white/70">친구들의 캘린더 업데이트와 약속 현황을 확인하세요.</p>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-white/60">아직 활동이 없습니다. 친구를 추가하거나 약속을 제안해보세요.</p>
        ) : (
          activities.map((activity, index) => (
            <Link
              key={`${activity.type}-${index}`}
              href={activity.link}
              className="block rounded-2xl border border-white/5 bg-white/5 p-6 transition hover:border-violet-500/40"
            >
              <p className="text-sm text-white/50">{format(activity.date, 'yyyy.MM.dd HH:mm')}</p>
              <p className="mt-2 text-lg text-white">{activity.description}</p>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

