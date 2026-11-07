# GiveBack

A micro-volunteering platform that matches people with short charity tasks that fit into their day.

**Status:** Prototype
**Live prototype:** https://give-back.lovable.app
**Case study:** on my portfolio, under Work > GiveBack
**Original brief:** [docs/original-brief.md](docs/original-brief.md)

---

## The problem

Small local charities often need help with short tasks, such as sorting donations or covering an event for two hours. Most volunteering platforms are built around regular weekly commitments, so these gaps are usually filled through social media posts and word of mouth.

At the same time, many people want to help but do not have a fixed weekly slot.

The problem is a mismatch between how charities need help and how volunteering is organised.

## Stakeholders

| Stakeholder | What they need |
| --- | --- |
| Volunteers | Find short, nearby tasks that match their time and the causes they care about |
| Charity coordinators | Post a task quickly and know it will be covered |
| Local reward partners (cafés, shops) | Visibility with local customers in exchange for small rewards |
| Donors | A simple way to support a charity when they have no time to give |

## Current process

1. A charity identifies a short-term need.
2. The coordinator posts it on social media or sends it to an email list.
3. Volunteers who happen to see it reply individually.
4. The coordinator confirms people one by one and follows up manually.
5. Volunteers get no record of the time they have given.

Pain points: low visibility, manual coordination, no way to search nearby tasks and no recognition for volunteers.

## Proposed process

1. The charity posts a task in its own space, with time, place and number of people needed.
2. Volunteers filter by city, cause and available time.
3. The volunteer books the task and both sides see the confirmation.
4. After the task, the volunteer earns points.
5. Points unlock rewards at partner cafés and shops.
6. People with no time that week can donate to the charity instead.

## Requirements

### Functional

- Volunteers can set their city, preferred causes and available time.
- Volunteers can search and filter open tasks.
- Volunteers can book and cancel a task.
- Charity accounts are created by an administrator after checks, not through open sign-up.
- Charities can create, edit and close their own tasks and upload legal documents.
- Charities see a dashboard with key figures for their tasks and volunteers.
- A UK map shows where help is needed.
- A community page shows how people are giving back in each city, without individual rankings.
- Points are awarded per booking and reversed if the booking is cancelled.
- Points can be redeemed for partner rewards.
- Users can donate directly to a charity.

### Non-functional

- Simple enough to use on a phone in under a minute.
- Volunteer and charity data handled in line with UK GDPR.
- Clear roles and permissions for volunteers, charities and administrators.
- Privileged actions, such as creating charity accounts, run on the server only.

## Success measures for a pilot

- Share of posted tasks that get booked
- Time between a task being posted and being booked
- Share of volunteers who book a second task
- Booked tasks that are completed rather than cancelled
- Number of rewards redeemed with partners

## Assumptions and risks

| Assumption or risk | How to address it |
| --- | --- |
| Local businesses will fund rewards in exchange for visibility | Test with a small number of Manchester partners before scaling |
| Some tasks involve children or vulnerable adults | Add safeguarding checks and let charities mark tasks that need them |
| Personal data is collected | Collect only what is needed and follow UK GDPR |
| No-shows could reduce charity trust | Add reminders, cancellation rules and a reliability record |

## What the prototype covers

- Volunteer onboarding with city, causes and time
- Task discovery, filtering, booking and cancellation
- Volunteer profile with upcoming bookings
- Charity space to post and manage tasks, with a dashboard
- Admin area to create and manage charity accounts
- UK map of open tasks
- City community page
- Points and rewards
- Donation page (payment connection planned, not active yet)

## Next steps

1. Run a short pilot with a few Manchester charities.
2. Interview coordinators and volunteers to validate the requirements.
3. Track the pilot success measures and compare them with current channels.
4. Add safeguarding and reminder features before a wider launch.

## Built with

React, TanStack Start, TypeScript, Tailwind CSS and Lovable Cloud (Supabase).

The first version was built at the BuildHer x Lovable one-day MVP event.

## Working on the code

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/355e52ea-b752-494b-8af3-7a1794681503).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm. [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Author

Wiam El Youbi, Manchester
