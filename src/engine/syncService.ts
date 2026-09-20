import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';

const QUEUE_KEY = 'fitaura_offline_queue';

interface QueueItem {
  id: string;
  collection: string;
  payload: any;
  timestamp: number;
}

export const syncService = {
  async addToQueue(collection: string, payload: any) {
    const { value } = await Preferences.get({ key: QUEUE_KEY });
    const queue: QueueItem[] = value ? JSON.parse(value) : [];
    
    queue.push({
      id: crypto.randomUUID(),
      collection,
      payload,
      timestamp: Date.now()
    });
    
    await Preferences.set({
      key: QUEUE_KEY,
      value: JSON.stringify(queue)
    });
    console.log(`[Offline] Item added to ${collection} queue.`);
  },

  async flushQueue() {
    const status = await Network.getStatus();
    if (!status.connected) return;

    const { value } = await Preferences.get({ key: QUEUE_KEY });
    if (!value) return;

    const queue: QueueItem[] = JSON.parse(value);
    if (queue.length === 0) return;

    console.log(`[Sync] Flushing ${queue.length} items to server...`);
    
    // In a real app, you would batch write to Firebase Firestore here.
    // Example:
    // const batch = writeBatch(db);
    // queue.forEach(item => {
    //   const docRef = doc(db, item.collection, item.id);
    //   batch.set(docRef, item.payload);
    // });
    // await batch.commit();

    // Clear queue after successful sync
    await Preferences.remove({ key: QUEUE_KEY });
    console.log('[Sync] Queue flushed successfully.');
  },

  initListeners() {
    Network.addListener('networkStatusChange', status => {
      console.log('Network status changed', status);
      if (status.connected) {
        this.flushQueue();
      }
    });
  }
};
