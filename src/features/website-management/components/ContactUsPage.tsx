import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox, Mail, Phone, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactUsService } from '../services/contact-us.service';
import type { ContactUsPage as ContactUsPageData } from '../types/contact-us';

const PAGE_SIZE = 20;

export const ContactUsPage: React.FC = () => {
  const [data, setData] = useState<ContactUsPageData | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      setData(await contactUsService.getSubmissions(page, PAGE_SIZE));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load contact requests');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Contact Us</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Requests submitted through the public website
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadSubmissions()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {loading && !data ? (
          <div className="flex min-h-64 items-center justify-center">
            <RefreshCw className="h-7 w-7 animate-spin text-primary-600" />
          </div>
        ) : !data?.content.length ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <Inbox className="mb-3 h-10 w-10 text-neutral-300" />
            <p className="font-medium text-neutral-700">No contact requests yet</p>
            <p className="mt-1 text-sm text-neutral-500">New website submissions will appear here.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    {['Full name', 'Contact', 'Interest', 'Message', 'Submitted'].map((heading) => (
                      <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {data.content.map((submission) => (
                    <tr key={submission.id} className="align-top hover:bg-neutral-50/70">
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-neutral-900">
                        {submission.fullName}
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-600">
                        <a className="flex items-center gap-2 hover:text-primary-700" href={`tel:${submission.phoneNumber}`}>
                          <Phone className="h-3.5 w-3.5" />{submission.phoneNumber}
                        </a>
                        <a className="mt-2 flex items-center gap-2 hover:text-primary-700" href={`mailto:${submission.emailAddress}`}>
                          <Mail className="h-3.5 w-3.5" />{submission.emailAddress}
                        </a>
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-700">{submission.interest}</td>
                      <td className="max-w-md whitespace-pre-wrap break-words px-5 py-4 text-sm text-neutral-600">
                        {submission.message}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-neutral-500">
                        {new Date(submission.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-4">
              <p className="text-sm text-neutral-500">{data.totalElements} total requests</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={data.first || loading}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  className="rounded-lg border border-neutral-300 p-2 text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-sm text-neutral-600">
                  Page {data.number + 1} of {Math.max(data.totalPages, 1)}
                </span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={data.last || loading}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-neutral-300 p-2 text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
