import { useEffect, useState } from "react";
import "./style.css";

const STORAGE_KEY = "bookmarks";

function isValidUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export default function App() {
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

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

    setBookmarks((prev) => [...prev, { name: trimmedName, url: trimmedUrl }]);
    setName("");
    setUrl("");
  }

  function handleRemoveBookmark(target) {
    setBookmarks((prev) =>
      prev.filter((b) => !(b.name === target.name && b.url === target.url))
    );
  }

  return (
    <div className="app-container">
      <h1>Bookmark Saver</h1>

      <div className="input-container">
        <input
          type="text"
          placeholder="Bookmark Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Bookmark URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button onClick={handleAddBookmark}>Add Bookmark</button>
      </div>

      <ul id="bookmark-list">
        {bookmarks.map((b, index) => (
          <li key={`${b.name}-${b.url}-${index}`}>
            <a href={b.url} target="_blank" rel="noreferrer">
              {b.name}
            </a>
            <button onClick={() => handleRemoveBookmark(b)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
