import { db } from './firebase-config.js';
import { collection, query, where, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

/**
 * Predicts the demand for a specific item for tomorrow.
 * 
 * Logic:
 * 1. Fetches sales history for the item over the last 14 days.
 * 2. Calculates a 7-day weighted moving average.
 * 3. Adjusts based on day of week (e.g., weekends have less demand).
 * 4. Adds current pre-bookings for tomorrow.
 */
export async function predictDemand(itemId) {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Fetch sales history
    const q = query(
      collection(db, 'salesHistory'), 
      where('itemId', '==', itemId),
      where('date', '>=', twoWeeksAgo)
    );
    const snapshot = await getDocs(q);
    
    let salesByDate = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const dateStr = data.date.toDate().toISOString().split('T')[0];
      salesByDate[dateStr] = (salesByDate[dateStr] || 0) + data.quantity;
    });

    // 7-day weighted moving average (more weight to recent days)
    let totalWeight = 0;
    let weightedSum = 0;
    let daysWithData = 0;

    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const qty = salesByDate[dateStr] || 0;
      if (qty > 0) {
        const weight = 8 - i; // Recent day = weight 7, 7 days ago = weight 1
        weightedSum += qty * weight;
        totalWeight += weight;
        daysWithData++;
      }
    }

    let basePrediction = 0;
    if (totalWeight > 0) {
      basePrediction = weightedSum / totalWeight;
    }

    // Day of week adjustment (Tomorrow)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayOfWeek = tomorrow.getDay(); // 0 = Sunday, 6 = Saturday

    let weekendFactor = 1.0;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendFactor = 0.4; // 60% less demand on weekends
    }

    // Fetch pre-bookings for tomorrow
    tomorrow.setHours(0,0,0,0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const bookingQ = query(
      collection(db, 'bookings'),
      where('itemId', '==', itemId),
      where('status', '==', 'pending'),
      where('pickupTime', '>=', tomorrow),
      where('pickupTime', '<', dayAfter)
    );
    const bookingSnap = await getDocs(bookingQ);
    let preBookedQty = 0;
    bookingSnap.forEach(doc => preBookedQty += doc.data().quantity);

    // Final calculation
    let recommendedCookQty = Math.round(basePrediction * weekendFactor);
    
    // Ensure we at least cook what is pre-booked + a buffer
    const buffer = 5;
    if (recommendedCookQty < preBookedQty + buffer) {
      recommendedCookQty = preBookedQty + buffer;
    }

    // Confidence Level based on historical data availability
    let confidence = 'Low';
    if (daysWithData >= 5) confidence = 'High';
    else if (daysWithData >= 3) confidence = 'Medium';

    return {
      prediction: recommendedCookQty,
      preBooked: preBookedQty,
      confidence: confidence,
      baseAverage: Math.round(basePrediction)
    };

  } catch (error) {
    console.error("Prediction error:", error);
    return { prediction: 0, preBooked: 0, confidence: 'Error', baseAverage: 0 };
  }
}
