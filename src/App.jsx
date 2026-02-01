import { useEffect, useMemo, useRef, useState } from "react";
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

  function CustomSelect({ label, value, options, onChange }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const active = options.find((opt) => opt.value === value) || options[0];

    useEffect(() => {
      function handleClickOutside(event) {
        if (!containerRef.current?.contains(event.target)) {
          setOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="select" ref={containerRef}>
        <button
          className="select-trigger"
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="select-label">{label}</span>
          <span className="select-display">
            <span className="select-value">{active.label}</span>
            <span className="select-caret" aria-hidden="true" />
          </span>
        </button>
        {open && (
          <ul className="select-menu" role="listbox">
            {options.map((option) => (
              <li key={option.value} role="option" aria-selected={option.value === value}>
                <button
                  type="button"
                  className={`select-option${option.value === value ? " active" : ""}`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const categoryOptions = [
    { value: "All", label: "All Categories" },
    ...DEFAULT_CATEGORIES.map((c) => ({ value: c, label: c })),
  ];

  const tagOptions = [
    { value: "", label: "All Tags" },
    ...allTags.map((t) => ({ value: t, label: `#${t}` })),
  ];

  const addCategoryOptions = DEFAULT_CATEGORIES.map((c) => ({ value: c, label: c }));

  return (
    <div className="app-container">
      <h1>Bookmark Saver</h1>

      {/* Filters */}
      <div className="filters">
        <CustomSelect
          label="Category"
          value={categoryFilter}
          options={categoryOptions}
          onChange={setCategoryFilter}
        />

        <CustomSelect
          label="Tag"
          value={tagFilter}
          options={tagOptions}
          onChange={setTagFilter}
        />

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

        <CustomSelect
          label="Add Category"
          value={category}
          options={addCategoryOptions}
          onChange={setCategory}
        />

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

            <button className="remove-btn" onClick={() => handleRemoveBookmark(b.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      {filteredBookmarks.length === 0 && (
        <p className="empty">No bookmarks match your filters.</p>
      )}
    </div>
  );
}
