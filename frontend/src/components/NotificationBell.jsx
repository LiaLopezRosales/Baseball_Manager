import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiGet, apiPost } from '../api';
import './notifications.css';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isLogged = !!localStorage.getItem('token');

  const fetchNotifications = useCallback(async () => {
    if (!isLogged) return;
    try {
      const data = await apiGet('/api/notifications/');
      setNotifications(data.notifications || []);
      setUnread(data.unread_count || 0);
    } catch {
      /* silencioso */
    }
  }, [isLogged]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* Refresco periódico del badge + al recuperar el foco de la ventana */
  useEffect(() => {
    if (!isLogged) return undefined;
    const id = setInterval(fetchNotifications, 30000);
    const onFocus = () => fetchNotifications();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [isLogged, fetchNotifications]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markRead = async (id) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.is_read) return;
    setNotifications((list) =>
      list.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnread((u) => Math.max(0, u - 1));
    try {
      await apiPost(`/api/notifications/${id}/read/`);
    } catch {
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    setNotifications((list) => list.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
    try {
      await apiPost('/api/notifications/read-all/');
    } catch {
      /* silencioso */
    } finally {
      fetchNotifications();
    }
  };

  if (!isLogged) return null;

  return (
    <div className="notification-bell" ref={ref} data-open={open ? 'true' : 'false'}>
      <button
        className="notification-bell__btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notificaciones"
        title="Notificaciones"
      >
        <Bell size={20} />
        {unread > 0 && <span className="notification-bell__badge">{unread}</span>}
      </button>

      {open && (
        <div className="notification-bell__dropdown">
          <div className="notification-bell__head">
            <span>Notificaciones</span>
            {unread > 0 && (
              <button className="notification-bell__mark" onClick={markAllRead}>
                <CheckCheck size={14} /> Marcar leídas
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="notification-bell__empty">Sin notificaciones</p>
          ) : (
            <ul className="notification-bell__list">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`notification-bell__item${n.is_read ? '' : ' notification-bell__item--unread'}`}
                >
                  {n.link ? (
                    <Link
                      to={n.link}
                      className="notification-bell__message"
                      onClick={() => {
                        markRead(n.id);
                        setOpen(false);
                      }}
                    >
                      {n.message}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="notification-bell__message notification-bell__message--btn"
                      onClick={() => markRead(n.id)}
                    >
                      {n.message}
                    </button>
                  )}
                  <span className="notification-bell__date">
                    {new Date(n.created_at).toLocaleDateString('es-ES')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
