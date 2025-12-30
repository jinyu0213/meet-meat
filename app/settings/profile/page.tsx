import { requireUser } from '@/lib/auth';
import { updateProfileAction } from '@/lib/actions';
import { SubmitButton } from '@/components/SubmitButton';

export default async function SettingsProfilePage() {
  const user = await requireUser();

  return (
    <section className="max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8">
      <h1 className="text-3xl font-bold text-white">내 프로필 설정</h1>
      <p className="text-sm text-white/70">표시 이름, 소개, 아바타, 약속 요청 설정을 변경하세요.</p>

      <form action={updateProfileAction} className="mt-8 space-y-4">
        <div>
          <label className="text-sm text-white/60">표시 이름</label>
          <input name="displayName" className="input mt-1" defaultValue={user.displayName ?? ''} />
        </div>
        <div>
          <label className="text-sm text-white/60">소개</label>
          <textarea
            name="bio"
            rows={3}
            className="input mt-1"
            defaultValue={user.bio ?? ''}
            placeholder="간단한 자기소개"
          />
        </div>
        <div>
          <label className="text-sm text-white/60">아바타 이미지 URL</label>
          <input name="avatarUrl" className="input mt-1" defaultValue={user.avatarUrl ?? ''} />
        </div>
        <label className="flex items-center gap-3 text-sm text-white/80">
          <input
            type="checkbox"
            name="isFriendOnlyForMeetingRequests"
            defaultChecked={user.isFriendOnlyForMeetingRequests}
            className="h-4 w-4 rounded border-white/20 bg-white/10"
          />
          친구에게만 약속 제안 허용
        </label>
        <SubmitButton pendingLabel="저장 중...">변경 내용 저장</SubmitButton>
      </form>
    </section>
  );
}






