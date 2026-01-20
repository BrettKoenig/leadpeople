import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import api from '../lib/api';
import { format } from 'date-fns';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  position: string | null;
  lastContact: string | null;
  nextFollowUp: string | null;
  importance: string | null;
}

export function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState({ total: 0, followUps: 0, recentInteractions: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/api/contacts');
      const contactsData = response.data;
      setContacts(contactsData.slice(0, 5)); // Show only 5 recent contacts

      const now = new Date();
      const followUpsCount = contactsData.filter(
        (c: Contact) => c.nextFollowUp && new Date(c.nextFollowUp) <= now
      ).length;

      setStats({
        total: contactsData.length,
        followUps: followUpsCount,
        recentInteractions: contactsData.filter(
          (c: Contact) => c.lastContact
        ).length,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="loading">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <h1>Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Contacts</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Follow-ups Due</h3>
            <p className="stat-number">{stats.followUps}</p>
          </div>
          <div className="stat-card">
            <h3>Recent Interactions</h3>
            <p className="stat-number">{stats.recentInteractions}</p>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Contacts</h2>
            <Link to="/contacts" className="btn-secondary">
              View All
            </Link>
          </div>

          {contacts.length === 0 ? (
            <div className="empty-state">
              <p>No contacts yet. Start building your network!</p>
              <Link to="/contacts" className="btn-primary">
                Add Your First Contact
              </Link>
            </div>
          ) : (
            <div className="contacts-list">
              {contacts.map((contact) => (
                <Link
                  key={contact.id}
                  to={`/contacts/${contact.id}`}
                  className="contact-card"
                >
                  <div className="contact-info">
                    <h3>
                      {contact.firstName} {contact.lastName}
                    </h3>
                    {contact.position && contact.company && (
                      <p className="contact-role">
                        {contact.position} at {contact.company}
                      </p>
                    )}
                  </div>
                  {contact.nextFollowUp && (
                    <div className="contact-follow-up">
                      Follow up: {format(new Date(contact.nextFollowUp), 'MMM d, yyyy')}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
