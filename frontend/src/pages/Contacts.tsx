import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import api from '../lib/api';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  company: string | null;
  position: string | null;
  importance: string | null;
  lastContact: string | null;
}

export function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    relationship: '',
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/api/contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/contacts', formData);
      setShowForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        relationship: '',
      });
      fetchContacts();
    } catch (error) {
      console.error('Failed to create contact:', error);
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
      <div className="contacts-page">
        <div className="page-header">
          <h1>Contacts</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ Add Contact'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="position">Position</label>
                <input
                  id="position"
                  type="text"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="relationship">Relationship</label>
              <select
                id="relationship"
                value={formData.relationship}
                onChange={(e) =>
                  setFormData({ ...formData, relationship: e.target.value })
                }
              >
                <option value="">Select...</option>
                <option value="colleague">Colleague</option>
                <option value="manager">Manager</option>
                <option value="direct_report">Direct Report</option>
                <option value="client">Client</option>
                <option value="mentor">Mentor</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button type="submit" className="btn-primary">
              Create Contact
            </button>
          </form>
        )}

        {contacts.length === 0 ? (
          <div className="empty-state">
            <p>No contacts yet. Add your first contact to get started!</p>
          </div>
        ) : (
          <div className="contacts-grid">
            {contacts.map((contact) => (
              <Link
                key={contact.id}
                to={`/contacts/${contact.id}`}
                className="contact-card"
              >
                <h3>
                  {contact.firstName} {contact.lastName}
                </h3>
                {contact.position && contact.company && (
                  <p className="contact-role">
                    {contact.position} at {contact.company}
                  </p>
                )}
                {contact.email && <p className="contact-email">{contact.email}</p>}
                {contact.importance && (
                  <span className={`importance-badge ${contact.importance}`}>
                    {contact.importance}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
