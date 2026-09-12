import Link from 'next/link'

import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata = {
  title: '配信一覧 | AIが選ぶおすすめシーン',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Channel = {
  name: string | null
  thumbnail_url: string | null
}

type Stream = {
  id: number
  youtube_video_id: string
  title: string
  duration_sec: number | null
  published_at: string | null
  video_thumbnail_url: string | null
  channel: Channel | null
}

function formatPublishedDate(value: string | null) {
  if (!value) {
    return null
  }

  return new Date(value).toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export default async function Home() {
  const { data, error } = await supabase
    .from('stream')
    .select(`
      id,
      youtube_video_id,
      title,
      duration_sec,
      published_at,
      video_thumbnail_url,
      channel (
        name,
        thumbnail_url
      )
    `)
    .order('published_at', {
      ascending: false,
      nullsFirst: false,
    })

  if (error) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-6">
          <div className="text-3xl font-bold">
            AIが選ぶおすすめシーン
          </div>

          <div className="mt-1 text-sm text-gray-500">
            配信から見どころを自動でピックアップ
          </div>

          <h1 className="mt-6 text-2xl font-bold">
            配信一覧
          </h1>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          配信一覧の取得に失敗しました。
          <div className="mt-2 text-sm">
            {error.message}
          </div>
        </div>
      </main>
    )
  }

  const streams = (data ?? []) as unknown as Stream[]

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        配信一覧
      </h1>

      <div className="space-y-4">
        {streams.map((stream) => {
          const publishedDate = formatPublishedDate(
            stream.published_at
          )

          return (
            <Link
              key={stream.id}
              href={`/stream/${stream.youtube_video_id}`}
              className="block overflow-hidden rounded-2xl border border-gray-300 bg-white transition hover:border-gray-400 hover:bg-gray-50"
            >
              <div className="flex flex-col sm:flex-row">
                {/* 配信サムネイル */}
                <div className="shrink-0 sm:w-64">
                  {stream.video_thumbnail_url ? (
                    <img
                      src={stream.video_thumbnail_url}
                      alt=""
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-video w-full bg-gray-200" />
                  )}
                </div>

                {/* 配信情報 */}
                <div className="min-w-0 flex-1 p-5">
                  <h2 className="text-xl font-bold leading-snug text-gray-900">
                    {stream.title}
                  </h2>

                  {/* チャンネル */}
                  <div className="mt-4 flex items-center gap-3">
                    {stream.channel?.thumbnail_url ? (
                      <img
                        src={stream.channel.thumbnail_url}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
                    )}

                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-gray-700">
                        {stream.channel?.name ??
                          'チャンネル不明'}
                      </div>

                      {publishedDate && (
                        <div className="mt-0.5 text-sm text-gray-500">
                          公開日：{publishedDate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {streams.length === 0 && (
        <div className="rounded-xl border border-gray-300 p-6 text-gray-500">
          配信がまだ登録されていません。
        </div>
      )}
    </main>
  )
}