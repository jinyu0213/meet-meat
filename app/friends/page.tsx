import Link from 'next/link';

import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendFriendRequestAction, respondFriendRequestAction } from '@/lib/actions';

type FriendsPageProps = {
  searchParams: { q?: string };
};

export default async function FriendsPage({ searchParams }: FriendsPageProps) {
  const user = await requireUser();
  const query = searchParams.q?.trim();

  const [friendships, incoming, outgoing, searchResults] = await Promise.all([
    prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: user.id }, { receiverId: user.id }],
      },
      include: { requester: true, receiver: true },
    }),
    prisma.friendship.findMany({
      where: { receiverId: user.id, status: 'PENDING' },
      include: { requester: true },
    }),
    prisma.friendship.findMany({
      where: { requesterId: user.id, status: 'PENDING' },
      include: { receiver: true },
    }),
    query
      ? (async () => {
          // SQLite는 case-insensitive 검색을 지원하지 않으므로
          // 모든 사용자를 가져온 후 필터링
          const allUsers = await prisma.user.findMany({
            where: { NOT: { id: user.id } },
          });
          const lowerQuery = query.toLowerCase();
          return allUsers
            .filter((u) => u.username.toLowerCase().includes(lowerQuery))
            .slice(0, 10);
        })()
      : Promise.resolve([]),
  ]);

  const friends = friendships.map((friendship) =>
    friendship.requesterId === user.id ? friendship.receiver : friendship.requester,
  );

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-bold text-white">친구 & 탐색</h1>
        <p className="text-sm text-white/70">친구 요청을 관리하고 새로운 사용자를 찾아보세요.</p>
        <form className="mt-4" method="get">
          <input
            name="q"
            className="input"
            placeholder="아이디로 친구 검색"
            defaultValue={query ?? ''}
          />
          <div className="mt-3 flex gap-3">
            <button className="btn-primary flex-1 rounded-full" type="submit">
              검색
            </button>
            <Link href="/friends" className="btn-secondary flex-1 rounded-full text-center">
              초기화
            </Link>
          </div>
        </form>
      </div>

      {query && (
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">검색 결과</h2>
          {searchResults.length ? (
            searchResults.map((result) => (
              <div
                key={result.id}
                className="flex flex-wrap items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4"
              >
                <div>
                  <p className="text-white">{result.displayName ?? result.username}</p>
                  <p className="text-sm text-white/60">@{result.username}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/profile/${result.username}`} className="btn-secondary rounded-full px-4 py-2 text-sm">
                    프로필
                  </Link>
                  <form action={sendFriendRequestAction}>
                    <input type="hidden" name="targetUsername" value={result.username} />
                    <button className="btn-primary rounded-full px-4 py-2 text-sm" type="submit">
                      친구 요청
                    </button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/60">검색 결과가 없습니다.</p>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-white">내 친구</h3>
          {friends.length ? (
            friends.map((friend) => (
              <Link
                key={friend.id}
                href={`/profile/${friend.username}`}
                className="block rounded-2xl border border-white/5 bg-white/5 p-4 text-white"
              >
                <p className="font-semibold">{friend.displayName ?? friend.username}</p>
                <p className="text-sm text-white/60">@{friend.username}</p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-white/60">아직 친구가 없습니다.</p>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-semibold text-white">받은 요청</h3>
            {incoming.length ? (
              incoming.map((req) => (
                <div key={req.id} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <p className="text-white">{req.requester.displayName ?? req.requester.username}</p>
                  <div className="mt-3 flex gap-2">
                    <form action={respondFriendRequestAction} className="flex-1">
                      <input type="hidden" name="friendshipId" value={req.id} />
                      <input type="hidden" name="action" value="accept" />
                      <button className="btn-primary w-full rounded-full text-sm" type="submit">
                        수락
                      </button>
                    </form>
                    <form action={respondFriendRequestAction} className="flex-1">
                      <input type="hidden" name="friendshipId" value={req.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button className="btn-secondary w-full rounded-full text-sm" type="submit">
                        거절
                      </button>
                    </form>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">받은 요청이 없습니다.</p>
            )}
          </div>

          <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-semibold text-white">보낸 요청</h3>
            {outgoing.length ? (
              outgoing.map((req) => (
                <div key={req.id} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <p className="text-white">{req.receiver.displayName ?? req.receiver.username}</p>
                  <p className="text-sm text-white/60">승인 대기 중</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">보낸 요청이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

