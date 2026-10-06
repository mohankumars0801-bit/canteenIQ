import { db } from './firebase-config.js';
import { collection, addDoc, onSnapshot, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Utility to calculate queue status based on bookings in a slot
export async function getSlotQueueStatus(slotTimeStr) {
  // Mock logic: assume slotTimeStr is "12:00 PM"
  // We count pending bookings around this time today
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const q = query(
    collection(db, 'bookings'),
    where('status', '==', 'pending'),
    where('pickupTime', '>=', today),
    where('pickupTime', '<', tomorrow)
  );
  
  const snapshot = await getDocs(q);
  let countInSlot = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    // Assuming pickupSlot is stored as string like "12:00 - 12:30 PM"
    if (data.pickupSlot === slotTimeStr) {
      countInSlot++;
    }
  });

  if (countInSlot > 20) return { level: 'High', color: 'danger', wait: '~15 mins' };
  if (countInSlot > 10) return { level: 'Medium', color: 'warning', wait: '~8 mins' };
  return { level: 'Low', color: 'success', wait: '~2 mins' };
}
