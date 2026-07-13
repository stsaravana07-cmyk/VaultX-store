import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MessageSquare, RefreshCw, Reply, CheckCircle } from 'lucide-react';

const SupportTicketsManager = ({ triggerAlert }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('support/tickets/');
      setTickets(res.data.results || res.data);
    } catch (err) {
      triggerAlert('Failed to fetch support tickets.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleReplyChange = (id, text) => {
    setReplyText(prev => ({ ...prev, [id]: text }));
  };

  const handleSendReply = async (id) => {
    const text = replyText[id];
    if (!text) {
      triggerAlert('Please enter a reply message.', 'error');
      return;
    }
    setSubmittingReply(id);
    try {
      await api.post(`support/tickets/${id}/reply/`, { admin_reply: text });
      triggerAlert('Reply sent successfully.', 'success');
      setReplyText(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      fetchTickets();
    } catch (err) {
      triggerAlert('Failed to send reply.', 'error');
    } finally {
      setSubmittingReply(null);
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-secondary" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 font-display">
          <MessageSquare className="text-secondary" /> Support Tickets
        </h2>
        <button onClick={fetchTickets} className="text-slate-400 hover:text-secondary transition-colors">
          <RefreshCw size={18} />
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 text-slate-400">
          <MessageSquare size={48} className="opacity-50" />
          <p className="font-medium">No support tickets found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{ticket.subject}</h3>
                  <p className="text-xs text-slate-500 font-medium">By {ticket.username} ({ticket.user_email}) - {new Date(ticket.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    ticket.status === 'Open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>

              <div className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.message}</div>
              
              {ticket.image && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Attached Image</p>
                  <a href={ticket.image} target="_blank" rel="noopener noreferrer">
                    <img src={ticket.image} alt="Ticket attachment" className="h-32 object-contain rounded-lg border border-slate-200" />
                  </a>
                </div>
              )}

              {ticket.status === 'Open' ? (
                <div className="mt-6 pt-4 border-t border-slate-100 space-y-3 bg-slate-50 p-4 rounded-xl">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Reply</label>
                  <textarea 
                    rows="3" 
                    value={replyText[ticket.id] || ''} 
                    onChange={(e) => handleReplyChange(ticket.id, e.target.value)}
                    placeholder="Type your reply here to resolve the ticket..." 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-secondary transition-colors"
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleSendReply(ticket.id)}
                      disabled={submittingReply === ticket.id}
                      className="px-6 py-2 bg-secondary hover:bg-purple-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {submittingReply === ticket.id ? <RefreshCw className="animate-spin" size={14} /> : <Reply size={14} />} 
                      Send Reply & Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 bg-emerald-50/50 p-4 rounded-xl">
                  <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={12}/> Resolved by Admin</label>
                  <p className="text-sm text-slate-700 font-medium italic">"{ticket.admin_reply}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportTicketsManager;
