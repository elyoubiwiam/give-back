import { createServerFn } from '@tanstack/react-start'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { googleCalendarUrl, outlookCalendarUrl } from '@/lib/calendar'
import { formatMinutes, type Task } from '@/lib/data'

export const notifyTaskJoined = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { taskId: string }) => ({ taskId: String(d.taskId) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context
    const email = (claims as any).email as string | undefined
    if (!email) return { sent: false }
    const { data: signup } = await supabase.from('task_signups').select('id').eq('user_id', userId).eq('task_id', data.taskId).maybeSingle()
    if (!signup) return { sent: false }
    const { data: task } = await supabase.from('tasks').select('*').eq('id', data.taskId).single()
    if (!task) return { sent: false }
    const { data: profile } = await supabase.from('profiles').select('name').eq('id', userId).maybeSingle()
    const t = task as unknown as Task
    const when = t.starts_at
      ? new Date(t.starts_at).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Europe/London' })
      : t.when_label
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email')
    try {
      const r = await sendTemplateEmail('task-joined', email, {
        templateData: { name: (profile as any)?.name, title: t.title, org: t.org, city: t.city, when, duration: formatMinutes(t.minutes), points: t.points, googleUrl: googleCalendarUrl(t), outlookUrl: outlookCalendarUrl(t) },
        idempotencyKey: `task-joined-${userId}-${t.id}`,
      })
      return { sent: r.sent }
    } catch (e) {
      console.error('task-joined email failed', e)
      return { sent: false }
    }
  })
