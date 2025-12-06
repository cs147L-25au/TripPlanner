export interface Trip {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
}

export interface TripMember {
    id: string;
    trip_id: string;
    user_id: string;
    user_name: string;
    role: "owner" | "member";
    created_at: string;
}

export interface ItineraryItem {
    id: string;
    trip_id: string;
    type: "flight" | "lodging" | "activity";
    title: string;
    date: string; // ISO date string
    time: string; // HH:mm format
    location: string;
    notes: string | null;
    booked_by: string; // user_id or user_name
    created_at: string;
    updated_at: string;
}

export type ItineraryItemInput = Omit<
    ItineraryItem,
    "id" | "created_at" | "updated_at"
>;


