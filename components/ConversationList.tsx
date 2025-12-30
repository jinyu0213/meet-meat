import Link from 'next/link';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

import { Avatar } from './Avatar';

type ConversationItem = {
  id: string;
  otherUser: {
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
  lastMessage?: {
    content: string;
    createdAt: Date;
  } | null;
};

type Props = {
  conversations: ConversationItem[];
  selectedId?: string;
};

export function ConversationList({ conversations, selectedId }: Props) {
  if (!conversations.length) {
    return <p className="text-sm text-white/60">대화를 시작해보세요.</p>;
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/messages?conversationId=${conversation.id}`}
          className={clsx(
            'flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 transition hover:border-violet-500/50',
            selectedId === conversation.id && 'border-violet-400 bg-violet-500/10',
          )}
        >
          <Avatar
            size="sm"
            src={conversation.otherUser.avatarUrl ?? undefined}
            alt={conversation.otherUser.username}
            fallback={conversation.otherUser.displayName ?? conversation.otherUser.username}
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">
              {conversation.otherUser.displayName ?? conversation.otherUser.username}
            </p>
            <p className="text-xs text-white/60">
              {conversation.lastMessage
                ? `${conversation.lastMessage.content.slice(0, 40)} · ${formatDistanceToNow(
                    conversation.lastMessage.createdAt,
                    {
                      addSuffix: true,
                    },
                  )}`
                : '아직 메시지가 없습니다.'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}






