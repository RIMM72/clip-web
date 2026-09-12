import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const { data: streams, error } = await supabase
    .from('stream')
    .select('*')
    .order('published_at', {
      ascending: false,
      nullsFirst: false,
    })

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">stream取得エラー</h1>
        <pre className="mt-4">{error.message}</pre>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold">配信一覧</h1>

        <div className="space-y-4">
          {streams?.map((stream) => (
            <Link
              key={stream.id}
              href={`/stream/${stream.youtube_video_id}`}
              className="block rounded-xl border p-5 hover:bg-gray-50"
            >
              <h2 className="text-xl font-bold">
                {stream.title}
              </h2>

              <div className="mt-2 text-sm text-gray-600">
                <div>
                  {stream.channel_name ?? 'チャンネル不明'}
                </div>

                {stream.published_at && (
                  <div className="mt-1 text-gray-500">
                    公開日：
                    {new Date(stream.published_at).toLocaleDateString(
                      'ja-JP',
                      {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      }
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}