import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { formatBonsaiDisplayText } from "@/lib/bonsai-display";
import { collectBonsaiTimelineImages } from "@/lib/bonsai-images";
import type { BonsaiDetail, BonsaiSummary, PostCommentDto, PostDto } from "@/types/dto";
import { POST_TYPE_LABELS, POST_TYPE_OPTIONS } from "@/types/domain";

interface FeedResponse {
  ok: boolean;
  data?: {
    items: PostDto[];
  };
  error?: {
    message: string;
  };
}

interface BonsaiListResponse {
  ok: boolean;
  data?: {
    items: BonsaiSummary[];
  };
}

interface ComposerImage {
  image: string;
  date: string;
  source: string;
}

function collectComposerImages(bonsai: BonsaiDetail | null): ComposerImage[] {
  return collectBonsaiTimelineImages(bonsai).map(({ image, date, source }) => ({ image, date, source }));
}

export default function FeedPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      void router.replace("/");
    },
  });
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [bonsais, setBonsais] = useState<BonsaiSummary[]>([]);
  const [selectedBonsaiId, setSelectedBonsaiId] = useState<string>("");
  const [selectedBonsai, setSelectedBonsai] = useState<BonsaiDetail | null>(null);
  const [entryIds, setEntryIds] = useState<number[]>([]);
  const [manualImages, setManualImages] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [postType, setPostType] = useState<(typeof POST_TYPE_OPTIONS)[number]>("SHOWCASE");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerStep, setComposerStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const availableImages = useMemo(() => collectComposerImages(selectedBonsai), [selectedBonsai]);
  const effectiveImages = useMemo(
    () => manualImages.filter((image, index) => manualImages.indexOf(image) === index && availableImages.some((item) => item.image === image)).slice(0, 5),
    [availableImages, manualImages],
  );
  const canSubmit = text.trim().length > 0 && !!selectedBonsaiId;

  async function loadFeed() {
    const response = await fetch("/api/posts");
    const json = (await response.json()) as FeedResponse;
    if (!response.ok || !json.ok || !json.data) {
      throw new Error(json.error?.message ?? "Der Feed konnte nicht geladen werden.");
    }
    setPosts(json.data.items);
  }

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    void (async () => {
      try {
        const [feedResponse, bonsaiResponse] = await Promise.all([
          fetch("/api/posts"),
          fetch("/api/bonsais?limit=50"),
        ]);
        const feedJson = (await feedResponse.json()) as FeedResponse;
        const bonsaiJson = (await bonsaiResponse.json()) as BonsaiListResponse;

        if (!feedResponse.ok || !feedJson.ok || !feedJson.data) {
          throw new Error(feedJson.error?.message ?? "Der Feed konnte nicht geladen werden.");
        }
        if (!bonsaiResponse.ok || !bonsaiJson.ok || !bonsaiJson.data) {
          throw new Error((bonsaiJson as { error?: { message?: string } }).error?.message ?? "Die Bonsais für den Composer konnten nicht geladen werden.");
        }

        setPosts(feedJson.data.items);
        setBonsais(bonsaiJson.data.items);
        if (bonsaiJson.data.items[0] && !selectedBonsaiId) {
          setSelectedBonsaiId(String(bonsaiJson.data.items[0].id));
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Der Feed konnte nicht geladen werden.");
      }
    })();
  }, [status, selectedBonsaiId]);

  useEffect(() => {
    if (!selectedBonsaiId || !composerOpen) {
      return;
    }

    void (async () => {
      const response = await fetch(`/api/bonsais/${selectedBonsaiId}`);
      const json = (await response.json()) as { ok: boolean; data?: BonsaiDetail; error?: { message: string } };
      if (!response.ok || !json.ok || !json.data) {
        setError(json.error?.message ?? "Der ausgewählte Bonsai konnte nicht geladen werden.");
        return;
      }
      setSelectedBonsai(json.data);
      setManualImages((current) =>
        current.filter((image) => json.data?.images.includes(image) || json.data?.subEntries.some((entry) => entry.images.includes(image))),
      );
      setError(null);
    })();
  }, [selectedBonsaiId, composerOpen]);

  function resetComposerState() {
    setEditingPostId(null);
    setText("");
    setEntryIds([]);
    setManualImages([]);
    setPostType("SHOWCASE");
    setComposerStep(0);
    setSelectedBonsai((current) => current);
  }

  function openComposer() {
    if (!bonsais.length) {
      return;
    }
    if (!selectedBonsaiId) {
      setSelectedBonsaiId(String(bonsais[0].id));
    }
    setComposerOpen(true);
    setComposerStep(0);
  }

  function closeComposer() {
    setComposerOpen(false);
    resetComposerState();
  }

  async function handleCreateOrUpdatePost() {
    if (!selectedBonsaiId) {
      return;
    }

    setError(null);
    const response = await fetch(editingPostId ? `/api/posts/${editingPostId}` : "/api/posts", {
      method: editingPostId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bonsaiId: Number(selectedBonsaiId),
        text,
        postType,
        entryIds,
        manualImages: effectiveImages,
      }),
    });
    const json = (await response.json()) as { ok: boolean; data?: PostDto; error?: { message: string } };
    if (!response.ok || !json.ok || !json.data) {
      setError(json.error?.message ?? "Der Post konnte nicht gespeichert werden.");
      return;
    }

    setPosts((current) => {
      if (editingPostId) {
        return current.map((post) => (post.id === editingPostId ? json.data! : post));
      }
      return [json.data!, ...current];
    });
    closeComposer();
  }

  async function toggleLike(postId: number) {
    const response = await fetch(`/api/posts/${postId}/likes`, { method: "POST" });
    if (!response.ok) {
      setError("Das Like konnte nicht aktualisiert werden.");
      return;
    }
    await loadFeed();
  }

  async function createComment(postId: number, commentText: string) {
    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: commentText }),
    });
    if (!response.ok) {
      setError("Der Kommentar konnte nicht gespeichert werden.");
      return;
    }
    await loadFeed();
  }

  async function deletePost(postId: number) {
    const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Der Post konnte nicht gelöscht werden.");
      return;
    }
    setPosts((current) => current.filter((post) => post.id !== postId));
    if (editingPostId === postId) {
      closeComposer();
    }
  }

  if (status !== "authenticated") {
    return null;
  }

  return (
    <main className="page-shell mx-auto max-w-6xl px-4 py-6">
      <div className="hero-panel mb-6 flex flex-col gap-4 rounded-[2rem] p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Community Feed</p>
          <h1 className="text-3xl font-bold">Zeige Fortschritte oder frage die Community</h1>
          <p className="mt-2 text-base-content/70">Posts und Profile sind innerhalb der geschlossenen Beta für alle eingeloggten Tester sichtbar.</p>
        </div>
        <button className="btn btn-primary btn-sm md:btn-md" onClick={openComposer} disabled={bonsais.length === 0}>
          Beitrag erstellen
        </button>
      </div>

      {error ? <div className="alert alert-error mb-6">{error}</div> : null}

      {bonsais.length === 0 ? (
        <section className="surface-card card border-dashed mb-6">
          <div className="card-body">
            <h2 className="card-title">Noch keine Bonsais für Posts</h2>
            <p>Lege zuerst einen Bonsai an. Danach kannst du jederzeit einen Beitrag im Feed erstellen.</p>
            <Link href="/create-bonsai" className="btn btn-primary w-fit">Bonsai anlegen</Link>
          </div>
        </section>
      ) : null}

      {posts.length === 0 ? (
        <section className="surface-card card border-dashed">
          <div className="card-body">
            <h2 className="card-title">Noch keine Posts</h2>
            <p>Veröffentliche deinen ersten Fortschritt oder stelle eine Frage an die Community.</p>
          </div>
        </section>
      ) : null}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={Number(session?.user.id)}
            onLike={toggleLike}
            onComment={createComment}
            onDelete={deletePost}
            onEdit={(currentPost) => {
              setEditingPostId(currentPost.id);
              setSelectedBonsaiId(String(currentPost.bonsaiId));
              setText(currentPost.text);
              setPostType(currentPost.postType);
              setManualImages(currentPost.images);
              setEntryIds(currentPost.entryReferenceIds.filter((entryId): entryId is number => entryId !== null));
              setComposerOpen(true);
              setComposerStep(0);
            }}
          />
        ))}
      </div>

      <dialog className={`modal ${composerOpen ? "modal-open" : ""}`}>
        <div className="modal-box max-w-5xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{editingPostId ? "Post bearbeiten" : "Neuen Post erstellen"}</h2>
              <p className="text-sm text-base-content/65">Erst nach Klick auf diesen Einstieg öffnet sich der Wizard. Bilder sind optional.</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={closeComposer}>Schliessen</button>
          </div>

          <div className="join my-6 w-full">
            {["Grunddaten", "Bilder", "Kontext"].map((label, index) => (
              <button
                key={label}
                type="button"
                className={`btn join-item flex-1 ${composerStep === index ? "btn-primary" : "btn-outline"}`}
                onClick={() => setComposerStep(index)}
              >
                {index + 1}. {label}
              </button>
            ))}
          </div>

          {composerStep === 0 ? (
            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <fieldset className="fieldset gap-2">
                  <legend className="fieldset-legend text-sm font-medium">Bonsai</legend>
                  <select className="select select-bordered" value={selectedBonsaiId} onChange={(event) => setSelectedBonsaiId(event.target.value)}>
                    {bonsais.map((bonsai) => (
                      <option key={bonsai.id} value={bonsai.id}>{bonsai.name}</option>
                    ))}
                  </select>
                </fieldset>
                <fieldset className="fieldset gap-2">
                  <legend className="fieldset-legend text-sm font-medium">Post-Typ</legend>
                  <select className="select select-bordered" value={postType} onChange={(event) => setPostType(event.target.value as (typeof POST_TYPE_OPTIONS)[number])}>
                    {POST_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>{POST_TYPE_LABELS[option]}</option>
                    ))}
                  </select>
                </fieldset>
                <fieldset className="fieldset gap-2 md:col-span-2">
                  <legend className="fieldset-legend text-sm font-medium">Text</legend>
                  <textarea className="textarea textarea-bordered h-32" value={text} onChange={(event) => setText(event.target.value)} />
                </fieldset>
              </div>
            </section>
          ) : null}

          {composerStep === 1 ? (
            <section className="space-y-4">
              <div>
                <h3 className="font-semibold">Bilder für diesen Post</h3>
                <p className="text-sm text-base-content/65">
                  Optional. Du kannst bis zu 5 Bilder auswählen, musst aber kein Bild anhängen.
                </p>
              </div>
              {availableImages.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {availableImages.map((item) => {
                    const isSelected = effectiveImages.includes(item.image);
                    return (
                      <button
                        key={`${item.image}-${item.date}`}
                        type="button"
                        className={`relative overflow-hidden rounded-2xl border text-left ${isSelected ? "border-primary ring-2 ring-primary/30" : "border-base-300"}`}
                        onClick={() => {
                          setManualImages((current) => {
                            if (current.includes(item.image)) {
                              return current.filter((image) => image !== item.image);
                            }
                            if (current.length >= 5) {
                              return current;
                            }
                            return [...current, item.image];
                          });
                        }}
                      >
                        <img src={item.image} alt="Post-Auswahl" className="h-40 w-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/55 p-2 text-xs text-white">
                          <div className="flex items-center justify-between gap-2">
                            <span>{new Date(item.date).toLocaleDateString("de-DE")}</span>
                            <span>{item.source}</span>
                          </div>
                          <p className="mt-1 font-medium">
                            {isSelected ? "Ausgewählt" : effectiveImages.length >= 5 ? "Maximal 5 Bilder" : "Zum Auswählen klicken"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-base-300 p-4 text-sm text-base-content/70">
                  Dieser Bonsai hat noch keine Bilder. Du kannst den Post trotzdem ohne Bilder erstellen.
                </div>
              )}
              <p className="text-sm text-base-content/70">
                Aktuell ausgewählt: {effectiveImages.length} / 5 Bilder
              </p>
            </section>
          ) : null}

          {composerStep === 2 ? (
            <section className="space-y-4">
              <div>
                <h3 className="font-semibold">Timeline-Einträge als Kontext</h3>
                <p className="text-sm text-base-content/65">Optional. Diese Einträge geben deinem Post mehr Kontext, sind aber nicht nötig.</p>
              </div>
              {selectedBonsai?.subEntries.length ? (
                <div className="space-y-2">
                  {selectedBonsai.subEntries.map((entry) => (
                    <label key={entry.id} className="label cursor-pointer justify-start gap-3 rounded-2xl border border-base-300 p-3">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={entryIds.includes(entry.id)}
                        onChange={(event) => {
                          setEntryIds((current) =>
                            event.target.checked ? [...current, entry.id] : current.filter((item) => item !== entry.id),
                          );
                        }}
                      />
                      <span>{new Date(entry.date).toLocaleDateString("de-DE")} · {entry.entryType}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-base-300 p-4 text-sm text-base-content/70">
                  Noch keine Timeline-Einträge vorhanden. Du kannst den Post trotzdem veröffentlichen.
                </div>
              )}
            </section>
          ) : null}

          {!canSubmit ? (
            <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-base-content/80">
              {!selectedBonsaiId ? "Bitte wähle zuerst einen Bonsai." : "Bitte ergänze einen Text für den Post."}
            </div>
          ) : null}

          <div className="modal-action">
            <button className="btn btn-ghost" onClick={closeComposer}>Abbrechen</button>
            <button className="btn btn-outline" onClick={() => setComposerStep((current) => Math.max(0, current - 1))} disabled={composerStep === 0}>
              Zurück
            </button>
            {composerStep < 2 ? (
              <button className="btn btn-outline" onClick={() => setComposerStep((current) => Math.min(2, current + 1))}>
                Weiter
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => void handleCreateOrUpdatePost()} disabled={!canSubmit}>
                {editingPostId ? "Post speichern" : "Post veröffentlichen"}
              </button>
            )}
          </div>
        </div>
      </dialog>
    </main>
  );
}

function PostCard({
  post,
  currentUserId,
  onLike,
  onComment,
  onDelete,
  onEdit,
}: {
  post: PostDto;
  currentUserId: number;
  onLike: (postId: number) => Promise<void>;
  onComment: (postId: number, text: string) => Promise<void>;
  onDelete: (postId: number) => Promise<void>;
  onEdit: (post: PostDto) => void;
}) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<PostCommentDto[]>([]);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (!showComments) {
      return;
    }
    void (async () => {
      const response = await fetch(`/api/posts/${post.id}/comments`);
      const json = (await response.json()) as { ok: boolean; data?: { items: PostCommentDto[] } };
      if (response.ok && json.ok && json.data) {
        setComments(json.data.items);
      }
    })();
  }, [post.id, showComments]);

  return (
    <article className="surface-card card overflow-hidden">
      <div className="card-body gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className={`badge ${post.postType === "HELP" ? "badge-error" : "badge-outline"} mb-2`}>
              {POST_TYPE_LABELS[post.postType]}
            </div>
            <h2 className="card-title">
              <Link href={`/profile/${post.userId}`} className="link link-hover">{post.userName ?? "Unbekannt"}</Link>
            </h2>
            <p className="text-sm text-base-content/70">
              {post.snapshotName} · {formatBonsaiDisplayText(post.snapshotSpecies)} · {new Date(post.createdAt).toLocaleDateString("de-DE")}
            </p>
          </div>
          <span className="text-sm text-base-content/60">{post.commentCount} Kommentare</span>
        </div>

        <p>{post.text}</p>

        {post.images.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {post.images.map((image) => (
              <img key={image} src={image} alt={post.snapshotName} className="h-44 w-full rounded-2xl object-cover" />
            ))}
          </div>
        ) : null}

        <div className="card-actions justify-between">
          <div className="flex gap-2">
            <button className={`btn btn-sm ${post.viewerHasLiked ? "btn-primary" : "btn-outline"}`} onClick={() => void onLike(post.id)}>
              {post.viewerHasLiked ? "Liked" : "Like"} · {post.likeCount}
            </button>
            <button className="btn btn-sm btn-outline" onClick={() => setShowComments((current) => !current)}>
              Kommentare
            </button>
            {post.userId === currentUserId ? (
              <>
                <button className="btn btn-sm btn-outline" onClick={() => onEdit(post)}>
                  Bearbeiten
                </button>
                <button className="btn btn-sm btn-error" onClick={() => void onDelete(post.id)}>
                  Löschen
                </button>
              </>
            ) : null}
          </div>
          <Link href={`/profile/${post.userId}`} className="btn btn-sm btn-ghost">Profil</Link>
        </div>

        {showComments ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {comments.map((item) => (
                <div key={item.id} className="rounded-2xl border border-base-300 p-3">
                  <p className="text-sm font-semibold">{item.userName ?? "Unbekannt"}</p>
                  <p className="text-sm text-base-content/70">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input input-bordered flex-1" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Kommentar schreiben" />
              <button
                className="btn btn-primary"
                disabled={!comment.trim()}
                onClick={async () => {
                  await onComment(post.id, comment);
                  setComment("");
                  setShowComments(false);
                }}
              >
                Senden
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
