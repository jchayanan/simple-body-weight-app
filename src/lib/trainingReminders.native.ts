import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export type ReminderSchedule = { days: number[]; hour: number; minute: number };

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

async function ensurePermission() {
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('training-reminders', { name: 'Training reminders', importance: Notifications.AndroidImportance.DEFAULT });
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export async function scheduleTrainingReminders({ days, hour, minute }: ReminderSchedule) {
  if (!(await ensurePermission())) return { scheduled: false, reason: 'Notifications are disabled in system settings.' };
  const requests = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(requests.filter((request) => request.content.data?.type === 'training-reminder').map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)));
  await Promise.all(days.map((weekday) => Notifications.scheduleNotificationAsync({
    content: { title: 'Ready to train?', body: 'Open Repbook and record your next set.', data: { type: 'training-reminder' }, sound: 'default' },
    trigger: Platform.OS === 'ios'
      ? { type: Notifications.SchedulableTriggerInputTypes.CALENDAR, weekday, hour, minute, repeats: true }
      : { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute, channelId: 'training-reminders' },
  })));
  return { scheduled: true, reason: '' };
}
