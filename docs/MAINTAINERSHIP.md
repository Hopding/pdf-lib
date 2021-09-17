# Maintainership

Hello friend! I'm @hopding, the principal maintainer of `pdf-lib` 👋. I [started the project](https://github.com/Hopding/pdf-lib/commit/fd7459e5ecee898c4f6bbccae021af2d837d64be) in September, 2017 and have been building and maintaining it ever since 🙂. If you'd like to help me maintain `pdf-lib`, see [here](#becoming-a-maintainer).

I value the time and effort contributors put into improving the project. I also appreciate `pdf-lib`'s users and understand that they have questions about the project and suggestions for how to improve it.

I've written this guide to help set expectations for the community about how I approach maintainership and what can be expected from me <sup>[1](#footnote-1)</sup>. Some important things to note:

- I am not paid to maintain `pdf-lib` ([details](#donations-and-compensation)).
- I spend about 5 hours each week on the project.
- I prioritize reading and answering questions/suggestions from _contributors_ ([details](#communication)).
- I can't read or answer all questions/suggestions from _users_ ([details](#communication)).
- I have many other commitments, including a full time job.

## Communication

In the project's early days I was able to read and answer all communications from users. I could also spend large chunks of time investigating, reproducing, and fixing issues. All this while still building out new features and improvements 🚀.

I could do this primarily because there simply weren't very many users back then! This is no longer the case. Today there are thousands of individuals and organizations depending on `pdf-lib`. But there's still just one @hopding 🙂.

This means I can no longer read or answer all communications from `pdf-lib` users. I also have to be choosy about what forums I use to communicate about the project in order to maximize my impact and share information to a broader audience.

I use three main channels for `pdf-lib` communication: [issues](#issues), [pull requests](#pull-requests), and [discussions](#discussions). I use these channels because they are public. This means that:

- Community members can pitch in and help out.
- Other users can benefit from discussions.
- Search engines can index and distribute the information.

More details on each of these channels below.

If you want to message me privately, please read the [email](#email) and [discord](#discord) sections.

## Issues

Issues are used for three purposes:

1. Reporting bugs
2. Tracking work
3. Sharing proposals

Each category has a corresponding template outlining what information must be provided for that type of issue.

I do my best to triage issues within 1-2 weeks after they're created. Triaging an issue means applying a label or closing it. I typically follow this process:

- If it doesn't fit the above criteria then close it.
- If it's a proposal the apply a label.
- If it's tracking active work then apply a label.
- If it's a bug then apply a label denoting its severity.

All open issues must have an assignee who is actively working them. Issues are closed after 3 weeks of inactivity once they've been triaged. High impact bugs are the only exception to this rule, they remain open until a fix has been shipped.

A few other important things to note:

- **Issues are not used to ask questions or provide feedback.** Use [discussions](#discussions) instead.
- Issues can be used for proposals **only if** they have been clearly thought out and have a clear path to implementation. Most proposals should out start as a [discussion](#discussions) and eventually produce an issue.
- Closed issues can be reopened! Often issues are closed because they simply weren't prioritized and nobody was available to work on them. If you see an issue that's been closed and would like to work on it, ask if it can be reopened.

See also [Communicating on GitHub](https://docs.github.com/en/get-started/quickstart/communicating-on-github). This [blog post](https://steveklabnik.com/writing/how-to-be-an-open-source-gardener) provides insight into the issue triage process.

## Pull Requests

Contributions to `pdf-lib` are made via pull requests and are an important part of the project! Lots of valuable features have been added to the library through contributions from the community 💖.

Please note that each PR should be focused, targeting a specific feature, bug fix, or improvement. A PR should not contain multiple orthogonal changes grouped together.

Consider writing a proposal issue for PRs that involve a nontrivial amount of effort to create. This will reduce the liklihood that you spend time on something that won't ultimately be merged.

> Changes are only merged into `master` when they are 100% ready to be released. `master` never contains code that isn't ready to be shipped.

A few general things to keep in mind:

- There is a high bar for contributions to `pdf-lib`. Your code must be well tested, well documented, and well written.
- Merging a PR comes with a cost. Once a feature is merged into `pdf-lib`, it's there for good and must be maintained.
- PRs justify this cost if they are stable and provide value for a large number of users.
- PDFs are complicated and can be difficult to understand. It's important to read the spec and test carefully.
- Breaking changes impose a very high maintenance burden and disturb users. As such they require strong justification and are unlikely to be merged.

A complete list of PR requirements is outlined in the PR template.

I use the following checklist when reviewing PRs:

1. **Understand what it does.**
2. **Understand why it is necessary or useful.**
3. **Validate its intent.** PRs must justify the maintenance burden they create.
4. **Test that it works.** Including edge cases.
5. **Understand how it works.** Important for lots of reasons.
6. **Review the implementation.** The code itself as well as comments, patterns, architecture, etc...
7. **Approve and merge.** The fun part! 🎉 🎊
8. **Release.** See [Cutting Releases](#cutting-releases).

> Note that sometimes PRs will need minor changes before they're ready for release. It may be easier to make the changes myself than to write review comments. In these cases, I will merge the PR into a temporary branch, make the changes, and merge the temporary branch into `master`.

As you can see, reviewing a PR is quite a bit of work and can take a fair amount of time. I prioritize PR reviews over most other maintenance work. I try to leave initial comments (if not a full review) within 1-2 weeks of a PR's creation.

PRs can become stale. Just like issues, PRs will be closed after 3 weeks of inactivity once they've been triaged. If you'd like to finish up a PR that was closed after becoming stale, feel free to leave a comment. Like issues, closed PRs can be reopened.

If you're thinking about submitting a PR, I tip my hat to you 🎩 ✨. Contribution's like yours are what open source such a force in the world!

## Discussions

StackOverflow is also a good place for some of this stuff...

Response times...

## Cutting Releases

Is expensive due to amount of manual testing in different readers and environments.

Response times...

See also the release process...

## Email

You can communicate privately with me via email (`andrew.dillon.j@gmail.com`), but that doesn't mean you should. Most `pdf-lib` related communication should happen in [issues](#issues), [pull requests](#pull-requests), and [discussions](#discussions). If you send me an email asking a question about `pdf-lib` or proposing a new feature/enhancement, I will probably reply back asking you to create an issue or start a discussion.

However, email still makes sense in certain cases. Some things don't need to (or shouldn't) be public. If you want to talk about something like this, feel free to email me. Here are some examples of situations where email makes sense:

- You want to share something cool you built with pdf-lib.
- You want to thank me for my work.
- You want to chat about something unrelated to pdf-lib.
- You want to discuss making a donation.
- You want to pay me to work on something for you ([details](#donations-and-compensation)).

I do my best to respond to most emails within 1-2 weeks.

## Discord

A few things about Discord:

- There is an official `pdf-lib` [discord server](https://discord.gg/Y7uuVMc).
- Discord is a fine way to engage with the `pdf-lib` community.
- Discord is not a good way to contact me. I rarely login to Discord.

## Donations and Compensation

## Becoming a Maintainer

## Footnotes

<a name="footnote-1">1</a>: This guide is partially inspired by https://opensource.guide/best-practices.
