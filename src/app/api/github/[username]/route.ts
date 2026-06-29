import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  if (!username || username.trim() === "") {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  try {
    // Fetch user profile and repos in parallel
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        next: { revalidate: 60 }, // cache for 60 seconds
      }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        next: { revalidate: 60 },
      }),
    ]);

    if (userRes.status === 404) {
      return NextResponse.json({ error: "GitHub user not found" }, { status: 404 });
    }

    if (!userRes.ok) {
      return NextResponse.json({ error: "Failed to fetch user from GitHub" }, { status: userRes.status });
    }

    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    // Sort repos by stars descending
    const sortedRepos = Array.isArray(repos)
      ? repos.sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
      : [];

    return NextResponse.json({ user, repos: sortedRepos }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
