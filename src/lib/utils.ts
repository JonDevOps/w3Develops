import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(timestamp: Timestamp | Date | null | undefined): string {
    if (!timestamp) return 'N/A';
    
    let date: Date;
    if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
    } else {
        date = timestamp;
    }
    
    return date.toLocaleDateString();
}
