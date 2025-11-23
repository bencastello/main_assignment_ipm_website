console.log("dataLoader.js loaded");

export async function loadJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error("Failed: " + path);
        return await response.json();
    } catch (err) {
        console.error("JSON load error:", err);
        return null;
    }
}

export async function loadBooks() {
    const data = await loadJSON("../data/books.json");
    return data?.books || [];
}

export async function loadFriends() {
    const data = await loadJSON("../data/friends.json");
    return data?.friends || [];
}

export async function loadUser() {
    const data = await loadJSON("../data/users.json");
    return data?.user || {};
}
