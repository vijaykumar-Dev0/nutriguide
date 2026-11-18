import { useState, type FormEvent } from 'react';
import { CheckCircle2, Mail, MapPin, Clock } from 'lucide-react';
import { submitContact } from '../lib/api.ts';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<{
    message: string;
    id: number;
  } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setConfirmation(null);

    if (name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (subject.trim().length < 3) {
      setError('Please enter a brief subject.');
      return;
    }
    if (message.trim().length < 10) {
      setError('Please enter a message of at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitContact({ name, email, subject, message });
      setConfirmation({
        message: res.message,
        id: res.record.message_id,
      });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send your message.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#15803D]">Questions &amp; Feedback</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#142419] text-balance">
              Contact the Nutrition Awareness Team
            </h1>
            <p className="text-base text-[#475B4B] leading-relaxed">
              Have a question about vitamins, school nutrition workshops, or feedback on our food
              guides? Send us a message and our editorial team will respond promptly.
            </p>
          </div>

          <div className="bg-[#FEFCE8] border border-[#EDE9C6] rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="text-sm font-semibold text-[#142419]">Educational Desk</div>
                <div className="text-sm text-[#475B4B]">hello@nutriguide-awareness.org</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="text-sm font-semibold text-[#142419]">Response Window</div>
                <div className="text-sm text-[#475B4B]">Monday – Friday, within 1–2 business days</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="text-sm font-semibold text-[#142419]">Scope Note</div>
                <div className="text-sm text-[#475B4B]">
                  We provide general nutrition education. For clinical diagnoses, please consult a
                  licensed physician or registered dietitian.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8E2] rounded-2xl p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-[#142419] mb-5">Send a Message</h2>

          {confirmation && (
            <div className="mb-6 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-sm text-[#14532D] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="font-semibold">{confirmation.message}</div>
                <div className="text-xs mt-1 font-mono-nums">
                  Reference ID #{confirmation.id}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-[#142419] mb-1.5">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maya Lin"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFCFA] border border-[#E2E8E2] rounded-xl text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-[#142419] mb-1.5">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@example.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFCFA] border border-[#E2E8E2] rounded-xl text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className="block text-sm font-medium text-[#142419] mb-1.5">
                Subject
              </label>
              <input
                id="contact-subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Question about Vitamin D dietary sources"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FCFCFA] border border-[#E2E8E2] rounded-xl text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-[#142419] mb-1.5">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your nutrition question or suggestion here..."
                className="w-full px-3.5 py-2.5 text-sm bg-[#FCFCFA] border border-[#E2E8E2] rounded-xl text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
              >
                {submitting ? 'Sending Message...' : 'Submit Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
