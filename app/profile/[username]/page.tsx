import { notFound } from 'next/navigation';
import { format } from 'date-fns';

import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CalendarGrid } from '@/components/CalendarGrid';
import { Avatar } from '@/components/Avatar';
import { SubmitButton } from '@/components/SubmitButton';
import {
  addDayCommentAction,
  proposeMeetingAction,
  respondFriendRequestAction,
  sendFriendRequestAction,
  upsertDayEntryAction,
} from '@/lib/actions';
import { getMonthDays, formatDateKey, ensureDate, getNextMonthStart } from '@/lib/date';
import { AVAILABILITY_STATUS } from '@/lib/constants';

type ProfilePageProps = {
  params: { username: string };
  searchParams: { date?: string };
};

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const viewer = await requireUser();
  const profileUser = await prisma.user.findUnique({
    where: { username: params.username },
  });

  if (!profileUser) {
    notFound();
  }

  const selectedDateKey = searchParams.date ?? formatDateKey(new Date());
  const selectedDate = ensureDate(selectedDateKey);

  const monthStart = new Date(selectedDate);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthEnd = getNextMonthStart(monthStart);
  const days = getMonthDays(monthStart);
  const monthEntries = await prisma.dayEntry.findMany({
    where: {
      userId: profileUser.id,
      date: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
  });
  const entryMap = Object.fromEntries(monthEntries.map((entry) => [formatDateKey(entry.date), entry.availabilityStatus]));

  const dayEntry = await prisma.dayEntry.findUnique({
    where: {
      userId_date: {
        userId: profileUser.id,
        date: selectedDate,
      },
    },
    include: {
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      },
      meetingProposals: {
        include: { proposer: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: viewer.id, receiverId: profileUser.id },
        { requesterId: profileUser.id, receiverId: viewer.id },
      ],
    },
  });

  const isOwner = viewer.id === profileUser.id;
  const isFriend = friendship?.status === 'ACCEPTED';
  const viewerCanPropose = isOwner
    ? false
    : !profileUser.isFriendOnlyForMeetingRequests || isFriend;

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex flex-wrap items-center gap-6">
          <Avatar
            size="lg"
            src={profileUser.avatarUrl ?? undefined}
            alt={profileUser.username}
            fallback={profileUser.displayName ?? profileUser.username}
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">
                {profileUser.displayName ?? profileUser.username}
              </h1>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                @{profileUser.username}
              </span>
            </div>
            <p className="text-white/70">{profileUser.bio ?? '소개가 없습니다.'}</p>
            {!isOwner && (
              <div className="flex items-center gap-3">
                {friendship ? (
                  friendship.status === 'ACCEPTED' ? (
                    <span className="rounded-full bg-emerald-500/30 px-4 py-1 text-sm font-semibold text-emerald-100">
                      친구
                    </span>
                  ) : friendship.receiverId === viewer.id ? (
                    <div className="flex gap-2">
                      <form action={respondFriendRequestAction}>
                        <input type="hidden" name="friendshipId" value={friendship.id} />
                        <input type="hidden" name="action" value="accept" />
                        <SubmitButton pendingLabel="승인 중..." className="w-auto">
                          요청 수락
                        </SubmitButton>
                      </form>
                      <form action={respondFriendRequestAction}>
                        <input type="hidden" name="friendshipId" value={friendship.id} />
                        <input type="hidden" name="action" value="reject" />
                        <SubmitButton pendingLabel="거절 중..." variant="secondary" className="w-auto">
                          거절
                        </SubmitButton>
                      </form>
                    </div>
                  ) : (
                    <span className="rounded-full border border-white/20 px-4 py-1 text-sm text-white/70">
                      요청 보냄
                    </span>
                  )
                ) : (
                  <form action={sendFriendRequestAction}>
                    <input type="hidden" name="targetUsername" value={profileUser.username} />
                    <SubmitButton pendingLabel="요청 중..." className="w-auto">
                      친구 요청
                    </SubmitButton>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-white/60">
              {format(monthStart, 'yyyy MMM')}
            </p>
            <h2 className="text-2xl font-semibold text-white">약속 가능 날짜</h2>
          </div>
        </div>
        <CalendarGrid
          days={days}
          currentMonth={monthStart}
          entryMap={entryMap}
          username={profileUser.username}
          selectedDate={selectedDateKey}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">선택한 날짜</p>
              <h3 className="text-2xl font-semibold text-white">
                {format(selectedDate, 'yyyy년 MM월 dd일')}
              </h3>
            </div>
            {dayEntry && (
              <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/80">
                상태: {dayEntry.availabilityStatus}
              </span>
            )}
          </div>

          {isOwner ? (
            <form action={upsertDayEntryAction} className="space-y-4">
              <input type="hidden" name="username" value={profileUser.username} />
              <input type="hidden" name="date" value={selectedDateKey} />
              <label className="text-sm text-white/70">상태</label>
              <select
                name="status"
                defaultValue={dayEntry?.availabilityStatus ?? AVAILABILITY_STATUS.NONE}
                className="input"
              >
                {Object.values(AVAILABILITY_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <label className="text-sm text-white/70">메모</label>
              <textarea
                name="personalNote"
                defaultValue={dayEntry?.personalNote ?? ''}
                rows={3}
                className="input"
              />
              <SubmitButton pendingLabel="저장 중...">나의 일정 업데이트</SubmitButton>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-white/80">
                {dayEntry?.personalNote ?? '작성된 메모가 없습니다.'}
              </p>

              <form action={proposeMeetingAction} className="space-y-2 rounded-2xl border border-white/10 p-4">
                <input type="hidden" name="username" value={profileUser.username} />
                <input type="hidden" name="date" value={selectedDateKey} />
                <label className="text-sm text-white/70">약속 제안 메시지</label>
                <textarea
                  name="message"
                  rows={3}
                  className="input"
                  placeholder="저녁 식사 어떠세요?"
                  disabled={!viewerCanPropose}
                />
                <SubmitButton
                  pendingLabel="제안 중..."
                  className="w-full"
                  variant={viewerCanPropose ? 'primary' : 'secondary'}
                  disabled={!viewerCanPropose}
                >
                  {viewerCanPropose ? '약속 제안하기' : '친구만 제안할 수 있어요'}
                </SubmitButton>
                {!viewerCanPropose && profileUser.isFriendOnlyForMeetingRequests && (
                  <p className="text-xs text-white/60">친구로 등록되면 이 날짜에 약속을 제안할 수 있어요.</p>
                )}
              </form>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white">댓글</h4>
            <div className="space-y-3">
              {dayEntry?.comments.length ? (
                dayEntry.comments.map((comment) => (
                  <div key={comment.id} className="rounded-2xl border border-white/5 bg-white/5 p-3 text-sm">
                    <p className="font-semibold text-white">
                      {comment.author.displayName ?? comment.author.username}
                    </p>
                    <p className="text-white/80">{comment.content}</p>
                    <span className="text-xs text-white/40">
                      {format(comment.createdAt, 'yyyy.MM.dd HH:mm')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/60">아직 댓글이 없습니다.</p>
              )}
            </div>
            <form action={addDayCommentAction} className="space-y-2 rounded-2xl border border-white/10 p-4">
              <input type="hidden" name="username" value={profileUser.username} />
              <input type="hidden" name="date" value={selectedDateKey} />
              <textarea
                name="content"
                rows={2}
                className="input"
                placeholder="댓글 남기기"
                required
              />
              <SubmitButton pendingLabel="등록 중...">댓글 남기기</SubmitButton>
            </form>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h4 className="text-lg font-semibold text-white">약속 제안 현황</h4>
          <div className="space-y-3">
            {dayEntry?.meetingProposals.length ? (
              dayEntry.meetingProposals.map((proposal) => (
                <div key={proposal.id} className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm">
                  <p className="font-semibold text-white">
                    {proposal.proposer.displayName ?? proposal.proposer.username}
                  </p>
                  <p className="text-white/70">{proposal.message ?? '메시지 없음'}</p>
                  <span className="text-xs text-white/40">
                    상태: {proposal.status} · {format(proposal.createdAt, 'MM.dd HH:mm')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">아직 제안이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

