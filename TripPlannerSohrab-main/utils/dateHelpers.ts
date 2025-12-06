/**
 * Date formatting utilities for the itinerary timeline
 */

export const formatDateHeader = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const itemDate = new Date(date);
    itemDate.setHours(0, 0, 0, 0);

    const diffTime = itemDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        month: "long",
        day: "numeric",
    };

    if (diffDays === 0) {
        return `Today, ${date.toLocaleDateString("en-US", options)}`;
    }
    if (diffDays === 1) {
        return `Tomorrow, ${date.toLocaleDateString("en-US", options)}`;
    }
    if (diffDays === -1) {
        return `Yesterday, ${date.toLocaleDateString("en-US", options)}`;
    }
    if (diffDays > 1 && diffDays <= 7) {
        return `${date.toLocaleDateString("en-US", { weekday: "long" })}, ${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
    }

    return date.toLocaleDateString("en-US", options);
};

export const formatTime = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

export const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const formatTimeForInput = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
};


