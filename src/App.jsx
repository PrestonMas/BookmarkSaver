import { useEffect, useMemo, useState } from "react";
import "./style.css";

const STORAGE_KEY = "bookmarks_v1";
const DEFAULT_CATEGORIES = ["School", "Work", "Personal", "Social", "Music", "Other"];

function isValidUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function parseTags(rawTags) {
  return rawTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.toLowerCase());
}

export default function App() {
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState("");


  //Filters
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const allTags = useMemo(() => {
    const set = new Set();
    for (const b of bookmarks) {
      (b.tags || []).forEach((t) => set.add(t));
    }
    return Array.from(set).sort();
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      const categoryOk = categoryFilter === "All" || b.category === categoryFilter;
      const tagOk = !tagFilter || (b.tags || []).includes(tagFilter);
      return categoryOk && tagOk;
    });
  }, [bookmarks, categoryFilter, tagFilter]);


  function handleAddBookmark() {
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName || !trimmedUrl) {
      alert("Please enter both a name and a URL.");
      return;
    }
    if (!isValidUrl(trimmedUrl)) {
      alert("Please enter a valid URL starting with http:// or https://");
      return;
    }

    const tags = parseTags(tagsInput);

    const isDuplicate = bookmarks.some(
      (b) => b.name === trimmedName && b.url === trimmedUrl
    );

    if (isDuplicate) {
      alert("This bookmark already exists.");
      // TODO: toast notification
      return;
    }

    const newBookmark = {
      id: crypto.randomUUID(),
      name: trimmedName,
      url: trimmedUrl,
      category,
      tags,
      createdAt: Date.now(),
    };

    setBookmarks((prev) => [newBookmark, ...prev]);
    setName("");
    setUrl("");
    setTagsInput("");

  }

  function handleRemoveBookmark(id) {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  function clearTagFilter() {
    setTagFilter("");
  }

  return (
    <div className="app-container">
      <h1>Bookmark Saver</h1>

      {/* Filters */}
      <div className="filters">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          {DEFAULT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        >
          <option value="">All Tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              #{t}
            </option>
          ))}
        </select>

        {tagFilter && (
          <button className="secondary" onClick={clearTagFilter}>
            Clear Tag
          </button>
        )}
      </div>

      {/* Add form */}
      <div className="input-container">
        <input
          type="text"
          placeholder="Bookmark Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Bookmark URL (https://...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {DEFAULT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Tags (comma-separated: school, cs, tools)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        <button onClick={handleAddBookmark}>Add Bookmark</button>
      </div>

      {/* List */}
      <ul id="bookmark-list">
        {filteredBookmarks.map((b) => (
          <li key={b.id} className="bookmark-item">
            <div className="bookmark-main">
              <a href={b.url} target="_blank" rel="noreferrer">
                {b.name}
              </a>
              <div className="meta">
                <span className="category">{b.category}</span>

                {(b.tags || []).length > 0 && (
                  <div className="tags">
                    {b.tags.map((t) => (
                      <button
                        key={t}
                        className="tag"
                        type="button"
                        onClick={() => setTagFilter(t)}
                        title="Filter by this tag"
                      >
                        #{t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => handleRemoveBookmark(b.id)}>Remove</button>
          </li>
        ))}
      </ul>

      {filteredBookmarks.length === 0 && (
        <p className="empty">No bookmarks match your filters.</p>
      )}
    </div>
  );
}

