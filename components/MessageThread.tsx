import clsx from 'clsx';
import { format } from 'date-fns';

import { PROPOSAL_STATUS } from '@/lib/constants';

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  messageType: string;
  relatedMeetingProposal?: {
    id: string;
    status: string;
    message?: string | null;
    receiverId?: string;
  } | null;
};

type Props = {
  messages: Message[];
  currentUserId: string;
};

export function MessageThread({ messages, currentUserId }: Props) {
  if (!messages.length) {
    return <p className="text-sm text-white/60">이 대화에 아직 메시지가 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isMine = message.senderId === currentUserId;
        const isSystem = message.messageType !== 'TEXT';

        return (
          <div
            key={message.id}
            className={clsx(
              'flex flex-col text-sm',
              isMine ? 'items-end text-right' : 'items-start text-left',
            )}
          >
            <div
              className={clsx(
                'max-w-[70%] rounded-2xl px-4 py-2',
                isSystem
                  ? 'bg-white/5 text-white/80'
                  : isMine
                    ? 'bg-violet-500 text-white'
                    : 'bg-white text-slate-900',
              )}
            >
              <p>{message.content}</p>
              <span className="mt-1 block text-xs text-white/60">
                {format(message.createdAt, 'yyyy.MM.dd HH:mm')}
              </span>
              {message.relatedMeetingProposal && (
                <span className="mt-1 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
                  {message.relatedMeetingProposal.status === PROPOSAL_STATUS.PENDING
                    ? '제안 대기'
                    : message.relatedMeetingProposal.status}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

