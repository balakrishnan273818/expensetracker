export function formatDate(dateStr) {
    //console.log("RAW:", dateStr);                  // 👈 ADD THIS
    //console.log("PARSED:", new Date(dateStr));     // 👈 ADD THIS

    const date = new Date(dateStr);

    return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}