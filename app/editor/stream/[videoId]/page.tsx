import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function formatTime(seconds: number) {
  const totalSeconds = Math.floor(seconds)

  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`
  }

  return `${m}:${s.toString().padStart(2, '0')}`
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

export default async function EditorStreamPage({
  params,
}: {
  params: Promise<{ videoId: string }>
}) {
  const { videoId } = await params

  const { data: stream, error: streamError } = await supabase
    .from('stream')
    .select(`
      id,
      youtube_video_id,
      title,
      published_at,
      video_thumbnail_url,
      channel (
        name,
        thumbnail_url
      )
    `)
    .eq('youtube_video_id', videoId)
    .single()

  if (streamError) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">
          stream取得エラー
        </h1>

        <pre className="mt-4">
          {streamError.message}
        </pre>
      </main>
    )
  }

  const { data: highlights, error: highlightError } = await supabase
    .from('highlight')
    .select('*')
    .eq('stream_id', stream.id)
    .order('total_score', { ascending: false })

  if (highlightError) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">
          highlight取得エラー
        </h1>

        <pre className="mt-4">
          {highlightError.message}
        </pre>
      </main>
    )
  }

  const publishedDate = formatPublishedDate(
    stream.published_at
  )

  const originalYoutubeUrl =
    `https://youtu.be/${stream.youtube_video_id}`

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-6 inline-block text-blue-600 hover:underline"
        >
          ← 配信一覧へ
        </Link>

        <h1 className="mb-6 text-3xl font-bold">
          切り抜き候補 / Editor
        </h1>

        {/* 配信情報 */}
        <section className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row">
            {/* 配信サムネ */}
            <div className="shrink-0 md:w-80">
              {stream.video_thumbnail_url ? (
                <a
                  href={originalYoutubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={stream.video_thumbnail_url}
                    alt={stream.title}
                    className="aspect-video h-full w-full object-cover"
                  />
                </a>
              ) : (
                <div className="aspect-video w-full bg-gray-200" />
              )}
            </div>

            {/* 配信詳細 */}
            <div className="flex min-w-0 flex-1 flex-col justify-center p-5">
              <h2 className="text-xl font-bold leading-snug">
                {stream.title}
              </h2>

              <div className="mt-4 flex items-center gap-3">
                {stream.channel?.thumbnail_url ? (
                  <img
                    src={stream.channel.thumbnail_url}
                    alt={stream.channel.name ?? ''}
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-11 w-11 shrink-0 rounded-full bg-gray-200" />
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

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                <a
                  href={originalYoutubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  YouTubeで元配信を見る
                </a>

                <Link
                  href={`/stream/${stream.youtube_video_id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  公開ページを見る
                </Link>
              </div>

              <p className="mt-2 text-xs text-gray-400">
                YouTube ID: {stream.youtube_video_id}
              </p>
            </div>
          </div>
        </section>

        {/* 切り抜き候補 */}
        <div className="space-y-6">
          {highlights?.map((highlight, index) => {
            const youtubeUrl =
              `https://youtu.be/${stream.youtube_video_id}?t=${Math.floor(
                highlight.start_sec
              )}`

            return (
              <article
                key={highlight.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-1 text-sm font-semibold text-gray-500">
                      #{index + 1}
                    </p>

                    <h2 className="text-2xl font-bold">
                      {highlight.title}
                    </h2>

                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-blue-600 hover:underline"
                    >
                      {formatTime(highlight.start_sec)}
                      {' - '}
                      {highlight.end_sec
                        ? formatTime(highlight.end_sec)
                        : ''}
                    </a>
                  </div>

                  <div className="shrink-0 rounded-lg bg-gray-900 px-4 py-3 text-center text-white">
                    <div className="text-xs uppercase tracking-wide">
                      Total
                    </div>

                    <div className="text-2xl font-bold">
                      {highlight.total_score}
                    </div>
                  </div>
                </div>

                <div className="mb-5 grid grid-cols-3 gap-3">
                  <ScoreBox
                    label="Semantic"
                    score={highlight.semantic_score}
                  />

                  <ScoreBox
                    label="Chat"
                    score={highlight.chat_score}
                  />

                  <ScoreBox
                    label="Audio"
                    score={highlight.audio_score}
                  />
                </div>

                <div className="space-y-4 text-sm leading-6">
                  <section>
                    <h3 className="font-bold">
                      内容
                    </h3>

                    <p className="mt-1 text-gray-700">
                      {highlight.summary}
                    </p>
                  </section>

                  <section>
                    <h3 className="font-bold">
                      見どころ
                    </h3>

                    <p className="mt-1 text-gray-700">
                      {highlight.appeal}
                    </p>
                  </section>

                  <section>
                    <h3 className="font-bold">
                      寸評
                    </h3>

                    <p className="mt-1 text-gray-700">
                      {highlight.commentary}
                    </p>
                  </section>

                  <section>
                    <h3 className="font-bold">
                      編集ポイント
                    </h3>

                    <p className="mt-1 text-gray-700">
                      {highlight.editing_point}
                    </p>
                  </section>

                  <section>
                    <h3 className="font-bold">
                      注意点
                    </h3>

                    <p className="mt-1 text-gray-700">
                      {highlight.caution || 'なし'}
                    </p>
                  </section>

                  <section>
                    <h3 className="font-bold">
                      Candidate ID
                    </h3>

                    <p className="mt-1 font-mono text-gray-700">
                      {highlight.candidate_id}
                    </p>
                  </section>

                  <section>
                    <h3 className="font-bold">
                      Selection Reasons
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {highlight.selection_reasons?.map(
                        (reason: string) => (
                          <span
                            key={reason}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                          >
                            {reason}
                          </span>
                        )
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="font-bold">
                      Source Evidence
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <Evidence
                        label="Transcript"
                        enabled={
                          highlight.source_evidence?.transcript
                        }
                      />

                      <Evidence
                        label="Chat"
                        enabled={
                          highlight.source_evidence?.chat
                        }
                      />

                      <Evidence
                        label="Audio"
                        enabled={
                          highlight.source_evidence?.audio
                        }
                      />
                    </div>
                  </section>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </main>
  )
}

function ScoreBox({
  label,
  score,
}: {
  label: string
  score: number
}) {
  return (
    <div className="rounded-lg bg-gray-100 p-3 text-center">
      <div className="text-xs font-semibold uppercase text-gray-500">
        {label}
      </div>

      <div className="mt-1 text-xl font-bold">
        {score}
      </div>
    </div>
  )
}

function Evidence({
  label,
  enabled,
}: {
  label: string
  enabled: boolean
}) {
  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
      {label}: {enabled ? 'あり' : 'なし'}
    </span>
  )
}