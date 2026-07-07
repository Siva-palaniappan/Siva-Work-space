Ship the current uncommitted changes: create a branch, commit, push, and open a pull request — end to end, without asking the user for input at any step. Use sensible defaults and just proceed; only stop early if there is a real blocker (e.g. nothing to commit, or uncommitted changes that look unrelated/risky to include).

Steps to follow:

1. Run `git status --porcelain=v1` and `git diff` (and `git diff --cached` if anything is already staged) to see exactly what changed. If there is nothing to commit, tell the user and stop — do not create an empty branch/commit.

2. Check for anything that shouldn't be committed (`.env`, credentials, secrets, stray build output) before staging anything. Never stage those files; if the only changes are in files like this, stop and tell the user instead of committing them.

3. Determine the base branch: this repo deploys from `main` (Netlify's production branch), so branch off `main` unless the working tree is already stacked on top of another in-progress feature branch — use judgement, but default to `main`.

4. Derive a short, descriptive kebab-case branch name from the actual content of the changes (read the diff/file list yourself and summarize what changed — don't just concatenate filenames). Prefix it `feature/` to match this repo's convention, e.g. `feature/add-expense-date-filter`.

5. Create the branch: `git checkout -b <branch-name>`.

6. Stage the relevant changed files explicitly (never `git add -A` / `git add .` blindly).

7. Commit with a concise message describing *why* the change was made (not just what), matching this repo's existing commit style (check `git log --oneline` for examples). Always end the commit message with:
   ```
   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   ```

8. Push: `git push -u origin <branch-name>`.

9. Open the PR:
   - Check `gh auth status` first.
   - If authenticated, run `gh pr create --base main --head <branch-name> --title "..." --body "..."` and report the returned URL.
   - If `gh` is not authenticated, don't stop to sort out authentication or ask the user to log in mid-task — just hand back the manual PR-creation link instead: `https://github.com/Siva-palaniappan/Siva-Work-space/compare/main...<branch-name>`.

10. Report back concisely: the branch name, a one-line summary of the commit, and either the PR URL or the manual-merge link — no other confirmation needed.
