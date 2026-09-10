import { supabase } from '@/lib/supabase'

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`
  }

  return `${m}:${s.toString().padStart(2, '0')}`
}

export default async function Home() {
  const { data: streams, error: streamError } = await supabase
    .from('stream')
    .select('*')

  const { data: highlights, error: highlightError } = await supabase
    .from('highlight')
    .select('*')
    .order('total_score', { ascending: false })

  if (streamError) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">stream取得エラー</h1>
        <pre className="mt-4">{streamError.message}</pre>
      </main>
    )
  }

  if (highlightError) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">highlight取得エラー</h1>
        <pre className="mt-4">{highlightError.message}</pre>
      </main>
    )
  }

  const stream = streams?.[0]

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold">
          切り抜き候補
        </h1>

        {stream && (
          <div className="mb-8">
            <p className="text-lg font-semibold">
              {stream.title}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              YouTube ID: {stream.youtube_video_id}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {highlights?.map((highlight, index) => {
            const youtubeUrl = stream
              ? `https://youtu.be/${stream.youtube_video_id}?t=${highlight.start_sec}`
              : '#'

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

                  <div className="rounded-lg bg-gray-900 px-4 py-3 text-center text-white">
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
                      {highlight.caution}
                    </p>
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