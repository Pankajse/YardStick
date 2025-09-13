import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Pen, Trash2, Plus, LogOut, Crown, Frown } from "lucide-react"; // Icon library

// --- Type Definitions (unchanged) ---
type Note = {
  id: string;
  title: string;
  content: string;
};

type DecodedToken = {
  userId: string;
  tenantId: string;
  role: "ADMIN" | "MEMBER";
  tenantSlug: string;
  exp: number;
};

export default function Notes() {
  // --- State Management (unchanged) ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [role, setRole] = useState<"ADMIN" | "MEMBER" | null>(null);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.exp * 1000 < Date.now()) {
          handleLogout();
          return;
        }
        console.log(decoded)
        setRole(decoded.role);
        setTenantSlug(decoded.tenantSlug);
      } catch {
        setError("Invalid session, please log in again.");
        setTimeout(handleLogout, 2000);
      }
    } else {
      navigate("/");
    }
  }, [token, navigate]);

  async function fetchNotes() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setNotes(data);
      } else {
        setError(data.message || "Failed to fetch notes");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function addOrUpdateNote(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);

    const url = editingNote
      ? `${import.meta.env.VITE_BASE_URL}/notes/${editingNote.id}`
      : `${import.meta.env.VITE_BASE_URL}/notes`;
    const method = editingNote ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (res.ok) {
        if (editingNote) {
          setNotes((prev) =>
            prev.map((note) => (note.id === editingNote.id ? data : note))
          );
        } else {
          setNotes((prev) => [...prev, data]);
        }
        // Reset form state
        setTitle("");
        setContent("");
        setEditingNote(null);
        setShowForm(false);
      } else {
        setError(data.message || "Failed to save note. Please try again.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    }
  }

  async function deleteNote(id: string) {
    if (!token) return;
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setNotes((prev) => prev.filter((note) => note.id !== id));
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete note.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    }
  }

  async function upgradeTenant() {
    if (!token || !tenantSlug) return;
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/tenants/${tenantSlug}/upgrade`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Tenant upgraded to PRO successfully!");
      } else {
        setError(data.message || "Upgrade failed. Please contact support.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("tenantId");
    navigate("/");
  };

  // Fetch notes on initial component mount
  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token]);

  // Handler to open the "Add Note" form
  const handleAddNoteClick = () => {
    setEditingNote(null);
    setTitle("");
    setContent("");
    setShowForm(true);
  };

  // Handler to open the "Edit Note" form
  const handleEditNoteClick = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setShowForm(true);
  };
  
  // Handler to close the form
  const closeForm = () => {
    setShowForm(false);
    setEditingNote(null);
  }

  return (
    <div className="min-h-screen w-full bg-slate-100 font-sans text-slate-800">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* --- Header Section --- */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-700 mb-4 sm:mb-0">
            My Notes
          </h1>
          <div className="flex items-center gap-3">
            {role === "ADMIN" && (
              <button
                onClick={upgradeTenant}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <Crown size={18} />
                Upgrade Plan
              </button>
            )}
            <button
              onClick={handleAddNoteClick}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Plus size={18} />
              Add Note
            </button>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 bg-slate-200 text-slate-600 rounded-full shadow-sm hover:bg-red-500 hover:text-white hover:shadow-md hover:scale-110 transition-all duration-300"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* --- Error Display --- */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 shadow-sm" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* --- Notes Grid --- */}
        {loading ? (
          <div className="text-center text-slate-500">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
            <Frown size={48} className="mx-auto text-slate-400 mb-4" />
            <h2 className="text-xl font-semibold text-slate-600">No notes yet.</h2>
            <p className="text-slate-500">Why not add one now?</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <h2 className="font-bold text-xl mb-2 text-slate-700">{note.title}</h2>
                  <p className="text-slate-600 whitespace-pre-wrap">{note.content}</p>
                </div>
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleEditNoteClick(note)}
                    className="p-2 text-slate-500 hover:bg-sky-100 hover:text-sky-600 rounded-full transition-colors"
                    aria-label="Edit Note"
                  >
                    <Pen size={18} />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-2 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                    aria-label="Delete Note"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- Add/Edit Note Modal Form --- */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative">
            <h2 className="text-2xl font-bold mb-6 text-slate-700">
              {editingNote ? "Edit Note" : "Create a New Note"}
            </h2>
            <form onSubmit={addOrUpdateNote} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-slate-600 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-semibold text-slate-600 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  rows={5}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}