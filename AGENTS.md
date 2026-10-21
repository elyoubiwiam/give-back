<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep welcome-reward eligibility in a shared, tested rule so all reward buttons apply the same limit.
- Render booking confirmation in TaskCard with the shared Dialog and calendar helpers so all task listings share the same confirmation flow.
- Cancel bookings through an authenticated, owner-scoped atomic database function that reverses booking points; never delete signups directly from the browser.
- Build the profile booking summary from the shared tasks query and current user's joined IDs, reusing TaskCard for consistent calendar and cancellation controls.
- Roles live in public.user_roles (admin, charity) checked via has_role(); charity logins are created only by the admin server function in src/lib/admin.functions.ts — keeps privileged account creation server-side.
- Charity area lives under src/routes/_authenticated/charity/ guarded by the charity role; dashboard KPIs come from pure helpers in src/lib/charity-stats.ts (tested) so numbers stay consistent.
- Charity logos are stored as resized image strings on charities.logo_url because public storage buckets are blocked in this workspace; legal documents go to the private charity-docs bucket.
