import { ArchiveCard } from "@/components/archive-card";
import { getMessages } from "@/lib/messages";
import { getPosts } from "@/lib/posts";
import { getRequestPreferences } from "@/lib/request-preferences";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { locale } = await getRequestPreferences();
  const messages = getMessages(locale);
  const posts = await getPosts(messages.card);

  return (
    <main className="archive-shell">
      {posts.length ? (
        <div className="archive-grid">
          {posts.map((post, index) => (
            <ArchiveCard key={post.id} post={post} priority={index === 0} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h1>{messages.emptyTitle}</h1>
          <p>{messages.emptyDescription}</p>
        </div>
      )}
    </main>
  );
}
