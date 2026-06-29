"use client";

import { useState } from "react";
import { Search, Star, GitFork, BookOpen, MapPin, Link, XIcon, ExternalLink, ArrowLeft } from "lucide-react";
import Link2 from "next/link";

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  location: string;
  blog: string;
  twitter_username: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  created_at: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  fork: boolean;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#ffac45",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Vue: "#41b883",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

export default function GitHubPage() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [filterLang, setFilterLang] = useState("all");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setUser(null);
    setRepos([]);
    setSearched(true);
    setFilterLang("all");

    try {
      const res = await fetch(`/api/github/${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setUser(data.user);
        setRepos(data.repos);
      }
    } catch {
      setError("Failed to connect to the GitHub API");
    } finally {
      setIsLoading(false);
    }
  };

  const languages = [
    "all",
    ...Array.from(new Set(repos.map((r) => r.language).filter(Boolean))),
  ];

  const filteredRepos =
    filterLang === "all"
      ? repos
      : repos.filter((r) => r.language === filterLang);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans transition-colors duration-300">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link2
            href="/"
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Tasks
          </Link2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              GitHub REST API
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-3">
            GitHub Explorer
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-base">
            Search any GitHub user and explore their public profile and repositories.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-12">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            id="github-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a GitHub username..."
            className="w-full pl-11 pr-28 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 shadow-sm transition-all text-base"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 text-white rounded-xl transition-all duration-200 shadow-md font-medium text-sm"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent" />
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="max-w-xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50 text-sm text-center">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && searched && !user && (
          <div className="text-center py-16 text-neutral-500 dark:text-neutral-400">
            No user found.
          </div>
        )}

        {/* Results */}
        {!isLoading && user && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm sticky top-6">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-24 h-24 rounded-full border-4 border-purple-100 dark:border-purple-900 mb-4 mx-auto lg:mx-0"
                />
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {user.name || user.login}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">@{user.login}</p>
                {user.bio && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-3 mb-4 leading-relaxed">
                    {user.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-5 py-4 border-y border-neutral-100 dark:border-neutral-800">
                  <div className="text-center">
                    <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{formatNumber(user.public_repos)}</p>
                    <p className="text-xs text-neutral-500">Repos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{formatNumber(user.followers)}</p>
                    <p className="text-xs text-neutral-500">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{formatNumber(user.following)}</p>
                    <p className="text-xs text-neutral-500">Following</p>
                  </div>
                </div>

                {/* Meta info */}
                <div className="space-y-2 text-sm">
                  {user.location && (
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <MapPin size={14} />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.blog && (
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 truncate">
                      <Link size={14} className="flex-shrink-0" />
                      <a href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" className="truncate hover:text-purple-500 transition-colors">
                        {user.blog}
                      </a>
                    </div>
                  )}
                  {user.twitter_username && (
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <XIcon size={14} />
                      <a href={`https://twitter.com/${user.twitter_username}`} target="_blank" rel="noopener noreferrer" className="hover:text-purple-500 transition-colors">
                        @{user.twitter_username}
                      </a>
                    </div>
                  )}
                </div>

                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 mt-5 w-full py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  View on GitHub <ExternalLink size={14} />
                </a>
                <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-3">
                  Joined {formatDate(user.created_at)}
                </p>
              </div>
            </div>

            {/* Repos */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Repositories
                  <span className="ml-2 text-sm font-normal text-neutral-400">
                    ({filteredRepos.length})
                  </span>
                </h3>
              </div>

              {/* Language Filter */}
              {languages.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setFilterLang(lang)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        filterLang === lang
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-purple-400"
                      }`}
                    >
                      {lang === "all" ? "All" : lang}
                    </button>
                  ))}
                </div>
              )}

              {/* Repo List */}
              <div className="space-y-3">
                {filteredRepos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-purple-400 dark:hover:border-purple-700 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <BookOpen size={15} className="text-purple-500 flex-shrink-0" />
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                          {repo.name}
                        </span>
                        {repo.fork && (
                          <span className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                            fork
                          </span>
                        )}
                      </div>
                      <ExternalLink size={14} className="text-neutral-300 dark:text-neutral-600 group-hover:text-purple-400 flex-shrink-0 mt-0.5 transition-colors" />
                    </div>

                    {repo.description && (
                      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">
                        {repo.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-neutral-400">
                      {repo.language && (
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || "#8b8b8b" }}
                          />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star size={12} /> {formatNumber(repo.stargazers_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork size={12} /> {formatNumber(repo.forks_count)}
                      </span>
                      <span className="ml-auto">Updated {formatDate(repo.updated_at)}</span>
                    </div>
                  </a>
                ))}
              </div>

              {filteredRepos.length === 0 && (
                <div className="text-center py-12 text-neutral-400 dark:text-neutral-600">
                  No repositories found for this language.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
