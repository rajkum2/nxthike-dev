import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Check,
  Twitter,
  Linkedin,
  Facebook,
  MessageSquare,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.subject) newErrors.subject = 'Please select a subject';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="bg-surface-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 py-12">
        <div className="container-default">
          <h1 className="text-3xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-blue-100 max-w-3xl">
            Have a question, feedback, or want to partner with us? We would love to hear from you. Fill out the form below or reach out directly.
          </p>
        </div>
      </div>

      <div className="container-default py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent>
                <h2 className="text-lg md:text-xl font-semibold mb-6">Send Us a Message</h2>

                {submitted && (
                  <div className="bg-emerald-50 border border-emerald-300 text-emerald-700 px-4 py-3 rounded relative mb-6 flex items-center">
                    <Check size={20} className="mr-2" />
                    <span>Thank you! Your message has been sent successfully. We will get back to you soon.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      error={errors.name}
                      fullWidth
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="your.email@example.com"
                      leftIcon={<Mail size={18} />}
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      error={errors.email}
                      fullWidth
                    />
                  </div>

                  <Select
                    label="Subject"
                    options={[
                      { value: '', label: 'Select a subject' },
                      { value: 'general', label: 'General Inquiry' },
                      { value: 'support', label: 'Support' },
                      { value: 'partnership', label: 'Partnership' },
                      { value: 'feedback', label: 'Feedback' },
                    ]}
                    value={formData.subject}
                    onChange={(value) => handleChange('subject', value)}
                    error={errors.subject}
                    fullWidth
                  />

                  <div className="w-full">
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className={`block w-full px-4 py-2 rounded border ${
                        errors.message
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-surface-300 focus:ring-brand-500 focus:border-brand-500'
                      } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                    )}
                  </div>

                  <Button type="submit" leftIcon={<Send size={18} />}>
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Company Info */}
          <div>
            <Card className="mb-6">
              <CardContent>
                <h3 className="font-semibold text-surface-900 text-lg mb-4">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-brand-50 rounded-md p-2 mr-3">
                      <MapPin className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-surface-900 text-sm">Address</h4>
                      <p className="text-sm text-surface-600">
                        123 Career Street, Suite 100
                        <br />
                        San Francisco, CA 94102
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-brand-50 rounded-md p-2 mr-3">
                      <Mail className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-surface-900 text-sm">Email</h4>
                      <a
                        href="mailto:contact@nxthike.com"
                        className="text-sm text-brand-600 hover:text-brand-800"
                      >
                        contact@nxthike.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-brand-50 rounded-md p-2 mr-3">
                      <Phone className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-surface-900 text-sm">Phone</h4>
                      <a
                        href="tel:+15551234567"
                        className="text-sm text-brand-600 hover:text-brand-800"
                      >
                        +1 (555) 123-4567
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-brand-50 rounded-md p-2 mr-3">
                      <MessageSquare className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-surface-900 text-sm">Office Hours</h4>
                      <p className="text-sm text-surface-600">
                        Monday - Friday: 9:00 AM - 6:00 PM PST
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="font-semibold text-surface-900 text-lg mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-surface-100 hover:bg-brand-50 rounded-md p-3 transition-colors"
                  >
                    <Twitter className="h-5 w-5 text-surface-600 hover:text-brand-500" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-surface-100 hover:bg-brand-50 rounded-md p-3 transition-colors"
                  >
                    <Linkedin className="h-5 w-5 text-surface-600 hover:text-brand-700" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-surface-100 hover:bg-brand-50 rounded-md p-3 transition-colors"
                  >
                    <Facebook className="h-5 w-5 text-surface-600 hover:text-brand-600" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
