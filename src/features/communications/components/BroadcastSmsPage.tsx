import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Megaphone, MessageSquareText, Search, Send, Users, X } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { broadcastSmsApiService } from '../../../services/api/broadcast-sms-api-service';
import { OwnersApiService } from '../../users/services/owner.service';
import type { Owner } from '../../users/types/owner';

type BroadcastTargetMode = 'ALL_USERS' | 'SELECTED_USERS';

export const BroadcastSmsPage: React.FC = () => {
  const ownersService = new OwnersApiService();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [targetMode, setTargetMode] = useState<BroadcastTargetMode>('ALL_USERS');
  const [owners, setOwners] = useState<Owner[]>([]);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [selectedPhoneNumbers, setSelectedPhoneNumbers] = useState<string[]>([]);

  const trimmedMessage = message.trim();
  const smsSegments = trimmedMessage ? Math.max(1, Math.ceil(trimmedMessage.length / 160)) : 0;
  const selectedOwners = useMemo(
    () => owners.filter((owner) => selectedPhoneNumbers.includes(owner.phoneNumber)),
    [owners, selectedPhoneNumbers]
  );
  const filteredOwners = useMemo(() => {
    const query = ownerSearch.trim().toLowerCase();

    if (!query) {
      return owners;
    }

    return owners.filter((owner) =>
      [owner.fullName, owner.phoneNumber, owner.email].join(' ').toLowerCase().includes(query)
    );
  }, [ownerSearch, owners]);

  useEffect(() => {
    void loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      setOwnersLoading(true);

      const collectedOwners: Owner[] = [];
      let page = 0;
      let totalPages = 1;

      while (page < totalPages) {
        const response = await ownersService.getOwners({
          page,
          size: 100,
          sortBy: 'fullName',
          sortDir: 'asc',
        });

        const payload = response.data;
        const pageOwners = payload?.content || [];
        const validOwners = pageOwners.filter((owner) => owner.phoneNumber?.trim());

        collectedOwners.push(...validOwners);
        totalPages = payload?.totalPages || 0;
        page += 1;
      }

      const uniqueOwners = Array.from(
        new Map(collectedOwners.map((owner) => [owner.phoneNumber, owner])).values()
      );

      setOwners(uniqueOwners);
    } catch (error) {
      console.error('Failed to load owners for broadcast selection:', error);
      toast.error('Failed to load users for SMS selection');
    } finally {
      setOwnersLoading(false);
    }
  };

  const toggleOwnerSelection = (phoneNumber: string) => {
    setSelectedPhoneNumbers((current) =>
      current.includes(phoneNumber)
        ? current.filter((item) => item !== phoneNumber)
        : [...current, phoneNumber]
    );
  };

  const removeSelectedPhoneNumber = (phoneNumber: string) => {
    setSelectedPhoneNumbers((current) => current.filter((item) => item !== phoneNumber));
  };

  const selectFilteredOwners = () => {
    setSelectedPhoneNumbers((current) => {
      const combined = new Set(current);
      filteredOwners.forEach((owner) => combined.add(owner.phoneNumber));
      return Array.from(combined);
    });
  };

  const clearSelectedOwners = () => {
    setSelectedPhoneNumbers([]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!trimmedMessage) {
      toast.error('Message is required');
      return;
    }

    if (targetMode === 'SELECTED_USERS' && selectedPhoneNumbers.length === 0) {
      toast.error('Select at least one user');
      return;
    }

    setSending(true);

    try {
      const response = targetMode === 'ALL_USERS'
        ? await broadcastSmsApiService.broadcastToAllUsers({
            message: trimmedMessage,
          })
        : await broadcastSmsApiService.broadcastToSelectedUsers({
            message: trimmedMessage,
            phoneNumbers: selectedPhoneNumbers,
          });

      toast.success(response.message);
      setMessage('');
      if (targetMode === 'SELECTED_USERS') {
        setSelectedPhoneNumbers([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send broadcast SMS';
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Broadcast SMS"
        description="Send one message to every registered user or a selected group from the admin console."
        icon={Megaphone}
      />

      <div className="px-2 py-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-6 text-white">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
                  <MessageSquareText className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Compose broadcast</h2>
                  <p className="mt-1 max-w-2xl text-sm text-emerald-50/90">
                    Choose whether this SMS goes to all users or only the users you select below.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setTargetMode('ALL_USERS')}
                  className={`rounded-2xl border p-4 text-left transition ${
                    targetMode === 'ALL_USERS'
                      ? 'border-primary-300 bg-primary-50 shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">All users</p>
                      <p className="mt-1 text-sm text-neutral-600">Use `target=ALL_USERS` for a full broadcast.</p>
                    </div>
                    {targetMode === 'ALL_USERS' && <CheckCircle2 className="h-5 w-5 text-primary-600" />}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('SELECTED_USERS')}
                  className={`rounded-2xl border p-4 text-left transition ${
                    targetMode === 'SELECTED_USERS'
                      ? 'border-primary-300 bg-primary-50 shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Selected users</p>
                      <p className="mt-1 text-sm text-neutral-600">Send to only the phone numbers you choose.</p>
                    </div>
                    {targetMode === 'SELECTED_USERS' && <CheckCircle2 className="h-5 w-5 text-primary-600" />}
                  </div>
                </button>
              </div>

              {targetMode === 'SELECTED_USERS' && (
                <div className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900">Select users</h3>
                      <p className="mt-1 text-sm text-neutral-600">
                        Pick one or more users from the existing owner directory.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={selectFilteredOwners} disabled={ownersLoading || filteredOwners.length === 0}>
                        Select filtered
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={clearSelectedOwners} disabled={selectedPhoneNumbers.length === 0}>
                        Clear selection
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={ownerSearch}
                      onChange={(event) => setOwnerSearch(event.target.value)}
                      placeholder="Search by name, phone number, or email..."
                      className="w-full rounded-2xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {selectedOwners.length > 0 && (
                    <div className="rounded-2xl border border-primary-100 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-neutral-900">
                          Selected users ({selectedOwners.length})
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedOwners.map((owner) => (
                          <span
                            key={owner.phoneNumber}
                            className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-sm text-primary-800"
                          >
                            <span>{owner.fullName} · {owner.phoneNumber}</span>
                            <button
                              type="button"
                              onClick={() => removeSelectedPhoneNumber(owner.phoneNumber)}
                              className="rounded-full p-0.5 text-primary-700 transition hover:bg-primary-100"
                              aria-label={`Remove ${owner.fullName}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="max-h-80 overflow-y-auto rounded-2xl border border-neutral-200 bg-white">
                    {ownersLoading ? (
                      <div className="p-6 text-center text-sm text-neutral-500">Loading users...</div>
                    ) : filteredOwners.length === 0 ? (
                      <div className="p-6 text-center text-sm text-neutral-500">No users found for this search.</div>
                    ) : (
                      <div className="divide-y divide-neutral-100">
                        {filteredOwners.map((owner) => {
                          const isSelected = selectedPhoneNumbers.includes(owner.phoneNumber);

                          return (
                            <label
                              key={owner.phoneNumber}
                              className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-neutral-50 ${
                                isSelected ? 'bg-primary-50/60' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleOwnerSelection(owner.phoneNumber)}
                                className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-neutral-900">{owner.fullName}</p>
                                <p className="text-sm text-neutral-600">{owner.phoneNumber}</p>
                                <p className="truncate text-xs text-neutral-500">{owner.email}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="broadcast-message" className="text-sm font-semibold text-neutral-900">
                  Message
                </label>
                <textarea
                  id="broadcast-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Type the message that should be delivered to all users..."
                  rows={10}
                  disabled={sending}
                  className="min-h-[220px] w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-50"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-500">
                  <span>{trimmedMessage.length} characters</span>
                  <span>{smsSegments} SMS segment{smsSegments === 1 ? '' : 's'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" isLoading={sending} className="inline-flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>{sending ? 'Sending broadcast...' : 'Send Broadcast SMS'}</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={sending || !message}
                  onClick={() => setMessage('')}
                >
                  Clear message
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Audience</h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    {targetMode === 'ALL_USERS'
                      ? <>Target is set to <span className="font-semibold text-neutral-900">ALL_USERS</span>.</>
                      : <>This message will go to <span className="font-semibold text-neutral-900">{selectedPhoneNumbers.length}</span> selected user{selectedPhoneNumbers.length === 1 ? '' : 's'}.</>}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-neutral-900">Before sending</h3>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li>Keep the message concise so it fits typical SMS delivery rules.</li>
                    <li>Double-check links, dates, and contact numbers before sending.</li>
                    <li>Use this only for announcements intended for the full user base.</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900">Preview</h3>
              <div className="mt-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  SMS body
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-800">
                  {trimmedMessage || 'Your message preview will appear here.'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
