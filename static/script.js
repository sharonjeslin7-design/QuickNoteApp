
document.addEventListener("DOMContentLoaded", loadNotes);

// Save note
async function saveNote() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    if (!title.trim() || !content.trim()) {
        alert("Please enter title and content");
        return;
    }

    try {
        const response = await fetch("/api/notes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error);
            return;
        }

        document.getElementById("title").value = "";
        document.getElementById("content").value = "";

        loadNotes();

        alert("Note saved successfully!");

    } catch (error) {
        alert("Unable to save note");
        console.error(error);
    }
}

// Load notes
async function loadNotes() {
    const container = document.getElementById("notes-container");

    try {
        const response = await fetch("/api/notes");
        const notes = await response.json();

        container.innerHTML = "";

        if (notes.length === 0) {
            container.innerHTML =
                '<p class="empty-message">No notes yet. Create your first note!</p>';
            return;
        }

        notes.forEach(note => {
            const card = document.createElement("div");
            card.className = "note-card";

            const heading = document.createElement("h3");
            heading.textContent = note.title;

            const paragraph = document.createElement("p");
            paragraph.textContent = note.content;

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "Delete";

            deleteButton.onclick = () => deleteNote(note.id);

            card.appendChild(heading);
            card.appendChild(paragraph);
            card.appendChild(deleteButton);

            container.appendChild(card);
        });

    } catch (error) {
        container.innerHTML = "<p>Unable to load notes.</p>";
        console.error(error);
    }
}

// Delete note
async function deleteNote(id) {
    if (!confirm("Are you sure you want to delete this note?")) {
        return;
    }

    const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        loadNotes();
    } else {
        alert("Unable to delete note");
    }
}
