import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  GraduationCap,
  MessageSquare,
  Calendar,
  Sparkles,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react';
import api from '../../api/client';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url: string | null;
  data: Record<string, any>;
  read_at: string | null;
  is_read: boolean;
  created_at: string;
  created_at_human: string;
}

interface NotificationCenterDropdownProps {
  theme?: 'dark-red' | 'default';
}

export const NotificationCenterDropdown: React.FC<NotificationCenterDropdownProps> = ({
  theme = 'dark-red',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data?.data) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unread_count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (notification: NotificationItem) => {
    if (!notification.is_read) {
      try {
        await api.post(`/notifications/${notification.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notification read', err);
      }
    }

    if (notification.action_url) {
      setIsOpen(false);
      window.location.href = notification.action_url;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'enrollment_approved':
        return (
          <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <GraduationCap className="h-4 w-4" />
          </div>
        );
      case 'feedback_submitted':
        return (
          <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <MessageSquare className="h-4 w-4" />
          </div>
        );
      case 'feedback_window_open':
        return (
          <div className="h-8 w-8 rounded-xl bg-rose-50 text-[#73111b] flex items-center justify-center shrink-0 border border-rose-100">
            <Calendar className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-100">
            <Bell className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative focus:outline-none"
        title="Notifications Center"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        {unreadCount > 0 && (
          <span
            className={`absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-white rounded-full ${
              theme === 'dark-red' ? 'bg-[#73111b]' : 'bg-rose-600'
            } shadow-xs ring-2 ring-white animate-pulse`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#fff1f2] text-[#73111b] border border-[#fecdd3]">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-semibold text-[#73111b] hover:text-[#520c13] flex items-center gap-1 transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center px-4 pt-2.5 pb-1 border-b border-slate-100 gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`pb-1.5 transition border-b-2 ${
                filter === 'all'
                  ? 'border-[#73111b] text-[#73111b]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`pb-1.5 transition border-b-2 ${
                filter === 'unread'
                  ? 'border-[#73111b] text-[#73111b]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* List content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Loader2 className="h-6 w-6 animate-spin text-[#73111b] mb-2" />
                <span>Checking notifications...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold text-slate-700">All caught up!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {filter === 'unread'
                    ? 'You have no unread notifications.'
                    : 'No notifications at the moment.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n)}
                  className={`p-3.5 hover:bg-slate-50/80 transition cursor-pointer flex gap-3 items-start relative ${
                    !n.is_read ? 'bg-rose-50/25' : ''
                  }`}
                >
                  {getNotificationIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                        {n.created_at_human}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    {n.action_url && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#73111b] mt-1.5 hover:underline">
                        <span>View details</span>
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  {!n.is_read && (
                    <span className="h-2 w-2 rounded-full bg-[#73111b] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
