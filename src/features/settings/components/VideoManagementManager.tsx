import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Clapperboard,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';
import {
  VideoApiService,
  type VideoItem,
  type VideoPayload,
} from '../../../services/api/video-api-service';

interface VideoFormState {
  title: string;
  description: string;
  videoLink: string;
  thumbnail: string;
}

const emptyForm: VideoFormState = {
  title: '',
  description: '',
  videoLink: '',
  thumbnail: '',
};

const getYoutubeVideoId = (url: string): string | null => {
  try {
    const parsed = new URL(url.trim());

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.split('/').filter(Boolean)[0] || null;
    }

    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v');
    }

    return null;
  } catch {
    return null;
  }
};

const getThumbnailCandidates = (video: Pick<VideoItem, 'thumbnail' | 'videoLink'>): string[] => {
  const candidates: string[] = [];

  if (video.thumbnail?.trim()) {
    candidates.push(video.thumbnail.trim());
  }

  const youtubeId = getYoutubeVideoId(video.videoLink);
  if (youtubeId) {
    candidates.push(`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`);
    candidates.push(`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`);
    candidates.push(`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`);
  }

  return [...new Set(candidates)];
};

const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const formatDateTime = (value: string) => {
  if (!value) return 'Not available';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const VideoThumbnail: React.FC<{ video: VideoItem }> = ({ video }) => {
  const candidates = useMemo(() => getThumbnailCandidates(video), [video]);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [video.id, video.thumbnail, video.videoLink]);

  const current = candidates[candidateIndex];

  if (!current) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <ImageIcon className="h-8 w-8 text-slate-400" />
      </div>
    );
  }

  return (
    <img
      src={current}
      alt={video.title}
      className="h-full w-full object-cover"
      onError={() => {
        setCandidateIndex((index) => (index < candidates.length - 1 ? index + 1 : index));
      }}
    />
  );
};

export const VideoManagementManager: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VideoItem | null>(null);
  const [formData, setFormData] = useState<VideoFormState>(emptyForm);

  const filteredVideos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return videos;

    return videos.filter((video) =>
      [video.title, video.description, video.videoLink]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [searchQuery, videos]);

  useEffect(() => {
    void loadVideos(true);
  }, [showInactive]);

  const loadVideos = async (initial = false) => {
    try {
      if (initial) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const items = await VideoApiService.getVideos({
        page: 0,
        limit: 50,
        activeOnly: !showInactive,
      });

      setVideos(items);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load videos';
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const resetForm = () => {
    setEditingVideo(null);
    setFormData(emptyForm);
    setShowFormModal(false);
  };

  const openCreateModal = () => {
    setEditingVideo(null);
    setFormData(emptyForm);
    setShowFormModal(true);
  };

  const openEditModal = (video: VideoItem) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      videoLink: video.videoLink,
      thumbnail: video.thumbnail || '',
    });
    setShowFormModal(true);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return false;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return false;
    }

    if (!formData.videoLink.trim()) {
      toast.error('Video link is required');
      return false;
    }

    if (!isValidUrl(formData.videoLink.trim())) {
      toast.error('Please enter a valid video URL');
      return false;
    }

    if (formData.thumbnail.trim() && !isValidUrl(formData.thumbnail.trim())) {
      toast.error('Please enter a valid thumbnail URL');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload: VideoPayload = {
      title: formData.title,
      description: formData.description,
      videoLink: formData.videoLink,
      thumbnail: formData.thumbnail,
    };

    try {
      setSubmitting(true);

      if (editingVideo) {
        const updated = await VideoApiService.updateVideo(editingVideo.id, payload);
        setVideos((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        toast.success('Video updated successfully');
      } else {
        const created = await VideoApiService.createVideo(payload);
        setVideos((current) => [created, ...current]);
        toast.success('Video created successfully');
      }

      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save video';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await VideoApiService.deleteVideo(deleteTarget.id);
      setVideos((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Video deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete video';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Instructional Videos</h2>
          <p className="text-gray-600">
            Manage the videos shown to SME app and web users in the learning experience.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setShowInactive((current) => !current)}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Film className="h-4 w-4" />
            <span>{showInactive ? 'Show Active Only' : 'Show All Videos'}</span>
          </Button>
          <Button
            onClick={() => void loadVideos(false)}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Video</span>
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search title, description, or link..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Video Library</h3>
            <p className="text-sm text-slate-500">{filteredVideos.length} video(s) visible</p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
            <p className="mt-3 text-sm text-slate-500">Loading instructional videos...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="p-10 text-center">
            <Clapperboard className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-lg font-semibold text-slate-900">No videos found</p>
            <p className="mt-2 text-sm text-slate-500">
              Add your first instructional video or adjust the active filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredVideos.map((video) => (
              <div key={video.id} className="grid gap-4 px-6 py-5 lg:grid-cols-[220px_1fr_auto]">
                <div className="h-32 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <VideoThumbnail video={video} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-semibold text-slate-900">{video.title}</h4>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        video.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {video.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                    {video.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>Created {formatDateTime(video.createdAt)}</span>
                    <span>Updated {formatDateTime(video.updatedAt)}</span>
                    <a
                      href={video.videoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary-700 hover:text-primary-800"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open video link
                    </a>
                  </div>
                </div>

                <div className="flex flex-row gap-2 lg:flex-col">
                  <Button
                    onClick={() => openEditModal(video)}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    onClick={() => setDeleteTarget(video)}
                    variant="secondary"
                    className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showFormModal}
        onClose={resetForm}
        title={editingVideo ? 'Edit Instructional Video' : 'Add Instructional Video'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                placeholder="Jinsi ya kuongeza Bidhaa"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, description: event.target.value }))
                }
                rows={4}
                placeholder="Video ya maelekezo ya kuongeza bidhaa kwenye mfumo wa RINO"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Video Link</label>
              <input
                type="url"
                value={formData.videoLink}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, videoLink: event.target.value }))
                }
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
              />
              <p className="mt-2 text-xs text-slate-500">
                If the thumbnail URL fails or is left blank, YouTube thumbnails will be derived automatically.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Thumbnail URL
                <span className="ml-1 text-slate-400">(optional)</span>
              </label>
              <input
                type="url"
                value={formData.thumbnail}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, thumbnail: event.target.value }))
                }
                placeholder="https://example.com/thumbnails/video.jpg"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? editingVideo
                  ? 'Saving Changes...'
                  : 'Creating Video...'
                : editingVideo
                  ? 'Save Changes'
                  : 'Create Video'}
            </Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Video"
        message="This video will be removed from the instructional library for app and web users."
        itemName={deleteTarget?.title}
        isLoading={deleting}
      />
    </div>
  );
};
