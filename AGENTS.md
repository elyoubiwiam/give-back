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
