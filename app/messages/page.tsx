import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ConversationList } from '@/components/ConversationList';
import { MessageThread } from '@/components/MessageThread';
import { SubmitButton } from '@/components/SubmitButton';
import { respondMeetingProposalAction, sendMessageAction } from '@/lib/actions';
import { PROPOSAL_STATUS } from '@/lib/constants';

type MessagesPageProps = {
  searchParams: { conversationId?: string };
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const user = await requireUser();

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ userAId: user.id }, { userBId: user.id }],
    },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      userA: true,
      userB: true,
    },
  });

  const formattedConversations = conversations.map((conversation) => {
    const other =
      conversation.userAId === user.id ? conversation.userB : conversation.userA;
    return {
      id: conversation.id,
      otherUser: {
        username: other.username,
        displayName: other.displayName,
        avatarUrl: other.avatarUrl,
      },
      lastMessage: conversation.messages[0]
        ? {
            content: conversation.messages[0].content,
            createdAt: conversation.messages[0].createdAt,
          }
        : null,
    };
  });

  const requestedId = searchParams.conversationId;
  const selectedId = requestedId && formattedConversations.find((c) => c.id === requestedId)
    ? requestedId
    : formattedConversations[0]?.id;

  const selectedConversation = selectedId
    ? await prisma.conversation.findUnique({
        where: { id: selectedId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              relatedMeetingProposal: true,
            },
          },
          userA: true,
          userB: true,
        },
      })
    : null;

  const pendingProposals =
    selectedConversation?.messages
      .map((message) => message.relatedMeetingProposal)
      .filter(
        (proposal) =>
          proposal &&
          proposal.status === PROPOSAL_STATUS.PENDING &&
          proposal.receiverId === user.id,
      ) ?? [];

  return (
    <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <h2 className="mb-4 text-lg font-semibold text-white">대화 목록</h2>
        <ConversationList conversations={formattedConversations} selectedId={selectedId} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        {selectedConversation ? (
          <>
            <div className="mb-6 border-b border-white/5 pb-4">
              <h3 className="text-xl font-semibold text-white">
                {selectedConversation.userAId === user.id
                  ? selectedConversation.userB.displayName ?? selectedConversation.userB.username
                  : selectedConversation.userA.displayName ?? selectedConversation.userA.username}
              </h3>
              <p className="text-sm text-white/60">1:1 메시지</p>
            </div>

            <div className="space-y-4">
              <MessageThread messages={selectedConversation.messages} currentUserId={user.id} />

              {pendingProposals.map((proposal) => (
                <form
                  key={proposal.id}
                  action={respondMeetingProposalAction}
                  className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4"
                >
                  <p className="text-sm text-white">
                    {proposal.message ?? '약속 제안'} · {proposal.status}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <input type="hidden" name="proposalId" value={proposal.id} />
                    <button
                      type="submit"
                      className="btn-primary flex-1 rounded-full"
                      name="status"
                      value={PROPOSAL_STATUS.ACCEPTED}
                    >
                      수락
                    </button>
                    <button
                      type="submit"
                      className="btn-secondary flex-1 rounded-full"
                      name="status"
                      value={PROPOSAL_STATUS.DECLINED}
                    >
                      거절
                    </button>
                  </div>
                </form>
              ))}

              <form action={sendMessageAction} className="mt-6 space-y-3 rounded-2xl border border-white/10 p-4">
                <input type="hidden" name="conversationId" value={selectedConversation.id} />
                <textarea
                  name="content"
                  rows={3}
                  className="input"
                  placeholder="메시지를 입력하세요"
                />
                <SubmitButton pendingLabel="전송 중...">메시지 보내기</SubmitButton>
              </form>
            </div>
          </>
        ) : (
          <p className="text-sm text-white/60">대화를 선택해주세요.</p>
        )}
      </div>
    </section>
  );
}

